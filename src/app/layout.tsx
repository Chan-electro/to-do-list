import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { AuthProvider } from "@/components/layout/auth-provider";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { PWARegister } from "@/components/pwa-register";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Nexus Command Center",
  description: "The Ultimate Self-Hosted Productivity Operating System",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <TRPCProvider>
          <AuthProvider>
          <PWARegister />
          {children}
          <CommandPalette />
          <Toaster
            theme="light"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#ffffff",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                color: "#0F172A",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              },
            }}
          />
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
