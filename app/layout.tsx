import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PlannerProvider } from "../components/planner-provider";
import { SiteHeader, StorageNotice } from "../components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BUPath | Next-Semester Class Planner",
  description: "Find a balanced, prerequisite-aware next-semester course plan with BUPath.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PlannerProvider>
          <SiteHeader />
          {children}
          <StorageNotice />
        </PlannerProvider>
      </body>
    </html>
  );
}
