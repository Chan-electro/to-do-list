import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { CommandPalette } from "@/components/command-palette/command-palette";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Nexus Command Center",
  description: "The Ultimate Self-Hosted Productivity Operating System",
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
          {children}
          <CommandPalette />
        </TRPCProvider>
      </body>
    </html>
  );
}
