'use client'

// 12th Standard Test Results Page
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2, Code, Stethoscope, Briefcase, BookOpen } from 'lucide-react'

const fieldInfo: {
  [key: string]: {
    title: string
    description: string
    icon: any
    colorClasses: { bg: string; text: string; border: string; dot: string }
    careers: string[]
    courses: string[]
  }
} = {
  engineering: {
    title: 'Engineering & Technology',
    description: 'Based on your answers, Engineering field is the best fit for you!',
    icon: Code,
    colorClasses: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-900 dark:text-blue-300',
      border: 'border-blue-800',
      dot: 'bg-blue-800',
    },
    careers: [
      'Software Engineer',
      'Mechanical Engineer',
      'Civil Engineer',
      'Electrical Engineer',
      'Data Engineer',
      'Aerospace Engineer',
    ],
    courses: [
      'B.Tech in Computer Science',
      'B.Tech in Mechanical Engineering',
      'B.Tech in Civil Engineering',
      'B.Tech in Electrical Engineering',
      'B.Tech in Electronics & Communication',
    ],
  },
  medical: {
    title: 'Medical & Healthcare',
    description: 'Based on your answers, Medical field is the best fit for you!',
    icon: Stethoscope,
    colorClasses: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-900 dark:text-blue-300',
      border: 'border-blue-800',
      dot: 'bg-blue-800',
    },
    careers: [
      'Doctor (MBBS)',
      'Dentist (BDS)',
      'Pharmacist',
      'Nurse',
      'Physiotherapist',
      'Medical Researcher',
    ],
    courses: [
      'MBBS (Bachelor of Medicine)',
      'BDS (Bachelor of Dental Surgery)',
      'B.Pharm (Pharmacy)',
      'B.Sc Nursing',
      'BPT (Physiotherapy)',
    ],
  },
  business: {
    title: 'Business & Management',
    description: 'Based on your answers, Business field is the best fit for you!',
    icon: Briefcase,
    colorClasses: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500',
      dot: 'bg-green-500',
    },
    careers: [
      'Business Analyst',
      'Financial Advisor',
      'Marketing Manager',
      'Entrepreneur',
      'Investment Banker',
      'Management Consultant',
    ],
    courses: [
      'BBA (Bachelor of Business Administration)',
      'B.Com (Commerce)',
      'CA (Chartered Accountancy)',
      'BBA + MBA Integrated',
      'B.Com (Hons)',
    ],
  },
  arts: {
    title: 'Arts, Law & Social Sciences',
    description: 'Based on your answers, Arts/Humanities field is the best fit for you!',
    icon: BookOpen,
    colorClasses: {
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500',
      dot: 'bg-purple-500',
    },
    careers: ['Lawyer', 'Journalist', 'Teacher/Professor', 'Psychologist', 'Social Worker', 'Writer/Author'],
    courses: ['LLB (Law)', 'BA (Bachelor of Arts)', 'B.Ed (Education)', 'BA in Journalism', 'BA in Psychology'],
  },
}

export default function TwelfthStandardResultClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const field = searchParams?.get('field') ?? 'engineering'
  const result = fieldInfo[field] || fieldInfo.engineering
  const Icon = result.icon
  const [saved, setSaved] = useState<any | null>(null)
  const [savedError, setSavedError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const res = await fetch('/api/assessments/latest?standard=12th-standard')
        if (!res.ok) {
          const txt = await res.text().catch(() => '')
          throw new Error(txt || 'Failed to load saved marks')
        }
        const json = await res.json()
        if (cancelled) return
        setSaved(json?.assessment ?? null)
      } catch (e: any) {
        if (cancelled) return
        setSavedError(e?.message || 'Failed to load saved marks')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => router.push('/dashboard/12th-standard')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div
            className={`mx-auto mb-4 w-20 h-20 ${result.colorClasses.bg} rounded-full flex items-center justify-center`}
          >
            <CheckCircle2 className={`h-10 w-10 ${result.colorClasses.text}`} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Your Career Assessment Result
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{result.description}</p>
        </div>

        <Card className={`mb-6 border-2 ${result.colorClasses.border}`}>
          <CardHeader className="text-center">
            <div
              className={`mx-auto mb-4 w-16 h-16 ${result.colorClasses.bg} rounded-full flex items-center justify-center`}
            >
              <Icon className={`h-8 w-8 ${result.colorClasses.text}`} />
            </div>
            <CardTitle className="text-2xl sm:text-3xl">{result.title}</CardTitle>
            <CardDescription className="text-base mt-2">Recommended field based on your interests and preferences</CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Saved Marks (from Database)</CardTitle>
            <CardDescription>Latest saved 12th assessment for your account</CardDescription>
          </CardHeader>
          <CardContent>
            {savedError ? (
              <p className="text-sm text-red-600">{savedError}</p>
            ) : !saved ? (
              <p className="text-sm text-gray-600">Loading…</p>
            ) : (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div><span className="font-semibold">Assessment ID:</span> {saved.id}</div>
                {saved.finalScore?.recommendedStream && (
                  <div><span className="font-semibold">Top Recommendation:</span> {saved.finalScore.recommendedStream}</div>
                )}
                {typeof saved.finalScore?.confidence === 'number' && (
                  <div><span className="font-semibold">Confidence:</span> {saved.finalScore.confidence}%</div>
                )}
                {typeof saved.finalScore?.flexibility === 'number' && (
                  <div><span className="font-semibold">Flexibility:</span> {saved.finalScore.flexibility}%</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Career Options</CardTitle>
            <CardDescription>Potential career paths in {result.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.careers.map((career, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${result.colorClasses.dot}`} />
                    <p className="font-medium text-gray-900 dark:text-white">{career}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Recommended Courses</CardTitle>
            <CardDescription>Degree programs to pursue in {result.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.courses.map((course, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${result.colorClasses.dot}`} />
                    <p className="font-medium text-gray-900 dark:text-white">{course}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => router.push('/dashboard/12th-standard/test')} variant="outline" size="lg">
            Retake Test
          </Button>
          <Button onClick={() => router.push('/my-dashboard')} size="lg" className="bg-green-600 hover:bg-green-700">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
