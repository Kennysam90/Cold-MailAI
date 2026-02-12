import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(10, parseInt(searchParams.get("pageSize") || "20", 10)));
    const skip = (page - 1) * pageSize;

    const { workspace } = await getWorkspaceContext();
    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.activityLog.count({ where: { workspaceId: workspace.id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("Activity fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
