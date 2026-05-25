"use client"

// Technical Group Career Assessment Test - 33 Questions RIASEC + OCEAN
import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// 33 Questions based on RIASEC + OCEAN for CSE Domain Selection
const INITIAL_QUESTIONS = [
  // RIASEC Realistic (1-6)
  {
    id: 1,
    category: 'RIASEC - REALISTIC',
    question: 'I prefer working with concrete problems that have tangible solutions',
    riasec: 'R',
    ocean: 'openness'
  },
  {
    id: 2,
    category: 'RIASEC - REALISTIC',
    question: 'I enjoy hands-on work and building things from scratch',
    riasec: 'R',
    ocean: 'conscientiousness'
  },
  {
    id: 3,
    category: 'RIASEC - REALISTIC',
    question: 'I like fixing broken systems and troubleshooting issues',
    riasec: 'R',
    ocean: 'conscientiousness'
  },
  {
    id: 4,
    category: 'RIASEC - REALISTIC',
    question: 'I prefer practical applications over theoretical concepts',
    riasec: 'R',
    ocean: 'openness'
  },
  {
    id: 5,
    category: 'RIASEC - REALISTIC',
    question: 'I enjoy working with infrastructure and system components',
    riasec: 'R',
    ocean: 'conscientiousness'
  },
  {
    id: 6,
    category: 'RIASEC - REALISTIC',
    question: 'I like setting up and maintaining technical environments',
    riasec: 'R',
    ocean: 'conscientiousness'
  },
  // RIASEC Investigative (7-12)
  {
    id: 7,
    category: 'RIASEC - INVESTIGATIVE',
    question: 'I enjoy researching and understanding how things work at a deep level',
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 8,
    category: 'RIASEC - INVESTIGATIVE',
    question: 'I like analyzing data patterns and drawing insights from information',
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 9,
    category: 'RIASEC - INVESTIGATIVE',
    question: 'I am interested in mathematics, statistics, and algorithms',
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 10,
    category: 'RIASEC - INVESTIGATIVE',
    question: 'I enjoy solving complex puzzles and brain teasers',
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 11,
    category: 'RIASEC - INVESTIGATIVE',
    question: 'I am curious about emerging technologies and latest innovations',
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 12,
    category: 'RIASEC - INVESTIGATIVE',
    question: 'I like identifying root causes and understanding systems deeply',
    riasec: 'I',
    ocean: 'openness'
  },
  // RIASEC Artistic (13-18)
  {
    id: 13,
    category: 'RIASEC - ARTISTIC',
    question: 'I enjoy creating user-friendly interfaces and visual designs',
    riasec: 'A',
    ocean: 'openness'
  },
  {
    id: 14,
    category: 'RIASEC - ARTISTIC',
    question: 'I like expressing ideas through creative coding and architecture',
    riasec: 'A',
    ocean: 'openness'
  },
  {
    id: 15,
    category: 'RIASEC - ARTISTIC',
    question: 'I appreciate aesthetics and good design in applications',
    riasec: 'A',
    ocean: 'openness'
  },
  {
    id: 16,
    category: 'RIASEC - ARTISTIC',
    question: 'I enjoy exploring new and unconventional solutions',
    riasec: 'A',
    ocean: 'openness'
  },
  {
    id: 17,
    category: 'RIASEC - ARTISTIC',
    question: 'I like experimenting with new tools and technologies',
    riasec: 'A',
    ocean: 'openness'
  },
  {
    id: 18,
    category: 'RIASEC - ARTISTIC',
    question: 'I enjoy learning and adapting to new paradigms in tech',
    riasec: 'A',
    ocean: 'openness'
  },
  // RIASEC Social (19-24)
  {
    id: 19,
    category: 'RIASEC - SOCIAL',
    question: 'I enjoy helping others solve their technical problems',
    riasec: 'S',
    ocean: 'agreeableness'
  },
  {
    id: 20,
    category: 'RIASEC - SOCIAL',
    question: 'I like collaborating with teams and sharing knowledge',
    riasec: 'S',
    ocean: 'agreeableness'
  },
  {
    id: 21,
    category: 'RIASEC - SOCIAL',
    question: 'I enjoy mentoring and teaching others technical concepts',
    riasec: 'S',
    ocean: 'agreeableness'
  },
  {
    id: 22,
    category: 'RIASEC - SOCIAL',
    question: 'I like communicating complex ideas in simple terms',
    riasec: 'S',
    ocean: 'agreeableness'
  },
  {
    id: 23,
    category: 'RIASEC - SOCIAL',
    question: 'I prefer working in team environments rather than solo',
    riasec: 'S',
    ocean: 'agreeableness'
  },
  {
    id: 24,
    category: 'RIASEC - SOCIAL',
    question: 'I enjoy building relationships and networking in tech communities',
    riasec: 'S',
    ocean: 'agreeableness'
  },
  // RIASEC Enterprising (25-28)
  {
    id: 25,
    category: 'RIASEC - ENTERPRISING',
    question: 'I am driven by achieving goals and delivering results',
    riasec: 'E',
    ocean: 'conscientiousness'
  },
  {
    id: 26,
    category: 'RIASEC - ENTERPRISING',
    question: 'I like taking leadership roles and making strategic decisions',
    riasec: 'E',
    ocean: 'conscientiousness'
  },
  {
    id: 27,
    category: 'RIASEC - ENTERPRISING',
    question: 'I enjoy working on projects with business impact',
    riasec: 'E',
    ocean: 'conscientiousness'
  },
  {
    id: 28,
    category: 'RIASEC - ENTERPRISING',
    question: 'I am motivated by recognition and career advancement',
    riasec: 'E',
    ocean: 'extraversion'
  },
  // OCEAN Openness (29-30)
  {
    id: 29,
    category: 'OCEAN - OPENNESS',
    question: 'I am open to learning completely new programming languages and frameworks',
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 30,
    category: 'OCEAN - OPENNESS',
    question: 'I like thinking about abstract concepts and theoretical problems',
    riasec: 'I',
    ocean: 'openness'
  },
  // OCEAN Conscientiousness (31-32)
  {
    id: 31,
    category: 'OCEAN - CONSCIENTIOUSNESS',
    question: 'I am detail-oriented and ensure code quality and standards',
    riasec: 'C',
    ocean: 'conscientiousness'
  },
  {
    id: 32,
    category: 'OCEAN - CONSCIENTIOUSNESS',
    question: 'I plan my work methodically and follow best practices',
    riasec: 'R',
    ocean: 'conscientiousness'
  },
  // OCEAN Extraversion (33)
  {
    id: 33,
    category: 'OCEAN - EXTRAVERSION',
    question: 'I prefer collaborative projects over independent work',
    riasec: 'S',
    ocean: 'extraversion'
  },
]

