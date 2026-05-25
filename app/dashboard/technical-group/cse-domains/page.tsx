'use client'

// 33-Question CSE Domain Assessment - RIASEC + OCEAN Model
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// 33 Questions based on RIASEC + OCEAN for CSE Domain Selection
const CSE_DOMAIN_QUESTIONS = [
  // RIASEC Realistic (1-6)
  {
    id: 1,
    question: 'I prefer working with concrete problems that have tangible solutions',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'R',
    ocean: 'openness'
  },
  {
    id: 2,
    question: 'I enjoy hands-on work and building things from scratch',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'R',
    ocean: 'conscientiousness'
  },
  {
    id: 3,
    question: 'I like fixing broken systems and troubleshooting issues',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'R',
    ocean: 'conscientiousness'
  },
  {
    id: 4,
    question: 'I prefer practical applications over theoretical concepts',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'R',
    ocean: 'openness'
  },
  {
    id: 5,
    question: 'I enjoy working with infrastructure and system components',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'R',
    ocean: 'conscientiousness'
  },
  {
    id: 6,
    question: 'I like setting up and maintaining technical environments',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'R',
    ocean: 'conscientiousness'
  },
  // RIASEC Investigative (7-12)
  {
    id: 7,
    question: 'I enjoy researching and understanding how things work at a deep level',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 8,
    question: 'I like analyzing data patterns and drawing insights from information',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 9,
    question: 'I am interested in mathematics, statistics, and algorithms',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 10,
    question: 'I enjoy solving complex puzzles and brain teasers',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 11,
    question: 'I am curious about emerging technologies and latest innovations',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 12,
    question: 'I like identifying root causes and understanding systems deeply',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'I',
    ocean: 'openness'
  },
  // RIASEC Artistic (13-18)
  {
    id: 13,
    question: 'I enjoy creating user-friendly interfaces and visual designs',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'A',
    ocean: 'openness'
  },
  {
    id: 14,
    question: 'I like expressing ideas through creative coding and architecture',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'A',
    ocean: 'openness'
  },
  {
    id: 15,
    question: 'I appreciate aesthetics and good design in applications',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'A',
    ocean: 'openness'
  },
  {
    id: 16,
    question: 'I enjoy exploring new and unconventional solutions',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'A',
    ocean: 'openness'
  },
  {
    id: 17,
    question: 'I like experimenting with new tools and technologies',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'A',
    ocean: 'openness'
  },
  {
    id: 18,
    question: 'I enjoy learning and adapting to new paradigms in tech',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'A',
    ocean: 'openness'
  },
  // RIASEC Social (19-24)
  {
    id: 19,
    question: 'I enjoy helping others solve their technical problems',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'S',
    ocean: 'agreeableness'
  },
  {
    id: 20,
    question: 'I like collaborating with teams and sharing knowledge',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'S',
    ocean: 'agreeableness'
  },
  {
    id: 21,
    question: 'I enjoy mentoring and teaching others technical concepts',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'S',
    ocean: 'agreeableness'
  },
  {
    id: 22,
    question: 'I like communicating complex ideas in simple terms',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'S',
    ocean: 'agreeableness'
  },
  {
    id: 23,
    question: 'I prefer working in team environments rather than solo',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'S',
    ocean: 'agreeableness'
  },
  {
    id: 24,
    question: 'I enjoy building relationships and networking in tech communities',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'S',
    ocean: 'agreeableness'
  },
  // RIASEC Enterprising (25-28)
  {
    id: 25,
    question: 'I am driven by achieving goals and delivering results',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'E',
    ocean: 'conscientiousness'
  },
  {
    id: 26,
    question: 'I like taking leadership roles and making strategic decisions',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'E',
    ocean: 'conscientiousness'
  },
  {
    id: 27,
    question: 'I enjoy working on projects with business impact',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'E',
    ocean: 'conscientiousness'
  },
  {
    id: 28,
    question: 'I am motivated by recognition and career advancement',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'E',
    ocean: 'extraversion'
  },
  // OCEAN Openness (29-30)
  {
    id: 29,
    question: 'I am open to learning completely new programming languages and frameworks',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'I',
    ocean: 'openness'
  },
  {
    id: 30,
    question: 'I like thinking about abstract concepts and theoretical problems',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'I',
    ocean: 'openness'
  },
  // OCEAN Conscientiousness (31-32)
  {
    id: 31,
    question: 'I am detail-oriented and ensure code quality and standards',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'C',
    ocean: 'conscientiousness'
  },
  {
    id: 32,
    question: 'I plan my work methodically and follow best practices',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'R',
    ocean: 'conscientiousness'
  },
  // OCEAN Extraversion (33)
  {
    id: 33,
    question: 'I prefer collaborative projects over independent work',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    riasec: 'S',
    ocean: 'extraversion'
  },
]

