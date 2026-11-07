import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { generateInvoicePdf } from "../utils/invoice.js";
import { config } from "../config/index.js";
import { OrderStatus, PaymentMethod, PaymentStatus, ScheduleClass, RxStatus } from "@prisma/client";

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required to place an order." });
      return;
    }

    const { items, addressId, prescriptionId, paymentMethod = "COD", notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: "Order must contain at least one item." });
      return;
    }

    const productIds = items.map((i: any) => Number(i.productId));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: {
        batches: {
          where: {
            quantity: { gt: 0 },
            expiryDate: { gt: new Date() },
          },
          orderBy: { expiryDate: "asc" },
        },
      },
    });

    if (products.length !== items.length) {
      res.status(400).json({ success: false, message: "One or more products in your cart are unavailable." });
      return;
    }

    const productMap = new Map<number, any>();
    products.forEach((p) => productMap.set(p.id, p));

    let requiresPrescription = false;
    let containsScheduleX = false;

    for (const item of items) {
      const p = productMap.get(Number(item.productId));
      if (!p) continue;

      if (p.scheduleClass === ScheduleClass.X) {
        containsScheduleX = true;
      }
      if (p.requiresRx || p.scheduleClass === ScheduleClass.H || p.scheduleClass === ScheduleClass.H1) {
        requiresPrescription = true;
      }
    }

    if (containsScheduleX) {
      res.status(403).json({
        success: false,
        message: "Schedule X and narcotics cannot be ordered online as per Indian Drugs & Cosmetics regulations.",
      });
      return;
    }

    let verifiedPrescriptionId: string | null = null;
    let initialOrderStatus: OrderStatus = OrderStatus.CONFIRMED;

    if (requiresPrescription) {
      if (!prescriptionId) {
        res.status(400).json({
          success: false,
          message: "One or more medicines in your cart require a valid prescription. Please upload or attach your prescription.",
        });
        return;
      }

      const rx = await prisma.prescription.findFirst({
        where: { id: prescriptionId, userId: req.user.userId },
      });

      if (!rx) {
        res.status(404).json({ success: false, message: "Attached prescription was not found." });
        return;
      }

      if (rx.status === RxStatus.REJECTED) {
        res.status(400).json({
          success: false,
          message: `The attached prescription was rejected: ${rx.rejectionReason || "Invalid prescription"}. Please upload a new one.`,
        });
        return;
      }

      verifiedPrescriptionId = rx.id;
      if (rx.status === RxStatus.PENDING) {
        initialOrderStatus = OrderStatus.PENDING_RX_VERIFICATION;
      }
    }

    let subtotal = 0;
    let totalTax = 0;
    const orderItemsData: any[] = [];
    const batchUpdates: { batchId: string; quantityToDeduct: number }[] = [];

    for (const item of items) {
      const p = productMap.get(Number(item.productId));
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        res.status(400).json({ success: false, message: `Invalid quantity for product ${p.name}` });
        return;
      }

      const availableQty = p.batches.reduce((sum: number, b: any) => sum + b.quantity, 0);
      if (availableQty < qty) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${p.name}. Available: ${availableQty}, requested: ${qty}.`,
        });
        return;
      }

      let remainingToDeduct = qty;
      let primaryBatchId: string | null = null;

      for (const batch of p.batches) {
        if (remainingToDeduct <= 0) break;
        const deduct = Math.min(batch.quantity, remainingToDeduct);
        batchUpdates.push({ batchId: batch.id, quantityToDeduct: deduct });
        if (!primaryBatchId) primaryBatchId = batch.id;
        remainingToDeduct -= deduct;
      }

      const unitPrice = p.price;
      const itemSubtotal = unitPrice * qty;
      const taxRate = p.gstRate;
      const itemTax = (itemSubtotal * taxRate) / (100 + taxRate);

      subtotal += itemSubtotal;
      totalTax += itemTax;

      orderItemsData.push({
        productId: p.id,
        batchId: primaryBatchId,
        quantity: qty,
        unitPrice,
        mrp: p.mrp,
        taxRate,
        taxAmount: Number(itemTax.toFixed(2)),
        totalPrice: Number(itemSubtotal.toFixed(2)),
      });
    }

    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const totalAmount = Number((subtotal + deliveryFee).toFixed(2));

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const orderNumber = `LEV-${datePrefix}-${randomSuffix}`;
    const invoiceNumber = `INV-${datePrefix}-${randomSuffix}`;

    const newOrder = await prisma.$transaction(async (tx) => {
      for (const b of batchUpdates) {
        await tx.inventoryBatch.update({
          where: { id: b.batchId },
          data: { quantity: { decrement: b.quantityToDeduct } },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user!.userId,
          addressId: addressId || null,
          prescriptionId: verifiedPrescriptionId,
          status: initialOrderStatus,
          paymentMethod: paymentMethod === "RAZORPAY" ? PaymentMethod.RAZORPAY : PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
          subtotal: Number(subtotal.toFixed(2)),
          deliveryFee,
          taxAmount: Number(totalTax.toFixed(2)),
          totalAmount,
          notes: notes || null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: { include: { product: true, batch: true } },
          address: true,
          user: true,
        },
      });

      const halfTax = Number((totalTax / 2).toFixed(2));
      await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: createdOrder.id,
          pharmacyGstin: config.pharmacy.gstin,
          drugLicense20B: config.pharmacy.license20B,
          drugLicense21B: config.pharmacy.license21B,
          subtotal: Number(subtotal.toFixed(2)),
          cgstAmount: halfTax,
          sgstAmount: halfTax,
          igstAmount: 0,
          totalAmount,
        },
      });

      return createdOrder;
    });

    try {
      const addressString = newOrder.address
        ? `${newOrder.address.street}, ${newOrder.address.city}, ${newOrder.address.pincode}`
        : config.pharmacy.address;

      const pdfUrl = await generateInvoicePdf({
        invoiceNumber,
        orderNumber: newOrder.orderNumber,
        date: newOrder.createdAt,
        customerName: newOrder.user.name,
        customerPhone: newOrder.user.phone || undefined,
        shippingAddress: addressString,
        items: newOrder.items.map((i) => ({
          name: i.product.name,
          pack: i.product.pack,
          hsnCode: i.product.hsnCode,
          batchNumber: i.batch?.batchNumber || "GENERIC",
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          taxRate: i.taxRate,
          taxAmount: i.taxAmount,
          totalPrice: i.totalPrice,
        })),
        subtotal: newOrder.subtotal,
        cgstAmount: Number((totalTax / 2).toFixed(2)),
        sgstAmount: Number((totalTax / 2).toFixed(2)),
        deliveryFee: newOrder.deliveryFee,
        discount: newOrder.discount,
        totalAmount: newOrder.totalAmount,
        paymentMethod: newOrder.paymentMethod,
      });

      await prisma.invoice.update({
        where: { orderId: newOrder.id },
        data: { pdfUrl },
      });
    } catch {}

    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: "ORDER_CREATED",
        entityType: "Order",
        entityId: newOrder.id,
        details: `Placed order ${newOrder.orderNumber} for Rs. ${newOrder.totalAmount}`,
        ipAddress: req.ip,
      },
    });

    res.status(201).json({
      success: true,
      message:
        initialOrderStatus === OrderStatus.PENDING_RX_VERIFICATION
          ? "Order placed! It will be confirmed once our pharmacist reviews your prescription."
          : "Order placed successfully!",
      data: newOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to place order." });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
        address: true,
        prescription: true,
        invoice: true,
      },
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch orders." });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        ...(req.user.role === "CUSTOMER" ? { userId: req.user.userId } : {}),
      },
      include: {
        items: { include: { product: true, batch: true } },
        address: true,
        prescription: true,
        invoice: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch order." });
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        include: {
          items: { include: { product: true } },
          user: { select: { name: true, phone: true, email: true } },
          prescription: true,
          invoice: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch orders." });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ success: false, message: "A valid order status is required." });
      return;
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId,
        action: `ORDER_STATUS_${status}`,
        entityType: "Order",
        entityId: id,
        details: `Order ${existing.orderNumber} status changed from ${existing.status} to ${status}`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json({ success: true, message: `Order status updated to ${status}.`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update order status." });
  }
};

