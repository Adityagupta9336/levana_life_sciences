import { Request, Response } from "express";
import { prisma } from "../prisma/client.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { Role } from "@prisma/client";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Name, email, and password are required." });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: "User with this email or phone already exists." });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const assignedRole = role === Role.ADMIN || role === Role.PHARMACIST ? role : Role.CUSTOMER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Registration failed." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      res.status(400).json({ success: false, message: "Email/Phone and password are required." });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Login failed." });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: true,
        _count: {
          select: {
            orders: true,
            prescriptions: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch profile." });
  }
};

export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { recipient, phone, street, landmark, city, state, pincode, isDefault } = req.body;

    if (!recipient || !phone || !street || !city || !pincode) {
      res.status(400).json({ success: false, message: "Required address fields are missing." });
      return;
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.userId,
        recipient,
        phone,
        street,
        landmark,
        city,
        state: state || "Uttar Pradesh",
        pincode,
        isDefault: Boolean(isDefault),
      },
    });

    res.status(201).json({ success: true, message: "Address added successfully.", data: address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to add address." });
  }
};

export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const addresses = await prisma.address.findMany({
      where: { userId: req.user.userId },
      orderBy: { isDefault: "desc" },
    });

    res.status(200).json({ success: true, data: addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch addresses." });
  }
};

