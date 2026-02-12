import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";

export async function GET() {
  try {
    const { workspace } = await getWorkspaceContext();
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: members });
  } catch (err) {
    console.error("Members fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
