import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { processUpload } from "../utils/upload.js";
import { RxStatus, Role } from "@prisma/client";

export const uploadPrescription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required to upload prescriptions." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: "Prescription file is required." });
      return;
    }

    const { patientName, patientAge, doctorName } = req.body;
    const uploadResult = await processUpload(req.file);

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const prescriptionNumber = `RX-${datePrefix}-${randomSuffix}`;

    const prescription = await prisma.prescription.create({
      data: {
        prescriptionNumber,
        userId: req.user.userId,
        fileUrl: uploadResult.fileUrl,
        filePublicId: uploadResult.filePublicId,
        originalFilename: uploadResult.originalFilename,
        mimeType: uploadResult.mimeType,
        patientName: patientName || null,
        patientAge: patientAge ? parseInt(patientAge, 10) : null,
        doctorName: doctorName || null,
        status: RxStatus.PENDING,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: "PRESCRIPTION_UPLOADED",
        entityType: "Prescription",
        entityId: prescription.id,
        details: `Uploaded ${uploadResult.originalFilename} as ${prescriptionNumber}`,
        ipAddress: req.ip,
      },
    });

    res.status(201).json({
      success: true,
      message: "Prescription uploaded successfully. Our pharmacist will verify it shortly.",
      data: prescription,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to upload prescription." });
  }
};

export const getMyPrescriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      include: {
        verifiedBy: {
          select: { name: true },
        },
      },
    });

    res.status(200).json({ success: true, data: prescriptions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch prescriptions." });
  }
};

export const getPharmacistQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && Object.values(RxStatus).includes(status as RxStatus)) {
      where.status = status as RxStatus;
    } else {
      where.status = RxStatus.PENDING;
    }

    const [prescriptions, totalCount] = await Promise.all([
      prisma.prescription.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip,
        take: limitNum,
        include: {
          user: {
            select: { name: true, phone: true, email: true },
          },
          verifiedBy: {
            select: { name: true },
          },
        },
      }),
      prisma.prescription.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: prescriptions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch prescription queue." });
  }
};

export const reviewPrescription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { id } = req.params;
    const { status, pharmacistNotes, rejectionReason } = req.body;

    if (!status || !Object.values(RxStatus).includes(status)) {
      res.status(400).json({ success: false, message: "A valid prescription status is required." });
      return;
    }

    if (status === RxStatus.REJECTED && !rejectionReason) {
      res.status(400).json({ success: false, message: "A reason is mandatory when rejecting a prescription." });
      return;
    }

    const existing = await prisma.prescription.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Prescription not found." });
      return;
    }

    const updated = await prisma.prescription.update({
      where: { id },
      data: {
        status: status as RxStatus,
        pharmacistNotes: pharmacistNotes || null,
        rejectionReason: status === RxStatus.REJECTED ? rejectionReason : null,
        verifiedById: req.user.userId,
        verifiedAt: new Date(),
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        verifiedBy: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: `PRESCRIPTION_${status}`,
        entityType: "Prescription",
        entityId: id,
        details: `Prescription ${existing.prescriptionNumber} marked as ${status}. Notes: ${pharmacistNotes || "None"}`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      success: true,
      message: `Prescription has been marked as ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to review prescription." });
  }
};

