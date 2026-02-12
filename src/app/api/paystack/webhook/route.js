import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: "Paystack webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");

  if (!signature || hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch (e) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const event = payload.event;
  const data = payload.data || {};
  const workspaceId = data?.metadata?.workspaceId;

  try {
    if (workspaceId) {
      const status = data.status === "success" ? "active" : data.status || "pending";
      const currentPeriodEnd = data.next_payment_date ? new Date(data.next_payment_date) : null;
      await prisma.billing.upsert({
        where: { workspaceId },
        update: {
          provider: "PAYSTACK",
          planName: "Premium",
          status,
          paystackCustomerCode: data.customer?.customer_code || null,
          paystackSubscriptionCode: data.subscription_code || data.plan_code || null,
          currentPeriodEnd,
        },
        create: {
          workspaceId,
          provider: "PAYSTACK",
          planName: "Premium",
          status,
          renewsAt: null,
          paystackCustomerCode: data.customer?.customer_code || null,
          paystackSubscriptionCode: data.subscription_code || data.plan_code || null,
          currentPeriodEnd,
        },
      });
    } else if (data.subscription_code) {
      await prisma.billing.updateMany({
        where: { paystackSubscriptionCode: data.subscription_code },
        data: {
          status: data.status === "success" ? "active" : data.status || "pending",
          currentPeriodEnd: data.next_payment_date ? new Date(data.next_payment_date) : null,
        },
      });
    }

    return NextResponse.json({ received: true, event });
  } catch (err) {
    console.error("Paystack webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
