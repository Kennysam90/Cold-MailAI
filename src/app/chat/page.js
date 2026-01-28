"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import Sidebar from "@/Component/sidebar";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi 👋 I’m your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");

    try {
      setMessages(prev => [...prev, { role: "assistant", content: "Typing…" }]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "⚠️ Local AI not responding. Is Ollama running?",
        },
      ]);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "black", color: "white", fontFamily: "sans-serif" }}>
      {/* Sidebar remains fixed */}
      <Sidebar />

      {/* Main Container - Offsets the sidebar and fills the space */}
      <main style={{ 
        flex: 1, 
        marginLeft: "13em", 
        display: "flex", 
        justifyContent: "center", 
        height: "100vh" 
      }}>
        
        {/* Chat Box Container */}
        <div style={{ 
          width: "100%", 
          maxWidth: "800px", 
          display: "flex", 
          flexDirection: "column", 
          height: "100%" 
        }}>

          {/* Header */}
          <div style={{ 
            padding: "1.5em", 
            borderBottom: "1px solid rgba(255,255,255,0.1)", 
            textAlign: "center" 
          }}>
            <h1 style={{ fontSize: "1.2rem", fontWeight: "600", margin: 0 }}>ColdAI Chat</h1>
          </div>

          {/* Messages Area */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: "2em", 
            display: "flex", 
            flexDirection: "column", 
            gap: "1.5em" 
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    borderRadius: "18px",
                    padding: "1em 1.2em",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    backgroundColor: msg.role === "user" ? "#4f46e5" : "rgba(255,255,255,0.1)",
                    color: msg.role === "user" ? "white" : "#e5e7eb",
                    boxShadow: msg.role === "user" ? "0 4px 12px rgba(79, 70, 229, 0.2)" : "none"
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: "1.5em 2em 3em 2em" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.8em",
              backgroundColor: "rgba(31, 41, 55, 0.6)",
              borderRadius: "16px",
              padding: "0.5em 1em",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.05)"
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  color: "white",
                  fontSize: "1rem",
                  minHeight: "50px",
                  paddingLeft: "0.5em"
                }}
              />

              <button
                onClick={sendMessage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "#374151",
                  border: "none",
                  cursor: "pointer",
                  transition: "0.2s"
                }}
              >
                <Send size={18} color="#e5e7eb" />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}