"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CollegeImages } from '@/components/10th/CollegeImages'
import {
  TOTAL_TIME_SECONDS,
  APTITUDE_QUESTIONS,
  APTITUDE_OPTIONS,
  PROFILE_QUESTIONS,
  SCALES,
  TOTAL_QUESTIONS_APTITUDE,
  TOTAL_QUESTIONS_PROFILE,
  TOTAL_QUESTIONS,
  IFinalRecommendation,
  IAptitudeQuestion,
  IProfileQuestion,
} from '@/lib/constants'

function PersonalizedAIRecommendation({
  streamKey,
  streamLabel,
  confidence,
  flexibility,
  region,
  aptitudeBreakdown,
  profileBreakdown,
}: {
  streamKey: 'science' | 'commerce' | 'arts'
  streamLabel: string
  confidence: number
  flexibility: number
  region: string
  aptitudeBreakdown: Record<string, number>
  profileBreakdown: Record<string, number>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState<string | null>(null)
  const scrollRef = useRef<HTMLPreElement | null>(null)
  const [canScroll, setCanScroll] = useState(false)
  const [atBottom, setAtBottom] = useState(false)

  const resultingStreamLabel = useMemo(() => {
    if (streamKey === 'science') return 'Science'
    if (streamKey === 'commerce') return 'Commerce'
    return 'Arts/Humanities'
  }, [streamKey])

  const aptitudeKey = useMemo(() => JSON.stringify(aptitudeBreakdown), [aptitudeBreakdown])
  const profileKey = useMemo(() => JSON.stringify(profileBreakdown), [profileBreakdown])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function run() {
      setLoading(true)
      setError(null)
      setText(null)

      try {
        const res = await fetch('/api/gemini/10th-recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            streamKey,
            streamLabel,
            confidence,
            flexibility,
            region: region === 'north' ? 'north' : 'south',
            aptitudeBreakdown,
            profileBreakdown,
          }),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            typeof data?.error === 'string'
              ? data.error
              : 'Failed to fetch AI recommendation'
          const details = typeof data?.details === 'string' ? data.details : ''
          throw new Error(details ? `${msg}: ${details}` : msg)
        }

        if (!cancelled) {
          setText(typeof data?.recommendation === 'string' ? data.recommendation : '')
        }
      } catch (e: any) {
        if (!cancelled && e?.name !== 'AbortError') {
          setError(e?.message || 'Failed to fetch AI recommendation')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [
    streamKey,
    streamLabel,
    confidence,
    flexibility,
    region,
    aptitudeBreakdown,
    profileBreakdown,
    aptitudeKey,
    profileKey,
  ])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const compute = () => {
      const overflow = el.scrollHeight - el.clientHeight
      setCanScroll(overflow > 8)
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
      setAtBottom(isAtBottom)
    }
    compute()
    // Run once after layout as well
    const t = window.setTimeout(compute, 50)
    return () => window.clearTimeout(t)
  }, [text, loading, error])

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
    setAtBottom(isAtBottom)
  }, [])

  const handleScrollButton = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
    if (isAtBottom) {
      el.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      el.scrollBy({ top: Math.max(200, Math.floor(el.clientHeight * 0.9)), behavior: 'smooth' })
    }
  }, [])

  return (
    <div className="mt-6 text-left">
      <div className="rounded-xl border bg-white p-5 shadow-sm w-full min-h-[340px]">
        <div className="text-lg font-bold text-gray-900">Personalized Recommendation (AI)</div>
        <div className="mt-1 text-xs text-gray-500">
          Uses your test result to suggest next steps.
        </div>
        <div className="mt-2 text-xs text-gray-600">
          Resulting Stream: <span className="font-semibold">{resultingStreamLabel}</span>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-gray-600">Generating recommendation…</div>
        ) : error ? (
          <div className="mt-4 text-sm text-red-600">{error}</div>
        ) : text ? (
          <>
            <pre
              ref={scrollRef}
              onScroll={onScroll}
              className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-800 max-h-[360px] overflow-y-auto pr-2"
            >
              {text}
            </pre>
            {canScroll ? (
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={handleScrollButton}>
                  {atBottom ? 'Back to Top' : 'Scroll'}
                </Button>
              </div>
            ) : null}

            <div className="mt-4 flex justify-end">
              <Button onClick={() => router.push('/my-dashboard')}>
                Dashboard
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

type Answers = { [key: string]: number }

export default function TenthStandardAssessment() {
  const router = useRouter()

  const [step, setStep] = useState<number>(0)
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Answers>({})
  const [profileAnswers, setProfileAnswers] = useState<Answers>({})
  const [finalScores, setFinalScores] = useState<IFinalRecommendation | null>(null)
  const [aiInsights, setAIInsights] = useState<any | null>(null)
  const [aiError, setAIError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME_SECONDS)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [shuffledAptitude, setShuffledAptitude] = useState<IAptitudeQuestion[]>([])
  const [shuffledProfile, setShuffledProfile] = useState<IProfileQuestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { data: session } = useSession()
  const [selectedStandard, setSelectedStandard] = useState<string>('10th-standard')
  const [region, setRegion] = useState<string>('south')
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const calculateAndSubmitScores = useCallback(
    async (timeExpired: boolean = false) => {
      setIsLoading(true)
      setStep(2)
      setSaveError(null)

      const aptBreakdown: { [key: string]: number } = {}
      const correctCounts: { [key: string]: number } = {}
      const totalCounts: { [key: string]: number } = {}

      APTITUDE_QUESTIONS.forEach((q: IAptitudeQuestion) => {
        totalCounts[q.section] = (totalCounts[q.section] || 0) + 1
        if (aptitudeAnswers[q.id] !== undefined && aptitudeAnswers[q.id] === q.answerIndex) {
          correctCounts[q.section] = (correctCounts[q.section] || 0) + 1
        }
      })

      Object.keys(totalCounts).forEach((section) => {
        const correct = correctCounts[section] || 0
        const count = totalCounts[section] || 1
        aptBreakdown[section] = Math.round((correct / count) * 100)
      })

      const factorSums: { [key: string]: number } = {}
      const factorCounts: { [key: string]: number } = {}

      PROFILE_QUESTIONS.forEach((q: IProfileQuestion) => {
        const rawScore = profileAnswers[q.id]
        if (rawScore === undefined) return
        const finalScore = q.isReversed ? 6 - rawScore : rawScore
        factorSums[q.type] = (factorSums[q.type] || 0) + finalScore
        factorCounts[q.type] = (factorCounts[q.type] || 0) + 1
      })

      const profileBreakdown: { [key: string]: number } = {}
      Object.entries(factorSums).forEach(([type, sum]) => {
        const average = sum / (factorCounts[type] || 1)
        profileBreakdown[type] = parseFloat((((average - 1) / 4) * 100).toFixed(1))
      })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const scienceFit =
        (aptBreakdown['Numerical'] || 0) * 0.4 + (profileBreakdown['Investigative'] || 0) * 0.3
      const commerceFit =
        (aptBreakdown['Numerical'] || 0) * 0.3 + (profileBreakdown['Conventional'] || 0) * 0.4
      const artsFit =
        (aptBreakdown['Verbal'] || 0) * 0.45 + (profileBreakdown['Artistic'] || 0) * 0.4

      const scores = [
        { name: 'science', label: 'Science', score: scienceFit, flex: 90 },
        { name: 'commerce', label: 'Commerce', score: commerceFit, flex: 70 },
        { name: 'arts', label: 'Arts/Humanities', score: artsFit, flex: 60 },
      ].sort((a, b) => b.score - a.score)

      const top = scores[0]

      const mockRecommendation: IFinalRecommendation = {
        name: top.label,
        confidence: Math.min(100, Math.round(top.score)),
        flexibility: top.flex,
        aptitudeBreakdown: aptBreakdown,
        profileBreakdown: profileBreakdown,
        timeExpired,
      }

      // Persist attempt + marks to DB (Supabase/Postgres via Prisma)
      try {
        const res = await fetch('/api/assessments/10th/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId: assessmentId || undefined,
            standard: '10th-standard',
            region: region === 'north' ? 'north' : 'south',
            timeExpired,
            aptitudeAnswers,
            profileAnswers,
          }),
        })

        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          const msg = typeof json?.error === 'string' ? json.error : 'Failed to save marks'
          setSaveError(msg)
        } else {
          const json = await res.json().catch(() => ({}))
          if (typeof json?.assessmentId === 'string') {
            setAssessmentId(json.assessmentId)
            try {
              localStorage.setItem('latest10thAssessmentId', json.assessmentId)
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (e: any) {
        setSaveError(e?.message || 'Failed to save marks')
      }

      localStorage.setItem(
        'careerProfile',
        JSON.stringify({ class: '10th-standard', stream: top.name, testCompleted: true }),
      )

      // Call AI insights endpoint for personalized recommendations
      try {
        setAIError(null)
        const normalizedScores: { [key: string]: number } = {}
        Object.entries(profileBreakdown).forEach(([type, val]) => {
          normalizedScores[type] = val as number
        })
        
        const clusterFits = [
          { cluster: top.label, score: top.score },
          ...(scores.slice(1) || []).map(s => ({ cluster: s.label, score: s.score }))
        ]

        const res = await fetch('/api/career-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            normalizedScores, 
            clusterFits, 
            stream: top.name,
            aptitudeBreakdown: aptBreakdown
          }),
        })
        if (res.ok) {
          const json = await res.json()
          setAIInsights(json)
        } else {
          try {
            const txt = await res.text()
            setAIError(`Server error: ${txt}`)
          } catch (e) {
            setAIError('Server returned an error')
          }
        }
      } catch (fetchErr) {
        console.error('Network error calling AI route:', fetchErr)
        setAIError('Network error contacting AI route')
      }

      setFinalScores(mockRecommendation)
      setStep(3)
      setIsLoading(false)
    },
    [aptitudeAnswers, profileAnswers, assessmentId, region],
  )

  useEffect(() => {
    // load selected standard from localStorage (if any)
    try {
      const raw = localStorage.getItem('careerProfile')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.class) setSelectedStandard(parsed.class)
      }

      // Only prefill the last *saved* assessment id for display/fetching.
      // Do not create a new id client-side; the server returns the real DB id.
      const prior = localStorage.getItem('latest10thAssessmentId')
      if (prior) setAssessmentId(prior)
    } catch (e) {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    if (step === 0 || step === 2 || step === 3) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          calculateAndSubmitScores(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [step, calculateAndSubmitScores])

  const handleAptitudeStart = () => {
    // Start a fresh attempt. We intentionally DO NOT set an assessment id here.
    // The DB id will be created on submit and returned by the API.
    setShuffledAptitude([...APTITUDE_QUESTIONS].sort(() => Math.random() - 0.5))
    setShuffledProfile([...PROFILE_QUESTIONS].sort(() => Math.random() - 0.5))
    setAssessmentId(null)
    setSaveError(null)
    setStep(0.5)
  }

  const handleAptitudeAnswerSelect = useCallback(
    (qId: string, answerIndex: number) => {
      if (step !== 0.5) return
      setAptitudeAnswers((prev) => ({ ...prev, [qId]: answerIndex }))
    },
    [step],
  )

  const handleAptitudeSubmit = useCallback(() => {
    setCurrentQuestionIndex(TOTAL_QUESTIONS_APTITUDE)
    setStep(1.5)
  }, [])

  const handleProfileAnswerSelect = useCallback(
    (qId: string, score: number) => {
      if (step !== 1.5) return
      setProfileAnswers((prev) => ({ ...prev, [qId]: score }))
    },
    [step],
  )

  const renderHeader = (title: string, stepText: string) => (
    <header className="bg-indigo-600 p-6 rounded-t-xl text-white flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-1 opacity-80">10th Pass: Stream Selection Profile</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex-shrink-0 w-44 sm:w-52 text-center text-xl font-semibold bg-indigo-700 py-2 px-6 sm:px-8 rounded-full shadow-md flex items-center justify-center">
          {stepText}
        </span>

        {/* Profile / session area */}
        {/* Only render profile / session area when not actively attending a test */}
        {(step === 0 || step === 3) && (
          <div className="flex items-center gap-3">
            <div className="text-right mr-2 hidden sm:block">
              <div className="text-sm font-semibold">{session?.user?.name ?? 'Guest'}</div>
              <div className="text-xs opacity-90">{session?.user?.email ?? ''}</div>
              <div className="text-xs opacity-90 capitalize">{selectedStandard.replace(/-/g, ' ')}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-3 py-2 bg-white text-indigo-600 font-semibold rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )

  const renderIntroduction = () => (
    <div className="p-8 text-center">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">
        Start Your Comprehensive Profile Assessment
      </h3>
      <p className="text-gray-600 mb-8">
        This combined assessment measures all factors for your stream recommendation in{' '}
        <strong>one hour</strong>.
      </p>
      <div className="grid grid-cols-3 gap-4 mb-10 text-lg font-medium">
        <p className="p-4 bg-indigo-50 rounded-lg shadow-md text-black">Aptitude (24 Qs)</p>
        <p className="p-4 bg-indigo-50 rounded-lg shadow-md text-black">Interests (18 Qs)</p>
        <p className="p-4 bg-indigo-50 rounded-lg shadow-md text-black">Personality (15 Qs)</p>
      </div>
      <p className="text-lg font-bold text-red-600 mb-4">
        Total Time Limit: {formatTime(TOTAL_TIME_SECONDS)}
      </p>
      <button
        onClick={handleAptitudeStart}
        className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200"
      >
        Begin Assessment (57 Questions Total)
      </button>
    </div>
  )

  const renderTestInterface = (isAptitude: boolean) => {
    const questions = isAptitude ? (shuffledAptitude.length ? shuffledAptitude : APTITUDE_QUESTIONS) : (shuffledProfile.length ? shuffledProfile : PROFILE_QUESTIONS)
    const answers = isAptitude ? aptitudeAnswers : profileAnswers
    const handleSelect = isAptitude ? handleAptitudeAnswerSelect : handleProfileAnswerSelect

    const qIndexInCurrentSet = isAptitude
      ? currentQuestionIndex
      : currentQuestionIndex - TOTAL_QUESTIONS_APTITUDE
    const q = questions[qIndexInCurrentSet]
    if (!q) return null

    const qId = q.id
    const isFinalInSet = qIndexInCurrentSet === questions.length - 1
    const questionNumber = currentQuestionIndex + 1
    const typeLabel = (q as IAptitudeQuestion).section
      ? `Aptitude - ${(q as IAptitudeQuestion).section}`
      : `${(q as IProfileQuestion).factor} - ${(q as IProfileQuestion).type}`
    const scaleTitle = isAptitude
      ? 'Select the correct option'
      : SCALES[(q as IProfileQuestion).scale].title

    const nextAction = isAptitude
      ? isFinalInSet
        ? handleAptitudeSubmit
        : () => setCurrentQuestionIndex((prev) => prev + 1)
      : isFinalInSet
      ? () => calculateAndSubmitScores(false)
      : () => setCurrentQuestionIndex((prev) => prev + 1)

    const isNextDisabled = answers[qId] === undefined || timeLeft <= 0
    const isSkipDisabled = timeLeft <= 0

    return (
      <div className="p-8 relative">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
            {typeLabel}
          </span>
          <div
            className={`text-lg font-bold p-2 rounded-md ${
              timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-indigo-600'
            }`}
          >
            Time Remaining: {formatTime(timeLeft)}
          </div>
        </div>

        <h4 className="text-xl font-bold mb-4 text-gray-800">
          Question {questionNumber}/{TOTAL_QUESTIONS}: {q.text}
        </h4>

        {isAptitude ? (
          <div className="space-y-3">
            {APTITUDE_OPTIONS[qId].map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(qId, index)}
                disabled={timeLeft <= 0}
                className={`w-full text-left p-3 rounded-lg border-2 transition text-black ${
                  answers[qId] === index
                    ? 'bg-indigo-100 border-indigo-600 font-semibold'
                    : 'bg-white border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span> {option}
              </button>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">{scaleTitle}</p>
            <div className="flex justify-between items-center space-x-2 p-4 bg-gray-50 rounded-lg shadow-inner">
              {SCALES[(q as IProfileQuestion).scale].labels.map((label, index) => {
                const scoreValue = index + 1
                const isSelected = answers[qId] === scoreValue
                return (
                  <div key={scoreValue} className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => handleSelect(qId, scoreValue)}
                      disabled={timeLeft <= 0}
                      className={`w-12 h-12 rounded-full text-lg font-bold transition shadow-md flex items-center justify-center ${
                        isSelected
                          ? 'bg-purple-600 text-white transform scale-110'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-purple-50'
                      }`}
                      title={label}
                    >
                      {scoreValue}
                    </button>
                    <p className="text-xs mt-2 text-center text-gray-500 max-w-[80%]">{label}</p>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0 || timeLeft <= 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={nextAction}
              disabled={isNextDisabled}
              className={`px-6 py-3 font-semibold rounded-lg transition duration-200 ${
                isNextDisabled
                  ? 'bg-indigo-300 text-white'
                  : isFinalInSet && !isAptitude
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {isFinalInSet ? 'Final Submission' : 'Next Question →'}
            </button>

            <button
              onClick={nextAction}
              disabled={isSkipDisabled}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Skip →
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderLoading = () => (
    <div className="text-center p-12">
      <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-lg font-semibold text-gray-700">Analyzing your responses...</p>
      <p className="text-sm text-gray-500">Combining 57 data points (Aptitude, RIASEC, OCEAN).</p>
    </div>
  )

  const renderResults = () => {
    if (!finalScores) return null

    const { name, confidence, flexibility, aptitudeBreakdown, profileBreakdown, timeExpired } =
      finalScores

    const aptitudeTotal = APTITUDE_QUESTIONS.length
    const aptitudeAttempted = APTITUDE_QUESTIONS.reduce(
      (acc, q) => acc + (aptitudeAnswers[q.id] === undefined ? 0 : 1),
      0,
    )
    const aptitudeCorrect = APTITUDE_QUESTIONS.reduce(
      (acc, q) => acc + (aptitudeAnswers[q.id] !== undefined && aptitudeAnswers[q.id] === q.answerIndex ? 1 : 0),
      0,
    )
    const aptitudeSkipped = Math.max(0, aptitudeTotal - aptitudeAttempted)
    const aptitudePercent = aptitudeTotal > 0 ? Math.round((aptitudeCorrect / aptitudeTotal) * 100) : 0

    const streamKey = name.toLowerCase().includes('science')
      ? 'science'
      : name.toLowerCase().includes('commerce')
      ? 'commerce'
      : name.toLowerCase().includes('arts')
      ? 'arts'
      : ''


    return (
      <div className="p-8 text-center">
        {timeExpired && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 font-semibold rounded-lg">
            ⚠️ Time Expired! Results based on completed answers.
          </div>
        )}

        {saveError ? (
          <div className="mb-4 p-3 bg-red-100 text-red-700 font-semibold rounded-lg">
            ⚠️ Could not save marks to database: {saveError}
          </div>
        ) : assessmentId ? (
          <div className="mb-4 p-3 bg-green-100 text-green-700 font-semibold rounded-lg">
            ✅ Marks saved. Assessment ID: {assessmentId}
          </div>
        ) : null}

        <h3 className="text-3xl font-extrabold text-indigo-700 mb-4">
          Recommended Stream: {name.toUpperCase()}
        </h3>

        <div className="bg-indigo-50 border-4 border-indigo-600 rounded-2xl p-6 mb-8 shadow-lg">
          <p className="text-2xl font-black text-indigo-800">{name}</p>
          <p className="text-lg text-gray-600 mt-2">
            Confidence Score: <span className="font-bold text-green-600">{confidence}%</span>
          </p>
          <p className="text-lg text-gray-600">Flexibility Score: {flexibility}%</p>
          <p className="text-lg text-gray-600">
            Marks (Aptitude): <span className="font-bold text-indigo-700">{aptitudeCorrect}/{aptitudeTotal}</span>
            <span className="text-gray-500"> ({aptitudePercent}%)</span>
          </p>
          <p className="text-sm text-gray-500">
            Attempted: {aptitudeAttempted}/{aptitudeTotal} · Skipped: {aptitudeSkipped}
          </p>
        </div>

        <div className="mb-4 mx-auto max-w-sm flex items-center justify-center gap-3">
          <div className="font-semibold text-gray-800">Filter</div>
          <Select
            value={region}
            onValueChange={(val) => {
              setRegion(val)
              try {
                const raw = localStorage.getItem('careerProfile')
                const parsed = raw ? JSON.parse(raw) : {}
                localStorage.setItem('careerProfile', JSON.stringify({ ...parsed, region: val }))
              } catch {}
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="north">North Karnataka</SelectItem>
              <SelectItem value="south">South Karnataka</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-8">
          <CollegeImages stream={streamKey} region={region} />
        </div>

        {streamKey ? (
          <PersonalizedAIRecommendation
            streamKey={streamKey as 'science' | 'commerce' | 'arts'}
            streamLabel={name}
            confidence={confidence}
            flexibility={flexibility}
            region={region}
            aptitudeBreakdown={aptitudeBreakdown}
            profileBreakdown={profileBreakdown}
          />
        ) : null}

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            <p className="font-bold text-indigo-700 mb-2">Aptitude (Readiness)</p>
            {Object.entries(aptitudeBreakdown).map(([key, value]) => (
              <p key={key} className="text-sm text-black">
                {key}: <span className="font-semibold">{value || 0}%</span>
              </p>
            ))}
          </div>
          <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            <p className="font-bold text-indigo-700 mb-2">Key Profile Traits</p>
            {Object.entries(profileBreakdown)
              .slice(0, 4)
              .map(([key, value]) => (
                <p key={key} className="text-sm text-black">
                  {key}: <span className="font-semibold">{value || 0}%</span>
                </p>
              ))}
          </div>
        </div>

        {/* AI Insights text removed as requested; only show error if any */}
        {aiError && (
          <div className="mt-8 p-4 border rounded-md bg-yellow-50 text-sm text-red-600 mb-4">
            {aiError}
          </div>
        )}

      </div>
    )
  }

  let content
  const currentStepText = `Step ${Math.ceil(step) + 1} of 4`
  const isAptitudeTest = currentQuestionIndex < TOTAL_QUESTIONS_APTITUDE

  if (step === 0) content = renderIntroduction()
  else if (step === 2) content = renderLoading()
  else if (step === 3) content = renderResults()
  else if (isAptitudeTest) content = renderTestInterface(true)
  else if (currentQuestionIndex < TOTAL_QUESTIONS) content = renderTestInterface(false)
  else content = <div className="p-8 text-red-500">Assessment Error.</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto my-4 bg-white rounded-xl shadow-2xl">
        {renderHeader('10th Pass Stream Classification', currentStepText)}
        {content}
      </div>
    </div>
  )
}