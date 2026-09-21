"use client"

// Technical Group Career Assessment Test - 33 Questions RIASEC + OCEAN
import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

import { TECHNICAL_QUESTIONS, ITechnicalQuestion } from '@/lib/technical-questions'
import { calculateTechnicalDomainRecommendations } from '@/lib/recommendation-technical'
import { sampleRiasecQuestions } from '@/lib/riasec-sampler'

export default function TechnicalGroupTestPage() {
  const [questions] = useState<ITechnicalQuestion[]>(() => sampleRiasecQuestions(TECHNICAL_QUESTIONS, 3))
  const router = useRouter()
  const { toast } = useToast()
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [saveState, setSaveState] = useState<{ state: 'idle' | 'saving' | 'saved' | 'error'; message?: string; assessmentId?: string }>(
    { state: 'idle' }
  )
  // Countdown timer: remaining seconds from 15 minutes
  const TOTAL_SECONDS = 15 * 60
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_SECONDS)
  const { data: session } = useSession()
  const [selectedStandard, setSelectedStandard] = useState('technical-group')

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = useCallback(async () => {
    setIsSubmitted(true)
    setSaveState({ state: 'saving' })
    toast({
      title: "Submitting Test...",
      description: "Generating personalized recommendations based on Pearson vector alignment. Please wait.",
    })

    const attempted = Object.keys(answers).length
    const skipped = questions.length - attempted

    // Build 18 RIASEC profile answers (1-5 Likert scale)
    const profileAnswers: Record<string, number | null> = {}
    questions.forEach((q) => {
      const raw = answers[q.id]
      profileAnswers[q.id] = raw === undefined ? null : raw + 1
    })

    // Calculate domain recommendations via Pearson engine
    const recResult = calculateTechnicalDomainRecommendations(profileAnswers)

    // Call AI API for personalized insights (dynamic fallback if AI not available)
    let insights: any = null
    try {
      const res = await fetch('/api/technical/career-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riasecScores: recResult.studentRiasecVector,
          domainScores: recResult.fitPercentages,
          topDomains: recResult.rankedDomains.slice(0, 3),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        insights = data.insights ?? null
      }
    } catch (e) {
      insights = null
    }

    const topDomainKey = recResult.recommendedDomainKey
    const topDomainName = recResult.recommendedDomain

    // Save to DB via Prisma endpoint
    try {
      const res = await fetch('/api/assessments/technical/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standard: 'technical-group',
          region: 'na',
          timeExpired: remainingSeconds <= 0,
          profileAnswers,
          recommendedDomain: topDomainKey,
          attempted,
          skipped,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        setSaveState({ state: 'saved', assessmentId: json?.data?.assessmentId || json?.assessmentId, message: 'Marks saved.' })
      } else {
        const txt = await res.text().catch(() => '')
        setSaveState({ state: 'error', message: txt || 'Failed to save marks.' })
      }
    } catch (e) {
      setSaveState({ state: 'error', message: 'Network error saving marks.' })
    }

    // Save results + insights to localStorage for the results page
    try {
      const elapsedSeconds = TOTAL_SECONDS - remainingSeconds
      localStorage.setItem(
        'careerProfile',
        JSON.stringify({
          class: 'technical-group',
          specialization: topDomainKey,
          testCompleted: true,
          riasecScores: recResult.studentRiasecVector,
          domainScores: recResult.fitPercentages,
          rankedDomains: recResult.rankedDomains,
          insights,
          attempted,
          skipped,
          elapsedSeconds,
          recResult,
        })
      )
    } catch (e) {
      console.warn('Failed to write careerProfile', e)
    }

    // short delay for UX then navigate to results
    setTimeout(() => {
      router.push(`/dashboard/technical-group/result?specialization=${topDomainKey}`)
    }, 800)
  }, [answers, router, toast, remainingSeconds, TOTAL_SECONDS, questions])

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]
  const selectedAnswer = answers[question.id]

  useEffect(() => {
    // Countdown interval
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // auto-submit when timer hits zero
          try {
            if (!isSubmitted) handleSubmit()
          } catch (e) {
            console.error('Auto-submit error', e)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isSubmitted, handleSubmit])

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60)
    const ss = s % 60
    return `${mm}:${ss.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('careerProfile')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.class) setSelectedStandard(parsed.class)
      }
    } catch (e) {}
  }, [])

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle2 className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Test Submitted!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Processing your results...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Technical Group Test</h1>
            <p className="text-sm text-gray-500">Technical Group: Career Selection</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">Answered:</div>
            <div className="text-3xl font-bold text-purple-600">{Object.keys(answers).length}/{questions.length}</div>
            <div className="text-xs text-gray-500">{formatTime(remainingSeconds)}</div>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/technical-group')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  RIASEC - {question.type.toUpperCase()}
                </span>
              </div>
            </div>
            <CardTitle className="text-lg sm:text-xl">
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-8">
              {question.text}
            </p>

            {/* 5-Point Likert Scale with Circles */}
            <div className="flex justify-between items-start gap-1 sm:gap-3 mb-8">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => handleAnswer(question.id, idx)}
                    className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-sm sm:text-xl font-bold transition-all duration-200 mb-3 ${
                      selectedAnswer === idx
                        ? 'bg-purple-600 text-white border-2 border-purple-700 scale-110'
                        : 'border-2 border-gray-300 text-gray-600 hover:border-purple-400 dark:border-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                  <span className={`text-[9px] sm:text-xs text-center font-semibold leading-tight max-w-[65px] sm:max-w-[90px] block ${selectedAnswer === idx ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'][idx]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Skip
            </Button>
            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === undefined}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={selectedAnswer === undefined}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next Question →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

