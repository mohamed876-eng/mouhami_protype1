// Layout racine — appliqué à toutes les pages
// Configure la langue, le RTL, et les métadonnées

import type { Metadata } from "next";
import "./globals.css";
import LoginTransitionAnimation from "@/components/ui/LoginTransitionAnimation";

export const metadata: Metadata = {
  title: "المكتب القانوني — ERP محاماة",
  description: "نظام متكامل لإدارة مكاتب المحاماة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preload" as="image" href="/images/background.jpg" />
        <link rel="preload" as="image" href="/images/bgpages.png" />
      </head>
      <body>
        {children}
        <LoginTransitionAnimation />
      </body>
    </html>
  );
}