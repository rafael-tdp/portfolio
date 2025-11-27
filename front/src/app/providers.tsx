"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import MouseAura from "@/components/MouseAura";
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showAura = pathname === '/' || pathname === ''

  useEffect(() => {
    try {
      if (showAura) {
        document.body.dataset.page = 'home'
      } else {
        if (document.body.dataset.page === 'home') {
          delete document.body.dataset.page
        }
      }
    } catch {
      // noop in environments where document is not available
    }
  }, [showAura])

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark">
      <Toaster position="top-right" richColors closeButton />
      {showAura && <MouseAura />}
      {children}
    </ThemeProvider>
  )
}
