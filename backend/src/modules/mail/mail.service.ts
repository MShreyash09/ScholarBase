import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

interface SendMailInput {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Transactional email via **Brevo** (https://www.brevo.com), on their free
 * tier: 300 emails/day, forever, no credit card.
 *
 * Chosen over the obvious alternatives for one specific reason — Brevo lets you
 * send to arbitrary recipients after verifying a single *sender address* (a
 * Gmail account works). Resend's free tier is more generous on volume but only
 * delivers to arbitrary recipients once you have verified a **domain**; until
 * then it only mails your own account address, which is useless for resetting
 * a student's password. ScholarBase is deployed on vercel.app / onrender.com
 * subdomains with no domain of its own, so Brevo is the one that actually works
 * today. If a domain gets bought later, swapping providers is this file only.
 *
 * With no API key configured the service logs the message instead of sending —
 * that keeps local development working without credentials, and makes a
 * misconfigured production deploy fail loudly in the logs rather than silently
 * swallowing password resets.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  private get apiKey(): string | undefined {
    return this.config.get<string>("BREVO_API_KEY")?.trim() || undefined;
  }

  async send({ to, toName, subject, html, text }: SendMailInput): Promise<void> {
    const apiKey = this.apiKey;
    const senderEmail = this.config.get<string>("MAIL_FROM_EMAIL", "no-reply@scholarbase.local");
    const senderName = this.config.get<string>("MAIL_FROM_NAME", "ScholarBase");

    if (!apiKey) {
      this.logger.warn(
        `BREVO_API_KEY is not set — not sending "${subject}" to ${to}. ` +
          `Message body follows so local development still works:\n${text}`,
      );
      return;
    }

    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      // Deliberately does not include the recipient in the thrown error — the
      // caller turns any failure into the same generic response so that a
      // failed send can't be used to probe which addresses exist.
      const body = await response.text().catch(() => "");
      this.logger.error(`Brevo rejected the send (${response.status}): ${body.slice(0, 400)}`);
      throw new Error("Email delivery failed");
    }
  }

  async sendPasswordReset(to: string, fullName: string, resetUrl: string, ttlMinutes: number) {
    const subject = "Reset your ScholarBase password";
    const text = [
      `Hi ${fullName},`,
      "",
      "Someone asked to reset the password for your ScholarBase account.",
      `Open this link to choose a new one (it expires in ${ttlMinutes} minutes and can only be used once):`,
      "",
      resetUrl,
      "",
      "If it wasn't you, you can ignore this email — your password stays unchanged.",
      "",
      "— ScholarBase",
    ].join("\n");

    const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111827">
  <h1 style="margin:0 0 16px;font-size:20px;color:#850013">Reset your password</h1>
  <p style="margin:0 0 12px;line-height:1.6">Hi ${escapeHtml(fullName)},</p>
  <p style="margin:0 0 20px;line-height:1.6">
    Someone asked to reset the password for your ScholarBase account.
    Choose a new one using the button below — the link expires in
    <strong>${ttlMinutes} minutes</strong> and can only be used once.
  </p>
  <p style="margin:0 0 24px">
    <a href="${escapeHtml(resetUrl)}"
       style="display:inline-block;background:#850013;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:30px;font-weight:600">
      Reset password
    </a>
  </p>
  <p style="margin:0 0 8px;line-height:1.6;font-size:13px;color:#6b7280">
    If the button doesn't work, paste this into your browser:
  </p>
  <p style="margin:0 0 24px;word-break:break-all;font-size:13px;color:#6b7280">${escapeHtml(resetUrl)}</p>
  <p style="margin:0;line-height:1.6;font-size:13px;color:#6b7280">
    If it wasn't you, ignore this email — your password stays unchanged.
  </p>
</div>`.trim();

    await this.send({ to, toName: fullName, subject, html, text });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
