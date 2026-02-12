"use client";

import React, { useState, useEffect } from "react";
import { Settings, User, Mail, Key, Bell, Shield, Database, Cpu, Zap } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "John Doe", email: "john@example.com" });
  const [preferences, setPreferences] = useState({
    emailSignature: "Best regards,\nJohn Doe",
    defaultTone: "professional",
    notifications: true,
  });
  const [ollamaConfig, setOllamaConfig] = useState({
    baseUrl: "http://localhost:11434",
    model: "tinyllama",
    apiKey: "",
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("unknown");
  const [billingStatus, setBillingStatus] = useState(null);

  // Reusable Style Objects
  const styles = {
    container: { display: "flex", justifyContent: "center", color: "#ffffff" },
    main: { width: "100%", display: "flex", justifyContent: "center", overflowY: "auto" },
    contentWrapper: { maxWidth: "56rem", width: "100%", padding: "3rem 2.5rem", display: "flex", flexDirection: "column", gap: "2.5rem" },
    section: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "1.5rem", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
    sectionHeader: { display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "1rem", borderBottom: "1px solid #1f2937" },
    inputLabel: { display: "block", fontSize: "0.875rem", color: "#9ca3af", marginBottom: "0.5rem" },
    inputField: { width: "100%", height: "3.5rem", padding: "0 1.25rem", borderRadius: "0.75rem", backgroundColor: "#030712", border: "1px solid #374151", color: "white", outline: "none" },
    textareaField: { width: "100%", height: "5rem", padding: "1rem 1.25rem", borderRadius: "1rem", backgroundColor: "#030712", border: "1px solid #374151", color: "white", outline: "none", resize: "none" },
    buttonPrimary: { padding: "0.75rem 2rem", backgroundColor: "#4f46e5", color: "white", borderRadius: "0.75rem", border: "none", cursor: "pointer", transition: "0.2s" },
    buttonSecondary: { padding: "0.75rem 1.5rem", backgroundColor: "#1f2937", color: "white", borderRadius: "0.75rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" },
    hintText: { fontSize: "0.75rem", color: "#6b7280", marginTop: "0.5rem" }
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/settings/ollama");
        const data = await res.json();
        if (data?.success && data.data) {
          setOllamaConfig({
            baseUrl: data.data.baseUrl || "http://localhost:11434",
            model: data.data.model || "tinyllama",
            apiKey: data.data.apiKey || "",
          });
        }
      } catch (e) {
        console.error("Failed to load Ollama config:", e);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const res = await fetch("/api/billing/status");
        const data = await res.json();
        if (data?.success) {
          setBillingStatus(data.data);
        }
      } catch (e) {}
    };
    loadBilling();
  }, []);

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePreferenceChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setPreferences({ ...preferences, [e.target.name]: value });
  };
  const handleOllamaChange = (e) => setOllamaConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const saveSettings = async () => {
    try {
      const res = await fetch("/api/settings/ollama", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ollamaConfig),
      });
      const data = await res.json();
      if (!data?.success) {
        throw new Error(data?.error || "Failed to save settings");
      }
      alert("Settings saved successfully!");
    } catch (e) {
      console.error("Save settings error:", e);
      alert("Failed to save settings.");
    }
  };

  const testOllamaConnection = async () => {
    setConnectionStatus("testing");
    try {
      const res = await fetch(`${ollamaConfig.baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      setConnectionStatus(res.ok ? "success" : "error");
    } catch (err) {
      setConnectionStatus("error");
    }
    setTimeout(() => setConnectionStatus("unknown"), 3000);
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* HEADER */}
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <h1 style={{ fontSize: "2.25rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", margin: 0 }}>
              <Settings /> Settings
            </h1>
            <p style={{ color: "#9ca3af", marginTop: "0.5rem" }}>Manage your account and preferences.</p>
          </div>

          {/* PROFILE SECTION */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <User size={20} style={{ color: "#818cf8" }} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>Profile</h2>
            </div>
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div>
                <label style={styles.inputLabel}>Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} style={styles.inputField} />
              </div>
              <div>
                <label style={styles.inputLabel}>Email</label>
                <input type="email" name="email" value={profile.email} onChange={handleProfileChange} style={styles.inputField} />
              </div>
            </div>
          </div>

          {/* EMAIL PREFERENCES */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Mail size={20} style={{ color: "#818cf8" }} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>Email Preferences</h2>
            </div>
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div>
                <label style={styles.inputLabel}>Email Signature</label>
                <textarea name="emailSignature" value={preferences.emailSignature} onChange={handlePreferenceChange} style={styles.textareaField} />
              </div>
              <div>
                <label style={styles.inputLabel}>Default Tone</label>
                <select name="defaultTone" value={preferences.defaultTone} onChange={handlePreferenceChange} style={styles.inputField}>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>
          </div>

          {/* OLLAMA AI CONFIGURATION */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Cpu size={20} style={{ color: "#818cf8" }} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>Ollama AI Configuration</h2>
            </div>
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div>
                <label style={{ ...styles.inputLabel, display: "flex", alignItems: "center", gap: "0.5rem" }}><Database size={14} /> Ollama Base URL</label>
                <input type="url" name="baseUrl" value={ollamaConfig.baseUrl} onChange={handleOllamaChange} style={styles.inputField} />
                <p style={styles.hintText}>Use http://localhost:11434 for local Ollama.</p>
              </div>

              <div>
                <label style={{ ...styles.inputLabel, display: "flex", alignItems: "center", gap: "0.5rem" }}><Zap size={14} /> Model</label>
                <input type="text" name="model" value={ollamaConfig.model} onChange={handleOllamaChange} style={styles.inputField} />
                <p style={styles.hintText}>Recommended: tinyllama, llama3.2, mistral</p>
              </div>

              <div>
                <label style={{ ...styles.inputLabel, display: "flex", alignItems: "center", gap: "0.5rem" }}><Key size={14} /> API Key (Optional)</label>
                <div style={{ position: "relative" }}>
                  <input type={showApiKey ? "text" : "password"} name="apiKey" value={ollamaConfig.apiKey} onChange={handleOllamaChange} style={{ ...styles.inputField, paddingRight: "3rem" }} />
                  <button type="button" onClick={() => setShowApiKey(!showApiKey)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button onClick={testOllamaConnection} disabled={connectionStatus === "testing"} style={connectionStatus === "testing" ? { ...styles.buttonSecondary, opacity: 0.5 } : styles.buttonSecondary}>
                  <Zap size={16} /> {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
                </button>
                {connectionStatus === "success" && <span style={{ color: "#4ade80" }}>✓ Connected</span>}
                {connectionStatus === "error" && <span style={{ color: "#f87171" }}>✗ Connection failed</span>}
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Bell size={20} style={{ color: "#818cf8" }} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>Notifications</h2>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}>
              <input type="checkbox" name="notifications" checked={preferences.notifications} onChange={handlePreferenceChange} style={{ width: "1.25rem", height: "1.25rem" }} />
              <span>Enable email notifications for new features and tips</span>
            </label>
          </div>

          {/* BILLING STATUS */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Shield size={20} style={{ color: "#818cf8" }} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>Billing</h2>
            </div>
            {!billingStatus ? (
              <p style={{ color: "#9ca3af", margin: 0 }}>Loading billing status…</p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9ca3af" }}>Plan</span>
                  <span>{billingStatus.billing?.planName || "Free"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9ca3af" }}>Status</span>
                  <span>{billingStatus.billing?.status || "inactive"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9ca3af" }}>Provider</span>
                  <span>{billingStatus.billing?.provider || "-"}</span>
                </div>
                {billingStatus.billing?.currentPeriodEnd && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9ca3af" }}>Renews</span>
                    <span>{new Date(billingStatus.billing.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "1rem" }}>
            <button onClick={saveSettings} style={styles.buttonPrimary}>Save Settings</button>
          </div>
        </div>
      </main>
    </div>
  );
}
