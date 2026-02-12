import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";

function getCurrentPeriod() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
  return { start, end };
}

export async function GET() {
  try {
    const { workspace } = await getWorkspaceContext();
    const { start, end } = getCurrentPeriod();

    const usage = await prisma.usage.upsert({
      where: { workspaceId: workspace.id },
      update: {},
      create: {
        workspaceId: workspace.id,
        periodStart: start,
        periodEnd: end,
        emailsGenerated: 0,
        limit: 500,
      },
    });

    return NextResponse.json({
      success: true,
      data: usage,
    });
  } catch (err) {
    console.error("Usage fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
