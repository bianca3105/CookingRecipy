import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

export const metadata: Metadata = {
  title: "Nuestras Recetas",
  description: "Recetas y menú semanal para organizar la cocina en casa.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-bg text-text antialiased">
        <div className="pb-24">{children}</div>
        <BottomTabBar />
      </body>
    </html>
  );
}
