'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2, Award, ChevronDown, ChevronUp, AlertCircle, Info, Sparkles, BookOpen } from 'lucide-react'

interface OnetOccupationMatch {
  socCode: string
  title: string
  description: string
  matchScore: number
  pearsonR: number
  isPathwayDependent: boolean
  relatedModernRoles: string[]
}

interface CareerFamilyResult {
  familyId: string
  slug: string
  familyName: string
  stream: string
  description: string
  familyScore: number
  topOccupations: OnetOccupationMatch[]
}

interface PipelineResult {
  selectedStream: string
  studentRiasecVector: { R: number; I: number; A: number; S: number; E: number; C: number }
  isFlatProfile: boolean
  top3Families: CareerFamilyResult[]
}

export default function TwelfthStandardResultClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const streamParam = searchParams?.get('stream') || 'science'

  const [pipelineData, setPipelineData] = useState<PipelineResult | null>(null)
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('careerProfile')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.pipelineResult) {
          const res = parsed.pipelineResult.data || parsed.pipelineResult
          if (res.top3Families) {
            setPipelineData(res)
            // Expand 1st family by default
            if (res.top3Families[0]) {
              setExpandedFamilies({ [res.top3Families[0].familyId]: true })
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse careerProfile from localStorage', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleExpand = (familyId: string) => {
    setExpandedFamilies((prev) => ({ ...prev, [familyId]: !prev[familyId] }))
  }

  const medals = ['🥇', '🥈', '🥉']
  const borderColors = ['border-amber-400 bg-amber-50/30', 'border-slate-300 bg-slate-50/30', 'border-amber-700/30 bg-amber-900/5']
  const badgeColors = ['bg-amber-100 text-amber-900 border-amber-300', 'bg-slate-100 text-slate-800 border-slate-300', 'bg-amber-100/50 text-amber-950 border-amber-400']

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/12th-standard')}
          className="mb-6 hover:bg-surface-container-high"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to 12th Standard Hub
        </Button>

        {/* Page Header */}
        <div className="text-center mb-8 py-8 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shadow-md">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface font-headline dark:text-white mb-2">
            Official O*NET 12th Career Assessment Result
          </h1>
          <p className="text-on-surface-variant dark:text-gray-400 font-medium">
            Stream: <strong className="text-primary uppercase tracking-wide">{pipelineData?.selectedStream || streamParam}</strong> | Matched via Pearson Correlation & O*NET 31.0 Data
          </p>
        </div>

        {/* Flat Profile Warning Banner if applicable */}
        {pipelineData?.isFlatProfile && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">Flat Interest Profile Detected</h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                Your answers showed equal preference across all interest dimensions (Pearson r = 0.0). Try re-taking the assessment with varied ratings to discover targeted career recommendations.
              </p>
            </div>
          </div>
        )}

        {/* Traceability Callout Card */}
        <Card className="mb-6 border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-200 font-medium leading-relaxed">
              <strong>Scoring Traceability:</strong> Each Career Family Score represents the <strong>maximum Match Score</strong> among its strongest eligible O*NET occupations.
            </p>
          </CardContent>
        </Card>

        {/* Top 3 Ranked Career Families */}
        <div className="space-y-6 mb-8">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Loading recommendations...</div>
          ) : !pipelineData || !pipelineData.top3Families || pipelineData.top3Families.length === 0 ? (
            <Card className="p-8 text-center">
              <CardTitle className="text-lg font-bold mb-2">No Recommendations Available</CardTitle>
              <CardDescription className="mb-4">Please take the 12th Career Assessment Test to generate your profile.</CardDescription>
              <Button onClick={() => router.push('/dashboard/12th-standard/test')} className="bg-primary text-white">
                Take Assessment Test
              </Button>
            </Card>
          ) : (
            pipelineData.top3Families.map((family, idx) => {
              const isExpanded = !!expandedFamilies[family.familyId]
              const topOcc = family.topOccupations[0]

              return (
                <Card
                  key={family.familyId}
                  className={`border-2 rounded-3xl shadow-md transition-all duration-200 ${borderColors[idx] || 'border-gray-200'}`}
                >
                  <CardHeader className="cursor-pointer pb-4" onClick={() => toggleExpand(family.familyId)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-3xl sm:text-4xl">{medals[idx] || '🏅'}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-xl sm:text-2xl font-extrabold text-on-surface">
                              {family.familyName}
                            </CardTitle>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeColors[idx] || 'bg-gray-100 text-gray-800'}`}>
                              {family.stream} Pool
                            </span>
                          </div>
                          <CardDescription className="text-sm mt-1 text-on-surface-variant font-medium">
                            {family.description}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-2xl sm:text-3xl font-black text-primary">
                          {family.familyScore}%
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Family Score
                        </span>
                      </div>
                    </div>

                    {/* Explanatory subtitle for top match */}
                    {topOcc && (
                      <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <span>
                          Driven by top eligible match: <strong className="text-blue-700 dark:text-blue-400">{topOcc.title}</strong> ({topOcc.matchScore}%)
                        </span>
                        <div className="flex items-center text-primary font-bold text-xs hover:underline">
                          {isExpanded ? 'Hide Details' : 'View Top 5 Matches'}
                          {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  {/* Expandable Top 5 O*NET Occupations */}
                  {isExpanded && (
                    <CardContent className="pt-0 border-t border-gray-200/80 dark:border-gray-800">
                      <div className="mt-4 mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                          Top 5 Eligible O*NET Occupation Matches:
                        </h4>
                        <div className="space-y-3">
                          {family.topOccupations.map((occ, occIdx) => (
                            <div
                              key={occ.socCode}
                              className="p-3.5 bg-surface-container-lowest dark:bg-gray-800/80 rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center justify-center shrink-0">
                                    {occIdx + 1}
                                  </span>
                                  <h5 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {occ.title}
                                  </h5>
                                  <span className="text-[11px] font-mono text-gray-500 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                                    SOC: {occ.socCode}
                                  </span>
                                  {occ.isPathwayDependent && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                                      Pathway-Dependent Degree
                                    </span>
                                  )}
                                </div>

                                {occ.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                    {occ.description}
                                  </p>
                                )}

                                {/* Modern Roles Tagging */}
                                {occ.relatedModernRoles && occ.relatedModernRoles.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                    <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                                      Modern Roles / Industry Pathways:
                                    </span>
                                    {occ.relatedModernRoles.map((role) => (
                                      <span
                                        key={role}
                                        className="text-[10px] font-medium px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md"
                                      >
                                        {role}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="text-right shrink-0 sm:self-center">
                                <div className="text-lg font-black text-blue-700 dark:text-blue-400">
                                  {occ.matchScore}%
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">
                                  Pearson Match
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={() => router.push('/dashboard/12th-standard/test')}
            variant="outline"
            size="lg"
            className="rounded-full font-bold"
          >
            Retake Assessment
          </Button>
          <Button
            onClick={() => router.push('/my-dashboard')}
            size="lg"
            className="bg-primary text-white hover:bg-primary-dim rounded-full font-bold shadow-md"
          >
            Go to Main Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
