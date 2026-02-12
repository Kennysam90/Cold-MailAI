import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { getWorkspaceContext } from "@/lib/workspace";

export async function GET() {
  try {
    const { workspace } = await getWorkspaceContext();
    const invites = await prisma.workspaceInvite.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: invites });
  } catch (err) {
    console.error("Invites fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { workspace } = await getWorkspaceContext();
    const { email, role, expiresInDays = 7 } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId: workspace.id,
        email,
        role: role || "MEMBER",
        token,
        expiresAt,
      },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: workspace.id,
        action: "workspace.invite_created",
        metadata: { email, role: invite.role },
      },
    });

    return NextResponse.json({ success: true, data: invite });
  } catch (err) {
    console.error("Invite create error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { action, token, email } = await req.json();

    let invite;
    if (action === "accept") {
      invite = await prisma.workspaceInvite.findFirst({
        where: { token },
      });
    } else {
      const { workspace } = await getWorkspaceContext();
      invite = await prisma.workspaceInvite.findFirst({
        where: { workspaceId: workspace.id, token },
      });
    }

    if (!invite) {
      return NextResponse.json({ success: false, error: "Invite not found" }, { status: 404 });
    }

    if (action === "revoke") {
      const updated = await prisma.workspaceInvite.update({
        where: { id: invite.id },
        data: { status: "REVOKED" },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "accept") {
      if (!email) {
        return NextResponse.json({ success: false, error: "Email required to accept invite" }, { status: 400 });
      }
      if (invite.status !== "PENDING") {
        return NextResponse.json({ success: false, error: "Invite is no longer active" }, { status: 400 });
      }
      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        await prisma.workspaceInvite.update({
          where: { id: invite.id },
          data: { status: "EXPIRED" },
        });
        return NextResponse.json({ success: false, error: "Invite expired" }, { status: 400 });
      }
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: email.split("@")[0] },
      });
      await prisma.workspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: user.id } },
        update: { role: invite.role },
        create: { workspaceId: invite.workspaceId, userId: user.id, role: invite.role },
      });
      const updated = await prisma.workspaceInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      });
      await prisma.activityLog.create({
        data: {
          workspaceId: invite.workspaceId,
          action: "workspace.invite_accepted",
          metadata: { email },
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Invite update error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
