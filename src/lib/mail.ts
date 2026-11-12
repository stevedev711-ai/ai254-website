import nodemailer from "nodemailer";
import type { EmailStatus } from "@prisma/client";
import { systemLog } from "./log";

type Mail = { to: string; subject: string; text: string; html: string; replyTo?: string };

let transporter: nodemailer.Transporter | null = null;

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

/** Sends an email and reports the outcome. Never throws: failures are logged for administrators. */
export async function sendMail(mail: Mail, context: string): Promise<EmailStatus> {
  if (!mailConfigured()) {
    await systemLog("WARN", "email", `Email not sent (${context}): SMTP is not configured`, { to: mail.to, subject: mail.subject });
    return "NOT_CONFIGURED";
  }
  try {
    await getTransporter().sendMail({ from: process.env.MAIL_FROM || "AI254 <no-reply@ai254.net>", ...mail });
    return "SENT";
  } catch (err) {
    await systemLog("ERROR", "email", `Email failed (${context})`, { to: mail.to, subject: mail.subject, error: String(err) });
    return "FAILED";
  }
}

export const notifyAddress = () => process.env.NOTIFY_EMAIL || "info@ai254.net";

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function renderTable(rows: [string, string | null | undefined][]) {
  const text = rows.map(([k, v]) => `${k}: ${v ?? "—"}`).join("\n");
  const html =
    `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">` +
    rows
      .map(([k, v]) => `<tr><td style="color:#555;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v ?? "—").replace(/\n/g, "<br>")}</td></tr>`)
      .join("") +
    `</table>`;
  return { text, html };
}

export function brandedHtml(title: string, inner: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111">
  <div style="border-bottom:3px solid #04A0E1;padding:16px 0"><strong style="font-size:20px;color:#111">AI254</strong></div>
  <h2 style="color:#264AA0;font-size:18px">${escapeHtml(title)}</h2>${inner}
  <p style="color:#666;font-size:12px;margin-top:32px">AI254 · Real-time Kiswahili lecture support · info@ai254.net · +254 705 771 360</p></div>`;
}
