"use client"

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Briefcase, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState, useRef, useEffect } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const initials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
    if (email) return (email[0] || 'U').toUpperCase()
    return 'U'
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-blue-600 text-white">
      <div className="container flex h-16 items-center justify-between">
        <Link href={session ? "/dashboard" : "/"} className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6" />
          <span className="font-bold text-xl">Career Guidance</span>
        </Link>

        <div className="flex items-center space-x-4">
          {session?.user ? (
            <div className="flex items-center space-x-3" ref={menuRef}>
              <ThemeToggle />

              <button
                onClick={() => setOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={open}
                className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-blue-700 focus:outline-none"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-blue-600 font-semibold">
                  {initials(session.user.name as any, session.user.email as any)}
                </div>
                <span className="hidden sm:inline text-sm">{session.user.name || session.user.email}</span>
              </button>

              {open && (
                <div className="absolute right-4 mt-12 w-60 bg-white text-gray-900 rounded shadow-lg py-2">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium truncate">{session.user.email}</p>
                    <p className="text-xs text-gray-500">{(session.user as any).role ?? 'User'}</p>
                  </div>
                  <Link href="/profile">
                    <a className="block px-4 py-2 hover:bg-gray-100">View Profile</a>
                  </Link>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => signOut({ callbackUrl: '/login' })}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/login">
                <Button size="sm">Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

