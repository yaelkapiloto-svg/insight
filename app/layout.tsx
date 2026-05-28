import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAPILOTO | דוחות סושיאל",
  description: "מערכת דוחות סושיאל מדיה של סוכנות קפילוטו",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
