import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";

export async function GET() {
  try {
    const { workspace } = await getWorkspaceContext();

    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId: workspace.id, abEnabled: true },
      include: { events: true },
      orderBy: { createdAt: "desc" },
    });

    const data = campaigns.map(c => {
      const summary = {
        a: { sent: 0, opened: 0, clicked: 0, replied: 0 },
        b: { sent: 0, opened: 0, clicked: 0, replied: 0 },
      };

      c.events.forEach(e => {
        const variant = e.meta?.variant || "a";
        const bucket = variant === "b" ? summary.b : summary.a;
        if (e.type === "SENT") bucket.sent += 1;
        if (e.type === "OPENED") bucket.opened += 1;
        if (e.type === "CLICKED") bucket.clicked += 1;
        if (e.type === "REPLIED") bucket.replied += 1;
      });

      return {
        id: c.id,
        name: c.name,
        variantA: c.abVariantA || "Variant A",
        variantB: c.abVariantB || "Variant B",
        summary,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("A/B fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
