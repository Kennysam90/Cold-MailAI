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

  // Load Ollama config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ollamaConfig");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate model is installed, otherwise reset to tinyllama
        const validModels = ["tinyllama", "llama3.2", "mistral", "codellama", "llama2"];
        if (!parsed.model || !validModels.some(m => parsed.model.toLowerCase().includes(m.toLowerCase()))) {
          parsed.model = "tinyllama";
          localStorage.setItem("ollamaConfig", JSON.stringify(parsed));
        }
        setOllamaConfig(parsed);
      } catch (e) {
        console.error("Failed to parse saved Ollama config:", e);
        setOllamaConfig({
          baseUrl: "http://localhost:11434",
          model: "tinyllama",
          apiKey: "",
        });
      }
    }
  }, []);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePreferenceChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setPreferences({
      ...preferences,
      [e.target.name]: value,
    });
  };

  const handleOllamaChange = (e) => {
    const { name, value } = e.target;
    setOllamaConfig(prev => ({
      ...prev,
      [name]: value,
    }));
    setConnectionStatus("unknown");
  };

  const saveSettings = () => {
    // Save Ollama config to localStorage
    localStorage.setItem("ollamaConfig", JSON.stringify(ollamaConfig));
    alert("Settings saved successfully!");
  };

  const testOllamaConnection = async () => {
    setConnectionStatus("testing");
    try {
      const res = await fetch(`${ollamaConfig.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setConnectionStatus("success");
        setTimeout(() => setConnectionStatus("unknown"), 3000);
      } else {
        setConnectionStatus("error");
        setTimeout(() => setConnectionStatus("unknown"), 3000);
      }
    } catch (err) {
      setConnectionStatus("error");
      setTimeout(() => setConnectionStatus("unknown"), 3000);
    }
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
            <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
              <Settings /> Settings
            </h1>
            <p className="text-gray-400">
              Manage your account and preferences.
            </p>
          </div>

          {/* PROFILE SECTION */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
              <User size={20} className="text-indigo-400" />
              <h2 className="text-xl font-semibold">Profile</h2>
            </div>

            <div className="grid gap-6" style={{ marginTop: "1em" }}>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full h-14 px-5 rounded-xl bg-gray-950 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full h-14 px-5 rounded-xl bg-gray-950 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                />
              </div>
            </div>
          </div>

          {/* PREFERENCES SECTION */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
              <Mail size={20} className="text-indigo-400" />
              <h2 className="text-xl font-semibold">Email Preferences</h2>
            </div>

            <div className="grid gap-6" style={{ marginTop: "1em" }}>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Signature</label>
                <textarea
                  name="emailSignature"
                  value={preferences.emailSignature}
                  onChange={handlePreferenceChange}
                  className="w-full h-20 px-5 py-4 rounded-2xl bg-gray-950 border border-gray-700 resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Default Tone</label>
                <select
                  name="defaultTone"
                  value={preferences.defaultTone}
                  onChange={handlePreferenceChange}
                  className="w-full h-14 px-5 rounded-xl bg-gray-950 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            </div>
          </div>

          {/* OLLAMA AI CONFIGURATION SECTION */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
              <Cpu size={20} className="text-indigo-400" />
              <h2 className="text-xl font-semibold">Ollama AI Configuration</h2>
            </div>

            <div className="grid gap-6" style={{ marginTop: "1em" }}>
              {/* Base URL */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Database size={14} />
                  Ollama Base URL
                </label>
                <input
                  type="url"
                  name="baseUrl"
                  value={ollamaConfig.baseUrl}
                  onChange={handleOllamaChange}
                  placeholder="http://localhost:11434"
                  className="w-full h-14 px-5 rounded-xl bg-gray-950 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                />
              <p className="text-xs text-gray-500 mt-2">
                Use <code>http://localhost:11434</code> for local Ollama or your cloud endpoint.<br />
                For cloud Ollama (OpenAI-compatible), use format: <code>https://api.ollama.com/v1</code>
              </p>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Zap size={14} />
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={ollamaConfig.model}
                  onChange={handleOllamaChange}
                  placeholder="llama3.2"
                  className="w-full h-14 px-5 rounded-xl bg-gray-950 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                />
              <p className="text-xs text-gray-500 mt-2">
                Recommended models: <code>tinyllama</code> (fastest), <code>llama3.2</code>, <code>mistral</code><br />
                Currently installed: <code>tinyllama:latest</code>
              </p>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Key size={14} />
                  API Key (Optional)
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    name="apiKey"
                    value={ollamaConfig.apiKey}
                    onChange={handleOllamaChange}
                    placeholder="Enter your Ollama Cloud API key"
                    className="w-full h-14 px-5 rounded-xl bg-gray-950 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Required for Ollama Cloud or other remote providers. Get your key from{" "}
                  <a
                    href="https://cloud.ollama.com/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline"
                  >
                    cloud.ollama.com
                  </a>
                </p>
              </div>

              {/* Test Connection Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={testOllamaConnection}
                  disabled={connectionStatus === "testing"}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Zap size={16} className={connectionStatus === "testing" ? "animate-pulse" : ""} />
                  {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
                </button>
                
                {connectionStatus === "success" && (
                  <span className="text-green-400 flex items-center gap-2">
                    ✓ Connected successfully
                  </span>
                )}
                {connectionStatus === "error" && (
                  <span className="text-red-400 flex items-center gap-2">
                    ✗ Connection failed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS SECTION */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
              <Bell size={20} className="text-indigo-400" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <div style={{ marginTop: "1em" }}>
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={preferences.notifications}
                  onChange={handlePreferenceChange}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable email notifications for new features and tips</span>
              </label>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end pt-4">
            <button
              onClick={saveSettings}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

