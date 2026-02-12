import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const auth = await requireAuth();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, amount } = await req.json();

    if (!email || !amount) {
      return NextResponse.json(
        { error: "Email and amount are required" },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Paystack secret key missing" },
        { status: 500 }
      );
    }

    const { workspace } = await getWorkspaceContext();
    const callbackUrl = process.env.NEXT_PUBLIC_URL
      ? `${process.env.NEXT_PUBLIC_URL}/success?provider=paystack`
      : "https://yourwebsite.com/success";

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        callback_url: callbackUrl,
        metadata: {
          workspaceId: workspace.id,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Paystack initialization failed" },
        { status: response.status }
      );
    }

    await prisma.billing.upsert({
      where: { workspaceId: workspace.id },
      update: {
        provider: "PAYSTACK",
        planName: "Premium",
        status: "pending",
      },
      create: {
        workspaceId: workspace.id,
        provider: "PAYSTACK",
        planName: "Premium",
        status: "pending",
        renewsAt: null,
      },
    });

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (err) {
    console.error("Paystack init error:", err);
    return NextResponse.json(
      { error: "Paystack initialization failed" },
      { status: 500 }
    );
  }
}
