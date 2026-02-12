import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";

function parseRange(range) {
  const now = new Date();
  if (range === "7d") return { days: 7, start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
  if (range === "30d") return { days: 30, start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
  if (range === "90d") return { days: 90, start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
  return { days: 30, start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
}

function formatDay(d) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";
    const { days, start } = parseRange(range);

    const { workspace } = await getWorkspaceContext();
    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId: workspace.id },
      include: { events: true },
    });

    const series = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      series[formatDay(d)] = { generated: 0, opened: 0, clicked: 0, replied: 0, sent: 0 };
    }

    campaigns.forEach(c => {
      c.events.forEach(e => {
        if (e.createdAt < start) return;
        const key = formatDay(new Date(e.createdAt));
        if (!series[key]) return;
        const count = Number(e.meta?.count || 1);
        if (e.type === "GENERATED") series[key].generated += count;
        if (e.type === "OPENED") series[key].opened += count;
        if (e.type === "CLICKED") series[key].clicked += count;
        if (e.type === "REPLIED") series[key].replied += count;
        if (e.type === "SENT") series[key].sent += count;
      });
    });

    return NextResponse.json({
      success: true,
      data: Object.entries(series).map(([date, metrics]) => ({ date, ...metrics })),
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
