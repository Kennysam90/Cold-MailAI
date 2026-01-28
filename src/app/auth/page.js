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
    if (user) router.push("/");
  }, [user, router]);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      router.push("/");
    } catch (err) {
      setError(err.message);
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

  const passwordStrength = getPasswordStrength(signupPassword);
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

  return (
    <div className="min-h-screen bg-[#030712] flex text-gray-100 selection:bg-indigo-500/30">
      
      {/* Left Side: Modern Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#09090b] border-r border-white/5 relative items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        </div>

        <div className={`relative z-10 max-w-lg transition-all duration-1000 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40">
              <Sparkles className="text-white" size={26} />
            </div>
            <span className="text-2xl font-bold tracking-tight">ColdMail<span className="text-indigo-400">AI</span></span>
          </div>
          
          <h2 className="text-5xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Stop guessing, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              start converting.
            </span>
          </h2>
          
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Generate highly personalized outreach at scale. Our AI analyzes your intent and crafts the perfect pitch in seconds.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {[
              "Hyper-personalized email scripts",
              "Smart sequence automation",
              "Tone and sentiment analysis",
              "Verified deliverability insights"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl  backdrop-blur-sm">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Check size={14} className="text-indigo-400" />
                </div>
                <span className="text-gray-300 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className={`w-full max-w-md transition-all duration-700 delay-200 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          
          {/* Header */}
          <div className="mb-10 text-center lg:text-left" style={{marginBottom:"1em", textAlign:"center"}}>
            <h3 className="text-3xl font-bold mb-2">
              {activeTab === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="text-gray-500">
              {activeTab === "login" ? "Enter your details to manage your campaigns." : "Start your 14-day free trial today."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-[#111113] border border-white/5 rounded-2xl mb-8" >
            <button
              onClick={() => { setActiveTab("login"); setError(""); }}
              className={`flex-1   rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === "login" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-gray-500 hover:text-gray-300"}`}
              style={{paddingTop:"0.5em", paddingBottom:"0.5em"}}
            >
              Log In
            </button>
            <button
              onClick={() => { setActiveTab("signup"); setError(""); }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === "signup" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-gray-500 hover:text-gray-300"}`}
              style={{paddingTop:"0.5em", paddingBottom:"0.5em"}}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> {error}
            </div>
          )}

          <form onSubmit={activeTab === "login" ? handleLogin : handleSignup} className="space-y-5" style={{marginTop:"1em"}}>
            {activeTab === "signup" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={18} />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    className="w-full h-14 pl-14 pr-4 rounded-2xl bg-[#09090b] border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              
              <div className="relative">
                 <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                {/* The Mail Icon */}
                <Mail 
                  size={18} 
                  style={{
                    position: "absolute",
                    left: "1rem", // matches left-4
                    color: "#6b7280",
                    pointerEvents: "none",
                    zIndex: 10
                  }} 
                />

                {/* The Email Input */}
                <input
                  type="email"
                  required
                  value={activeTab === "login" ? loginEmail : signupEmail}
                  onChange={(e) => activeTab === "login" ? setLoginEmail(e.target.value) : setSignupEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{
                    width: "100%",
                    height: "3.5rem",
                    paddingLeft: "3rem", // adjusted to clear the icon
                    paddingRight: "1rem",
                    borderRadius: "1rem",
                    backgroundColor: "#09090b",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "white",
                    outline: "none",
                    transition: "all 0.2s ease-in-out",
                  }}
                  // Keeping Tailwind for the interactive states (focus/placeholder)
                  className="focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-500"
                />
              </div>
              </div>
            </div>

            <div className="space-y-2">
              
              <div className="relative" style={{marginTop:"1em"}}>
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-gray-400">Password</label>
                  {activeTab === "login" && <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot?</button>}
                </div>
                <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
              {/* The Icon */}
              <Lock 
                size={18} 
                style={{
                  position: "absolute",
                  left: "1.5rem", // matches your left-6
                  color: "#6b7280",
                  pointerEvents: "none",
                  zIndex: 10
                }} 
              />

              {/* The Input */}
              <input
                type={showPassword ? "text" : "password"}
                required
                value={activeTab === "login" ? loginPassword : signupPassword}
                onChange={(e) => activeTab === "login" ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                    width: "100%",
                    height: "3.5rem",
                    paddingLeft: "3rem", // adjusted to clear the icon
                    paddingRight: "1rem",
                    borderRadius: "1rem",
                    backgroundColor: "#09090b",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "white",
                    outline: "none",
                    transition: "all 0.2s ease-in-out",
                  }}
                // Note: Inline styles don't support pseudo-classes like :focus or ::placeholder easily.
                // I recommend keeping your Tailwind classes for the focus ring if possible!
                className="focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-2/3 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {activeTab === "signup" && signupPassword && (
                <div className="pt-2 px-1">
                  <div className="flex gap-1.5 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${i <= passwordStrength ? strengthColors[passwordStrength - 1] : "bg-white/5"}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {activeTab === "signup" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 pl-14 pr-4 rounded-2xl bg-[#09090b] border border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
              style={{marginTop:"1em"}}
            >
              {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                <>
                  {activeTab === "login" ? "Sign In" : "Get Started"}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Footer Social */}
          <div className="mt-10">
            <div className="relative mb-8" style={{marginTop:"1em"}}>
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-tighter"><span className="bg-[#030712] px-4 text-gray-600 font-bold">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4" style={{marginTop:"1em"}}>
              <button
                onClick={() => loginWithGoogle()}
                className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-[#111113] border border-white/5 hover:bg-[#1d1d21] transition-all font-medium text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                onClick={() => loginWithGithub()}
                className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-[#111113] border border-white/5 hover:bg-[#1d1d21] transition-all font-medium text-sm"
              >
                <Github size={20} />
                GitHub
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-gray-600" style={{marginTop:"1em"}}>
            Secure connection encrypted via SSL. <br className="sm:hidden" /> 
            <a href="#" className="underline ml-1">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}