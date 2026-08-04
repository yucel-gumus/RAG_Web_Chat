import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAG Döküman Sohbet Uygulaması",
  description: "Web sitelerinden döküman çekerek AI ile sohbet edin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <div className="flex-1">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
        <footer className="w-full py-3 text-center text-xs text-gray-500 border-t border-gray-200/20">
          <p>Geliştirici: <a href="https://www.yucelgumus.dev/" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-gray-700 transition-colors">Yücel Gümüş</a></p>
        </footer>
      </body>
    </html>
  );
}
