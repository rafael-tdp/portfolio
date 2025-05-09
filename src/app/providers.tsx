"use client";

import { ThemeProvider } from "next-themes";
import MouseAura from "@/components/MouseAura";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark">

      <MouseAura />
      {children}
    </ThemeProvider>
  );
}
