"use client";

import React, { useState } from "react";
import Sidebar from "@/Component/sidebar";
import { Copy, Check, Sparkles } from "lucide-react";

export default function TemplatesPage() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const templates = [
    {
      id: 1,
      name: "Cold Outreach - SaaS",
      subject: "Quick question about {company}",
      body: `Hi {name},

I noticed {company} has been growing rapidly, and I thought you might be interested in how other {industry} companies are scaling their outreach.

We've helped {similar_company} increase their response rates by 40% with personalized cold emails.

Would you be open to a 5-minute call to share some strategies?

Best,
[Your Name]`,
    },
    {
      id: 2,
      name: "Follow-up",
      subject: "Re: Quick question about {company}",
      body: `Hi {name},

Just following up on my previous email - I understand you're busy, but I think this could really help with your outreach efforts.

If now isn't a good time, no worries at all.

Best,
[Your Name]`,
    },
    {
      id: 3,
      name: "Warm Introduction",
      subject: "Mutual connection - {company}",
      body: `Hi {name},

{name_of_mutual_connection} suggested I reach out to you. They mentioned you're working on scaling {company}'s sales process.

I'd love to share some insights from our work with {similar_company}.

Would you have 15 minutes this week for a quick chat?

Best,
[Your Name]`,
    },
  ];

  const copy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex justify-center overflow-y-auto" style={{ marginLeft: "80px" }}>
        <div className="max-w-4xl w-full px-10 py-12 space-y-10">
          {/* HEADER */}
          <div className="space-y-2" style={{ justifyContent: "center", textAlign: "center", marginBottom: "1em" }}>
            <h1 className="text-4xl font-bold">Email Templates</h1>
            <p className="text-gray-400">
              Pre-built templates to jumpstart your cold outreach campaigns.
            </p>
          </div>

          {/* TEMPLATES GRID */}
          <div className="grid gap-6" style={{ marginTop: "2em" }}>
            {templates.map((template, index) => (
              <div
                key={template.id}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-7 space-y-4"
                style={{ marginTop: "2em" }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    <span className="text-indigo-400 text-sm font-medium">{template.name}</span>
                  </div>

                  <button
                    onClick={() => copy(`Subject: ${template.subject}\n\n${template.body}`, index)}
                    className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition"
                  >
                    {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                    {copiedIndex === index ? "Copied" : "Copy"}
                  </button>
                </div>

                <p className="font-semibold text-lg">{template.subject}</p>

                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {template.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

