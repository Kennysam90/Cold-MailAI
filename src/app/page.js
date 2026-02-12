"use client";

import React, { useEffect, useState } from "react";
import { Mail, Sparkles, Copy, Check, Lock, Crown } from "lucide-react";
import { useAuth } from "@/Context/AuthContext";

export default function ColdEmailGenerator() {
  const [companyUrl, setCompanyUrl] = useState("");
  const [yourOffer, setYourOffer] = useState("");
  const [targetName, setTargetName] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("premium") === "true";
  });
  const [billingError, setBillingError] = useState("");
  const [showBillingModal, setShowBillingModal] = useState(false);

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

  useEffect(() => {
    let active = true;
    const loadPremium = async () => {
      try {
        const res = await fetch("/api/billing/status");
        const data = await res.json();
        if (active && data?.success) {
          setIsPremium(data.data.isPremium);
          if (typeof window !== "undefined") {
            localStorage.setItem("premium", data.data.isPremium ? "true" : "false");
          }
        }
      } catch (e) {}
    };
    loadPremium();
    return () => { active = false; };
  }, []);

  const upgradeWithStripe = async () => {
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
      setBillingError("Stripe checkout failed. Check server logs.");
    }
  };

  const upgradeWithPaystack = async () => {
    try {
      if (!user?.email) {
        setBillingError("Please sign in to use Paystack.");
        return;
      }
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, amount: 90000 }),
      });

      if (!res.ok) {
        throw new Error("Paystack init failed");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Paystack error:", err);
      setBillingError("Paystack initialization failed.");
    }
  };

  const visibleEmails = isPremium ? emails : emails.slice(0, 3);

  return (
    <div className="flex justify-center text-center">
      <div className="max-w-4xl w-full px-4 sm:px-10 py-12 space-y-10">
          {/* HEADER */}
          <div
            className="space-y-2"
            style={{ justifyContent: "center", textAlign: "center", marginBottom: "1em" }}
          >
            {/* Added responsive text size for mobile headers */}
            <h1 className="text-2xl sm:text-4xl font-bold">AI Cold Email Generator</h1>
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
                  style={{ marginTop: "2em" }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-400 text-sm font-medium">{email.style}</span>

                    <button
                      onClick={() =>
                        copy(`Subject: ${email.subject}\n\n${email.body}`, i)
                      }
                      className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition"
                    >
                      {copiedIndex === i ? <Check size={16} /> : <Copy size={16} />}
                      {copiedIndex === i ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <p className="font-semibold text-lg" style={{ textAlign: "left" }}>{email.subject}</p>

                  <p className="text-gray-300 whitespace-pre-line leading-relaxed" style={{ textAlign: "left" }}>
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
              {billingError && <p className="text-xs text-red-200">{billingError}</p>}
              <button
                onClick={() => setShowBillingModal(true)}
                className="mt-3 bg-black/30 hover:bg-black/40 px-8 py-3 rounded-xl transition"
              >
                Choose Payment Provider
              </button>
            </div>
          )}
          {showBillingModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm text-left">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold">Select Provider</h4>
                  <button
                    onClick={() => setShowBillingModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-4">Choose your payment provider to continue.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { setShowBillingModal(false); upgradeWithStripe(); }}
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-3 rounded-xl transition text-white"
                  >
                    Pay with Stripe
                  </button>
                  <button
                    onClick={() => { setShowBillingModal(false); upgradeWithPaystack(); }}
                    className="bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-xl transition text-white"
                  >
                    Pay with Paystack
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
