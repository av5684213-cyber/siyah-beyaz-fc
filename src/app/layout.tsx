import type { Metadata, Viewport } from "next";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FMProvider } from "@/lib/fm/GameContext";
import { MatchProvider } from "@/lib/fm/MatchContext";
import { ToastProvider } from "@/lib/fm/ToastContext";
import LayoutMobileNav from "@/components/LayoutMobileNav";
import TeamThemeProvider from "@/components/TeamThemeProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Touchline Manager | Pro Manager",
  description: "Online futbol menajerlik oyunu. Kadronuzu yönetin, taktik kurun, şampiyonluğa ulaşın.",
  keywords: ["futbol manager", "football manager", "online", "türkçe"],
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico", apple: "/icon-192.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TLM",
  },
  openGraph: {
    title: "Touchline Manager",
    description: "Online futbol menajerlik oyunu",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning data-theme="dark">
      {/*
        Fontlar globals.css @import ile Google Fonts CDN'den yüklenir.
        next/font/google build-time fetch yapıyor ve CI/CD ortamında
        ağ kısıtlaması varsa başarısız olabiliyor. CDN yöntemi daha güvenli.
      */}
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
        <TeamThemeProvider />
        <AuthProvider>
        <LanguageProvider>
        <FMProvider>
          <MatchProvider>
            <ToastProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </ToastProvider>
          </MatchProvider>
        </FMProvider>
        </LanguageProvider>
        </AuthProvider>
        <LayoutMobileNav />
        <Toaster />
      </body>
    </html>
  );
}
