import Stripe from "stripe";
import { getRuntimeSetting } from "./settings";

async function getStripe(): Promise<Stripe> {
  const key = await getRuntimeSetting("stripe_secret_key");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export async function createStripeCheckoutSession(params: {
  amountCents: number;
  orderId: number;
  paymentMethodType: "card" | "paypal";
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  const stripe = await getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: [params.paymentMethodType],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "RULF.CC Order" },
          unit_amount: params.amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { orderId: String(params.orderId) },
  });
  return { id: session.id, url: session.url! };
}

export async function constructStripeEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
  const secret = await getRuntimeSetting("stripe_webhook_secret");
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  const stripe = await getStripe();
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
