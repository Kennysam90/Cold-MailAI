"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function ChatPage() {
  const [streamingText, setStreamingText] = useState(""); // text currently typing
  const [context, setContext] = useState({
    topic: null,
  });

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
    // typing indicator
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: "Typing…" },
    ]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: updatedMessages,
      }),
    });

    const data = await res.json();

    // replace "Typing…" with real response
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
    <div className="min-h-screen bg-black text-white flex justify-center">
      {/* Chat Container */}
      <div className="w-full max-w-3xl flex flex-col h-screen" >

        {/* Header */}
        <div className="border-b border-white/10 p-4 text-center" style={{
          padding:"1em"
        }}>
          <h1 className="text-lg font-semibold">ColdAI Chat</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6" style={{
          padding:"1em"
        }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed  ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white/10 text-gray-200"
                }`} style={{
                  padding:"1em"
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4" style={{
              paddingBottom:"2em"
            }}>
                  <div
          className="
            w-full
            max-w-3xl
            mx-auto
            mb-6
            flex items-center gap-3
            bg-gray-800/60
            rounded-2xl
            px-3 sm:px-4
            py-2 sm:py-3
            backdrop-blur
          "
          style={{
              padding:"0.5em"
            }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="
              flex-1
              bg-transparent
              outline-none
              text-[16px] sm:text-base
              text-gray-100
              placeholder:text-gray-400
              pl-4 sm:pl-5
              min-h-[50px]
            "
          />

          <button
            onClick={sendMessage}
            className="
              flex items-center justify-center
              w-10 h-10 sm:w-11 sm:h-11
              rounded-xl
              bg-gray-700
              hover:bg-gray-600
              transition
            "
          >
            <Send size={18} className="text-gray-200" />
          </button>
        </div>

        </div>

      </div>
    </div>
  );
}
