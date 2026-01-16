import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/src/components/providers/session-provider";
import { Header } from "@/src/components/custom/header";
import { BreadcrumbView } from "@/src/components/custom/breadcrumb-view";
import { TopBar } from "@/src/components/custom/top-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forked.io",
  description: "PublishOS is a platform for building and publishing websites.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <AuthSessionProvider>
          {/* App Shell */}
          <div className="flex flex-col h-screen bg-[#FDFFFC]">
            {/* Top Bar */}
            <TopBar />
            {/* Header takes natural height */}
            <Header />

            {/* Content fills remaining space */}
            <main className="flex-1 overflow-hidden p-3">
              <BreadcrumbView />
              {children}
            </main>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
