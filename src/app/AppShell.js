"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/Component/sidebar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="main-content flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
