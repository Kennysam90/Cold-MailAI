import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";
import { requireAuth } from "@/lib/require-auth";
import { getOllamaConfigForWorkspace } from "@/lib/ai-config";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getWorkspaceContext();
  const config = await getOllamaConfigForWorkspace(workspace.id, prisma);

  return NextResponse.json({ success: true, data: config });
}

export async function PUT(req) {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { workspace } = await getWorkspaceContext();
  const body = await req.json();
  const { baseUrl, model, apiKey } = body || {};

  const updated = await prisma.workspaceSettings.upsert({
    where: { workspaceId: workspace.id },
    update: {
      ollamaBaseUrl: baseUrl || null,
      ollamaModel: model || null,
      ollamaApiKey: apiKey || null,
    },
    create: {
      workspaceId: workspace.id,
      ollamaBaseUrl: baseUrl || null,
      ollamaModel: model || null,
      ollamaApiKey: apiKey || null,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
