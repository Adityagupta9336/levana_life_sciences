import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "levana_jwt_fallback_secret_32_characters",
  jwtExpiresIn: "7d",
  databaseUrl: process.env.DATABASE_URL,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "kpkjsylq",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  web3FormsAccessKey: process.env.WEB3FORMS_ACCESS_KEY || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "Levana Life Sciences <orders@levanalifecare.com>",
  pharmacy: {
    name: process.env.PHARMACY_NAME || "Levana Life Sciences",
    license20B: process.env.PHARMACY_DRUG_LICENCE_20B || "UP/20B-21B/2026/1876",
    license21B: process.env.PHARMACY_DRUG_LICENCE_21B || "UP/20B-21B/2026/1876",
    gstin: process.env.PHARMACY_GSTIN || "09AANFL0727C1ZG",
    address: process.env.PHARMACY_ADDRESS || "Meerut, Uttar Pradesh, India",
    helpline: process.env.PHARMACY_HELPLINE || "+91 98765 43210",
  },
};