// Domain mappings: Data Science, AI/ML, Cybersecurity, Full Stack, DevOps, Cloud
const DOMAIN_PROFILES = {
  datascience: { name: 'Data Science', riasecMatch: ['I', 'R', 'E'] },
  aiml: { name: 'AI/ML Engineering', riasecMatch: ['I', 'R', 'A'] },
  cybersecurity: { name: 'Cybersecurity', riasecMatch: ['R', 'I', 'E'] },
  fullstack: { name: 'Full Stack Development', riasecMatch: ['R', 'A', 'S'] },
  devops: { name: 'DevOps & Cloud', riasecMatch: ['R', 'E', 'I'] },
  cloudarchitect: { name: 'Cloud Architecture', riasecMatch: ['R', 'E', 'I'] },
}

export default function CSEDomainsTest() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<any | null>(null)

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex })
  }

  const handleNext = () => {
    if (currentQuestion < CSE_DOMAIN_QUESTIONS.length - 1) {
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
    if (answeredCount < CSE_DOMAIN_QUESTIONS.length) {
      toast({
        title: 'Incomplete Test',
        description: `Please answer all ${CSE_DOMAIN_QUESTIONS.length} questions before submitting.`,
        variant: 'destructive'
      })
      return
    }

    // Calculate RIASEC scores
    const riasecScores: { [key: string]: number } = {
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    }

    CSE_DOMAIN_QUESTIONS.forEach((q) => {
      const scoreValue = (answers[q.id] || 0) + 1 // 1-5 scale
      riasecScores[q.riasec] += scoreValue
    })

    // Calculate domain fits
    const domainScores: { [key: string]: number } = {}
    Object.entries(DOMAIN_PROFILES).forEach(([domain, profile]) => {
      let score = 0
      profile.riasecMatch.forEach((type) => {
        score += riasecScores[type] || 0
      })
      domainScores[domain] = score
    })

    // Get top domain
    const topDomain = Object.entries(domainScores).sort(([, a], [, b]) => b - a)[0]
    
    setResults({
      topDomain: topDomain[0],
      domainScores,
      riasecScores,
      rankedDomains: Object.entries(domainScores)
        .sort(([, a], [, b]) => b - a)
        .map(([domain, score]) => ({
          domain,
          name: DOMAIN_PROFILES[domain as keyof typeof DOMAIN_PROFILES].name,
          score
        }))
    })

    setIsSubmitted(true)
    toast({
      title: 'Test Submitted!',
      description: 'Your CSE domain recommendations have been generated.',
    })
  }

  const progress = ((currentQuestion + 1) / CSE_DOMAIN_QUESTIONS.length) * 100
  const question = CSE_DOMAIN_QUESTIONS[currentQuestion]
  const selectedOptionIndex = answers[question.id]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/technical-group')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Technical Group
          </Button>

          <div className="text-center mb-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your CSE Domain Recommendations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Based on RIASEC + OCEAN Personality Assessment
            </p>
          </div>

          {results && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Domain Matches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.rankedDomains.map((domain: any, idx: number) => (
                    <div key={domain.domain} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          #{idx + 1} - {domain.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{domain.score}</p>
                        <p className="text-xs text-gray-500">Match Score</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>RIASEC Personality Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(results.riasecScores).map(([type, score]: [string, unknown]) => {
                      const scoreVal = typeof score === 'number' ? score : 0
                      return (
                        <div key={type} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <p className="text-xl font-bold text-purple-600">{type}</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{scoreVal}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push('/dashboard/technical-group')}
                  variant="outline"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/technical-group')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Technical Group
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            CSE Domain Assessment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            33-Question RIASEC + OCEAN Assessment
          </p>
          <p className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {CSE_DOMAIN_QUESTIONS.length} ({Math.round(progress)}%)
          </p>
          <div className="mt-2 w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedOptionIndex !== undefined ? selectedOptionIndex.toString() : ''}>
              <div className="space-y-4">
                {question.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={idx.toString()}
                      id={`option-${idx}`}
                      onClick={() => handleAnswer(question.id, idx)}
                    />
                    <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-4 mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentQuestion === CSE_DOMAIN_QUESTIONS.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Test
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Next
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
