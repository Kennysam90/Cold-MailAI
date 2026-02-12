import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";
import { getOrCreateSession, appendMessage, getRecentMessages, getMemory, setMemory } from "@/lib/chat-store";
import { requireAuth } from "@/lib/require-auth";
import { getOllamaConfigForWorkspace } from "@/lib/ai-config";
import crypto from "crypto";

function classifyIntent(text) {
  const t = text.toLowerCase();

  const signals = {
    debug: ["error", "bug", "failed", "issue", "crash"],
    react: ["react", "jsx", "component", "hook", "usestate", "useeffect"],
    explain: ["explain", "what is", "how does", "why", "difference"],
    code: ["code", "example", "snippet", "implement", "write"],
    design: ["architecture", "design", "structure", "flow"],
  };

  let bestIntent = "general";
  let score = 0;

  for (const intent in signals) {
    const currentScore = signals[intent].filter(word => t.includes(word)).length;
    if (currentScore > score) {
      score = currentScore;
      bestIntent = intent;
    }
  }

  return { intent: bestIntent, confidence: score };
}

// Check if URL is for OpenAI-compatible API
function isOpenAICompatible(baseUrl) {
  return baseUrl.includes('/v1') || baseUrl.includes('openai');
}

// Get available models from Ollama
async function getAvailableModels(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      return data.models?.map(m => m.name) || [];
    }
  } catch (err) {
    console.warn("Could not fetch models:", err.message);
  }
  return [];
}

// Get the best available model
async function getBestModel(preferredModel, baseUrl) {
  const available = await getAvailableModels(baseUrl);
  if (available.length === 0) return preferredModel;
  
  // Normalize preferred model name (remove :latest suffix)
  const normalizedPreferred = preferredModel.replace(/:latest$/, '');
  
  // Try exact match first
  if (available.includes(preferredModel) || available.includes(normalizedPreferred)) {
    return preferredModel;
  }
  
  // Try partial match
  const partialMatch = available.find(m => 
    m.toLowerCase().includes(normalizedPreferred.toLowerCase())
  );
  if (partialMatch) return partialMatch;
  
  // Return first available model
  return available[0];
}

