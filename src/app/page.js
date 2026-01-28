"use client";

import React, { useState } from "react";
import { Mail, Sparkles, Copy, Check, Lock, Crown } from "lucide-react";
import { motion } from "framer-motion";
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
      if (!res.ok) throw new Error("Checkout request failed");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Payment system not ready. Check server logs.");
    }
  };

  const visibleEmails = isPremium ? emails : emails.slice(0, 3);

  // Common UI Styles
  const inputStyle = {
    width: "100%",
    height: "3.5em",
    padding: "0 1.2em",
    borderRadius: "12px",
    backgroundColor: "#030712",
    border: "1px solid #374151",
    color: "white",
    fontSize: "1rem",
    marginBottom: "1.2em",
    outline: "none"
  };

  const cardStyle = {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "24px",
    padding: "2.5em",
    marginBottom: "2em",
    textAlign: "left"
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#030712", color: "white", fontFamily: "sans-serif" }}>
      {/* Sidebar remains fixed */}
      <Sidebar />

      {/* Main Content pushed to the right of Sidebar and Centered */}
      <main style={{ 
        flex: 1, 
        marginLeft: "13em", 
        display: "flex", 
        justifyContent: "center", 
        padding: "4em 2em",
        overflowY: "auto"
      }}>
        
        <div style={{ width: "100%", maxWidth: "800px", textAlign: "center" }}>
          
          {/* HEADER */}
          <header style={{ marginBottom: "3em" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.3em" }}>AI Cold Email Generator</h1>
            <p style={{ color: "#9ca3af", fontSize: "1.1rem" }}>
              Generate human-sounding outreach emails that actually get replies.
            </p>
            {isPremium && (
              <div style={{ color: "#4ade80", fontSize: "0.9rem", marginTop: "1em", display: "flex", justifyContent: "center", alignItems: "center", gap: "5px" }}>
                <Crown size={14} /> Premium unlocked
              </div>
            )}
          </header>

          {/* FORM CARD */}
          <div style={cardStyle}>
            <label style={{ display: "block", marginBottom: "0.5em", color: "#9ca3af", fontSize: "0.9rem", fontWeight: "bold" }}>Target Company</label>
            <input
              style={inputStyle}
              placeholder="Company URL or company name"
              onChange={(e) => setCompanyUrl(e.target.value)}
            />

            <label style={{ display: "block", marginBottom: "0.5em", color: "#9ca3af", fontSize: "0.9rem", fontWeight: "bold" }}>Recipient</label>
            <input
              style={inputStyle}
              placeholder="Recipient name (optional)"
              onChange={(e) => setTargetName(e.target.value)}
            />

            <label style={{ display: "block", marginBottom: "0.5em", color: "#9ca3af", fontSize: "0.9rem", fontWeight: "bold" }}>Your Offer</label>
            <textarea
              style={{ ...inputStyle, height: "100px", paddingTop: "1em", resize: "none" }}
              placeholder="Describe your offer..."
              onChange={(e) => setYourOffer(e.target.value)}
            />

            <button
              onClick={generateEmails}
              disabled={loading}
              style={{
                width: "100%",
                height: "3.5em",
                borderRadius: "16px",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                fontSize: "1.1rem",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "0.3s",
                opacity: loading ? 0.7 : 1
              }}
            >
              <Sparkles size={20} />
              {loading ? "Generating..." : "Generate Emails"}
            </button>
          </div>

          {/* EMAIL RESULTS */}
          {visibleEmails.length > 0 && (
            <div style={{ marginTop: "3em" }}>
              <h2 style={{ textAlign: "left", marginBottom: "1em", fontSize: "1.5rem" }}>Generated Emails</h2>
              {visibleEmails.map((email, i) => (
                <div key={i} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5em" }}>
                    <span style={{ color: "#818cf8", fontWeight: "bold", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" }}>
                      {email.style} Style
                    </span>

                    <button
                      onClick={() => copy(`Subject: ${email.subject}\n\n${email.body}`, i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "#1f2937",
                        color: "white",
                        padding: "0.6em 1.2em",
                        borderRadius: "10px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.85rem"
                      }}
                    >
                      {copiedIndex === i ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
                      {copiedIndex === i ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <p style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1em", borderBottom: "1px solid #1f2937", paddingBottom: "0.5em" }}>
                    {email.subject}
                  </p>

                  <p style={{ color: "#d1d5db", whiteSpace: "pre-line", lineHeight: "1.6", fontSize: "1rem" }}>
                    {email.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* PREMIUM LOCK */}
          {!isPremium && emails.length > 3 && (
            <div style={{ 
              background: "linear-gradient(to r, #4f46e5, #9333ea)", 
              padding: "3em", 
              borderRadius: "24px", 
              marginTop: "2em",
              textAlign: "center"
            }}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                <Lock /> Premium Required
              </h3>
              <p style={{ margin: "1em 0", opacity: 0.9 }}>
                Unlock all 30 emails, tone control, follow-ups & export.
              </p>
              <button
                onClick={upgrade}
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  color: "white",
                  padding: "1em 2em",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "1em"
                }}
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