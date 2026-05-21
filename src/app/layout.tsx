import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist, Geist_Mono } from "next/font/google";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

import { FMProvider } from "@/lib/fm/GameContext";
import { ToastProvider } from "@/lib/fm/ToastContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siyah Beyaz FM | Pro Manager",
  description: "Professional Football Manager - Dark Theme Edition",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
      >
        <FMProvider>
          <ToastProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ToastProvider>
        </FMProvider>
        <Toaster />
      </body>
    </html>
  );
}
