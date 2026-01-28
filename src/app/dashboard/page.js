"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { 
  TrendingUp, Users, Mail, MousePointer2, 
  Plus, ChevronRight, Zap, MessageSquare,
  BarChart3, Bot, Globe, Send, RefreshCcw, Crown, ShieldCheck,
  AlertCircle, Loader2, Trash2 
} from "lucide-react";
import Sidebar from "@/Component/sidebar";

import "swiper/css";

export default function Dashboard() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState("checking");
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalGenerated: 0,
      totalLeads: 0,
      activeCampaigns: 0,
      avgOpenRate: 0,
      ctr: 0,
    },
    campaigns: [],
  });

  const borderStyle = "1px solid rgba(255,255,255,0.05)";
  const cardBg = "#09090b";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsPremium(localStorage.getItem("premium") === "true");
    }
  }, []);

  // --- API HANDLERS ---

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      
      // Pull locally saved campaigns (if your builder saves to localStorage)
      const localCampaigns = JSON.parse(localStorage.getItem("my_campaigns") || "[]");

      if (data.success) {
        setDashboardData({
          stats: data.data.stats,
          // Merge local UI campaigns with server campaigns
          campaigns: [...localCampaigns, ...(data.data.campaigns || [])],
        });
        setError(null);
      } else {
        throw new Error(data.error || "Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      // Fallback: strictly show local if API fails
      const localCampaigns = JSON.parse(localStorage.getItem("my_campaigns") || "[]");
      setDashboardData(prev => ({
        ...prev,
        campaigns: localCampaigns
      }));
      setError("Cloud sync limited. Showing local data.");
    }
  };

  const checkSystemHealth = async () => {
    setIsRefreshing(true);
    setOllamaStatus("checking");
    try {
      const res = await fetch("/api/dashboard/health?service=ollama");
      const data = await res.json();
      setOllamaStatus(data.services?.ollama?.status || "offline");
    } catch (err) {
      setOllamaStatus("offline");
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const deleteCampaign = async (id) => {
    // 1. Remove from local state
    setDashboardData(prev => ({
      ...prev,
      campaigns: prev.campaigns.filter(c => c.id !== id)
    }));

    // 2. Remove from localStorage
    const local = JSON.parse(localStorage.getItem("my_campaigns") || "[]");
    localStorage.setItem("my_campaigns", JSON.stringify(local.filter(c => c.id !== id)));

    // 3. Optional: Call API to delete from server
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    } catch (e) { /* silent fail */ }
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDashboardData(), checkSystemHealth()]);
      setIsLoading(false);
    };
    initData();
  }, []);

  // --- COMPUTED ---
  const stats = [
    { label: "Total Generated", value: dashboardData.stats.totalGenerated.toLocaleString(), icon: Mail, color: "#818cf8" },
    { label: "Active Leads", value: (dashboardData.stats.totalLeads + dashboardData.campaigns.reduce((a,b) => a + (b.leads || 0), 0)).toLocaleString(), icon: Users, color: "#c084fc" },
    { label: "Avg. Open Rate", value: `${dashboardData.stats.avgOpenRate}%`, icon: TrendingUp, color: "#34d399" },
    { label: "CTR", value: `${dashboardData.stats.ctr}%`, icon: MousePointer2, color: "#fbbf24" },
  ];

  const deployBot = (platform) => alert(`Deploying AI Agent to ${platform}...`);

  if (isLoading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#030712", justifyContent: "center", alignItems: "center" }}>
        <Loader2 size={48} color="#4f46e5" className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#030712", color: "white", fontFamily: "sans-serif" }}>
      <Sidebar />

      <main style={{ flex: 1, marginLeft: "13em", display: "flex", justifyContent: "center", padding: "4em 2em" }}>
        <div style={{ width: "100%", maxWidth: "1100px", display: "flex", flexDirection: "column", gap: "3em" }}>
          
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={errorToastStyle}>
                <AlertCircle size={20} /> <span>{error}</span>
                <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>×</button>
              </motion.div>
            )}
          </AnimatePresence>

          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "800", margin: 0 }}>Welcome back, Chief</h1>
                {isPremium && <Crown size={24} color="#fbbf24" style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.4))" }} />}
              </div>
              <p style={{ color: "#9ca3af", marginTop: "0.5em" }}>Manage your AI empire and monitor outreach.</p>
            </motion.div>

            <div style={{ display: "flex", gap: "1em" }}>
               <button onClick={checkSystemHealth} style={{ ...statusBtnStyle, borderColor: ollamaStatus === "online" ? "#10b981" : "#ef4444" }}>
                  <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} color={ollamaStatus === "online" ? "#10b981" : "#ef4444"} />
                  <span style={{ color: ollamaStatus === "online" ? "#10b981" : "#ef4444", fontWeight: "bold", fontSize: "0.8rem" }}>{ollamaStatus.toUpperCase()}</span>
               </button>
               <motion.button onClick={() => router.push("/campaign-builder")} whileHover={{ scale: 1.05 }} style={primaryBtnStyle}>
                 <Plus size={20} /> New Campaign
               </motion.button>
            </div>
          </header>

          <section>
            <Swiper spaceBetween={20} slidesPerView={1} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }} modules={[Autoplay]}>
              {stats.map((stat, i) => (
                <SwiperSlide key={i}>
                  <div style={statCardStyle}>
                    <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "0.8em", borderRadius: "12px", display: "inline-block", marginBottom: "1em" }}>
                      <stat.icon size={24} color={stat.color} />
                    </div>
                    <p style={{ color: "#6b7280", fontSize: "0.8rem", textTransform: "uppercase", margin: 0 }}>{stat.label}</p>
                    <h3 style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0.2em 0 0 0" }}>{stat.value}</h3>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2em" }}>
             <div style={{ backgroundColor: cardBg, border: borderStyle, padding: "2em", borderRadius: "24px", gridColumn: "span 2" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px", marginBottom: "2em" }}><BarChart3 size={20} color="#818cf8"/> Weekly Activity</h2>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "150px", gap: "10px" }}>
                   {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} style={{ flex: 1, backgroundColor: i === 3 ? "#4f46e5" : "rgba(79, 70, 229, 0.2)", borderRadius: "8px" }}></motion.div>
                   ))}
                </div>
             </div>
             <div style={{ backgroundColor: cardBg, border: borderStyle, padding: "2em", borderRadius: "24px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5em" }}>Quick Tasks</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                   <button onClick={checkSystemHealth} style={actionButtonStyle}><ShieldCheck size={16} /> Run Health Check</button>
                   <button onClick={() => router.push("/campaign-builder")} style={actionButtonStyle}><Plus size={16} /> Create Campaign</button>
                </div>
             </div>
          </div>

          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5em", display: "flex", alignItems: "center", gap: "10px" }}>
               <Bot size={20} color="#818cf8"/> Command Center
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5em" }}>
              <BotCard platform="WhatsApp" icon={<MessageSquare size={24} color="#22c55e" />} color="#22c55e" onDeploy={() => deployBot("WhatsApp")} />
              <BotCard platform="Telegram" icon={<Send size={24} color="#3b82f6" />} color="#3b82f6" tag="NEW" onDeploy={() => deployBot("Telegram")} />
              <BotCard platform="Web Widget" icon={<Globe size={24} color="#f8fafc" />} color="#6366f1" onDeploy={() => deployBot("Widget")} />
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2em", marginBottom: "4em" }}>
            <div style={{ gridColumn: "span 2" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5em" }}>Live Campaigns</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
                <AnimatePresence>
                  {dashboardData.campaigns.length === 0 && <p style={{color: '#4b5563'}}>No active campaigns. Create one to get started.</p>}
                  {dashboardData.campaigns.map((camp) => (
                    <motion.div key={camp.id} exit={{ opacity: 0, x: -20 }} layout style={campaignRowStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
                        <div style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", color: "#818cf8", padding: "0.7em", borderRadius: "10px" }}><Zap size={18} /></div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "0.95rem" }}>{camp.name}</h4>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>{camp.leads} leads • {camp.status}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
                        <button onClick={() => deleteCampaign(camp.id)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer" }}>
                          <Trash2 size={18} />
                        </button>
                        <ChevronRight size={18} color="#374151" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {!isPremium && (
              <motion.div whileHover={{ scale: 1.02 }} style={premiumCardStyle}>
                <Crown size={40} style={{ marginBottom: "1em", opacity: 0.8 }} />
                <h3 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0 0 0.5em 0" }}>Scale Higher.</h3>
                <p style={{ color: "#e0e7ff", fontSize: "0.85rem", marginBottom: "2em" }}>Unlock multi-agent deployments and lead scraping.</p>
                <button onClick={() => router.push("/settings")} style={premiumBtnStyle}>UPGRADE NOW</button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function BotCard({ platform, icon, color, tag, onDeploy }) {
  return (
    <motion.div whileHover={{ y: -5 }} style={{ ...integrationCardStyle, border: `1px solid ${color}33` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div style={{ backgroundColor: `${color}1a`, borderRadius: "12px", padding: "10px" }}>{icon}</div>
        {tag && <span style={{ color, fontSize: "0.7rem", fontWeight: "bold" }}>{tag}</span>}
      </div>
      <h3 style={{ margin: "1em 0 0.5em 0" }}>{platform}</h3>
      <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "1.5em" }}>Automate your {platform} messages via AI.</p>
      <button onClick={onDeploy} style={{ ...connectBtn, background: color }}>Connect</button>
    </motion.div>
  );
}

const errorToastStyle = { position: "fixed", top: "2em", right: "2em", backgroundColor: "#ef4444", color: "white", padding: "1em 1.5em", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5em", zIndex: 1000, boxShadow: "0 4px 20px rgba(239, 68, 68, 0.4)" };
const statCardStyle = { backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.05)", padding: "2em", borderRadius: "24px" };
const actionButtonStyle = { display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", color: "#d1d5db", cursor: "pointer", textAlign: "left" };
const campaignRowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5em", backgroundColor: "#09090b", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.05)" };
const primaryBtnStyle = { backgroundColor: "#4f46e5", color: "white", padding: "0.8em 1.5em", borderRadius: "12px", border: "none", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5em", cursor: "pointer" };
const statusBtnStyle = { display: "flex", alignItems: "center", gap: "10px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid", padding: "0.6em 1.2em", borderRadius: "12px", cursor: "pointer" };
const integrationCardStyle = { backgroundColor: "#09090b", padding: "1.5em", borderRadius: "24px", display: "flex", flexDirection: "column" };
const connectBtn = { width: "100%", padding: "0.8em", borderRadius: "12px", border: "none", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer", marginTop: "auto", color: "white" };
const premiumCardStyle = { background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: "24px", padding: "2em", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "300px" };
const premiumBtnStyle = { width: "100%", padding: "1em", backgroundColor: "white", color: "#4f46e5", border: "none", borderRadius: "12px", fontWeight: "900", cursor: "pointer" };