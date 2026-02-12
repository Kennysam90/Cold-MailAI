"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import { Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, Check, Github } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [animate, setAnimate] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { user, login, signup, loginWithGoogle, loginWithGithub } = useAuth();
  const router = useRouter();

  useEffect(() => { setAnimate(true); }, []);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#030712",
      display: "flex",
      color: "#f3f4f6",
    },
    leftPanel: {
      display: "flex",
      width: "50%",
      backgroundColor: "#09090b",
      borderRight: "1px solid rgba(255, 255, 255, 0.05)",
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem",
      overflow: "hidden",
    },
    glowIndigo: {
      position: "absolute",
      top: "-10%",
      left: "-10%",
      width: "40%",
      height: "40%",
      backgroundColor: "rgba(79, 70, 229, 0.2)",
      filter: "blur(120px)",
      borderRadius: "9999px",
    },
    glowPurple: {
      position: "absolute",
      bottom: "-10%",
      right: "-10%",
      width: "40%",
      height: "40%",
      backgroundColor: "rgba(147, 51, 234, 0.1)",
      filter: "blur(120px)",
      borderRadius: "9999px",
    },
    brandIcon: {
      width: "3rem",
      height: "3rem",
      backgroundColor: "#4f46e5",
      borderRadius: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.4)",
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      width: "100%",
    },
    inputBase: {
      width: "100%",
      height: "3.5rem",
      paddingLeft: "3.5rem",
      paddingRight: "1rem",
      borderRadius: "1rem",
      backgroundColor: "#09090b",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "white",
      outline: "none",
      transition: "all 0.2s ease-in-out",
    },
    tabButton: (isActive) => ({
      flex: 1,
      padding: "0.75rem 1rem",
      borderRadius: "0.75rem",
      fontSize: "0.875rem",
      fontWeight: "600",
      cursor: "pointer",
      border: "none",
      transition: "all 0.3s",
      backgroundColor: isActive ? "#4f46e5" : "transparent",
      color: isActive ? "white" : "#6b7280",
      boxShadow: isActive ? "0 10px 15px -3px rgba(79, 70, 229, 0.2)" : "none",
    }),
    socialBtn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem",
      height: "3.5rem",
      borderRadius: "1rem",
      backgroundColor: "#111113",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      color: "white",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: "500",
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      document.cookie = "auth_token=true; path=/; max-age=" + 60 * 60 * 24 * 7;
      router.push("/dashboard"); 
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' ? "Incorrect email or password." : err.message);
    } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signup(signupName, signupEmail, signupPassword);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container} className="auth-container">
      
      {/* Left Side: Modern Branding Panel */}
      <div style={styles.leftPanel} className="auth-left hidden lg:flex">
        <div style={styles.glowIndigo} />
        <div style={styles.glowPurple} />

        <div style={{ 
          position: "relative", 
          zIndex: 10, 
          maxWidth: "32rem", 
          transition: "all 1s transform",
          transform: animate ? 'translateY(0)' : 'translateY(3rem)',
          opacity: animate ? 1 : 0 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
            <div style={styles.brandIcon}>
              <Sparkles className="text-white" size={26} />
            </div>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "-0.025em" }}>
              ColdMail<span style={{ color: "#818cf8" }}>AI</span>
            </span>
          </div>
          
          <h2 style={{ fontSize: "3rem", fontWeight: "800", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            Stop guessing, <br />
            <span style={{ background: "linear-gradient(to right, #818cf8, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              start converting.
            </span>
          </h2>
          
          <p style={{ color: "#9ca3af", fontSize: "1.125rem", marginBottom: "2.5rem", lineHeight: 1.6 }}>
            Generate highly personalized outreach at scale. Our AI analyzes your intent and crafts the perfect pitch in seconds.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {["Hyper-personalized scripts", "Smart sequences", "Tone analysis", "Verified deliverability"].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", backgroundColor: "rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={14} style={{ color: "#818cf8" }} />
                </div>
                <span style={{ color: "#d1d5db", fontWeight: "500" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }} className="auth-right">
        <div style={{ 
          width: "100%", 
          maxWidth: "28rem", 
          transition: "all 0.7s",
          transform: animate ? 'translateY(0)' : 'translateY(2rem)',
          opacity: animate ? 1 : 0 
        }} className="auth-card">
          
          <div style={{ marginBottom: "2.5rem", textAlign: "center" }} className="auth-header">
            <h3 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              {activeTab === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            <p style={{ color: "#6b7280" }}>
              {activeTab === "login" ? "Enter your details to manage your campaigns." : "Start your 14-day free trial today."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: "flex", padding: "0.25rem", backgroundColor: "#111113", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1.25rem", marginBottom: "2rem" }} className="auth-tabs">
            <button onClick={() => setActiveTab("login")} style={styles.tabButton(activeTab === "login")}>Log In</button>
            <button onClick={() => setActiveTab("signup")} style={styles.tabButton(activeTab === "signup")}>Register</button>
          </div>

          {error && (
            <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "0.75rem", color: "#f87171", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
               <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ef4444" }} /> {error}
            </div>
          )}

          <form onSubmit={activeTab === "login" ? handleLogin : handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} className="auth-form">
            {activeTab === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#9ca3af", marginLeft: "0.25rem" }}>Full Name</label>
                <div style={styles.inputWrapper}>
                  <User style={{ position: "absolute", left: "1.25rem", color: "#6b7280", zIndex: 10 }} size={18} />
                  <input type="text" required value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Alex Smith" style={styles.inputBase} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#9ca3af", marginLeft: "0.25rem" }}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail style={{ position: "absolute", left: "1.25rem", color: "#6b7280", zIndex: 10 }} size={18} />
                <input type="email" required value={activeTab === "login" ? loginEmail : signupEmail} onChange={(e) => activeTab === "login" ? setLoginEmail(e.target.value) : setSignupEmail(e.target.value)} placeholder="name@company.com" style={styles.inputBase} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#9ca3af" }}>Password</label>
                {activeTab === "login" && <button type="button" style={{ background: "none", border: "none", color: "#818cf8", fontSize: "0.75rem", cursor: "pointer" }}>Forgot?</button>}
              </div>
              <div style={styles.inputWrapper}>
                <Lock style={{ position: "absolute", left: "1.25rem", color: "#6b7280", zIndex: 10 }} size={18} />
                <input type={showPassword ? "text" : "password"} required value={activeTab === "login" ? loginPassword : signupPassword} onChange={(e) => activeTab === "login" ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)} placeholder="••••••••" style={styles.inputBase} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "1rem", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {activeTab === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#9ca3af", marginLeft: "0.25rem" }}>Confirm Password</label>
                <div style={styles.inputWrapper}>
                  <Lock style={{ position: "absolute", left: "1.25rem", color: "#6b7280", zIndex: 10 }} size={18} />
                  <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={styles.inputBase} />
                </div>
              </div>
            )}

            <button disabled={loading} type="submit" style={{ 
              width: "100%", height: "3.5rem", borderRadius: "1rem", 
              backgroundColor: "#4f46e5", color: "white", fontWeight: "bold", fontSize: "1.125rem", 
              border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", 
              alignItems: "center", justifyContent: "center", gap: "0.75rem", marginTop: "1rem",
              boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)", opacity: loading ? 0.6 : 1
            }}>
              {loading ? <div className="animate-spin" style={{ width: "1.5rem", height: "1.5rem", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%" }} /> : (
                <>
                  {activeTab === "login" ? "Sign In" : "Get Started"}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Social Auth */}
          <div style={{ marginTop: "2.5rem" }}>
            <div style={{ position: "relative", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", width: "100%", borderTop: "1px solid rgba(255,255,255,0.05)" }} />
              <span style={{ position: "relative", backgroundColor: "#030712", padding: "0 1rem", fontSize: "0.75rem", textTransform: "uppercase", color: "#4b5563", fontWeight: "bold" }}>Or continue with</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="auth-social-grid">
              <button onClick={() => loginWithGoogle()} style={styles.socialBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button onClick={() => loginWithGithub()} style={styles.socialBtn}>
                <Github size={20} /> GitHub
              </button>
            </div>
          </div>

          <p style={{ marginTop: "2.5rem", textAlign: "center", fontSize: "0.75rem", color: "#4b5563" }}>
            Secure connection encrypted via SSL. 
            <a href="#" style={{ color: "#6b7280", textDecoration: "underline", marginLeft: "0.25rem" }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
