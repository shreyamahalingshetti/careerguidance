"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  if (status === 'loading' || status === 'authenticated') {
    return <div className="min-h-screen flex items-center justify-center bg-surface-container-low"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background text-on-surface overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: ".organic-shape { border-radius: 60% 40% 70% 30% / 40% 50% 60% 40%; }"}} />
      
      {/* Left Section: Hero */}
      <section className="hidden md:flex md:w-3/5 lg:w-2/3 bg-surface-container-low relative items-center justify-center p-12 overflow-hidden">
        {/* Decorative Organic Shapes */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary-container/20 organic-shape blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[5%] w-[350px] h-[350px] bg-secondary-container/30 organic-shape blur-3xl"></div>
        
        <div className="z-10 text-center space-y-12 max-w-2xl block mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-3xl" data-icon="school">school</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">Career Guidance application</span>
          </div>
          
          <div className="relative">
            {/* Hero Image / Illustration */}
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl bg-white/40 backdrop-blur-sm p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                alt="Professional growth illustration" 
                className="w-full h-full object-cover rounded-lg" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB35hbgu6HipWV-pYMm3EqU856vkjI1tSJvjjetGHrVy0eD4-is6yFuGXRQea8AW5ncV0mQO_4rYoz6D2t8kNFSamxIUmzBTFnrUlQfoYmgodjIbhDP7FWgm6G3FTyCmLSqSQSO_zcYfw_MFJkape7EFRCjiLtWYQ2f9_qo1b6r0IshtsikCfsYe3twQBKygRBetftqPYj-AKQoVTYbV5JZNhmPO6fZI0_nQj02RtPXdLwGFuciLPHBtfFUticiIpEdORdC4LAqfsoY"
              />
            </div>
          </div>

          <div className="space-y-4 pt-12">
            <h1 className="text-5xl font-extrabold text-on-surface leading-[1.1] tracking-tight">
              Navigate your <span className="text-primary italic">future</span> with confidence.
            </h1>
          </div>
        </div>
      </section>

      {/* Right Section: Login Card */}
      <section className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Mobile Brand Logo */}
        <div className="md:hidden flex items-center gap-2 mb-12">
          <span className="material-symbols-outlined text-primary text-3xl" data-icon="school">school</span>
          <span className="text-xl font-extrabold text-on-surface font-headline">Career Guidance application</span>
        </div>
        
        <div className="w-full max-w-md mt-[-100px] md:mt-0">
          <div className="bg-surface-container-lowest rounded-xl p-10 md:p-12 shadow-[0_40px_40px_-15px_rgba(55,50,34,0.06)] border border-outline-variant/15">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-on-surface mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-on-surface-variant leading-relaxed">Continue your professional journey or explore new horizons.</p>
            </div>
            
            <div className="space-y-6">
              {/* Sign in with Google Button */}
              <button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full group relative flex items-center justify-center gap-3 px-6 py-4 bg-surface-container-highest text-on-surface font-semibold rounded-full transition-all duration-200 hover:bg-surface-container-high active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                )}
                {isLoading ? 'Connecting...' : 'Sign in using your Google account'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
