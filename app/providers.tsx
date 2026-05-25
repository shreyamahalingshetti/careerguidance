"use client"

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
