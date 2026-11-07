import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { ScheduleClass } from "@prisma/client";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, rx, scheduleClass, sort, page = "1", limit = "50" } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isActive: true };

    if (category && category !== "all") {
      if (category === "otc") {
        where.requiresRx = false;
      } else if (category === "rx") {
        where.requiresRx = true;
      } else {
        where.category = String(category);
      }
    }

    if (rx !== undefined) {
      where.requiresRx = rx === "true";
    }

    if (scheduleClass && Object.values(ScheduleClass).includes(scheduleClass as ScheduleClass)) {
      where.scheduleClass = scheduleClass as ScheduleClass;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { salt: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { id: "asc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    else if (sort === "price-desc") orderBy = { price: "desc" };
    else if (sort === "name-asc") orderBy = { name: "asc" };

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          batches: {
            where: {
              quantity: { gt: 0 },
              expiryDate: { gt: new Date() },
            },
            select: {
              batchNumber: true,
              expiryDate: true,
              quantity: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formatted = products.map((p) => {
      const totalStock = p.batches.reduce((sum, b) => sum + b.quantity, 0);
      return {
        ...p,
        inStock: totalStock > 0,
        totalStock,
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch products." });
  }
};

export const getProductByIdOrSlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;
    const isNumeric = !isNaN(Number(identifier));

    const product = await prisma.product.findFirst({
      where: isNumeric ? { id: Number(identifier) } : { slug: identifier },
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

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    const totalStock = product.batches.reduce((sum, b) => sum + b.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        ...product,
        inStock: totalStock > 0,
        totalStock,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch product." });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug,
      salt,
      company,
      category,
      pack,
      price,
      mrp,
      scheduleClass,
      requiresRx,
      hsnCode,
      gstRate,
      tag,
      icon,
      photo,
      description,
      dosage,
    } = req.body;

    if (!name || !salt || !company || !category || !pack || price === undefined || mrp === undefined) {
      res.status(400).json({ success: false, message: "Missing required product fields." });
      return;
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const product = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        salt,
        company,
        category,
        pack,
        price: Number(price),
        mrp: Number(mrp),
        discount,
        scheduleClass: scheduleClass || ScheduleClass.OTC,
        requiresRx: Boolean(requiresRx),
        hsnCode: hsnCode || "3004",
        gstRate: gstRate !== undefined ? Number(gstRate) : 12.0,
        tag: tag || null,
        icon: icon || "carton",
        photo: photo || null,
        description: description || null,
        dosage: dosage || null,
      },
    });

    res.status(201).json({ success: true, message: "Product created successfully.", data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create product." });
  }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const counts = await prisma.product.groupBy({
      by: ["category"],
      where: { isActive: true },
      _count: { id: true },
    });

    const total = await prisma.product.count({ where: { isActive: true } });
    const rxCount = await prisma.product.count({ where: { isActive: true, requiresRx: true } });
    const otcCount = await prisma.product.count({ where: { isActive: true, requiresRx: false } });

    const categories = [
      { id: "all", label: "All products", count: total },
      { id: "otc", label: "OTC", count: otcCount },
      { id: "rx", label: "Prescription", count: rxCount },
      ...counts.map((c) => ({
        id: c.category,
        label: c.category.charAt(0).toUpperCase() + c.category.slice(1),
        count: c._count.id,
      })),
    ];

    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch categories." });
  }
};

