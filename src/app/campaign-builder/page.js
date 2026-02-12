"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, Save, 
  Upload, Globe, MessageSquare, 
  Target, Rocket, CheckCircle2,
  Loader2, FileText, X
} from "lucide-react";

export default function CampaignBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLaunching, setIsLaunching] = useState(false);
  const [fileName, setFileName] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    leadsCount: 0,
    tone: "Professional",
    model: "llama3.2",
    abEnabled: false,
    abVariantA: "",
    abVariantB: ""
  });

  // --- LOGIC ---
  
  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.website)) {
      alert("Please fill in the campaign name and website.");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      // Simulate parsing lead count
      setFormData({ ...formData, leadsCount: Math.floor(Math.random() * 500) + 50 });
    }
  };

  const handleFinish = async () => {
    setIsLaunching(true);
    
    try {
      // 1. Send the new campaign data to your API
      const response = await fetch("/api/dashboard/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addCampaign",
          campaign: {
            name: formData.name,
            leads: formData.leadsCount,
            website: formData.website,
            abEnabled: formData.abEnabled,
            abVariantA: formData.abVariantA,
            abVariantB: formData.abVariantB,
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 2. Wait a small beat for the "Launch" effect
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push("/dashboard");
      } else {
        alert("Failed to save campaign: " + result.error);
      }
    } catch (error) {
      console.error("Error launching campaign:", error);
      alert("Something went wrong with the connection.");
    } finally {
      setIsLaunching(false);
    }
  };

  // --- STYLES ---
  const cardStyle = {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "24px",
    padding: "3em",
    textAlign: "left",
    width: "100%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
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
    marginTop: "0.5em",
    outline: "none",
    transition: "border-color 0.2s"
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "700px" }}>
          
          {/* STEP INDICATOR */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "3em" }}>
            {[1, 2, 3, 4].map((s) => (
              <div key={s} style={{ 
                height: "6px", 
                width: s === step ? "40px" : "20px", 
                backgroundColor: s <= step ? "#4f46e5" : "#1f2937", 
                borderRadius: "10px", 
                transition: "0.4s" 
              }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
                <div style={{ marginBottom: "2em" }}>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>Campaign Basics</h1>
                  <p style={{ color: "#9ca3af" }}>Identify your target niche.</p>
                </div>

                <div style={{ marginBottom: "1.5em" }}>
                  <label style={labelStyle}>Campaign Name</label>
                  <input 
                    style={inputStyle} 
                    placeholder="e.g. Q1 SaaS Founders Outreach" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div style={{ marginBottom: "2em" }}>
                  <label style={labelStyle}>Target Website / Niche</label>
                  <div style={{ position: "relative" }}>
                    <Globe size={18} style={{ position: "absolute", left: "15px", top: "25px", color: "#4b5563" }} />
                    <input 
                      style={{ ...inputStyle, paddingLeft: "3em" }} 
                      placeholder="e.g. stripe.com" 
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                    />
                  </div>
                </div>

                <button onClick={nextStep} style={primaryBtnStyle}>Next: Lead Source <ArrowRight size={18} /></button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
                <div style={{ marginBottom: "2em" }}>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>Leads & Data</h1>
                  <p style={{ color: "#9ca3af" }}>Upload the CSV you want the AI to analyze.</p>
                </div>

                <label style={{ cursor: "pointer", display: "block" }}>
                  <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} />
                  <div style={uploadBoxStyle}>
                    {fileName ? (
                      <>
                        <FileText size={32} color="#34d399" />
                        <p style={{ margin: "10px 0 0", fontWeight: "bold" }}>{fileName}</p>
                        <span style={{ color: "#4f46e5", fontSize: "0.8rem" }}>Click to change file</span>
                      </>
                    ) : (
                      <>
                        <Upload size={32} color="#4f46e5" />
                        <p style={{ margin: "10px 0 0", fontWeight: "bold" }}>Drop your CSV here</p>
                        <p style={{ color: "#4b5563", fontSize: "0.8rem" }}>Up to 5,000 leads supported</p>
                      </>
                    )}
                  </div>
                </label>

                <div style={{ display: "flex", gap: "1em", marginTop: "2em" }}>
                  <button onClick={prevStep} style={secondaryBtnStyle}>Back</button>
                  <button onClick={nextStep} style={{...primaryBtnStyle, opacity: fileName ? 1 : 0.5}} disabled={!fileName}>
                    Next: AI Persona <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
                <div style={{ marginBottom: "2em" }}>
                  <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>AI Configuration</h1>
                  <p style={{ color: "#9ca3af" }}>Choose how your AI bot speaks.</p>
                </div>

                <div style={{ marginBottom: "1.5em" }}>
                  <label style={labelStyle}>Outreach Tone</label>
                  <select style={inputStyle} value={formData.tone} onChange={(e) => setFormData({...formData, tone: e.target.value})}>
                    <option>Professional</option>
                    <option>Casual & Friendly</option>
                    <option>Direct / Short</option>
                    <option>Humorous</option>
                  </select>
                </div>

                <div style={{ marginBottom: "2.5em" }}>
                  <label style={labelStyle}>AI Engine (Ollama)</label>
                  <select style={inputStyle} value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})}>
                    <option value="llama3.2">Llama 3.2 (Recommended)</option>
                    <option value="mistral">Mistral 7B</option>
                    <option value="tinyllama">TinyLlama (Fastest)</option>
                  </select>
                </div>

                <div style={{ marginBottom: "2.5em" }}>
                  <label style={labelStyle}>A/B Test Subject Lines</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6em", marginTop: "0.6em" }}>
                    <input
                      type="checkbox"
                      checked={formData.abEnabled}
                      onChange={(e) => setFormData({ ...formData, abEnabled: e.target.checked })}
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Enable A/B testing</span>
                  </div>
                  {formData.abEnabled && (
                    <div style={{ display: "grid", gap: "0.8em", marginTop: "1em" }}>
                      <input
                        style={inputStyle}
                        placeholder="Variant A subject line"
                        value={formData.abVariantA}
                        onChange={(e) => setFormData({ ...formData, abVariantA: e.target.value })}
                      />
                      <input
                        style={inputStyle}
                        placeholder="Variant B subject line"
                        value={formData.abVariantB}
                        onChange={(e) => setFormData({ ...formData, abVariantB: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "1em" }}>
                  <button onClick={prevStep} style={secondaryBtnStyle}>Back</button>
                  <button onClick={nextStep} style={primaryBtnStyle}>Review & Launch <ArrowRight size={18} /></button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={cardStyle}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.5em" }}>Review Campaign</h1>
                <p style={{ color: "#9ca3af", marginBottom: "2em" }}>Everything looks ready for deployment.</p>

                <div style={summaryGridStyle}>
                   <SummaryItem label="Campaign" value={formData.name} />
                   <SummaryItem label="Target" value={formData.website} />
                   <SummaryItem label="Leads" value={`${formData.leadsCount} found`} />
                   <SummaryItem label="Engine" value={formData.model} />
                </div>

                <div style={{ display: "flex", gap: "1em", marginTop: "2em" }}>
                  <button onClick={prevStep} style={secondaryBtnStyle} disabled={isLaunching}>Edit</button>
                  <button onClick={handleFinish} style={{ ...primaryBtnStyle, backgroundColor: "#34d399" }} disabled={isLaunching}>
                    {isLaunching ? <Loader2 className="animate-spin" size={20} /> : <Rocket size={18} />}
                    {isLaunching ? "Launching..." : "Deploy Campaign"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function SummaryItem({ label, value }) {
  return (
    <div style={{ padding: "1em", backgroundColor: "#030712", borderRadius: "12px", border: "1px solid #1f2937" }}>
      <p style={{ color: "#4b5563", fontSize: "0.75rem", margin: 0, textTransform: "uppercase" }}>{label}</p>
      <p style={{ fontWeight: "bold", margin: "5px 0 0 0" }}>{value}</p>
    </div>
  );
}

// --- STYLES ---
const labelStyle = { fontSize: "0.9rem", color: "#9ca3af", fontWeight: "600" };
const summaryGridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1em" };
const uploadBoxStyle = { border: "2px dashed #1f2937", padding: "3em", borderRadius: "20px", textAlign: "center", backgroundColor: "rgba(255,255,255,0.02)", transition: "0.3s" };
const primaryBtnStyle = { flex: 1, height: "3.5em", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "14px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" };
const secondaryBtnStyle = { padding: "0 2em", height: "3.5em", backgroundColor: "transparent", color: "#9ca3af", border: "1px solid #1f2937", borderRadius: "14px", fontWeight: "bold", cursor: "pointer" };