// API handler
export async function POST(req) {
  try {
    const auth = await requireAuth();
    if (!auth) {
      const url = new URL("/auth", req.url);
      url.searchParams.set("callbackUrl", "/chat");
      return NextResponse.redirect(url);
    }

    const reqBody = await req.json();
    const { messages = [], sessionId = null } = reqBody;
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const session = await getOrCreateSession(sessionId);
    const memory = await getMemory(session.id);

    const { intent, confidence } = classifyIntent(lastUserMessage);

    let systemPrompt = `
    You are an intelligent assistant for ColdMailAI.
    Think step by step before answering.
    Be clear, practical, and structured.

    If you need to perform an action, respond ONLY with:
    TOOL_CALL: {"name":"tool_name","args":{...}}

    Available tools:
    - create_campaign { name, leads, website, status }
    - update_campaign_status { id, status }
    - list_campaigns { limit }
    - get_stats {}
    - invite_user { email, role }
    `;

    if (confidence < 1) {
      systemPrompt += `
      If the question is unclear, ask ONE clarifying question before answering.
      `;
    }

    if (intent === "debug") {
      systemPrompt += `
      You are a senior software engineer.
      Debug logically:
      1. Identify the problem
      2. Ask for missing info
      3. Suggest fixes
      `;
    }

    if (intent === "react") {
      systemPrompt += `
      You are a React mentor.
      Use simple explanations and small code examples.
      `;
    }

    if (intent === "code") {
      systemPrompt += `
      Only return correct, minimal code.
      No long explanations.
      `;
    }

    if (intent === "design") {
      systemPrompt += `
      Explain architecture using steps or diagrams (text-based).
      `;
    }

    if (intent === "general") {
      systemPrompt += `
      If unsure what the user means, ask a clarifying question first.
      `;
    }

    const { workspace } = await getWorkspaceContext();
    const ollamaConfig = await getOllamaConfigForWorkspace(workspace.id, prisma);
    const OLLAMA_BASE_URL = ollamaConfig.baseUrl || "http://localhost:11434";
    const preferredModel = ollamaConfig.model || "tinyllama";
    const OLLAMA_API_KEY = ollamaConfig.apiKey;

    const useOpenAI = isOpenAICompatible(OLLAMA_BASE_URL);
    
    // Auto-detect best available model
    const model = await getBestModel(preferredModel, OLLAMA_BASE_URL);
    
    // Fetch context for RAG
    const [campaigns, templates, stats] = await Promise.all([
      prisma.campaign.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.template.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.campaign.count({ where: { workspaceId: workspace.id } }),
    ]);

    const contextBlock = `
Context:
Recent campaigns: ${campaigns.map(c => `${c.name} (${c.status}, ${c.leads} leads)`).join("; ") || "none"}
Templates: ${templates.map(t => t.name).join(", ") || "none"}
Total campaigns: ${stats}
Memory: ${memory || "none"}
`;

    // Persist user message
    await appendMessage(session.id, "USER", lastUserMessage);
    
    // Normalize roles for frontend
    const normalizeRole = (role) => role.toLowerCase();

    let endpoint, headers, payload;

    if (useOpenAI) {
      // OpenAI-compatible format
      endpoint = OLLAMA_BASE_URL.replace(/\/$/, '') + '/chat/completions';
      headers = {
        "Content-Type": "application/json",
        ...(OLLAMA_API_KEY && { "Authorization": `Bearer ${OLLAMA_API_KEY}` }),
      };
      payload = JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt + "\n" + contextBlock },
          ...messages.slice(-8),
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      });
    } else {
      // Native Ollama format
      endpoint = `${OLLAMA_BASE_URL}/api/chat`;
      headers = {
        "Content-Type": "application/json",
        ...(OLLAMA_API_KEY && !useOpenAI && { "Authorization": `Bearer ${OLLAMA_API_KEY}` }),
      };
      payload = JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt + "\n" + contextBlock },
          ...messages.slice(-8),
        ],
        stream: false,
        options: {
          temperature: 0.7,
        }
      });
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: payload,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `AI service error: ${res.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const data = await res.json();

    let reply;
    if (useOpenAI) {
      reply = data.choices[0].message.content;
    } else {
      reply = data.message?.content || data.response || "No response from AI";
    }

    // Tool call handling
    const toolMatch = reply.match(/^TOOL_CALL:\s*(\{.*\})/s);
    if (toolMatch) {
      let toolResult = null;
      try {
        const toolCall = JSON.parse(toolMatch[1]);
        const { name, args } = toolCall || {};

        if (name === "create_campaign") {
          const created = await prisma.campaign.create({
            data: {
              workspaceId: workspace.id,
              name: args.name,
              leads: parseInt(args.leads) || 0,
              website: args.website || null,
              status: args.status || "DRAFT",
            },
          });
          toolResult = { ok: true, campaign: created };
        } else if (name === "update_campaign_status") {
          const updated = await prisma.campaign.update({
            where: { id: args.id },
            data: { status: args.status },
          });
          toolResult = { ok: true, campaign: updated };
        } else if (name === "list_campaigns") {
          const items = await prisma.campaign.findMany({
            where: { workspaceId: workspace.id },
            orderBy: { createdAt: "desc" },
            take: Math.min(20, Math.max(1, args?.limit || 5)),
          });
          toolResult = { ok: true, campaigns: items };
        } else if (name === "get_stats") {
          const count = await prisma.campaign.count({ where: { workspaceId: workspace.id } });
          toolResult = { ok: true, campaigns: count };
        } else if (name === "invite_user") {
          const token = crypto.randomUUID();
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          const invite = await prisma.workspaceInvite.create({
            data: {
              workspaceId: workspace.id,
              email: args.email,
              role: args.role || "MEMBER",
              token,
              expiresAt,
            },
          });
          toolResult = { ok: true, invite };
        } else {
          toolResult = { ok: false, error: "Unknown tool" };
        }
      } catch (e) {
        toolResult = { ok: false, error: e.message };
      }

      // Follow-up to craft a natural response
      const toolResponsePrompt = `
Tool result:
${JSON.stringify(toolResult)}

Write a brief, helpful response to the user based on the tool result.
`;
      const toolBody = useOpenAI
        ? JSON.stringify({ model, messages: [{ role: "user", content: toolResponsePrompt }], max_tokens: 200, temperature: 0.3 })
        : JSON.stringify({ model, prompt: toolResponsePrompt, stream: false, options: { temperature: 0.3 } });

      const toolRes = await fetch(endpoint, { method: "POST", headers, body: toolBody });
      if (toolRes.ok) {
        const toolData = await toolRes.json();
        reply = useOpenAI ? toolData.choices[0].message.content : toolData.response;
      }
    }

    // Save assistant reply
    await appendMessage(session.id, "ASSISTANT", reply);

    // Simple memory update every 10 messages
    const recent = await getRecentMessages(session.id, 20);
    if (recent.length >= 10) {
      const summaryPrompt = `
Summarize the conversation in 4-6 bullet points. Focus on user goals and preferences.
Conversation:
${recent.map(m => `${m.role}: ${m.content}`).join("\n")}
`;
      // Use same model to summarize (non-streaming)
      const summaryBody = useOpenAI
        ? JSON.stringify({ model, messages: [{ role: "user", content: summaryPrompt }], max_tokens: 200, temperature: 0.2 })
        : JSON.stringify({ model, prompt: summaryPrompt, stream: false, options: { temperature: 0.2 } });

      const summaryRes = await fetch(endpoint, { method: "POST", headers, body: summaryBody });
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        const summaryText = useOpenAI
          ? summaryData.choices[0].message.content
          : summaryData.response;
        await setMemory(session.id, summaryText.trim());
      }
    }

    return NextResponse.json({
      reply: reply,
      model: model,
      sessionId: session.id,
      role: "assistant",
    });

  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: "Failed to get AI response: " + err.message },
      { status: 500 }
    );
  }
}
