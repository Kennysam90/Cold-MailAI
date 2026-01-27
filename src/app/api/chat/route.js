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


// 2️⃣ API handler
export async function POST(req) {
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


  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "tinyllama",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-8),
      ],
      stream: false,
    }),
  });

  const data = await res.json();

  return Response.json({
    reply: data.message.content,
  });

  
}
