import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";
import { requireAuth } from "@/lib/require-auth";

export async function GET(_req, { params }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getWorkspaceContext();
  const template = await prisma.template.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
  });

  if (!template) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: template });
}

export async function PATCH(req, { params }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getWorkspaceContext();
  const body = await req.json();
  const { name, subject, body: content } = body || {};

  const updated = await prisma.template.updateMany({
    where: { id: params.id, workspaceId: workspace.id },
    data: {
      ...(name ? { name } : {}),
      ...(subject ? { subject } : {}),
      ...(content ? { body: content } : {}),
    },
  });

  if (updated.count === 0) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const template = await prisma.template.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
  });

  return NextResponse.json({ success: true, data: template });
}

export async function DELETE(_req, { params }) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getWorkspaceContext();
  const deleted = await prisma.template.deleteMany({
    where: { id: params.id, workspaceId: workspace.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
