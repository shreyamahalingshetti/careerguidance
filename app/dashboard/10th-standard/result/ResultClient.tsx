'use client'

// 10th Standard Test Results Page
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, GraduationCap, CheckCircle2, BookOpen, Briefcase } from 'lucide-react'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { CollegeImages } from '@/components/10th/CollegeImages'

const streamInfo: {
  [key: string]: {
    title: string
    icon: any
    colorClasses: { bg: string; text: string; border: string; dot: string }
    careers: string[]
  }
} = {
  science: {
    title: 'Science Stream',
    icon: GraduationCap,
    colorClasses: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500',
      dot: 'bg-blue-500',
    },
    careers: [
      'Engineering (B.Tech/B.E.)',
      'Medical (MBBS, BDS)',
      'Pure Sciences (B.Sc.)',
      'Pharmacy (B.Pharm)',
      'Biotechnology',
      'Research & Development',
    ],
  },
  commerce: {
    title: 'Commerce Stream',
    icon: Briefcase,
    colorClasses: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500',
      dot: 'bg-green-500',
    },
    careers: [
      'Chartered Accountancy (CA)',
      'Business Administration (BBA/MBA)',
      'Commerce (B.Com)',
      'Company Secretary (CS)',
      'Cost & Management Accountant (CMA)',
      'Finance & Banking',
    ],
  },
  arts: {
    title: 'Arts/Humanities Stream',
    icon: BookOpen,
    colorClasses: {
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500',
      dot: 'bg-purple-500',
    },
    careers: [
      'Law (LLB)',
      'Journalism & Mass Communication',
      'Teaching (B.Ed)',
      'Psychology (B.A./B.Sc.)',
      'Social Work',
      'Fine Arts & Design',
    ],
  },
}

export default function TenthStandardResultClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawStream = searchParams?.get('stream') ?? 'science'
  const stream = rawStream.toLowerCase().includes('science')
    ? 'science'
    : rawStream.toLowerCase().includes('commerce')
    ? 'commerce'
    : rawStream.toLowerCase().includes('arts') || rawStream.toLowerCase().includes('humanities')
    ? 'arts'
    : 'science'
  const result = streamInfo[stream] || streamInfo.science
  const Icon = result.icon
  const [region, setRegion] = useState<string>('south')
  const [loadingSaved, setLoadingSaved] = useState<boolean>(true)
  const [savedError, setSavedError] = useState<string | null>(null)
  const [savedAssessment, setSavedAssessment] = useState<any | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoadingSaved(true)
      setSavedError(null)
      try {
        const res = await fetch('/api/assessments/latest?standard=10th-standard', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg = typeof json?.error === 'string' ? json.error : 'Failed to load saved marks'
          throw new Error(msg)
        }
        if (!cancelled) {
          setSavedAssessment(json?.assessment ?? null)
        }
      } catch (e: any) {
        if (!cancelled) setSavedError(e?.message || 'Failed to load saved marks')
      } finally {
        if (!cancelled) setLoadingSaved(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const savedSummary = useMemo(() => {
    const finalScore = savedAssessment?.finalScore
    if (!finalScore) return null

    const aptitudeScores = (savedAssessment?.aptitudeScores || []) as Array<any>
    const aptitudeCorrect = aptitudeScores.reduce((acc, s) => acc + (typeof s?.correctCount === 'number' ? s.correctCount : 0), 0)
    const aptitudeTotal = aptitudeScores.reduce((acc, s) => acc + (typeof s?.totalQuestions === 'number' ? s.totalQuestions : 0), 0)
    const aptitudePercent = aptitudeTotal > 0 ? Math.round((aptitudeCorrect / aptitudeTotal) * 100) : 0

    return {
      assessmentId: savedAssessment?.id as string,
      completedAt: savedAssessment?.completedAt as string | null,
      recommendedStream: finalScore?.recommendedStream as string,
      confidence: finalScore?.confidence as number,
      flexibility: finalScore?.flexibility as number,
      aptitudeScores,
      aptitudeCorrect,
      aptitudeTotal,
      aptitudePercent,
    }
  }, [savedAssessment])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => router.push('/dashboard/10th-standard')} className="mb-6">
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
        </div>

        <Card className={`mb-6 border-2 ${result.colorClasses.border}`}>
          <CardHeader className="text-center">
            <div
              className={`mx-auto mb-4 w-16 h-16 ${result.colorClasses.bg} rounded-full flex items-center justify-center`}
            >
              <Icon className={`h-8 w-8 ${result.colorClasses.text}`} />
            </div>
            <CardTitle className="text-2xl sm:text-3xl">{result.title}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Saved Marks (from Database)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSaved ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">Loading saved marks…</div>
            ) : savedError ? (
              <div className="text-sm text-red-600">{savedError}</div>
            ) : savedSummary ? (
              <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
                <div><span className="font-semibold">Assessment ID:</span> {savedSummary.assessmentId}</div>
                <div><span className="font-semibold">Recommended Stream:</span> {savedSummary.recommendedStream}</div>
                <div><span className="font-semibold">Confidence:</span> {savedSummary.confidence}%</div>
                <div><span className="font-semibold">Flexibility:</span> {savedSummary.flexibility}%</div>
                {savedSummary.aptitudeTotal > 0 ? (
                  <div>
                    <span className="font-semibold">Marks (Aptitude):</span> {savedSummary.aptitudeCorrect}/{savedSummary.aptitudeTotal} ({savedSummary.aptitudePercent}%)
                  </div>
                ) : null}
                {Array.isArray(savedSummary.aptitudeScores) && savedSummary.aptitudeScores.length > 0 ? (
                  <div className="pt-2">
                    <div className="font-semibold mb-1">Aptitude (%)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {savedSummary.aptitudeScores.map((s: any) => (
                        <div key={s.id} className="rounded-md border bg-gray-50 dark:bg-gray-800 p-3">
                          <div className="font-semibold">{s.section}</div>
                          <div>{s.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                No saved marks found yet. Take the test once to create rows.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-4 mx-auto max-w-sm flex items-center justify-center gap-3">
          <div className="font-semibold text-gray-800 dark:text-gray-200">Filter</div>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="north">North Karnataka</SelectItem>
              <SelectItem value="south">South Karnataka</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <CollegeImages stream={stream} region={region} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Career Options in {result.title}</CardTitle>
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

        <div className="mt-6 flex justify-center">
          <Button onClick={() => router.push('/dashboard/10th-standard/test')} variant="outline" size="lg">
            Retake Test
          </Button>
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={() => router.push('/my-dashboard')} size="lg">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
