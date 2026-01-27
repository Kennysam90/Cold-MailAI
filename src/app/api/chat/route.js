import { NextResponse } from 'next/server';

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
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1].content;

    const { intent, confidence } = classifyIntent(lastUserMessage);

    let systemPrompt = `
    You are an intelligent assistant.
    Think step by step before answering.
    Be clear, practical, and structured.
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

    const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const preferredModel = process.env.OLLAMA_MODEL || "tinyllama";
    const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

    const useOpenAI = isOpenAICompatible(OLLAMA_BASE_URL);
    
    // Auto-detect best available model
    const model = await getBestModel(preferredModel, OLLAMA_BASE_URL);
    
    let endpoint, headers, body;

    if (useOpenAI) {
      // OpenAI-compatible format
      endpoint = OLLAMA_BASE_URL.replace(/\/$/, '') + '/chat/completions';
      headers = {
        "Content-Type": "application/json",
        ...(OLLAMA_API_KEY && { "Authorization": `Bearer ${OLLAMA_API_KEY}` }),
      };
      body = JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
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
      body = JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
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
      body: body,
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

    return NextResponse.json({
      reply: reply,
      model: model,
    });

  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: "Failed to get AI response: " + err.message },
      { status: 500 }
    );
  }
}

