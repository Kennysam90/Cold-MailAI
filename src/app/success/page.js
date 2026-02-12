"use client";

import React, { useEffect } from "react";

export default function Success() {
  useEffect(() => {
    const syncPremium = async () => {
      try {
        const res = await fetch("/api/billing/status");
        const data = await res.json();
        if (data?.success) {
          localStorage.setItem("premium", data.data.isPremium ? "true" : "false");
        } else {
          localStorage.setItem("premium", "true");
        }
      } catch {
        localStorage.setItem("premium", "true");
      }
    };
    syncPremium();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-300 mb-4">
          Premium features unlocked. Go back to the app and refresh to access all emails.
        </p>
        <a href="/" className="text-indigo-500 hover:underline">Go back</a>
      </div>
    </div>
  );
}
