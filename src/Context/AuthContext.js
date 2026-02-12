"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id || session.user.email,
        email: session.user.email,
        name: session.user.name || session.user.email?.split("@")[0],
        avatar: session.user.image || session.user.email?.substring(0, 2).toUpperCase() || "US",
        provider: session.user.provider || "oauth",
        createdAt: new Date().toISOString(),
      });
    } else if (status !== "loading" && !session) {
      // Check for local auth fallback
      const savedUser = localStorage.getItem("authUser");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem("authUser");
        }
      } else {
        setUser(null);
      }
    }
  }, [session, status]);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          const userData = {
            id: Date.now(),
            email,
            name: email.split("@")[0],
            avatar: email.substring(0, 2).toUpperCase(),
            createdAt: new Date().toISOString(),
            provider: "email",
          };
          setUser(userData);
          localStorage.setItem("authUser", JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 800);
    });
  };

  const signup = (name, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password.length >= 6) {
          const userData = {
            id: Date.now(),
            email,
            name,
            avatar: name.substring(0, 2).toUpperCase(),
            createdAt: new Date().toISOString(),
            provider: "email",
          };
          setUser(userData);
          localStorage.setItem("authUser", JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error("Please fill all fields (password must be 6+ characters)"));
        }
      }, 800);
    });
  };

  const loginWithGoogle = () => {
    return signIn("google", { callbackUrl: "/" });
  };

  const loginWithGithub = () => {
    return signIn("github", { callbackUrl: "/" });
  };

  const logout = async () => {
    if (session) {
      // For OAuth users, sign out from NextAuth
      await signOut({ callbackUrl: "/auth" });
    } else {
      // For local users, clear localStorage
      setUser(null);
      localStorage.removeItem("authUser");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loginWithGoogle,
        loginWithGithub,
        loading: status === "loading",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
