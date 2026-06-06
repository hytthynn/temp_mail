import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "./components.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "HytthynnMail | Сервис временной почты",
  description: "Быстрая и красивая временная почта без регистрации.",
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
