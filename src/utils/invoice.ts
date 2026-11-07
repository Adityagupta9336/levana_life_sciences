import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { config } from "../config/index.js";

const invoicesDir = path.join(process.cwd(), "uploads", "invoices");
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

export interface InvoiceItemData {
  name: string;
  pack: string;
  hsnCode: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  date: Date;
  customerName: string;
  customerPhone?: string;
  shippingAddress: string;
  items: InvoiceItemData[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
}

export const generateInvoicePdf = (data: InvoiceData): Promise<string> => {
  return new Promise((resolve, reject) => {
    const filename = `invoice-${data.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;
    const filePath = path.join(invoicesDir, filename);
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    doc.fontSize(18).fillColor("#0e5c4a").text(config.pharmacy.name, { align: "left" });
    doc.fontSize(9).fillColor("#41524a").text("Retail Drug Store & Health Care");
    doc.text(config.pharmacy.address);
    doc.text(`Helpline: ${config.pharmacy.helpline}`);
    doc.text(`GSTIN: ${config.pharmacy.gstin}`);
    doc.text(`Drug Licences: 20B: ${config.pharmacy.license20B} | 21B: ${config.pharmacy.license21B}`);
    doc.moveDown();

    doc.rect(40, doc.y, 515, 1).fillColor("#e8e0d3").fill();
    doc.moveDown(0.5);

    const invoiceY = doc.y;
    doc.fontSize(12).fillColor("#0e5c4a").text("TAX INVOICE", 40, invoiceY);
    doc.fontSize(9).fillColor("#1b2a24");
    doc.text(`Invoice No: ${data.invoiceNumber}`, 40, invoiceY + 18);
    doc.text(`Order No: ${data.orderNumber}`, 40, invoiceY + 30);
    doc.text(`Date: ${data.date.toLocaleDateString("en-IN")}`, 40, invoiceY + 42);

    doc.text(`Bill To: ${data.customerName}`, 300, invoiceY + 18);
    doc.text(`Phone: ${data.customerPhone || "N/A"}`, 300, invoiceY + 30);
    doc.text(`Address: ${data.shippingAddress}`, 300, invoiceY + 42, { width: 250 });

    doc.moveDown(3);

    const tableTop = doc.y + 10;
    doc.rect(40, tableTop, 515, 20).fillColor("#f6f3ee").fill();
    doc.fontSize(8).fillColor("#1b2a24");
    doc.text("Item / Description", 45, tableTop + 5);
    doc.text("HSN", 210, tableTop + 5);
    doc.text("Batch", 255, tableTop + 5);
    doc.text("Qty", 320, tableTop + 5);
    doc.text("Price", 355, tableTop + 5);
    doc.text("GST %", 410, tableTop + 5);
    doc.text("Total", 480, tableTop + 5);

    let currentY = tableTop + 24;
    for (const item of data.items) {
      doc.text(`${item.name} (${item.pack})`, 45, currentY, { width: 160 });
      doc.text(item.hsnCode, 210, currentY);
      doc.text(item.batchNumber, 255, currentY);
      doc.text(item.quantity.toString(), 320, currentY);
      doc.text(`Rs. ${item.unitPrice.toFixed(2)}`, 355, currentY);
      doc.text(`${item.taxRate}%`, 410, currentY);
      doc.text(`Rs. ${item.totalPrice.toFixed(2)}`, 480, currentY);
      currentY += 18;
    }

    doc.rect(40, currentY + 5, 515, 1).fillColor("#e8e0d3").fill();
    currentY += 15;

    const summaryX = 350;
    doc.fontSize(9).fillColor("#1b2a24");
    doc.text("Subtotal:", summaryX, currentY);
    doc.text(`Rs. ${data.subtotal.toFixed(2)}`, 470, currentY);
    currentY += 14;

    doc.text("CGST (6%):", summaryX, currentY);
    doc.text(`Rs. ${data.cgstAmount.toFixed(2)}`, 470, currentY);
    currentY += 14;

    doc.text("SGST (6%):", summaryX, currentY);
    doc.text(`Rs. ${data.sgstAmount.toFixed(2)}`, 470, currentY);
    currentY += 14;

    if (data.deliveryFee > 0) {
      doc.text("Delivery Fee:", summaryX, currentY);
      doc.text(`Rs. ${data.deliveryFee.toFixed(2)}`, 470, currentY);
      currentY += 14;
    }

    if (data.discount > 0) {
      doc.text("Discount:", summaryX, currentY);
      doc.text(`-Rs. ${data.discount.toFixed(2)}`, 470, currentY);
      currentY += 14;
    }

    doc.rect(summaryX, currentY, 205, 1).fillColor("#e8e0d3").fill();
    currentY += 6;

    doc.fontSize(11).fillColor("#0e5c4a").text("Net Total:", summaryX, currentY);
    doc.text(`Rs. ${data.totalAmount.toFixed(2)}`, 470, currentY);
    currentY += 20;

    doc.fontSize(8).fillColor("#74807a");
    doc.text(`Payment Method: ${data.paymentMethod}`, 40, currentY);
    doc.text("This is a computer generated tax invoice in accordance with Drugs and Cosmetics Rules.", 40, currentY + 12);
    doc.text("Medicines once sold can only be returned in accordance with state pharmacy rules.", 40, currentY + 22);

    doc.end();

    writeStream.on("finish", () => {
      resolve(`/uploads/invoices/${filename}`);
    });
    writeStream.on("error", (err) => {
      reject(err);
    });
  });
};
