import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";

export async function getOrCreateSession(sessionId) {
  const { workspace } = await getWorkspaceContext();
  if (sessionId) {
    const existing = await prisma.chatSession.findFirst({
      where: { id: sessionId, workspaceId: workspace.id },
    });
    if (existing) return existing;
  }
  return prisma.chatSession.create({
    data: { workspaceId: workspace.id },
  });
}

export async function appendMessage(sessionId, role, content) {
  return prisma.chatMessage.create({
    data: {
      sessionId,
      role,
      content,
    },
  });
}

export async function getRecentMessages(sessionId, limit = 12) {
  const msgs = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return msgs.reverse();
}

export async function getMemory(sessionId) {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  return session?.memory || "";
}

export async function setMemory(sessionId, memory) {
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: { memory },
  });
}
