import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import { errorHandler } from "./middlewares/error.js";

export const createApp = (): Application => {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(cors({ origin: true, credentials: true }));
  app.use(morgan("dev"));
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  const uploadsPath = path.join(process.cwd(), "uploads");
  const storePath = path.join(process.cwd(), "medical-store");

  app.use("/uploads", express.static(uploadsPath));
  app.use(express.static(storePath));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "healthy",
      service: "Levana Life Sciences API",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/prescriptions", prescriptionRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/contact", contactRoutes);

  app.get("/api/*", (_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Endpoint not found." });
  });

  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(storePath, "index.html"));
  });

  app.use(errorHandler);

  return app;
};

export default createApp;
