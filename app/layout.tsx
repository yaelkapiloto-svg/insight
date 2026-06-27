import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
});

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
    <html lang="he" dir="rtl" className={`h-full ${heebo.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
