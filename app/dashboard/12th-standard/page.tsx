'use client'

// 12th Standard Students Page
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BookOpen, ClipboardCheck } from 'lucide-react'

export default function TwelfthStandardPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-gray-900 p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-6 hover:bg-surface-container-high"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-8 py-8 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="mx-auto mb-4 w-16 h-16 bg-primary-container rounded-[2rem] flex items-center justify-center relative z-10 shadow-[0_8px_16px_-6px_rgba(15,82,186,0.3)]">
            <BookOpen className="h-8 w-8 text-primary dark:text-green-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface font-headline dark:text-white mb-2 relative z-10">
            12th Standard Students
          </h1>
          <p className="text-on-surface-variant dark:text-gray-400 mb-6 relative z-10 font-medium">
            Find your path after completing 12th grade
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/dashboard/12th-standard/test')}
            className="bg-primary text-white hover:bg-primary-dim rounded-full shadow-md font-bold relative z-10"
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Take Career Assessment Test
          </Button>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8">
          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 w-full bg-surface-container-lowest rounded-[2rem] group">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-on-surface font-headline">Engineering</CardTitle>
              <CardDescription className="text-on-surface-variant/80 font-medium">B.Tech, B.E. in various specializations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Computer Science, Mechanical, Civil, Electrical, and more engineering branches.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 w-full bg-surface-container-lowest rounded-[2rem] group">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-on-surface font-headline">Medical Sciences</CardTitle>
              <CardDescription className="text-on-surface-variant/80 font-medium">MBBS, BDS, Pharmacy, Nursing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Pursue careers in medicine, dentistry, pharmacy, and healthcare.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 w-full bg-surface-container-lowest rounded-[2rem] group">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-on-surface font-headline">Commerce & Business</CardTitle>
              <CardDescription className="text-on-surface-variant/80 font-medium">B.Com, BBA, CA, CS, CMA</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Business administration, accounting, finance, and management programs.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 w-full bg-surface-container-lowest rounded-[2rem] group">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-on-surface font-headline">Arts & Humanities</CardTitle>
              <CardDescription className="text-on-surface-variant/80 font-medium">BA, BFA, Law, Journalism</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Literature, fine arts, law, journalism, psychology, and social sciences.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
