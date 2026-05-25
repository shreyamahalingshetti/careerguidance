'use client'

// Dashboard Page - Career Guidance App (Fully Responsive)
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, BookOpen, Code, User, Tag, Shield, Settings, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!profileRef.current) return
      if (!profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      router.push('/admin')
    }
  }, [session, router])

  const initials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    if (email) return (email[0] || 'U').toUpperCase()
    return 'U'
  }

  const handleCardClick = (group: string) => {
    // Navigate to group page
    router.push(`/dashboard/${group}`)
  }

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Top-right profile */}
        {session?.user ? (
          <div className="flex justify-end mb-2" ref={profileRef}>
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={profileOpen}
                className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-container-high dark:hover:bg-white/10"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white font-semibold shadow-md">
                  {initials(session.user.name as any, session.user.email as any)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-on-surface dark:text-white truncate max-w-[220px]">
                    {session.user.name || session.user.email}
                  </div>
                  <div className="text-xs text-on-surface-variant dark:text-gray-300 truncate max-w-[220px]">
                    {session.user.email}
                  </div>
                </div>
              </button>

              {profileOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-outline-variant/30 bg-surface-container-lowest dark:bg-gray-900 shadow-xl overflow-hidden z-50">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest dark:hover:bg-gray-800"
                    onClick={() => {
                      setProfileOpen(false)
                      router.push('/profile')
                    }}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Tag className="h-4 w-4" />
                    Tags
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Shield className="h-4 w-4" />
                    Privacy
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 dark:hover:bg-gray-800"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center px-2 py-8 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-3xl mix-blend-multiply"></div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-on-surface font-headline dark:text-white mb-2 sm:mb-3 tracking-tight relative z-10">
            Career Guidance Dashboard
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-on-surface-variant dark:text-gray-400 px-2 mb-4 relative z-10">
            Choose your educational level to explore career options
          </p>
          <Button
            onClick={() => router.push('/dashboard/my-dashboard')}
            className="mb-4 bg-primary text-white hover:bg-primary-dim rounded-full shadow-md font-bold px-8 relative z-10"
            size="lg"
          >
            View My Dashboard
          </Button>
          {session?.user?.role === 'ADMIN' && (
            <Button
              onClick={() => router.push('/admin')}
              variant="outline"
              className="mb-4 ml-3 rounded-full shadow-sm font-bold px-8 relative z-10 border-primary text-primary hover:bg-primary/10"
              size="lg"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          )}
        </div>

        {/* Cards Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-6xl mx-auto">
          {/* 10th Standard Card */}
          <Card 
            className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 hover:border-primary/50 w-full bg-surface-container-lowest rounded-[2rem] overflow-hidden group"
            onClick={() => handleCardClick('10th-standard')}
          >
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-[80px] -z-10 group-hover:bg-primary/20 transition-colors"></div>
              <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-primary-container rounded-2xl flex items-center justify-center shadow-sm">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-on-surface font-headline">10th Standard Students</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2 text-on-surface-variant font-medium">
                Explore career options after completing 10th grade
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6 pb-4 sm:pb-6">
              <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
                Discover various streams and career paths available after 10th standard
              </p>
            </CardContent>
          </Card>

          {/* 12th Standard Card */}
          <Card 
            className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 hover:border-tertiary-dim/50 w-full bg-surface-container-lowest rounded-[2rem] overflow-hidden group"
            onClick={() => handleCardClick('12th-standard')}
          >
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-dim/10 rounded-bl-[80px] -z-10 group-hover:bg-tertiary-dim/20 transition-colors"></div>
              <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-tertiary-container rounded-2xl flex items-center justify-center shadow-sm">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-tertiary-dim" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-on-surface font-headline">12th Standard Students</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2 text-on-surface-variant font-medium">
                Find your path after completing 12th grade
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6 pb-4 sm:pb-6">
              <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
                Explore degree programs, courses, and career opportunities
              </p>
            </CardContent>
          </Card>

          {/* Technical Group Card */}
          <Card 
            className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 hover:border-secondary-dim/50 w-full sm:col-span-2 lg:col-span-1 bg-surface-container-lowest rounded-[2rem] overflow-hidden group"
            onClick={() => handleCardClick('technical-group')}
          >
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 relative">
               <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-dim/10 rounded-bl-[80px] -z-10 group-hover:bg-secondary-dim/20 transition-colors"></div>
              <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-secondary-container rounded-2xl flex items-center justify-center shadow-sm">
                <Code className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-dim" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-on-surface font-headline">Technical Group</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2 text-on-surface-variant font-medium">
                Career guidance for technical and engineering fields
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6 pb-4 sm:pb-6">
              <p className="text-xs sm:text-sm text-on-surface-variant/80 leading-relaxed">
                Explore engineering, technology, and technical career paths
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
