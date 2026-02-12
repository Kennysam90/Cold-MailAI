"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { 
  TrendingUp, Users, Mail, MousePointer2, 
  Plus, ChevronRight, Zap, MessageSquare,
  BarChart3, Bot, Globe, Send, RefreshCcw, Crown, ShieldCheck,
  AlertCircle, Loader2, Trash2, Search, Download, ListChecks
} from "lucide-react";
import { useAuth } from "@/Context/AuthContext";

import "swiper/css";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const searchInputRef = useRef(null);
  
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState("checking");
  
  const [dashboardData, setDashboardData] = useState({
    stats: { totalGenerated: 0, totalLeads: 0, activeCampaigns: 0, avgOpenRate: 0, ctr: 0 },
    campaigns: [],
  });
  const [campaigns, setCampaigns] = useState([]);
  const [campaignMeta, setCampaignMeta] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("30d");
  const [activity, setActivity] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [usage, setUsage] = useState(null);
  const [billing, setBilling] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [abTests, setAbTests] = useState([]);

  const borderStyle = "1px solid rgba(255,255,255,0.05)";
  const cardBg = "#09090b";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsPremium(localStorage.getItem("premium") === "true");
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

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setDashboardData({
          stats: data.data.stats,
          campaigns: data.data.campaigns || [],
        });
        setError(null);
      } else { throw new Error(); }
    } catch (err) {
      setError("Cloud sync limited. Showing local data.");
    }
  };

  const fetchCampaigns = async (page = 1) => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (rangeFilter) params.set("range", rangeFilter);
      params.set("page", String(page));
      params.set("pageSize", String(campaignMeta.pageSize));

      const res = await fetch(`/api/dashboard/campaigns?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data.items || []);
        setCampaignMeta({
          page: data.data.page,
          pageSize: data.data.pageSize,
          total: data.data.total,
          totalPages: data.data.totalPages,
        });
        setError(null);
      } else { throw new Error(); }
    } catch (err) {
      setError("Failed to load campaigns. Check your connection.");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/dashboard/analytics?range=${rangeFilter}`);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data || []);
      }
    } catch (err) {}
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch(`/api/dashboard/activity?page=1&pageSize=10`);
      const data = await res.json();
      if (data.success) {
        setActivity(data.data.items || []);
      }
    } catch (err) {}
  };

  const fetchUsage = async () => {
    try {
      const res = await fetch(`/api/dashboard/usage`);
      const data = await res.json();
      if (data.success) {
        setUsage(data.data);
      }
    } catch (err) {}
  };

  const fetchBilling = async () => {
    try {
      const res = await fetch(`/api/dashboard/billing`);
      const data = await res.json();
      if (data.success) {
        setBilling(data.data);
      }
    } catch (err) {}
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/workspaces/members`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.data || []);
      }
    } catch (err) {}
  };

  const fetchInvites = async () => {
    try {
      const res = await fetch(`/api/workspaces/invites`);
      const data = await res.json();
      if (data.success) {
        setInvites(data.data || []);
      }
    } catch (err) {}
  };

  const createInvite = async () => {
    if (!inviteEmail) return;
    try {
      const res = await fetch(`/api/workspaces/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (data.success) {
        setInviteEmail("");
        fetchInvites();
      }
    } catch (err) {}
  };

  const revokeInvite = async (token) => {
    try {
      await fetch(`/api/workspaces/invites`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", token }),
      });
      fetchInvites();
    } catch (err) {}
  };

  const fetchAbTests = async () => {
    try {
      const res = await fetch(`/api/dashboard/ab-tests`);
      const data = await res.json();
      if (data.success) {
        setAbTests(data.data || []);
      }
    } catch (err) {}
  };

  const checkSystemHealth = async () => {
    setIsRefreshing(true);
    setOllamaStatus("checking");
    try {
      const attempt = async () => {
        const res = await fetch("/api/dashboard/health?service=ollama");
        return res.json();
      };
      let data = await attempt();
      if (data.services?.ollama?.status !== "online") {
        await new Promise(r => setTimeout(r, 800));
        data = await attempt();
      }
      setOllamaStatus(data.services?.ollama?.status || "offline");
    } catch (err) { setOllamaStatus("offline"); }
    finally { setTimeout(() => setIsRefreshing(false), 500); }
  };

  const deleteCampaign = async (id) => {
    try { 
      await fetch(`/api/dashboard/stats`, { 
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteCampaign", campaign: { id } })
      }); 
      await fetchCampaigns(campaignMeta.page);
    } catch (e) {}
  };

  const updateCampaignStatus = async (id, status) => {
    try {
      await fetch(`/api/dashboard/stats`, { 
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateStatus", campaign: { id, status } })
      });
      await fetchCampaigns(campaignMeta.page);
      await fetchDashboardData();
    } catch (e) {}
  };

  const exportCampaignsCsv = () => {
    const headers = ["id", "name", "status", "leads", "website", "createdAt"];
    const rows = campaigns.map(c => [
      c.id,
      `"${String(c.name || "").replace(/"/g, '""')}"`,
      c.status,
      c.leads,
      c.website || "",
      c.createdAt,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "campaigns.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchCampaigns(1),
        fetchAnalytics(),
        fetchActivity(),
        fetchUsage(),
        fetchBilling(),
        fetchMembers(),
        fetchInvites(),
        fetchAbTests(),
        checkSystemHealth(),
      ]);
      setIsLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    fetchCampaigns(1);
    fetchAnalytics();
  }, [searchQuery, statusFilter, rangeFilter]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "n" || e.key === "N") {
        router.push("/campaign-builder");
      }
      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  const stats = [
    { label: "Total Generated", value: dashboardData.stats.totalGenerated.toLocaleString(), icon: Mail, color: "#818cf8" },
    { label: "Active Leads", value: dashboardData.stats.totalLeads.toLocaleString(), icon: Users, color: "#c084fc" },
    { label: "Avg. Open Rate", value: `${dashboardData.stats.avgOpenRate}%`, icon: TrendingUp, color: "#34d399" },
    { label: "CTR", value: `${dashboardData.stats.ctr}%`, icon: MousePointer2, color: "#fbbf24" },
  ];

  const checklist = [
    { label: "Create your first campaign", done: campaignMeta.total > 0 },
    { label: "Run a health check", done: ollamaStatus === "online" },
    { label: "Generate emails", done: dashboardData.stats.totalGenerated > 0 },
  ];

  const usagePercent = usage ? Math.min(100, Math.round((usage.emailsGenerated / Math.max(usage.limit, 1)) * 100)) : 0;

  if (isLoading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#030712", justifyContent: "center", alignItems: "center" }}>
        <Loader2 size={48} color="#4f46e5" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "1100px", display: "flex", flexDirection: "column", gap: isMobile ? "1.5em" : "3em" }}>
          
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={errorToastStyle}>
                <AlertCircle size={20} /> <span>{error}</span>
                <button onClick={() => { fetchDashboardData(); fetchCampaigns(1); fetchAnalytics(); }} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline" }}>
                  Retry
                </button>
                <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>×</button>
              </motion.div>
            )}
          </AnimatePresence>

          <header style={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row", 
            justifyContent: "space-between", 
            alignItems: isMobile ? "flex-start" : "center",
            gap: "1.5em"
          }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "800", margin: 0 }}>
                  Welcome{user?.name ? `, ${user.name}` : ""}
                </h1>
                {isPremium && <Crown size={24} color="#fbbf24" />}
              </div>
              <p style={{ color: "#9ca3af", marginTop: "0.5em", margin: "0.5em 0 0 0" }}>Manage your AI empire.</p>
            </motion.div>

            <div style={{ display: "flex", gap: "0.8em", width: isMobile ? "100%" : "auto" }}>
               <button onClick={checkSystemHealth} style={{ ...statusBtnStyle, flex: 1, borderColor: ollamaStatus === "online" ? "#10b981" : "#ef4444" }}>
                  <RefreshCcw size={16} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} color={ollamaStatus === "online" ? "#10b981" : "#ef4444"} />
                  <span style={{ color: ollamaStatus === "online" ? "#10b981" : "#ef4444", fontWeight: "bold", fontSize: "0.7rem" }}>{ollamaStatus.toUpperCase()}</span>
               </button>
               <motion.button onClick={() => router.push("/campaign-builder")} style={{ ...primaryBtnStyle, flex: 1 }}>
                 <Plus size={20} /> New
               </motion.button>
            </div>
          </header>

          <section style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "1em", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5em", backgroundColor: cardBg, border: borderStyle, borderRadius: "12px", padding: "0.6em 0.8em", flex: 1 }}>
              <Search size={16} color="#6b7280" />
              <input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                ref={searchInputRef}
                style={{ background: "transparent", border: "none", outline: "none", color: "white", width: "100%" }}
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select value={rangeFilter} onChange={(e) => setRangeFilter(e.target.value)} style={selectStyle}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button onClick={exportCampaignsCsv} style={secondaryBtnStyle}>
              <Download size={16} /> Export CSV
            </button>
          </section>

          <section>
            <Swiper spaceBetween={15} slidesPerView={1.2} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }} modules={[Autoplay]}>
              {stats.map((stat, i) => (
                <SwiperSlide key={i}>
                  <div style={{ ...statCardStyle, padding: isMobile ? "1.5em" : "2em" }}>
                    <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "0.8em", borderRadius: "12px", display: "inline-block", marginBottom: "1rem" }}>
                      <stat.icon size={20} color={stat.color} />
                    </div>
                    <p style={{ color: "#6b7280", fontSize: "0.7rem", textTransform: "uppercase", margin: 0, fontWeight: "600", letterSpacing: "0.05em" }}>{stat.label}</p>
                    <h3 style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontWeight: "bold", margin: "0.2em 0 0 0" }}>{stat.value}</h3>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.5em" }}>
             <div style={{ backgroundColor: cardBg, border: borderStyle, padding: isMobile ? "1.5em" : "2em", borderRadius: "24px", gridColumn: isMobile ? "span 1" : "span 2" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px", marginBottom: "2rem", margin: "0 0 2rem 0" }}>
                  <BarChart3 size={20} color="#818cf8"/> Activity Over Time
                </h2>
                <div style={{ width: "100%", height: isMobile ? "120px" : "170px" }}>
                  <SimpleLineChart data={analytics} height={isMobile ? 120 : 170} />
                </div>
             </div>
             <div style={{ backgroundColor: cardBg, border: borderStyle, padding: isMobile ? "1.5em" : "2em", borderRadius: "24px" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "1.5rem", margin: "0 0 1.5rem 0" }}>Onboarding</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {checklist.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", color: item.done ? "#34d399" : "#9ca3af" }}>
                      <ListChecks size={16} />
                      <span style={{ fontSize: "0.85rem" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.5em" }}>
            <div style={{ backgroundColor: cardBg, border: borderStyle, padding: "1.5em", borderRadius: "20px" }}>
              <h3 style={{ margin: "0 0 0.5em 0", fontSize: "0.9rem", color: "#9ca3af" }}>Usage</h3>
              <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                {usage ? `${usage.emailsGenerated} / ${usage.limit}` : "--"}
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.05)", height: "8px", borderRadius: "999px", marginTop: "0.6em" }}>
                <div style={{ width: `${usagePercent}%`, backgroundColor: "#4f46e5", height: "100%", borderRadius: "999px" }} />
              </div>
            </div>
            <div style={{ backgroundColor: cardBg, border: borderStyle, padding: "1.5em", borderRadius: "20px" }}>
              <h3 style={{ margin: "0 0 0.5em 0", fontSize: "0.9rem", color: "#9ca3af" }}>Billing</h3>
              <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                {billing ? billing.planName : "Free"}
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.8rem", margin: "0.4em 0 0 0" }}>
                Provider: {billing ? billing.provider : "Stripe"}
              </p>
            </div>
            <div style={{ backgroundColor: cardBg, border: borderStyle, padding: "1.5em", borderRadius: "20px" }}>
              <h3 style={{ margin: "0 0 0.5em 0", fontSize: "0.9rem", color: "#9ca3af" }}>Quick Tasks</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                 <button onClick={checkSystemHealth} style={actionButtonStyle}><ShieldCheck size={16} /> Health Check</button>
                 <button onClick={() => router.push("/campaign-builder")} style={actionButtonStyle}><Plus size={16} /> New Campaign</button>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 1.5rem 0" }}>
               <Bot size={20} color="#818cf8"/> Command Center
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5em" }}>
              <BotCard platform="WhatsApp" icon={<MessageSquare size={24} color="#22c55e" />} color="#22c55e" onDeploy={() => alert("WhatsApp Coming Soon")} />
              <BotCard platform="Telegram" icon={<Send size={24} color="#3b82f6" />} color="#3b82f6" tag="NEW" onDeploy={() => alert("Telegram Coming Soon")} />
              {!isMobile && <BotCard platform="Web Widget" icon={<Globe size={24} color="#f8fafc" />} color="#6366f1" onDeploy={() => alert("Widget Coming Soon")} />}
            </div>
          </section>

          <section style={{ backgroundColor: cardBg, border: borderStyle, borderRadius: "24px", padding: isMobile ? "1.5em" : "2em" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 1.2rem 0" }}>
              <BarChart3 size={20} color="#818cf8" /> Activity Log
            </h2>
            {activity.length === 0 && <p style={{ color: "#6b7280", margin: 0 }}>No recent activity.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
              {activity.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6em 0.8em", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                  <span style={{ fontSize: "0.85rem" }}>{item.action}</span>
                  <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ backgroundColor: cardBg, border: borderStyle, borderRadius: "24px", padding: isMobile ? "1.5em" : "2em" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 1.2rem 0" }}>
              <BarChart3 size={20} color="#818cf8" /> A/B Performance
            </h2>
            {abTests.length === 0 && <p style={{ color: "#6b7280", margin: 0 }}>No A/B tests yet.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8em" }}>
              {abTests.map((t) => (
                <div key={t.id} style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "0.8em" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6em" }}>
                    <span style={{ fontWeight: "600" }}>{t.name}</span>
                    <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>{t.variantA} vs {t.variantB}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0.6em" }}>
                    <div style={{ backgroundColor: "#0b0b0f", borderRadius: "10px", padding: "0.6em" }}>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Variant A</div>
                      <div style={{ display: "flex", gap: "1em", fontSize: "0.8rem", marginTop: "0.4em" }}>
                        <span>Sent: {t.summary.a.sent}</span>
                        <span>Open: {t.summary.a.opened}</span>
                        <span>Click: {t.summary.a.clicked}</span>
                        <span>Reply: {t.summary.a.replied}</span>
                      </div>
                    </div>
                    <div style={{ backgroundColor: "#0b0b0f", borderRadius: "10px", padding: "0.6em" }}>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Variant B</div>
                      <div style={{ display: "flex", gap: "1em", fontSize: "0.8rem", marginTop: "0.4em" }}>
                        <span>Sent: {t.summary.b.sent}</span>
                        <span>Open: {t.summary.b.opened}</span>
                        <span>Click: {t.summary.b.clicked}</span>
                        <span>Reply: {t.summary.b.replied}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ backgroundColor: cardBg, border: borderStyle, borderRadius: "24px", padding: isMobile ? "1.5em" : "2em" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "10px", margin: "0 0 1.2rem 0" }}>
              <Users size={20} color="#818cf8" /> Team
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.5em" }}>
              <div>
                <h3 style={{ fontSize: "0.9rem", color: "#9ca3af", margin: "0 0 0.8em 0" }}>Members</h3>
                {members.length === 0 && <p style={{ color: "#6b7280", margin: 0 }}>No members yet.</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
                  {members.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6em 0.8em", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                      <span style={{ fontSize: "0.85rem" }}>{m.user?.email || "user"}</span>
                      <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: "0.9rem", color: "#9ca3af", margin: "0 0 0.8em 0" }}>Invite</h3>
                <div style={{ display: "flex", gap: "0.6em", marginBottom: "0.8em" }}>
                  <input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="name@company.com"
                    style={{ flex: 1, backgroundColor: "#0b0b0f", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "0.6em 0.8em", borderRadius: "10px" }}
                  />
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={selectStyle}>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button onClick={createInvite} style={secondaryBtnStyle}>Invite</button>
                </div>
                <h3 style={{ fontSize: "0.9rem", color: "#9ca3af", margin: "0.6em 0" }}>Pending Invites</h3>
                {invites.length === 0 && <p style={{ color: "#6b7280", margin: 0 }}>No pending invites.</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
                  {invites.map((inv) => (
                    <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6em 0.8em", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.85rem" }}>{inv.email}</span>
                        <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{`/invites/${inv.token}`}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6em" }}>
                        <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{inv.status}</span>
                        {inv.status === "PENDING" && (
                          <button onClick={() => revokeInvite(inv.token)} style={{ ...secondaryBtnStyle, padding: "0.3em 0.6em", fontSize: "0.7rem" }}>
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "2.5rem", marginBottom: "4rem" }}>
            <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1.5rem", margin: "0 0 1.5rem 0" }}>Live Campaigns</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8em" }}>
                <AnimatePresence>
                  {campaigns.length === 0 && <p style={{color: '#4b5563', margin: 0}}>No active campaigns.</p>}
                  {campaigns.length === 0 && (
                    <button onClick={() => router.push("/campaign-builder")} style={{ ...primaryBtnStyle, width: "fit-content" }}>
                      <Plus size={18} /> Create your first campaign
                    </button>
                  )}
                  {campaigns.map((camp) => (
                    <motion.div key={camp.id} exit={{ opacity: 0, x: -20 }} layout style={{...campaignRowStyle, padding: isMobile ? "1em" : "1.5em"}}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
                        <div style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", color: "#818cf8", padding: "0.6em", borderRadius: "8px", display: "flex" }}><Zap size={16} /></div>
                        <div style={{ textAlign: "left" }}>
                          <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600" }}>{camp.name}</h4>
                          <p style={{ margin: 0, fontSize: "0.7rem", color: "#6b7280" }}>{camp.leads} leads</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
                        <select value={camp.status} onChange={(e) => updateCampaignStatus(camp.id, e.target.value)} style={miniSelectStyle}>
                          <option value="DRAFT">Draft</option>
                          <option value="ACTIVE">Active</option>
                          <option value="PAUSED">Paused</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                        <button onClick={() => deleteCampaign(camp.id)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer" }}><Trash2 size={16} /></button>
                        <ChevronRight size={16} color="#374151" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {campaignMeta.totalPages > 1 && (
                <div style={{ display: "flex", gap: "0.5em", marginTop: "1em" }}>
                  <button
                    onClick={() => fetchCampaigns(Math.max(1, campaignMeta.page - 1))}
                    style={secondaryBtnStyle}
                    disabled={campaignMeta.page <= 1}
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => fetchCampaigns(Math.min(campaignMeta.totalPages, campaignMeta.page + 1))}
                    style={secondaryBtnStyle}
                    disabled={campaignMeta.page >= campaignMeta.totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {!isPremium && (
              <motion.div style={{ ...premiumCardStyle, height: isMobile ? "200px" : "70%", marginTop:"5em" }}>
                <Crown size={isMobile ? 30 : 40} style={{ marginBottom: "1em" }} />
                <h3 style={{ fontSize: "1.3rem", fontWeight: "900", margin: "0 0 0.5em 0" }}>Scale Higher.</h3>
                <button onClick={() => router.push("/settings")} style={premiumBtnStyle}>UPGRADE NOW</button>
              </motion.div>
            )}
          </div>
        </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function BotCard({ platform, icon, color, tag, onDeploy }) {
  return (
    <motion.div whileHover={{ y: -5 }} style={{ ...integrationCardStyle, border: `1px solid ${color}33` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div style={{ backgroundColor: `${color}1a`, borderRadius: "12px", padding: "10px", display: "flex" }}>{icon}</div>
        {tag && <span style={{ color, fontSize: "0.6rem", fontWeight: "bold", backgroundColor: `${color}1a`, padding: "2px 8px", borderRadius: "10px" }}>{tag}</span>}
      </div>
      <h3 style={{ margin: "1em 0 0.5em 0", fontSize: "1rem", fontWeight: "700", textAlign: "left" }}>{platform}</h3>
      <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "1.5em", textAlign: "left", lineHeight: "1.4" }}>AI automation for {platform}.</p>
      <button onClick={onDeploy} style={{ ...connectBtn, background: color }}>Connect</button>
    </motion.div>
  );
}

function SimpleLineChart({ data, height = 160 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "0.8rem" }}>
        No data yet
      </div>
    );
  }

  const values = data.map(d => d.generated || 0);
  const max = Math.max(1, ...values);
  const points = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * 100;
    const y = 100 - (v / max) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height }}>
      <polyline
        fill="none"
        stroke="#4f46e5"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

// Styles
const errorToastStyle = { position: "fixed", bottom: "2em", right: "2em", backgroundColor: "#ef4444", color: "white", padding: "1rem 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.75em", zIndex: 1000, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" };
const statCardStyle = { backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", textAlign: "left" };
const actionButtonStyle = { display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", color: "#d1d5db", cursor: "pointer", transition: "0.2s" };
const campaignRowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#09090b", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.05)", transition: "0.2s" };
const primaryBtnStyle = { backgroundColor: "#4f46e5", color: "white", padding: "0.8em 1.5em", borderRadius: "12px", border: "none", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5em", cursor: "pointer" };
const statusBtnStyle = { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid", padding: "0.6em 1.2em", borderRadius: "12px", cursor: "pointer" };
const integrationCardStyle = { backgroundColor: "#09090b", padding: "1.5em", borderRadius: "24px", display: "flex", flexDirection: "column" };
const connectBtn = { width: "100%", padding: "0.8em", borderRadius: "12px", border: "none", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer", marginTop: "auto", color: "white" };
const premiumCardStyle = { background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: "24px", padding: "2em", display: "flex", flexDirection: "column", justifyContent: "flex-end", textAlign: "left", };
const premiumBtnStyle = { width: "100%", padding: "0.8em", backgroundColor: "white", color: "#4f46e5", border: "none", borderRadius: "10px", fontWeight: "900", cursor: "pointer" };
const selectStyle = { backgroundColor: "#09090b", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "0.6em 0.8em", borderRadius: "10px" };
const miniSelectStyle = { backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "0.4em 0.6em", borderRadius: "8px", fontSize: "0.7rem" };
const secondaryBtnStyle = { backgroundColor: "rgba(255,255,255,0.03)", color: "white", padding: "0.6em 1em", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "0.4em", cursor: "pointer" };
