// AI Configuration Utility
// This file centralizes AI configuration for the application

export function getOllamaConfig() {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama3.2",
    apiKey: process.env.OLLAMA_API_KEY || null,
  };
}

export async function getOllamaConfigForWorkspace(workspaceId, prisma) {
  const defaults = getOllamaConfig();
  if (!workspaceId || !prisma) return defaults;
  const settings = await prisma.workspaceSettings.findUnique({
    where: { workspaceId },
  });
  if (!settings) return defaults;
  return {
    baseUrl: settings.ollamaBaseUrl || defaults.baseUrl,
    model: settings.ollamaModel || defaults.model,
    apiKey: settings.ollamaApiKey || defaults.apiKey,
  };
}

export function getGoogleAIConfig() {
  return {
    apiKey: process.env.GOOGLE_AI_API_KEY || null,
    model: process.env.GOOGLE_AI_MODEL || "gemini-pro",
  };
}

export function isOpenAICompatible(baseUrl) {
  return baseUrl.includes('/v1') || baseUrl.includes('openai');
}

export async function checkOllamaHealth(baseUrl, timeoutMs = 2000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${baseUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return { ok: res.ok, status: res.status, models: res.ok ? await res.json() : null };
  } catch (err) {
    return { ok: false, status: 'error', error: err.message, models: null };
  }
}
