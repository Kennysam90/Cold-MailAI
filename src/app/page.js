"use client";

import React, { useState } from "react";
import { Mail, Sparkles, Copy, Check, Lock, Crown } from "lucide-react";
import Sidebar from "@/Component/sidebar";

export default function ColdEmailGenerator() {
  const [companyUrl, setCompanyUrl] = useState("");
  const [yourOffer, setYourOffer] = useState("");
  const [targetName, setTargetName] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isPremium, setIsPremium] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("premium") === "true";
  });

  const generateEmails = async () => {
    setLoading(true);
    setEmails([]);

    const res = await fetch("/api/generate-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyUrl, targetName, yourOffer }),
    });

    const data = await res.json();
    setEmails(data.emails || []);
    setLoading(false);
  };

  const copy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const upgrade = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });

      if (!res.ok) {
        throw new Error("Checkout request failed");
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Payment system not ready. Check server logs.");
    }
  };

  const visibleEmails = isPremium ? emails : emails.slice(0, 3);

  return (
    // ✅ Flex wrapper for sidebar + main content
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main
        className="flex-1 flex justify-center overflow-y-auto"
        style={{ paddingTop: "2em", textAlign: "center" }}
      >
        <div className="max-w-4xl w-full px-10 py-12 space-y-10">
          {/* HEADER */}
          <div
            className="space-y-2"
            style={{ justifyContent: "center", textAlign: "center", marginBottom: "1em" }}
          >
            <h1 className="text-4xl font-bold">AI Cold Email Generator</h1>
            <p className="text-gray-400">
              Generate human-sounding outreach emails that actually get replies.
            </p>
            {isPremium && (
              <div className="text-green-400 text-sm font-medium flex justify-center gap-1 items-center">
                <Crown size={14} /> Premium unlocked
              </div>
            )}
          </div>

          {/* FORM */}
          <div
            className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6 transition-all"
            style={{ padding: "2em" }}
          >
            <input
              className="w-full h-14 px-5 rounded-xl bg-gray-950 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
              placeholder="Company URL or company name"
              onChange={(e) => setCompanyUrl(e.target.value)}
              style={{ marginBottom: "1em" }}
            />

            <input
              className="w-full h-14 px-5 rounded-xl bg-gray-950 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
              placeholder="Recipient name (optional)"
              onChange={(e) => setTargetName(e.target.value)}
              style={{ marginBottom: "1em" }}
            />

            <textarea
              className="w-full h-20 px-5 py-4 rounded-2xl bg-gray-950 border border-gray-700 resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
              placeholder="Describe your offer..."
              onChange={(e) => setYourOffer(e.target.value)}
              style={{ marginBottom: "1em" }}
            />

            <button
              onClick={generateEmails}
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 text-lg transition"
            >
              <Sparkles />
              {loading ? "Generating..." : "Generate Emails"}
            </button>
          </div>

          {/* EMAIL RESULTS */}
          {visibleEmails.length > 0 && (
            <div className="space-y-6" style={{ marginTop: "2em" }}>
              {visibleEmails.map((email, i) => (
                <div
                  key={i}
                  className="bg-gray-900 border border-gray-800 rounded-3xl p-7 space-y-4 animate-fadeUp"
                  style={{ marginTop: "2em", padding:"2em" }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-400 text-sm font-medium">{email.style}</span>

                    <button
                      onClick={() =>
                        copy(`Subject: ${email.subject}\n\n${email.body}`, i)
                      }
                      className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition"
                      style={{padding:"0.9em"}}
                    >
                      {copiedIndex === i ? <Check size={16} /> : <Copy size={16} />}
                      {copiedIndex === i ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <p className="font-semibold text-lg">{email.subject}</p>

                  <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {email.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* PREMIUM LOCK */}
          {!isPremium && emails.length > 3 && (
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl text-center space-y-3"
              style={{ marginTop: "2em" }}
            >
              <h3 className="text-2xl font-bold flex justify-center gap-2">
                <Lock /> Premium Required
              </h3>
              <p className="text-sm opacity-90">
                Unlock all 30 emails, tone control, follow-ups & export.
              </p>
              <button
                onClick={upgrade}
                className="mt-3 bg-black/30 hover:bg-black/40 px-8 py-3 rounded-xl transition"
              >
                Unlock Premium (Demo)
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
