import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "./components.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "AuraMail | Сервис временной почты",
  description: "Безопасная, быстрая и красивая временная почта без регистрации. Защитите свой основной ящик от спама.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={outfit.variable}>
      <body>{children}</body>
    </html>
  );
}
