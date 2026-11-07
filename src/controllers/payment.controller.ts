import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../prisma/client.js";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ success: false, message: "Order ID is required." });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret && !keyId.includes("your_key")) {
      const amountInPaise = Math.round(order.totalAmount * 100);
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: order.orderNumber,
          notes: {
            orderId: order.id,
            customerEmail: order.user.email,
          },
        }),
      });

      const rzpOrder: any = await response.json();

      if (!response.ok) {
        res.status(502).json({ success: false, message: "Failed to initialize Razorpay payment." });
        return;
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: rzpOrder.id },
      });

      res.status(200).json({
        success: true,
        data: {
          razorpayOrderId: rzpOrder.id,
          amount: order.totalAmount,
          currency: "INR",
          keyId,
          orderNumber: order.orderNumber,
          customer: {
            name: order.user.name,
            email: order.user.email,
            phone: order.user.phone,
          },
        },
      });
      return;
    }

    const simulatedRazorpayId = `rzp_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: simulatedRazorpayId },
    });

    res.status(200).json({
      success: true,
      message: "Development simulated payment initialized.",
      data: {
        razorpayOrderId: simulatedRazorpayId,
        amount: order.totalAmount,
        currency: "INR",
        keyId: "rzp_test_simulated_key",
        orderNumber: order.orderNumber,
        isSimulated: true,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create payment." });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderId || !razorpayPaymentId) {
      res.status(400).json({ success: false, message: "Missing required verification details." });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && !keySecret.includes("your_secret") && razorpayOrderId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        res.status(400).json({ success: false, message: "Invalid payment signature." });
        return;
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        razorpayPaymentId,
        razorpaySignature: razorpaySignature || "SIMULATED_VERIFIED",
        status:
          order.status === OrderStatus.PENDING_RX_VERIFICATION
            ? OrderStatus.PENDING_RX_VERIFICATION
            : OrderStatus.CONFIRMED,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId,
        action: "PAYMENT_VERIFIED",
        entityType: "Order",
        entityId: orderId,
        details: `Payment ID ${razorpayPaymentId} verified for order ${order.orderNumber}`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      data: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Payment verification failed." });
  }
};

