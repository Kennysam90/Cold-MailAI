import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const upsertByWorkspace = async (workspaceId, data) => {
    await prisma.billing.upsert({
      where: { workspaceId },
      update: data,
      create: {
        workspaceId,
        provider: "STRIPE",
        planName: "Premium",
        status: data.status || "active",
        renewsAt: data.renewsAt || null,
        stripeCustomerId: data.stripeCustomerId || null,
        stripeSubscriptionId: data.stripeSubscriptionId || null,
        currentPeriodEnd: data.currentPeriodEnd || null,
      },
    });
  };

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const workspaceId = session?.metadata?.workspaceId || session?.client_reference_id;
      if (!workspaceId) {
        return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
      }

      let subscription = null;
      if (session?.subscription) {
        subscription = await stripe.subscriptions.retrieve(session.subscription);
      }

      await upsertByWorkspace(workspaceId, {
        provider: "STRIPE",
        planName: "Premium",
        status: subscription?.status || "active",
        renewsAt: null,
        stripeCustomerId: session.customer || null,
        stripeSubscriptionId: subscription?.id || session.subscription || null,
        currentPeriodEnd: subscription?.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      });
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const status = subscription.status || (event.type === "customer.subscription.deleted" ? "canceled" : "active");
      const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null;

      const updated = await prisma.billing.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status,
          currentPeriodEnd,
          stripeCustomerId: subscription.customer || null,
        },
      });

      if (updated.count === 0) {
        const workspaceId = subscription.metadata?.workspaceId;
        if (workspaceId) {
          await upsertByWorkspace(workspaceId, {
            status,
            stripeCustomerId: subscription.customer || null,
            stripeSubscriptionId: subscription.id,
            currentPeriodEnd,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
