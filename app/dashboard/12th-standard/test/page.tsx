"use client"

// 12th Standard Career Assessment Test
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ScienceTest from '@/components/12th/ScienceTest'
import CommerceTest from '@/components/12th/CommerceTest'
import ArtsTest from '@/components/12th/ArtsTest'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Test Questions for 12th Standard
const questions = [
  {
    id: 1,
    question: "Which field interests you the most for higher education?",
    options: [
      "Engineering and Technology",
      "Medical and Healthcare",
      "Business and Management",
      "Arts, Law, or Social Sciences"
    ]
  },
  {
    id: 2,
    question: "What type of work environment do you prefer?",
    options: [
      "Laboratory, research, or technical settings",
      "Hospitals, clinics, or healthcare facilities",
      "Corporate offices or business environments",
      "Creative studios, courts, or educational institutions"
    ]
  },
  {
    id: 3,
    question: "What skills do you want to develop?",
    options: [
      "Problem-solving, analytical, and technical skills",
      "Medical knowledge, patient care, and diagnostic skills",
      "Business acumen, financial analysis, and management",
      "Communication, creativity, and critical thinking"
    ]
  },
  {
    id: 4,
    question: "What are your career goals?",
    options: [
      "Become an engineer, scientist, or researcher",
      "Become a doctor, nurse, or healthcare professional",
      "Start a business or work in corporate sector",
      "Become a lawyer, journalist, teacher, or artist"
    ]
  },
  {
    id: 5,
    question: "How do you handle challenges?",
    options: [
      "Analyze systematically and find technical solutions",
      "Focus on helping others and providing care",
      "Use strategic thinking and business solutions",
      "Approach creatively with communication and empathy"
    ]
  }
]

