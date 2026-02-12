import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGoogleAIConfig, isOpenAICompatible, getOllamaConfigForWorkspace } from '@/lib/ai-config';
import { prisma } from "@/lib/prisma";
import { getWorkspaceContext } from "@/lib/workspace";
import { requireAuth } from "@/lib/require-auth";

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

function getCurrentPeriod() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
  return { start, end };
}

// Generate a single email using Google Gemini
async function generateSingleEmailWithGemini(params) {
  const { companyUrl, targetName, yourOffer, tone, style, apiKey, model } = params;

  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model: model || "gemini-pro" });

  const prompt = `You are an expert cold email writer. Generate a personalized, compelling cold email with the following details:

- Target Company/Person: ${targetName ? targetName : "the target person"} (Company: ${companyUrl})
- What you're offering: ${yourOffer}
- Tone: ${tone}
- Style: ${style}

Requirements:
1. Write a professional, engaging cold email
2. Keep it concise (150-200 words max)
3. Make it personalized and relevant to the company/industry
4. Include a clear call-to-action
5. Do NOT include a subject line
6. Sign off with "Best regards," followed by a simple signature placeholder

Return ONLY the email body, nothing else.`;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Generate a single email using Ollama
async function generateSingleEmail(params) {
  const { companyUrl, targetName, yourOffer, tone, style, model, baseUrl, apiKey } = params;
  
  const prompt = `You are an expert cold email writer. Generate a personalized, compelling cold email with the following details:

- Target Company/Person: ${targetName ? targetName : "the target person"} (Company: ${companyUrl})
- What you're offering: ${yourOffer}
- Tone: ${tone}
- Style: ${style}

Requirements:
1. Write a professional, engaging cold email
2. Keep it concise (150-200 words max)
3. Make it personalized and relevant to the company/industry
4. Include a clear call-to-action
5. Do NOT include a subject line
6. Sign off with "Best regards," followed by a simple signature placeholder

Return ONLY the email body, nothing else.`;

  let endpoint, headers, body;

  if (isOpenAICompatible(baseUrl)) {
    // OpenAI-compatible format
    endpoint = baseUrl.replace(/\/$/, '') + '/chat/completions';
    headers = {
      "Content-Type": "application/json",
      ...(apiKey && { "Authorization": `Bearer ${apiKey}` }),
    };
    body = JSON.stringify({
      model: model,
      messages: [
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
  } else {
    // Native Ollama format
    endpoint = `${baseUrl}/api/generate`;
    headers = {
      "Content-Type": "application/json",
    };
    body = JSON.stringify({
      model: model,
      prompt: prompt,
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
    throw new Error(`Ollama API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  
  if (isOpenAICompatible(baseUrl)) {
    return data.choices[0].message.content;
  } else {
    return data.response;
  }
}

// Generate subject lines using Ollama
async function generateSubjectLine(params) {
  const { companyUrl, targetName, yourOffer, model, baseUrl, apiKey } = params;
  
  const prompt = `Generate 5 compelling, concise subject lines for a cold email about "${yourOffer}" to ${targetName ? targetName : "a potential client"} at ${companyUrl}.

Return ONLY the subject lines, one per line, numbered 1-5. Keep them under 60 characters each.`;

  let endpoint, headers, body;

  if (isOpenAICompatible(baseUrl)) {
    endpoint = baseUrl.replace(/\/$/, '') + '/chat/completions';
    headers = {
      "Content-Type": "application/json",
      ...(apiKey && { "Authorization": `Bearer ${apiKey}` }),
    };
    body = JSON.stringify({
      model: model,
      messages: [
        { role: "user", content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
  } else {
    endpoint = `${baseUrl}/api/generate`;
    headers = {
      "Content-Type": "application/json",
    };
    body = JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
    });
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: body,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ollama API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  let response;
  
  if (isOpenAICompatible(baseUrl)) {
    response = data.choices[0].message.content;
  } else {
    response = data.response;
  }
  
  // Parse subject lines from response
  const subjects = response
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
    .filter(line => line.length > 0 && line.length <= 60)
    .slice(0, 5);
  
  return subjects.length > 0 ? subjects : [
    "Quick question",
    "Exploring a potential fit", 
    "Idea worth sharing",
    "Reaching out briefly",
    "Thought this might be relevant"
  ];
}

// Template-based fallback when Ollama is not available
function generateTemplateFallback({ companyUrl, targetName, yourOffer }) {
  const name = targetName ? ` ${targetName}` : "";

  const greetings = ["Hi", "Hello", "Good day", "Greetings", "Hope you're having a great day"];
  const openers = [
    "I came across your company and was genuinely impressed.",
    "I've been following your work and wanted to reach out.",
    "Your company stood out to me while researching this space.",
    "I noticed your team while exploring leaders in your industry.",
    "I've admired how your company approaches its work.",
    "Your product and direction caught my attention recently.",
  ];
  const valueProps = [
    "We help teams improve results without adding complexity.",
    "Our work focuses on clarity, execution, and measurable outcomes.",
    "We support companies looking to move faster and smarter.",
    "We specialize in practical solutions that actually ship.",
    "We help teams remove friction and focus on impact.",
    "Our approach emphasizes long-term value, not quick wins.",
  ];
  const offers = [
    `Specifically, ${yourOffer}.`,
    `One area we often help with is ${yourOffer}.`,
    `This usually involves ${yourOffer}.`,
    `Our recent work includes ${yourOffer}.`,
  ];
  const ctas = [
    "Would you be open to a short conversation?",
    "Open to a brief intro call?",
    "Happy to share more context if helpful.",
    "Would it make sense to explore this further?",
    "Let me know if this is worth discussing.",
  ];
  const subjects = [
    "Quick question",
    "Exploring a potential fit",
    "Idea worth sharing",
    "Reaching out briefly",
    "Thought this might be relevant",
    "Potential collaboration",
    "A short introduction",
  ];

  const templates = [
    ({ g, o, v, of, c }) => `${g}${name},\n\n${o}\n\n${v}\n${of}\n\n${c}\n\nBest regards,`,
    ({ g, v, of, c }) => `${g}${name},\n\nI'll keep this brief.\n\n${v}\n${of}\n\n${c}\n\nBest regards,`,
    ({ g, o, of }) => `${g}${name},\n\n${o}\n${of}\n\nIf helpful, happy to share more.\n\nBest regards,`,
    ({ g, v, c }) => `${g}${name},\n\n${v}\n\n${c}\n\nBest regards,`,
  ];

  const emails = Array.from({ length: 30 }).map((_, i) => {
    const template = templates[i % templates.length];
    return {
      style: ["Professional", "Warm", "Friendly", "Consultative"][i % 4],
      subject: subjects[i % subjects.length],
      body: template({
        g: greetings[i % greetings.length],
        o: openers[i % openers.length],
        v: valueProps[i % valueProps.length],
        of: offers[i % offers.length],
        c: ctas[i % ctas.length],
      }).trim(),
      aiGenerated: false,
    };
  });

  return { emails };
}

export async function POST(req) {
  // Always return valid JSON, even on error
  let body = {};
  try {
    const auth = await requireAuth();
    if (!auth) {
      const url = new URL("/auth", req.url);
      url.searchParams.set("callbackUrl", "/");
      return NextResponse.redirect(url);
    }

    const { workspace } = await getWorkspaceContext();
    body = await req.json().catch(() => ({}));
    const { companyUrl, targetName, yourOffer } = body;

    if (!companyUrl || !yourOffer) {
      return NextResponse.json(
        { 
          error: "Missing required fields: companyUrl and yourOffer are required",
          emails: [],
          aiGenerated: false
        },
        { status: 400 }
      );
    }

    const ollamaConfig = await getOllamaConfigForWorkspace(workspace.id, prisma);
    const googleConfig = getGoogleAIConfig();
    const googleApiKey = googleConfig.apiKey;
    const aiService = googleApiKey ? 'gemini' : 'ollama';
    const { baseUrl: ollamaBaseUrl, model: preferredModel, apiKey: ollamaApiKey } = ollamaConfig;
    const useOpenAI = isOpenAICompatible(ollamaBaseUrl);
    
    // Check if Ollama is available (even if Gemini is preferred, so we can fallback)
    let ollamaAvailable = false;
    const healthEndpoint = useOpenAI 
      ? `${ollamaBaseUrl.replace(/\/$/, '')}/models`
      : `${ollamaBaseUrl}/api/tags`;
    
    try {
      const healthCheck = await fetch(healthEndpoint, { 
        signal: AbortSignal.timeout(3000),
        headers: useOpenAI && ollamaApiKey 
          ? { "Authorization": `Bearer ${ollamaApiKey}` }
          : {}
      });
      ollamaAvailable = healthCheck.ok;
    } catch (err) {
      console.warn("Ollama health check failed:", err.message);
      ollamaAvailable = false;
    }

    if (aiService === 'ollama' && !ollamaAvailable) {
      console.log("Using template fallback - Ollama not available");
      const fallback = generateTemplateFallback({ companyUrl, targetName, yourOffer });
      return NextResponse.json({ 
        emails: fallback.emails,
        aiGenerated: false,
        error: "AI service not available, using templates"
      });
    }
    
    // Auto-detect best available model for Ollama
    const ollamaModel = ollamaAvailable ? await getBestModel(preferredModel, ollamaBaseUrl) : preferredModel;
    const preferredLabel = aiService === 'ollama' ? preferredModel : googleConfig.model;
    console.log(`Preferred service: ${aiService}, preferred model: ${preferredLabel}`);
    
    // Define tone and style combinations
    const combinations = [
      { tone: "Professional", style: "Professional" },
      { tone: "Warm and Friendly", style: "Warm" },
      { tone: "Casual and Direct", style: "Friendly" },
      { tone: "Consultative", style: "Consultative" },
    ];

    // Generate subject lines first (prefer Ollama if available)
    let subjects;
    try {
      if (ollamaAvailable) {
        subjects = await generateSubjectLine({ companyUrl, targetName, yourOffer, model: ollamaModel, baseUrl: ollamaBaseUrl, apiKey: ollamaApiKey });
      } else {
        throw new Error("Ollama unavailable for subject lines");
      }
    } catch (err) {
      console.error("Subject line generation failed:", err);
      subjects = [
        "Quick question",
        "Exploring a potential fit",
        "Idea worth sharing",
        "Reaching out briefly",
        "Thought this might be relevant"
      ];
    }

    // Generate emails in parallel batches
    const emails = [];
    let usedGemini = false;
    let usedOllama = false;

    // Generate 30 emails (7-8 batches of 4 variations)
    for (let batch = 0; batch < 8; batch++) {
      const batchPromises = [];
      
      for (let i = 0; i < 4; i++) {
        const index = (batch * 4 + i) % 4;
        const { tone, style } = combinations[index];
        
        if (aiService === 'gemini') {
          batchPromises.push(
            generateSingleEmailWithGemini({
              companyUrl,
              targetName,
              yourOffer,
              tone,
              style,
              apiKey: googleApiKey,
              model: googleConfig.model,
            }).catch(err => {
              console.error(`Error generating email ${batch * 4 + i}:`, err);
              return null;
            })
          );
        } else {
          batchPromises.push(
            generateSingleEmail({
              companyUrl,
              targetName,
              yourOffer,
              tone,
              style,
              model: ollamaModel,
              baseUrl: ollamaBaseUrl,
              apiKey: ollamaApiKey,
            }).catch(err => {
              console.error(`Error generating email ${batch * 4 + i}:`, err);
              return null;
            })
          );
        }
      }

      const batchResults = await Promise.all(batchPromises);
      
      for (let i = 0; i < batchResults.length; i++) {
        let body = batchResults[i];
        const index = (batch * 4 + i) % 4;

        if (!body && aiService === 'gemini' && ollamaAvailable) {
          // Fallback to Ollama if Gemini fails
          try {
            body = await generateSingleEmail({
              companyUrl,
              targetName,
              yourOffer,
              tone: combinations[index].tone,
              style: combinations[index].style,
              model: ollamaModel,
              baseUrl: ollamaBaseUrl,
              apiKey: ollamaApiKey,
            });
            usedOllama = true;
          } catch (err) {
            console.error(`Ollama fallback failed for email ${batch * 4 + i}:`, err);
            body = null;
          }
        }

        if (body) {
          if (aiService === 'gemini') usedGemini = true;
          else usedOllama = true;

          emails.push({
            style: combinations[index].style,
            tone: combinations[index].tone,
            subject: subjects[index % subjects.length],
            body: body.trim(),
            aiGenerated: true,
          });
        }
      }

      if (emails.length >= 30) break;
    }

    // If we don't have enough AI-generated emails, use fallback for remaining
    if (emails.length < 30) {
      const templateEmails = generateTemplateFallback({ companyUrl, targetName, yourOffer });
      const remainingNeeded = 30 - emails.length;
      emails.push(...templateEmails.emails.slice(0, remainingNeeded).map(e => ({ ...e, aiGenerated: false })));
    }

    const sliced = emails.slice(0, 30);
    const anyAi = sliced.some(e => e.aiGenerated);
    const modelUsed = usedGemini ? googleConfig.model : usedOllama ? ollamaModel : "template";

    try {
      const { start, end } = getCurrentPeriod();
      await prisma.usage.upsert({
        where: { workspaceId: workspace.id },
        update: { emailsGenerated: { increment: sliced.length } },
        create: {
          workspaceId: workspace.id,
          periodStart: start,
          periodEnd: end,
          emailsGenerated: sliced.length,
          limit: 500,
        },
      });
      await prisma.activityLog.create({
        data: {
          workspaceId: workspace.id,
          action: "emails.generated",
          metadata: { count: sliced.length, aiGenerated: anyAi, model: modelUsed },
        },
      });
    } catch (e) {
      console.error("Usage tracking error:", e);
    }

    return NextResponse.json({
      emails: sliced,
      aiGenerated: anyAi,
      model: modelUsed,
    });

  } catch (err) {
    console.error("Email generation error:", err);
    const fallback = generateTemplateFallback({ 
      companyUrl: body.companyUrl || "", 
      targetName: body.targetName || "", 
      yourOffer: body.yourOffer || "" 
    });
    
    return NextResponse.json({ 
      emails: fallback.emails,
      aiGenerated: false,
      error: "AI generation failed, using templates: " + err.message
    });
  }
}
