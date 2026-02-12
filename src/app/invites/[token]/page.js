"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const acceptInvite = async () => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/workspaces/invites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", token, email }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to accept invite");
      }
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (e) {
      setStatus("error");
      setError(e.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#030712", color: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: "420px", width: "100%", backgroundColor: "#0b0b0f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "2rem" }}>
        <h1 style={{ margin: "0 0 0.5rem 0" }}>Accept Invite</h1>
        <p style={{ color: "#9ca3af", margin: "0 0 1.5rem 0" }}>Enter your email to join the workspace.</p>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          style={{ width: "100%", backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.7rem 0.9rem", borderRadius: "10px", marginBottom: "1rem" }}
        />
        <button
          onClick={acceptInvite}
          disabled={!email || status === "loading"}
          style={{ width: "100%", backgroundColor: "#4f46e5", border: "none", color: "white", padding: "0.8rem", borderRadius: "10px", cursor: "pointer" }}
        >
          {status === "loading" ? "Joining..." : "Join Workspace"}
        </button>
        {status === "success" && <p style={{ color: "#34d399", marginTop: "1rem" }}>Invite accepted. Redirecting...</p>}
        {status === "error" && <p style={{ color: "#f87171", marginTop: "1rem" }}>{error}</p>}
      </div>
    </div>
  );
}
