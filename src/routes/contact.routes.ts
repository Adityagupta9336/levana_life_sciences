import { Router, Request, Response } from "express";
import { config } from "../config/index.js";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, message, botcheck } = req.body;

    if (botcheck) {
      res.status(400).json({ success: false, message: "Spam check failed." });
      return;
    }

    if (!name || !phone || !message) {
      res.status(400).json({ success: false, message: "Please complete all required fields." });
      return;
    }

    if (!config.web3FormsAccessKey) {
      res.status(503).json({ success: false, message: "Contact form is temporarily unavailable." });
      return;
    }

    const payload = new URLSearchParams({
      access_key: config.web3FormsAccessKey,
      subject: "New contact message from Levana Life Sciences Store",
      from_name: name,
      name,
      phone,
      message,
    });
    if (email) payload.set("email", email);

    const upstream = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
    });

    const result = (await upstream.json()) as any;
    if (!upstream.ok || !result.success) {
      res.status(502).json({ success: false, message: "Message could not be sent. Please try again." });
      return;
    }

    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to send message." });
  }
});

export default router;
