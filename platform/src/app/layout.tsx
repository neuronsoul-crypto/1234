import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ЛицоЛицензия — платформа лицензирования внешности для ИИ-контента",
  description: "Маркетплейс легального лицензирования лица для ИИ-генерации рекламы, игр и микросериалов. РФ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
