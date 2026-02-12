"use client";

import React, { useEffect, useState } from "react";
import { Copy, Check, Sparkles, Plus, Pencil, Trash2, Save, X } from "lucide-react";

export default function TemplatesPage() {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [preview, setPreview] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", subject: "", body: "" });

  const sampleData = {
    name: "Alex",
    company: "Acme Inc",
    industry: "SaaS",
    similar_company: "Brightflow",
    name_of_mutual_connection: "Jamie Lee",
  };

  const applyTokens = (text) => {
    return text.replace(/\{(\w+)\}/g, (_, key) => sampleData[key] || `{${key}}`);
  };

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/templates");
        const data = await res.json();
        if (!data?.success) throw new Error(data?.error || "Failed to load templates");
        setTemplates(data.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const copy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const resetForm = () => {
    setForm({ name: "", subject: "", body: "" });
    setEditingId(null);
  };

  const submitForm = async () => {
    if (!form.name || !form.subject || !form.body) {
      setError("Please fill in name, subject, and body.");
      return;
    }
    setError("");
    try {
      if (editingId) {
        const res = await fetch(`/api/templates/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!data?.success) throw new Error(data?.error || "Update failed");
        setTemplates(prev => prev.map(t => (t.id === editingId ? data.data : t)));
      } else {
        const res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!data?.success) throw new Error(data?.error || "Create failed");
        setTemplates(prev => [data.data, ...prev]);
      }
      resetForm();
    } catch (e) {
      setError(e.message);
    }
  };

  const editTemplate = (template) => {
    setEditingId(template.id);
    setForm({ name: template.name, subject: template.subject, body: template.body });
  };

  const deleteTemplate = async (id) => {
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Delete failed");
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", color: "white" }}>
      <div style={{ maxWidth: "56rem", width: "100%", padding: "3rem 2.5rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          
          {/* HEADER */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h1 style={{ fontSize: "2.25rem", fontWeight: "bold", margin: 0 }}>Email Templates</h1>
            <p style={{ color: "#9ca3af", margin: 0 }}>
              Pre-built templates to jumpstart your cold outreach campaigns.
            </p>
          </div>

          {/* CREATE / EDIT */}
          <div style={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "1.5rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "1rem" }}>{editingId ? "Edit Template" : "Create Template"}</h3>
            {error && <p style={{ color: "#f87171", margin: 0 }}>{error}</p>}
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Template name"
              style={{ width: "100%", backgroundColor: "#0b0b0f", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.7rem 0.9rem", borderRadius: "10px" }}
            />
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Subject"
              style={{ width: "100%", backgroundColor: "#0b0b0f", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.7rem 0.9rem", borderRadius: "10px" }}
            />
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Email body"
              rows={5}
              style={{ width: "100%", backgroundColor: "#0b0b0f", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.7rem 0.9rem", borderRadius: "10px", resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={submitForm} style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#4f46e5", color: "white", padding: "0.6rem 1rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }}>
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {editingId ? "Save" : "Create"}
              </button>
              {editingId && (
                <button onClick={resetForm} style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#1f2937", color: "white", padding: "0.6rem 1rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }}>
                  <X size={16} /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* TEMPLATES GRID */}
          {loading ? (
            <p style={{ color: "#9ca3af" }}>Loading templates…</p>
          ) : (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {templates.map((template, index) => (
              <div
                key={template.id}
                style={{
                  backgroundColor: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: "1.5rem",
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Sparkles size={16} style={{ color: "#818cf8" }} />
                    <span style={{ color: "#818cf8", fontSize: "0.875rem", fontWeight: 500 }}>{template.name}</span>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => editTemplate(template)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                        backgroundColor: "#1f2937",
                        color: "white",
                        padding: "0.5rem 0.8rem",
                        borderRadius: "0.75rem",
                        border: "none",
                        cursor: "pointer",
                        transition: "0.2s"
                      }}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        color: "#f87171",
                        padding: "0.5rem 0.8rem",
                        borderRadius: "0.75rem",
                        border: "none",
                        cursor: "pointer",
                        transition: "0.2s"
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
                  {preview ? applyTokens(template.subject) : template.subject}
                </p>

                <p style={{ color: "#d1d5db", whiteSpace: "pre-line", lineHeight: 1.625, margin: 0, textAlign: "left" }}>
                  {preview ? applyTokens(template.body) : template.body}
                </p>

                <button
                  onClick={() => copy(`Subject: ${template.subject}\n\n${template.body}`, index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "#1f2937",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.75rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "0.2s",
                    marginTop: "0.5rem",
                    width: "fit-content"
                  }}
                >
                  {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                  {copiedIndex === index ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
            </div>
          )}

          <div style={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "1.5rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <h3 style={{ margin: 0, fontSize: "1rem" }}>Personalization Tokens</h3>
            <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.85rem" }}>
              Use tokens like <code>{"{name}"}</code>, <code>{"{company}"}</code>, <code>{"{industry}"}</code> in your templates.
            </p>
            <button
              onClick={() => setPreview(!preview)}
              style={{
                width: "fit-content",
                backgroundColor: "#1f2937",
                color: "white",
                padding: "0.6rem 1rem",
                borderRadius: "0.75rem",
                border: "none",
                cursor: "pointer"
              }}
            >
              {preview ? "Show Raw" : "Preview with Sample Data"}
            </button>
          </div>
      </div>
    </div>
  );
}
