import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";
import MouseAura from "@/components/MouseAura";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rafael Tavares | Portfolio",
  description: "Développeur full stack passionné",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`overflow-y-scroll no-scrollbar bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-400 transition-colors duration-200 ${inter.className} max-w-screen-xl mx-auto`}
      >
        <MouseAura />
        <ThemeProvider attribute="data-theme" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
