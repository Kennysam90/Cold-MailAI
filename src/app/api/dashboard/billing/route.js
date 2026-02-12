import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";

export async function GET() {
  try {
    const { workspace } = await getWorkspaceContext();
    const billing = await prisma.billing.upsert({
      where: { workspaceId: workspace.id },
      update: {},
      create: {
        workspaceId: workspace.id,
        provider: "STRIPE",
        planName: "Free",
        status: "active",
        renewsAt: null,
      },
    });

    return NextResponse.json({ success: true, data: billing });
  } catch (err) {
    console.error("Billing fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
