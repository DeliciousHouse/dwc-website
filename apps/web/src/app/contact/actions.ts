"use server";

import { sendContactEmail } from "@/lib/email";

export type ContactState = {
  ok: boolean;
  message?: string;
  error?: string;
};

const SUPPORT_EMAIL = "bkam@deliciouswines.org";

export async function contactAction(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const issueType = String(formData.get("issueType") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const addressLine1 = String(formData.get("addressLine1") ?? "").trim();
  const addressLine2 = String(formData.get("addressLine2") ?? "").trim();
  const addressCity = String(formData.get("addressCity") ?? "").trim();
  const addressState = String(formData.get("addressState") ?? "").trim();
  const addressPostal = String(formData.get("addressPostal") ?? "").trim();

  if (!name || !email.includes("@") || !message) {
    return { ok: false, error: "Please provide your name, email, and a message." };
  }

  if (issueType === "order") {
    if (!orderNumber) {
      return { ok: false, error: "Please provide your order number for order issues." };
    }
    if (!addressLine1 || !addressCity || !addressState || !addressPostal) {
      return { ok: false, error: "Please provide your shipping address for order issues." };
    }
  }

  const address =
    addressLine1 || addressCity || addressState || addressPostal
      ? {
          line1: addressLine1,
          line2: addressLine2 || null,
          city: addressCity,
          state: addressState,
          postalCode: addressPostal,
        }
      : null;

  const subjectPrefix = issueType === "order" ? "Order issue" : "General inquiry";
  const subject = `${subjectPrefix} from ${name}`;

  try {
    await sendContactEmail({
      to: SUPPORT_EMAIL,
      fromEmail: email,
      fromName: name,
      subject,
      message,
      orderNumber: orderNumber || null,
      issueType: issueType || null,
      address,
    });
  } catch {
    return { ok: false, error: "Unable to send your message. Please try again later." };
  }

  return { ok: true, message: "Thanks! We received your message and will reply soon." };
}
