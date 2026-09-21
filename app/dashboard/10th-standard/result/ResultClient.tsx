'use client'

// 10th Standard Test Results Page
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, GraduationCap, CheckCircle2, BookOpen, Briefcase } from 'lucide-react'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { CollegeImages } from '@/components/10th/CollegeImages'
import { generateAptitudeFeedback } from '@/lib/aptitude-feedback-10th'

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

    const scienceFit = typeof finalScore?.scienceFit === 'number' ? parseFloat(finalScore.scienceFit.toFixed(1)) : 0
    const commerceFit = typeof finalScore?.commerceFit === 'number' ? parseFloat(finalScore.commerceFit.toFixed(1)) : 0
    const artsFit = typeof finalScore?.artsFit === 'number' ? parseFloat(finalScore.artsFit.toFixed(1)) : 0

    const streamList = [
      { name: 'Science', score: scienceFit, key: 'science' },
      { name: 'Commerce', score: commerceFit, key: 'commerce' },
      { name: 'Arts/Humanities', score: artsFit, key: 'arts' },
    ].sort((a, b) => b.score - a.score)

    const topStream = streamList[0]
    const alternativeStream = streamList[1]
    const scoreDiff = parseFloat((topStream.score - alternativeStream.score).toFixed(1))
    const isCloseMatch = scoreDiff <= 5.0

    const getBand = (score: number) => {
      if (score >= 75.0) return { label: 'Strong Alignment', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
      if (score >= 50.0) return { label: 'Moderate Alignment', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
      return { label: 'Low Alignment', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' }
    }

    const aptitudeScores = (savedAssessment?.aptitudeScores || []) as Array<any>
    const aptitudeCorrect = aptitudeScores.reduce((acc, s) => acc + (typeof s?.correctCount === 'number' ? s.correctCount : 0), 0)
    const aptitudeTotal = aptitudeScores.reduce((acc, s) => acc + (typeof s?.totalQuestions === 'number' ? s.totalQuestions : 0), 0)
    const aptitudePercent = aptitudeTotal > 0 ? Math.round((aptitudeCorrect / aptitudeTotal) * 100) : 0

    return {
      assessmentId: savedAssessment?.id as string,
      completedAt: savedAssessment?.completedAt as string | null,
      recommendedStream: finalScore?.recommendedStream || topStream.name,
      alternativeStream: alternativeStream.name,
      scienceFit,
      commerceFit,
      artsFit,
      scienceBand: getBand(scienceFit),
      commerceBand: getBand(commerceFit),
      artsBand: getBand(artsFit),
      isCloseMatch,
      scoreDiff,
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
            Your Stream Suitability Result
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Based on RIASEC Vocational Interest Alignment
          </p>
        </div>

        <Card className={`mb-6 border-2 ${result.colorClasses.border}`}>
          <CardHeader className="text-center">
            <div
              className={`mx-auto mb-4 w-16 h-16 ${result.colorClasses.bg} rounded-full flex items-center justify-center`}
            >
              <Icon className={`h-8 w-8 ${result.colorClasses.text}`} />
            </div>
            <CardTitle className="text-2xl sm:text-3xl">{result.title}</CardTitle>
            {savedSummary ? (
              <div className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Top Alternative Stream: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{savedSummary.alternativeStream}</span>
              </div>
            ) : null}
          </CardHeader>
        </Card>

        {savedSummary?.isCloseMatch ? (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-sm">
            <div className="font-bold flex items-center gap-2 mb-1">
              <span>⚡ Close Match / Strong Overlap</span>
            </div>
            <div>
              Your top two streams ({savedSummary.recommendedStream} and {savedSummary.alternativeStream}) differ by only {savedSummary.scoreDiff} percentage points. You demonstrate balanced potential across both fields!
            </div>
          </div>
        ) : null}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Stream Suitability Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSaved ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">Loading stream fit scores…</div>
            ) : savedError ? (
              <div className="text-sm text-red-600">{savedError}</div>
            ) : savedSummary ? (
              <div className="space-y-4 text-sm text-gray-800 dark:text-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/40 p-4 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-base text-blue-900 dark:text-blue-200">Science Stream</div>
                      <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">{savedSummary.scienceFit}%</div>
                    </div>
                    <span className={`mt-3 inline-block px-2.5 py-1 text-xs font-semibold rounded-full w-fit ${savedSummary.scienceBand.color}`}>
                      {savedSummary.scienceBand.label}
                    </span>
                  </div>

                  <div className="rounded-lg border bg-green-50 dark:bg-green-950/40 p-4 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-base text-green-900 dark:text-green-200">Commerce Stream</div>
                      <div className="text-2xl font-extrabold text-green-700 dark:text-green-400 mt-1">{savedSummary.commerceFit}%</div>
                    </div>
                    <span className={`mt-3 inline-block px-2.5 py-1 text-xs font-semibold rounded-full w-fit ${savedSummary.commerceBand.color}`}>
                      {savedSummary.commerceBand.label}
                    </span>
                  </div>

                  <div className="rounded-lg border bg-purple-50 dark:bg-purple-950/40 p-4 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-base text-purple-900 dark:text-purple-200">Arts/Humanities</div>
                      <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 mt-1">{savedSummary.artsFit}%</div>
                    </div>
                    <span className={`mt-3 inline-block px-2.5 py-1 text-xs font-semibold rounded-full w-fit ${savedSummary.artsBand.color}`}>
                      {savedSummary.artsBand.label}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  ℹ️ <strong>Understanding Stream Scores</strong>: Stream suitability scores reflect normalized vocational interest similarity (0–100% vector fit) against 24 O*NET Career Family centroids. They represent interest alignment for educational exploration and are not academic marks or probability of success.
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                No saved assessment found yet. Take the test once to see your stream suitability.
              </div>
            )}
          </CardContent>
        </Card>

        {savedSummary && Array.isArray(savedSummary.aptitudeScores) && savedSummary.aptitudeScores.length > 0 ? (() => {
          const aptBreakdown: Record<string, number> = {}
          savedSummary.aptitudeScores.forEach((s: any) => {
            if (s?.section && typeof s?.percentage === 'number') {
              aptBreakdown[s.section] = s.percentage
            }
          })

          const aptFeedback = generateAptitudeFeedback(aptBreakdown, savedSummary.recommendedStream)

          return (
            <Card className="mb-6 border border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-xl sm:text-2xl text-slate-900 dark:text-white">
                    Section 2: Skill Development & Practice Guidance
                  </CardTitle>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    Assessment Performance
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Based on your current performance across 8 questions per section. Aptitude scores provide skill-building insights and do not alter your stream recommendation.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border text-xs text-slate-700 dark:text-slate-300">
                  <div className="font-semibold mb-0.5">Overall Performance Summary</div>
                  <div>{aptFeedback.overallSummary}</div>
                  {aptFeedback.streamSynergyNote ? (
                    <div className="mt-2 text-indigo-700 dark:text-indigo-300 font-medium bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded border border-indigo-200 dark:border-indigo-800">
                      💡 {aptFeedback.streamSynergyNote}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aptFeedback.sections.map((sec) => (
                    <div
                      key={sec.section}
                      className="rounded-xl border p-4 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {sec.sectionLabel}
                          </span>
                          {sec.isRelativeStrength ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              ⭐ Relative Strength
                            </span>
                          ) : sec.isAreaToImprove ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              🎯 Area to Improve
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {sec.percentage}%
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${sec.bandColorClass}`}>
                            {sec.band}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                          {sec.explanation}
                        </p>
                      </div>

                      <div className="border-t pt-2 mt-2">
                        <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Practice Focus:
                        </div>
                        <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-3">
                          {sec.improvementTips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                  ℹ️ Assessment performance reflects current section accuracy out of 8 sample questions per topic. It does not measure intelligence, predict career success, or alter stream eligibility.
                </div>
              </CardContent>
            </Card>
          )
        })() : null}

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