export default function TwelfthStandardTestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedStream, setSelectedStream] = useState<string | null>(null)
  const { data: session } = useSession()
  const [selectedStandard, setSelectedStandard] = useState('12th-standard')

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    const answeredCount = Object.keys(answers).length
    if (answeredCount < questions.length) {
      toast({
        title: "Incomplete Test",
        description: `Please answer all ${questions.length} questions before submitting.`,
        variant: "destructive"
      })
      return
    }

    setIsSubmitted(true)
    toast({
      title: "Test Submitted!",
      description: "Your responses have been recorded. Results will be displayed shortly.",
    })

    const result = calculateResult(answers)
    
    // Save to localStorage for dashboard
    localStorage.setItem('careerProfile', JSON.stringify({
      class: '12th-standard',
      field: result,
      testCompleted: true
    }))

    setTimeout(() => {
      router.push(`/dashboard/12th-standard/result?field=${result}`)
    }, 2000)
  }

  const calculateResult = (answers: { [key: number]: string }) => {
    const scores = { engineering: 0, medical: 0, business: 0, arts: 0 }
    
    Object.values(answers).forEach((answer) => {
      if (answer.includes("Engineering") || answer.includes("Technology") || answer.includes("technical") || answer.includes("scientist")) {
        scores.engineering++
      } else if (answer.includes("Medical") || answer.includes("Healthcare") || answer.includes("doctor") || answer.includes("patient")) {
        scores.medical++
      } else if (answer.includes("Business") || answer.includes("Management") || answer.includes("corporate") || answer.includes("financial")) {
        scores.business++
      } else if (answer.includes("Arts") || answer.includes("Law") || answer.includes("Social") || answer.includes("creative") || answer.includes("journalist")) {
        scores.arts++
      }
    })

    const maxScore = Math.max(...Object.values(scores))
    if (scores.engineering === maxScore) return "engineering"
    if (scores.medical === maxScore) return "medical"
    if (scores.business === maxScore) return "business"
    return "arts"
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  useEffect(() => {
    try {
      const raw = localStorage.getItem('careerProfile')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.class) setSelectedStandard(parsed.class)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-2xl">
          <CardHeader>
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl text-on-surface font-headline font-bold">Test Submitted!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-on-surface-variant mb-4 font-medium">
              Processing your results...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Top header: user info/logout on the right and title */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 py-8 px-6 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden">
           <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="text-center sm:text-left relative z-10">
            <h1 className="text-3xl font-extrabold text-on-surface font-headline dark:text-white tracking-tight">12th Pass Stream Test</h1>
            <p className="text-sm text-on-surface-variant mt-1 font-medium italic">Defining Your Academic Profile</p>
          </div>
          {/* Hide the user-info/logout area while the user has selected a stream (during a test)
              This prevents users from accidentally signing out mid-test */}
          {!selectedStream && (
            <div className="flex items-center gap-3 relative z-10">
              <div className="text-right mr-2 hidden sm:block">
                <div className="text-sm font-bold text-on-surface">{session?.user?.name ?? 'Guest'}</div>
                <div className="text-xs text-on-surface-variant">{session?.user?.email ?? ''}</div>
                <div className="text-xs text-primary font-bold capitalize">{selectedStandard.replace(/-/g, ' ')}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-4 py-2 bg-surface-container-lowest text-error font-bold rounded-full hover:bg-error/10 border border-outline-variant/30 shadow-sm transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Stream selection: if user hasn't selected a stream, show tiles linking to the specific profile tests (Science/Commerce/Arts) */}
        {!selectedStream && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 items-stretch">
            <div className="p-8 bg-surface-container-lowest rounded-[2rem] shadow-xl border border-outline-variant/30 text-center flex flex-col justify-between h-72 overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 hover:border-primary/50 group relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-[80px] -z-10 group-hover:bg-primary/20 transition-colors"></div>
              <div>
                <h3 className="text-xl font-bold text-on-surface font-headline capitalize">Science Profile</h3>
                <p className="text-sm text-on-surface-variant font-medium mt-3 max-h-12 overflow-hidden leading-relaxed">Find your path in science degree programs and careers</p>
              </div>
              <div className="mt-4 w-full">
                <Button className="w-full sm:w-64 mx-auto px-4 py-3 bg-primary text-white font-bold rounded-full shadow-md hover:bg-primary-dim transition-colors" onClick={() => {
                  localStorage.setItem('careerProfile', JSON.stringify({ class: '12th-standard', stream: 'science' }))
                  setSelectedStream('science')
                }}>
                  Start Test
                </Button>
              </div>
            </div>
            
            <div className="p-8 bg-surface-container-lowest rounded-[2rem] shadow-xl border border-outline-variant/30 text-center flex flex-col justify-between h-72 overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 hover:border-tertiary-dim/50 group relative">
               <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-dim/10 rounded-bl-[80px] -z-10 group-hover:bg-tertiary-dim/20 transition-colors"></div>
              <div>
                <h3 className="text-xl font-bold text-on-surface font-headline capitalize">Commerce Profile</h3>
                <p className="text-sm text-on-surface-variant font-medium mt-3 max-h-12 overflow-hidden leading-relaxed">Explore commerce and management streams and outcomes</p>
              </div>
              <div className="mt-4 w-full">
                <Button className="w-full sm:w-64 mx-auto px-4 py-3 bg-tertiary-dim text-white font-bold rounded-full shadow-md hover:bg-tertiary transition-colors" onClick={() => {
                  localStorage.setItem('careerProfile', JSON.stringify({ class: '12th-standard', stream: 'commerce' }))
                  setSelectedStream('commerce')
                }}>
                  Start Test
                </Button>
              </div>
            </div>

            <div className="p-8 bg-surface-container-lowest rounded-[2rem] shadow-xl border border-outline-variant/30 text-center flex flex-col justify-between h-72 overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 hover:border-secondary-dim/50 group relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-dim/10 rounded-bl-[80px] -z-10 group-hover:bg-secondary-dim/20 transition-colors"></div>
              <div>
                <h3 className="text-xl font-bold text-on-surface font-headline capitalize">Arts Profile</h3>
                <p className="text-sm text-on-surface-variant font-medium mt-3 max-h-12 overflow-hidden leading-relaxed">Explore arts, linguistics, and humanities streams</p>
              </div>
              <div className="mt-4 w-full">
                <Button className="w-full sm:w-64 mx-auto px-4 py-3 bg-secondary-dim text-white font-bold rounded-full shadow-md hover:bg-secondary-dim/80 transition-colors" onClick={() => {
                  localStorage.setItem('careerProfile', JSON.stringify({ class: '12th-standard', stream: 'arts' }))
                  setSelectedStream('arts')
                }}>
                  Start Test
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Back button removed (requested) */}
        {/* Removed MCQs below as requested — they appear beneath the stream tiles */}
        <div className="mb-6">
          {/* Inline selected stream: render the stream test when a stream is chosen */}
          {selectedStream && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-lg">
              {selectedStream === 'science' && <ScienceTest />}
              {selectedStream === 'commerce' && <CommerceTest />}
              {selectedStream === 'arts' && <ArtsTest />}
            </div>
          )}
          {/* Progress display removed as requested */}
        </div>
      </div>
      {/* MCQ card and navigation removed as requested */}
    </div>
  )
}