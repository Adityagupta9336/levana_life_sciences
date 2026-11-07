import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { RxStatus, OrderStatus } from "@prisma/client";

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

    const [
      totalOrders,
      todayOrders,
      pendingPrescriptions,
      totalCustomers,
      recentOrders,
      nearExpiryBatches,
      allBatches,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { createdAt: { gte: today } },
        select: { totalAmount: true },
      }),
      prisma.prescription.count({ where: { status: RxStatus.PENDING } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, phone: true } },
          items: { include: { product: true } },
        },
      }),
      prisma.inventoryBatch.findMany({
        where: {
          expiryDate: { lte: sixtyDaysLater },
          quantity: { gt: 0 },
        },
        include: { product: true },
        orderBy: { expiryDate: "asc" },
      }),
      prisma.inventoryBatch.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
      }),
    ]);

    const totalSales = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: OrderStatus.CANCELLED } },
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lowStockProductIds = allBatches.filter((b) => (b._sum.quantity || 0) < 20).map((b) => b.productId);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalOrders,
          todayOrdersCount: todayOrders.length,
          todayRevenue,
          totalSales: totalSales._sum.totalAmount || 0,
          pendingPrescriptions,
          totalCustomers,
          lowStockCount: lowStockProductIds.length,
          nearExpiryCount: nearExpiryBatches.length,
        },
        recentOrders,
        nearExpiryBatches,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch dashboard stats." });
  }
};

export const addInventoryBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, batchNumber, mfgDate, expiryDate, quantity, mrp, purchasePrice } = req.body;

    if (!productId || !batchNumber || !expiryDate || quantity === undefined || mrp === undefined) {
      res.status(400).json({ success: false, message: "Missing required batch fields." });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    const batch = await prisma.inventoryBatch.create({
      data: {
        productId: Number(productId),
        batchNumber,
        mfgDate: mfgDate ? new Date(mfgDate) : null,
        expiryDate: new Date(expiryDate),
        quantity: parseInt(quantity, 10),
        mrp: Number(mrp),
        purchasePrice: purchasePrice ? Number(purchasePrice) : null,
      },
      include: { product: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.userId,
        action: "INVENTORY_BATCH_ADDED",
        entityType: "InventoryBatch",
        entityId: batch.id,
        details: `Added batch ${batchNumber} with ${quantity} units for product ${product.name}`,
        ipAddress: req.ip,
      },
    });

    res.status(201).json({ success: true, message: "Batch added to inventory.", data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to add batch." });
  }
};

export const getInventoryBatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, nearExpiry, page = "1", limit = "30" } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (productId) {
      where.productId = Number(productId);
    }
    if (nearExpiry === "true") {
      const ninetyDays = new Date();
      ninetyDays.setDate(ninetyDays.getDate() + 90);
      where.expiryDate = { lte: ninetyDays };
    }

    const [batches, totalCount] = await Promise.all([
      prisma.inventoryBatch.findMany({
        where,
        orderBy: { expiryDate: "asc" },
        skip,
        take: limitNum,
        include: { product: true },
      }),
      prisma.inventoryBatch.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: batches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch inventory." });
  }
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "50" } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        include: {
          user: { select: { name: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count(),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch audit logs." });
  }
};
