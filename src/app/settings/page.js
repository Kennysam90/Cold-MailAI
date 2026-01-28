"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/Component/sidebar";
import { Settings, User, Mail, Key, Bell, Shield, Database, Cpu, Zap } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
  });

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

  useEffect(() => {
    const saved = localStorage.getItem("ollamaConfig");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validModels = ["tinyllama", "llama3.2", "mistral", "codellama", "llama2"];
        if (!parsed.model || !validModels.some(m => parsed.model.toLowerCase().includes(m.toLowerCase()))) {
          parsed.model = "tinyllama";
          localStorage.setItem("ollamaConfig", JSON.stringify(parsed));
        }
        setOllamaConfig(parsed);
      } catch (e) {
        console.error("Failed to parse saved Ollama config:", e);
      }
    }
  }, []);

  // --- Inline Style Objects ---
  const cardStyle = {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "24px",
    padding: "2.5em",
    marginBottom: "2em",
    textAlign: "left"
  };

  const inputStyle = {
    width: "100%",
    height: "3.5em",
    padding: "0 1.2em",
    borderRadius: "12px",
    backgroundColor: "#030712",
    border: "1px solid #374151",
    color: "white",
    fontSize: "1rem",
    outline: "none",
    marginTop: "0.5em"
  };

  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9rem",
    color: "#9ca3af",
    fontWeight: "600"
  };

  const sectionHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "1em",
    borderBottom: "1px solid #1f2937",
    marginBottom: "1.5em"
  };

  // --- Handlers ---
  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePreferenceChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setPreferences({ ...preferences, [e.target.name]: value });
  };
  const handleOllamaChange = (e) => {
    const { name, value } = e.target;
    setOllamaConfig(prev => ({ ...prev, [name]: value }));
    setConnectionStatus("unknown");
  };

  const saveSettings = () => {
    localStorage.setItem("ollamaConfig", JSON.stringify(ollamaConfig));
    alert("Settings saved successfully!");
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
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#030712", color: "white", fontFamily: "sans-serif" }}>
      <Sidebar />

      <main style={{ 
        flex: 1, 
        marginLeft: "13em", 
        display: "flex", 
        justifyContent: "center", 
        padding: "4em 2em",
        overflowY: "auto"
      }}>
        <div style={{ width: "100%", maxWidth: "850px" }}>
          
          {/* HEADER */}
          <header style={{ textAlign: "center", marginBottom: "3em" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", margin: 0 }}>
              <Settings size={36} /> Settings
            </h1>
            <p style={{ color: "#9ca3af", marginTop: "0.5em" }}>Manage your account and preferences.</p>
          </header>

          {/* PROFILE SECTION */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <User size={20} color="#818cf8" />
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Profile</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5em" }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" name="email" value={profile.email} onChange={handleProfileChange} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* PREFERENCES SECTION */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <Mail size={20} color="#818cf8" />
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Email Preferences</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5em" }}>
              <div>
                <label style={labelStyle}>Email Signature</label>
                <textarea 
                  name="emailSignature" 
                  value={preferences.emailSignature} 
                  onChange={handlePreferenceChange} 
                  style={{ ...inputStyle, height: "100px", paddingTop: "1em", resize: "none" }} 
                />
              </div>
              <div>
                <label style={labelStyle}>Default Tone</label>
                <select name="defaultTone" value={preferences.defaultTone} onChange={handlePreferenceChange} style={inputStyle}>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>
          </div>

          {/* OLLAMA AI SECTION */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <Cpu size={20} color="#818cf8" />
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Ollama AI Configuration</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5em" }}>
              <div>
                <label style={labelStyle}><Database size={14} /> Base URL</label>
                <input type="url" name="baseUrl" value={ollamaConfig.baseUrl} onChange={handleOllamaChange} style={inputStyle} />
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.5em" }}>Example: http://localhost:11434</p>
              </div>
              <div>
                <label style={labelStyle}><Zap size={14} /> Model</label>
                <input type="text" name="model" value={ollamaConfig.model} onChange={handleOllamaChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}><Key size={14} /> API Key (Optional)</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type={showApiKey ? "text" : "password"} 
                    name="apiKey" 
                    value={ollamaConfig.apiKey} 
                    onChange={handleOllamaChange} 
                    style={inputStyle} 
                  />
                  <button 
                    onClick={() => setShowApiKey(!showApiKey)} 
                    style={{ position: "absolute", right: "15px", top: "25px", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "1.5em" }}>
                <button onClick={testOllamaConnection} style={{ padding: "0.8em 1.5em", backgroundColor: "#374151", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
                  Test Connection
                </button>
                {connectionStatus === "success" && <span style={{ color: "#4ade80", fontSize: "0.9rem" }}>✓ Connected</span>}
                {connectionStatus === "error" && <span style={{ color: "#f87171", fontSize: "0.9rem" }}>✗ Connection Failed</span>}
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <Bell size={20} color="#818cf8" />
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Notifications</h2>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <input type="checkbox" name="notifications" checked={preferences.notifications} onChange={handlePreferenceChange} style={{ width: "20px", height: "20px" }} />
              <span style={{ fontSize: "1rem" }}>Enable email notifications for new features and tips</span>
            </label>
          </div>

          {/* SAVE BUTTON */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4em" }}>
            <button 
              onClick={saveSettings} 
              style={{ padding: "1em 2.5em", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "14px", fontWeight: "bold", cursor: "pointer", fontSize: "1rem" }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}