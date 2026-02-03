import { getSiteUrl } from "@/lib/site";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const resendKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM;

async function sendEmail(input: SendEmailInput) {
  if (!resendKey || !resendFrom) {
    throw new Error("Email service is not configured.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    throw new Error("Unable to send email.");
  }
}

export async function sendContactEmail(input: {
  to: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  message: string;
  orderNumber?: string | null;
  issueType?: string | null;
  address?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  } | null;
}) {
  const safeOrder = input.orderNumber ? `Order: ${input.orderNumber}` : "Order: n/a";
  const safeIssue = input.issueType ? `Issue: ${input.issueType}` : "Issue: general";
  const safeAddress = input.address
    ? `Address: ${input.address.line1}${input.address.line2 ? `, ${input.address.line2}` : ""}, ${input.address.city}, ${input.address.state} ${input.address.postalCode}`
    : "Address: n/a";
  const subject = input.subject;
  const text = [
    `From: ${input.fromName} <${input.fromEmail}>`,
    safeOrder,
    safeIssue,
    safeAddress,
    "",
    input.message,
  ].join("\n");
  const html = `
    <p><strong>From:</strong> ${input.fromName} &lt;${input.fromEmail}&gt;</p>
    <p><strong>${safeOrder}</strong></p>
    <p><strong>${safeIssue}</strong></p>
    <p><strong>${safeAddress}</strong></p>
    <p>${input.message.replace(/\n/g, "<br />")}</p>
  `;
  await sendEmail({ to: input.to, subject, html, text });
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${getSiteUrl()}/verify-email?token=${token}`;
  const subject = "Verify your email";
  const text = `Verify your email address by visiting: ${url}`;
  const html = `
    <p>Thanks for signing up for Delicious Wines.</p>
    <p>Verify your email address by clicking the link below:</p>
    <p><a href="${url}">Verify email</a></p>
    <p>If you did not create an account, you can ignore this email.</p>
  `;
  await sendEmail({ to, subject, html, text });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${getSiteUrl()}/reset-password?token=${token}`;
  const subject = "Reset your password";
  const text = `Reset your password by visiting: ${url}`;
  const html = `
    <p>We received a request to reset your password.</p>
    <p>Reset your password by clicking the link below:</p>
    <p><a href="${url}">Reset password</a></p>
    <p>If you did not request a reset, you can ignore this email.</p>
  `;
  await sendEmail({ to, subject, html, text });
}
