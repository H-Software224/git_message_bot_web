import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MessengerProvider } from "@/context/MessengerContext";
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
  title: "Git Messenger Bot",
  description: "Git 명령 실행과 GitHub 협업 알림을 메신저로 받는 Agent 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MessengerProvider>{children}</MessengerProvider>
      </body>
    </html>
  );
}
