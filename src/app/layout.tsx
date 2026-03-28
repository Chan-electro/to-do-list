import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { PWARegister } from "@/components/pwa-register";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Nexus Command Center",
  description: "The Ultimate Self-Hosted Productivity Operating System",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#00D4FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <TRPCProvider>
          <PWARegister />
          {children}
          <CommandPalette />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0F1D30",
                border: "1px solid rgba(75, 142, 255, 0.15)",
                color: "#F1F5F9",
              },
            }}
          />
        </TRPCProvider>
      </body>
    </html>
  );
}
