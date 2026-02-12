import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";

function parseRange(range) {
  const now = new Date();
  if (range === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (range === "90d") return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  return null;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const { workspace } = await getWorkspaceContext();

    const q = searchParams.get("q") || "";
    const status = searchParams.get("status");
    const range = searchParams.get("range");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(5, parseInt(searchParams.get("pageSize") || "10", 10)));
    const skip = (page - 1) * pageSize;

    const createdAfter = parseRange(range);

    const where = {
      workspaceId: workspace.id,
      ...(q
        ? {
            name: {
              contains: q,
              mode: "insensitive",
            },
          }
        : {}),
      ...(status ? { status } : {}),
      ...(createdAfter ? { createdAt: { gte: createdAfter } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.campaign.count({ where }),
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
    console.error("Campaigns fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
