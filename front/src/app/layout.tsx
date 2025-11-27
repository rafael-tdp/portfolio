import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
        className={`overflow-y-scroll no-scrollbar transition-colors duration-200 ${inter.className} mx-auto`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
