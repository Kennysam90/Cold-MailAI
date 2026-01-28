import Sidebar from "@/Component/sidebar";
import "./globals.css";
import { AuthProvider } from "@/Context/AuthContext";
import Providers from "@/Component/Providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <Providers>
          <AuthProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
