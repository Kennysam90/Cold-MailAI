"use client";

import { Mail, Sparkles, Settings, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Sidebar({ onSelect }) {
  const [active, setActive] = useState("generator");

  const handleClick = (tab) => {
    setActive(tab);
    if (onSelect) onSelect(tab);
  };

  const buttonClass = (tab) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      active === tab
        ? "bg-gray-800 text-white"
        : "hover:bg-gray-800 text-gray-400"
    }`;

  return (
    <aside
      className="w-50 bg-gray-900 border-r border-gray-800 flex flex-col"
      style={{
        padding: "1em",
        overflow: "hidden",
        position: "fixed", // keep sidebar fixed
        height: "100vh", // full viewport height
      }}
    >
      <h1
        className="text-xl font-bold text-white"
        style={{ marginBottom: "2em" }}
      >
        ColdMail<span className="text-indigo-500">AI</span>
      </h1>

      <nav className="flex flex-col gap-10 text-gray-400">
        <button
          className={buttonClass("generator")}
          onClick={() => handleClick("generator")}
        >
          <Mail size={18} /> Generator
        </button>

        <button
          className={buttonClass("templates")}
          onClick={() => handleClick("templates")}
        >
          <Sparkles size={18} /> Templates
        </button>

        <button
          className={buttonClass("settings")}
          onClick={() => handleClick("settings")}
        >
          <Settings size={18} /> Settings
        </button>

        <button
          className={buttonClass("chat")}
          onClick={() => handleClick("/chat")}
          style={{ marginBottom: "1em" }}
        >
          <MessageCircle size={18} /> Chat
        </button>
      </nav>

      <div
        className="mt-auto border-t border-gray-800 text-xs text-gray-500"
        style={{ paddingTop: "2em" }}
      >
        Free Plan
      </div>
    </aside>
  );
}
