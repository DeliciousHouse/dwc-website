import Stripe from "stripe";
import { getPrisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const secretKey = process.env.STRIPE_SECRET_KEY;

function getStripeClient() {
  if (!secretKey) return null;
  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",
  });
}

export async function POST(req: Request) {
  if (!webhookSecret || !secretKey) {
    return new Response("Stripe webhook not configured.", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature.", { status: 400 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return new Response("Stripe not configured.", { status: 500 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    return new Response(`Webhook error: ${message}`, { status: 400 });
  }

  const prisma = getPrisma();

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId ?? null;

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
        select: { id: true, status: true },
      });

      if (!order || order.status === "paid") return;

      const reservations = await tx.inventoryReservation.findMany({
        where: { orderId: order.id, status: "reserved" },
      });

      for (const reservation of reservations) {
        await tx.product.update({
          where: { id: reservation.productId },
          data: { inventoryOnHand: { decrement: reservation.qty } },
        });
      }

      if (reservations.length) {
        await tx.inventoryReservation.updateMany({
          where: { orderId: order.id, status: "reserved" },
          data: { status: "consumed" },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: "paid" },
      });
    });

    await writeAuditLog({
      action: "checkout_payment_succeeded",
      entityType: "order",
      entityId: orderId,
      data: { paymentIntentId: paymentIntent.id },
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId ?? null;

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
        select: { id: true, status: true },
      });

      if (!order || order.status === "cancelled") return;

      await tx.inventoryReservation.updateMany({
        where: { orderId: order.id, status: "reserved" },
        data: { status: "released" },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: "cancelled" },
      });
    });

    await writeAuditLog({
      action: "checkout_payment_failed",
      entityType: "order",
      entityId: orderId,
      data: { paymentIntentId: paymentIntent.id },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
