import Stripe from "stripe";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe secret key missing" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { workspace, session: userSession } = await getWorkspaceContext();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "ColdMail AI Premium" },
            unit_amount: 900,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      customer_email: userSession?.user?.email || undefined,
      client_reference_id: workspace.id,
      metadata: { workspaceId: workspace.id },
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?provider=stripe`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
    });

    await prisma.billing.upsert({
      where: { workspaceId: workspace.id },
      update: {
        provider: "STRIPE",
        planName: "Premium",
        status: "pending",
      },
      create: {
        workspaceId: workspace.id,
        provider: "STRIPE",
        planName: "Premium",
        status: "pending",
        renewsAt: null,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Stripe checkout failed" },
      { status: 500 }
    );
  }
}
