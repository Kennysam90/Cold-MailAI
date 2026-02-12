"use client";

import { Mail, Sparkles, Settings, MessageCircle, LogOut, Crown, User, LayoutDashboard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isHovered, setIsHovered] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localPremium = localStorage.getItem("premium") === "true";
      setIsPremium(localPremium);
      
      // Check if mobile
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 1024);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

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
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isMobileMenuOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
    return () => document.body.classList.remove("sidebar-open");
  }, [isMobileMenuOpen]);

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (pathname === "/") return "generator";
    if (pathname === "/dashboard") return "dashboard";
    if (pathname === "/templates") return "templates";
    if (pathname === "/settings") return "settings";
    if (pathname === "/chat") return "chat";
    return "generator";
  };

  const active = getActiveTab();

  const handleClick = (route) => {
    router.push(route);
    setIsMobileMenuOpen(false); // Close mobile menu on click
  };

  const handleLogout = async () => {
    await logout();
    if (!user?.provider || user.provider === 'email') {
      router.push("/auth");
    }
    setIsMobileMenuOpen(false);
  };

  const buttonClass = (tab) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer transform hover:translate-x-1 ${
      active === tab
        ? "bg-gray-800 text-white shadow-lg shadow-gray-800/50"
        : "hover:bg-gray-800 text-gray-400 hover:text-white"
    }`;

  // Mobile menu button
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
      aria-label="Toggle menu"
      aria-expanded={isMobileMenuOpen}
    >
      {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  // Mobile overlay
  const MobileOverlay = () => (
    isMobileMenuOpen && (
      <div 
        className="lg:hidden fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )
  );

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = ({ isMobileSidebar = false }) => (
    <aside
      className={`z-50 bg-gray-900 border-r border-gray-800 flex flex-col ${
        isMobileSidebar 
          ? "fixed top-0 left-0 h-full w-64 transform transition-transform duration-300" 
          : "hidden lg:flex w-52"
      } ${isMobileSidebar && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}`}
      style={{
        padding: "1em",
        overflow: "hidden",
        position: isMobileSidebar ? "fixed" : "fixed",
        height: "100vh",
        justifyContent: "space-between"
      }}
    >
      <nav className="flex flex-col gap-2 text-gray-400" style={{justifyContent:"space-between", gap:"3em"}}>

        <h1
          className="text-xl font-bold text-white cursor-pointer transition-transform duration-300 hover:scale-105"
          style={{ marginBottom: "" }}
          onClick={() => handleClick("/")}
        >
          ColdMail<span className="text-indigo-500">AI</span>
        </h1>

        <button className={buttonClass("dashboard")} onClick={() => handleClick("/dashboard")}>
          <LayoutDashboard size={18} /> <span className="hide-mobile-label">Dashboard</span>
        </button>

        <button
          className={buttonClass("generator")}
          onClick={() => handleClick("/")}
        >
          <Mail size={18} /> <span className="hide-mobile-label">Generator</span>
        </button>

        <button
          className={buttonClass("templates")}
          onClick={() => handleClick("/templates")}
        >
          <Sparkles size={18} /> <span className="hide-mobile-label">Templates</span>
        </button>

        <button
          className={buttonClass("settings")}
          onClick={() => handleClick("/settings")}
        >
          <Settings size={18} /> <span className="hide-mobile-label">Settings</span>
        </button>

        <button
          className={buttonClass("chat")}
          onClick={() => handleClick("/chat")}
          style={{ marginBottom: "1em" }}
        >
          <MessageCircle size={18} /> <span className="hide-mobile-label">Chat</span>
        </button>
      </nav>

      {user && (
        <div
          className="mt-auto border-t border-gray-800 pt-4 animate-fadeUp"
          onMouseLeave={() => setIsHovered(null)}
        >
          {isPremium && (
            <div className="flex items-center gap-2 px-4 py-2 mb-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl">
              <Crown size={14} className="text-yellow-400" />
              <span className="text-xs text-indigo-300 font-medium">Premium</span>
            </div>
          )}

          <div className="flex items-center gap-3 px-2">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm transition-transform duration-300 hover:scale-105">
                { <User size={18} />}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
            </div>

            <div className="flex-1 min-w-0 hide-mobile-info">
              <p className="text-sm font-medium text-white truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 transform hover:scale-110"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div
          className="mt-auto border-t border-gray-800 pt-4"
          style={{ paddingTop: "2em" }}
        >
          <div className="text-xs text-gray-500 text-center">
            <a
              href="/auth"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in to save your data
            </a>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Mobile menu button */}
      <MobileMenuButton />
      
      {/* Mobile overlay */}
      <MobileOverlay />
      
      {/* Desktop sidebar (always visible on lg screens and above) */}
      <SidebarContent isMobileSidebar={false} />
      
      {/* Mobile sidebar */}
      <SidebarContent isMobileSidebar={true} />
    </>
  );
}
