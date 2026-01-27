"use client";

import { Mail, Sparkles, Settings, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname === "/") return "generator";
    if (pathname === "/templates") return "templates";
    if (pathname === "/settings") return "settings";
    if (pathname === "/chat") return "chat";
    return "generator";
  };

  const [active] = useState(getActiveTab());

  const handleClick = (route) => {
    router.push(route);
  };

  const buttonClass = (tab, route) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${
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
        position: "fixed",
        height: "100vh",
      }}
    >
      <h1
        className="text-xl font-bold text-white cursor-pointer"
        style={{ marginBottom: "2em" }}
        onClick={() => router.push("/")}
      >
        ColdMail<span className="text-indigo-500">AI</span>
      </h1>

      <nav className="flex flex-col gap-10 text-gray-400">
        <button
          className={buttonClass("generator", "/")}
          onClick={() => handleClick("/")}
        >
          <Mail size={18} /> Generator
        </button>

        <button
          className={buttonClass("templates", "/templates")}
          onClick={() => handleClick("/templates")}
        >
          <Sparkles size={18} /> Templates
        </button>

        <button
          className={buttonClass("settings", "/settings")}
          onClick={() => handleClick("/settings")}
        >
          <Settings size={18} /> Settings
        </button>

        <button
          className={buttonClass("chat", "/chat")}
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
