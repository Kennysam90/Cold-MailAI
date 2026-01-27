export async function POST(req) {
  try {
    const { companyUrl, targetName, yourOffer } = await req.json();

    if (!companyUrl || !yourOffer) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const name = targetName ? ` ${targetName}` : "";

    const greetings = ["Hi", "Hello", "Good day", "Greetings", "Hope you're having a great day"];
    const openers = [
      "I came across your company and was genuinely impressed.",
      "I’ve been following your work and wanted to reach out.",
      "Your company stood out to me while researching this space.",
      "I noticed your team while exploring leaders in your industry.",
      "I’ve admired how your company approaches its work.",
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
      ({ g, v, of, c }) => `${g}${name},\n\nI’ll keep this brief.\n\n${v}\n${of}\n\n${c}\n\nBest regards,`,
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
      };
    });

    return Response.json({ emails });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