// Domain mappings
const DOMAIN_PROFILES = {
  datascience: { name: 'Data Science', riasecMatch: ['I', 'R', 'E'] },
  aiml: { name: 'AI/ML Engineering', riasecMatch: ['I', 'R', 'A'] },
  cybersecurity: { name: 'Cybersecurity', riasecMatch: ['R', 'I', 'E'] },
  fullstack: { name: 'Full Stack Development', riasecMatch: ['R', 'A', 'S'] },
  devops: { name: 'DevOps & Cloud', riasecMatch: ['R', 'E', 'I'] },
  cloudarchitect: { name: 'Cloud Architecture', riasecMatch: ['R', 'E', 'I'] },
}

export default function TechnicalGroupTestPage() {
  const [questions] = useState(() => [...INITIAL_QUESTIONS].sort(() => Math.random() - 0.5))
  const router = useRouter()
  const { toast } = useToast()
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
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

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers({ ...answers, [questionId]: value })
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
      description: "Generating personalized recommendations. Please wait.",
    })

    const attempted = Object.keys(answers).length
    const skipped = questions.length - attempted

    // Calculate RIASEC average scores (1-5) based only on attempted answers
    const riasecSums: { [key: string]: number } = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
    const riasecCounts: { [key: string]: number } = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

    questions.forEach((q) => {
      const raw = answers[q.id]
      if (raw === undefined) return
      const scoreValue = raw + 1 // 1-5 scale
      riasecSums[q.riasec] += scoreValue
      riasecCounts[q.riasec] += 1
    })

    const riasecScores: { [key: string]: number } = {
      R: riasecCounts.R > 0 ? riasecSums.R / riasecCounts.R : 0,
      I: riasecCounts.I > 0 ? riasecSums.I / riasecCounts.I : 0,
      A: riasecCounts.A > 0 ? riasecSums.A / riasecCounts.A : 0,
      S: riasecCounts.S > 0 ? riasecSums.S / riasecCounts.S : 0,
      E: riasecCounts.E > 0 ? riasecSums.E / riasecCounts.E : 0,
      C: riasecCounts.C > 0 ? riasecSums.C / riasecCounts.C : 0,
    }

    // Calculate domain fits
    const domainScores: { [key: string]: number } = {}
    Object.entries(DOMAIN_PROFILES).forEach(([domain, profile]) => {
      let score = 0
      profile.riasecMatch.forEach((type) => {
        score += riasecScores[type] || 0
      })
      domainScores[domain] = score
    })

    // Rank domains
    const rankedDomains = Object.entries(domainScores)
      .sort(([, a], [, b]) => b - a)
      .map(([domain, score]) => ({ domain, name: DOMAIN_PROFILES[domain as keyof typeof DOMAIN_PROFILES].name, score }))

    // Call AI API for personalized insights (dynamic fallback if AI not available)
    let insights: any = null
    try {
      const res = await fetch('/api/technical/career-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riasecScores, domainScores, topDomains: rankedDomains.slice(0,3) }),
      })

      if (res.ok) {
        const data = await res.json()
        insights = data.insights ?? null
      }
    } catch (e) {
      // network or API error - continue with non-AI results
      insights = null
    }

    // Determine top domain
    const topDomain = rankedDomains[0]

    // Save to DB (Supabase via Prisma)
    try {
      const profileAnswers: Record<string, number | null> = {}
      for (const q of questions) {
        const raw = answers[q.id]
        profileAnswers[String(q.id)] = raw === undefined ? null : raw + 1
      }

      const res = await fetch('/api/assessments/technical/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standard: 'technical-group',
          region: 'na',
          timeExpired: remainingSeconds <= 0,
          profileAnswers,
          recommendedDomain: topDomain?.domain ?? null,
          attempted,
          skipped,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        setSaveState({ state: 'saved', assessmentId: json?.assessmentId, message: 'Marks saved.' })
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
      localStorage.setItem('careerProfile', JSON.stringify({
        class: 'technical-group',
        specialization: topDomain?.domain ?? null,
        testCompleted: true,
        riasecScores,
        domainScores,
        rankedDomains,
        insights,
        attempted,
        skipped,
        elapsedSeconds
      }))
    } catch (e) {
      console.warn('Failed to write careerProfile', e)
    }

    // short delay for UX then navigate to results
    setTimeout(() => {
      router.push(`/dashboard/technical-group/result?specialization=${topDomain?.domain ?? ''}`)
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
            <div className="text-3xl font-bold text-purple-600">{Object.keys(answers).length}/33</div>
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
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{question.category}</span>
              </div>
            </div>
            <CardTitle className="text-lg sm:text-xl">
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-8">
              {question.question}
            </p>

            {/* 5-Point Likert Scale with Circles */}
            <div className="flex justify-between items-start mb-8">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <button
                    onClick={() => handleAnswer(question.id, idx)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 mb-3 ${
                      selectedAnswer === idx
                        ? 'bg-purple-600 text-white border-2 border-purple-700 scale-110'
                        : 'border-2 border-gray-300 text-gray-600 hover:border-purple-400 dark:border-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                  <span className={`text-xs text-center font-medium whitespace-nowrap ${selectedAnswer === idx ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
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

