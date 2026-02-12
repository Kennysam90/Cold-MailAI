import "./globals.css";
import { AuthProvider } from "@/Context/AuthContext";
import Providers from "@/Component/Providers";
import AppShell from "./AppShell";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <Providers>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
