import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getWorkspaceContext();
  const templates = await prisma.template.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: templates });
}

export async function POST(req) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getWorkspaceContext();
  const body = await req.json();
  const { name, subject, body: content } = body || {};

  if (!name || !subject || !content) {
    return NextResponse.json({ success: false, error: "name, subject, and body are required" }, { status: 400 });
  }

  const created = await prisma.template.create({
    data: {
      workspaceId: workspace.id,
      name,
      subject,
      body: content,
    },
  });

  return NextResponse.json({ success: true, data: created });
}
