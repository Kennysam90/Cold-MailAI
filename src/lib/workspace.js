import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function ensureDefaultWorkspace() {
  const defaultWorkspaceId = "default-workspace";
  const defaultUserId = "default-user";

  const workspace = await prisma.workspace.upsert({
    where: { id: defaultWorkspaceId },
    update: {},
    create: {
      id: defaultWorkspaceId,
      name: "Default Workspace",
      isPrivate: true,
    },
  });

  await prisma.user.upsert({
    where: { id: defaultUserId },
    update: {},
    create: {
      id: defaultUserId,
      name: "Owner",
      email: "owner@local.dev",
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: defaultWorkspaceId, userId: defaultUserId } },
    update: {},
    create: {
      workspaceId: defaultWorkspaceId,
      userId: defaultUserId,
      role: "OWNER",
    },
  });

  return workspace;
}

export async function getWorkspaceContext() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  const name = session?.user?.name || null;

  if (!email) {
    return { session: null, workspace: await ensureDefaultWorkspace() };
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: name || undefined },
    create: { email, name: name || email.split("@")[0] },
  });

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
  });

  if (membership?.workspace) {
    return { session, workspace: membership.workspace, user };
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: name ? `${name}'s Workspace` : `${email}'s Workspace`,
      isPrivate: true,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  return { session, workspace, user };
}
