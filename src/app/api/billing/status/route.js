import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getWorkspaceContext();
  const billing = await prisma.billing.findUnique({ where: { workspaceId: workspace.id } });
  const isPremium = billing?.status === "active" && billing?.planName?.toLowerCase() !== "free";

  return NextResponse.json({ success: true, data: { isPremium, billing } });
}
