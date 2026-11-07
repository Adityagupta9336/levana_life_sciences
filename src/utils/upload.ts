import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/index.js";

const uploadsDir = path.join(process.cwd(), "uploads", "prescriptions");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png, webp) and PDF files are allowed"));
    }
  },
});

export interface UploadResult {
  fileUrl: string;
  filePublicId: string | null;
  originalFilename: string;
  mimeType: string;
}

export const processUpload = async (file: Express.Multer.File): Promise<UploadResult> => {
  if (config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    try {
      const uploadResponse = await cloudinary.uploader.upload(file.path, {
        folder: "levana_prescriptions",
        resource_type: "auto",
      });
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return {
        fileUrl: uploadResponse.secure_url,
        filePublicId: uploadResponse.public_id,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
      };
    } catch {
      return {
        fileUrl: `/uploads/prescriptions/${file.filename}`,
        filePublicId: null,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
      };
    }
  }

  return {
    fileUrl: `/uploads/prescriptions/${file.filename}`,
    filePublicId: null,
    originalFilename: file.originalname,
    mimeType: file.mimetype,
  };
};
