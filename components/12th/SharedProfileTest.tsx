"use client"

import React, { useState, useCallback, FC, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PROFILE_QUESTIONS, SCALES } from '@/lib/constants'
import { sampleRiasecQuestions } from '@/lib/riasec-sampler'

type Answers = { [key: string]: number }

interface SharedProps {
  title: string
  headerColorClass?: string
  buttonAccentClass?: string
  stream?: string
}

export default function SharedProfileTest({
  title,
  headerColorClass = 'bg-indigo-700',
  buttonAccentClass = 'bg-indigo-600',
  stream = 'Science',
}: SharedProps) {
  const router = useRouter()
  const [currentQIndex, setCurrentQIndex] = useState(0)
  
  // Subject prerequisite toggles for 12th standard eligibility (Direct Subject Selections)
  const [hasMath, setHasMath] = useState(false)
  const [hasBiology, setHasBiology] = useState(false)
  const [hasCs, setHasCs] = useState(false)

  // Randomly sample 3 questions per RIASEC trait (18 total) from 60-question pool
  const riasecQuestions = useMemo(
    () => sampleRiasecQuestions(PROFILE_QUESTIONS.filter((q) => q.factor === 'RIASEC'), 3),
    []
  )

  const [answers, setAnswers] = useState<Answers>(
    riasecQuestions.reduce((acc, q) => ({ ...acc, [q.id]: -1 }), {})
  )

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ state: 'idle' | 'saving' | 'saved' | 'error'; message?: string }>({ state: 'idle' })

  // Quiz Timer (15 minutes = 900s)
  const QUIZ_DURATION_SECONDS = 15 * 60
  const [secondsLeft, setSecondsLeft] = useState<number>(QUIZ_DURATION_SECONDS)

  const totalQuestions = riasecQuestions.length
  const currentQuestion = riasecQuestions[currentQIndex]
  const isLastQuestion = currentQIndex === totalQuestions - 1
  const labels = SCALES.Interest.labels

  const isScience = stream.toLowerCase() === 'science'
  const isScienceSubjectValid = !isScience || (hasMath || hasBiology || hasCs)

  const handleSubmitTest = useCallback(async () => {
    if (isScience && (!hasMath && !hasBiology && !hasCs)) {
      setSaveStatus({
        state: 'error',
        message: 'Please select at least one Science subject to evaluate career eligibility.'
      })
      return
    }

    setIsLoading(true)
    setSaveStatus({ state: 'saving' })

    try {
      const profileAnswers: Record<string, number | null> = {}
      for (const q of riasecQuestions) {
        const v = answers[q.id]
        profileAnswers[q.id] = v === undefined || v === -1 ? 3 : v
      }

      const res = await fetch('/api/assessments/12th/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standard: '12th-standard',
          stream: stream.toLowerCase(),
          hasMath,
          hasBiology,
          hasCs,
          timeExpired: secondsLeft <= 0,
          profileAnswers,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        const resultData = json.data || json

        // Store results for ResultClient UI
        localStorage.setItem(
          'careerProfile',
          JSON.stringify({
            class: '12th-standard',
            stream,
            testCompleted: true,
            pipelineResult: resultData,
          })
        )

        setSaveStatus({ state: 'saved', message: 'Assessment submitted successfully.' })
        setIsSubmitted(true)

        setTimeout(() => {
          router.push(`/dashboard/12th-standard/result?stream=${stream.toLowerCase()}`)
        }, 1500)
      } else {
        const txt = await res.text().catch(() => '')
        setSaveStatus({ state: 'error', message: txt || 'Failed to submit assessment.' })
      }
    } catch (e) {
      setSaveStatus({ state: 'error', message: 'Network error submitting assessment.' })
    } finally {
      setIsLoading(false)
    }
  }, [answers, stream, hasMath, hasBiology, hasCs, isScience, secondsLeft, riasecQuestions, router])

  useEffect(() => {
    if (isSubmitted) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isSubmitted])

  useEffect(() => {
    if (secondsLeft === 0 && !isSubmitted) {
      handleSubmitTest()
    }
  }, [secondsLeft, isSubmitted, handleSubmitTest])

  const handleAnswerSelect = useCallback((qId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: score }))
  }, [])

  const handleNavigation = useCallback((direction: number) => {
    if (direction > 0 && isScience && (!hasMath && !hasBiology && !hasCs)) {
      setSaveStatus({
        state: 'error',
        message: 'Please select at least one Science subject to evaluate career eligibility.'
      })
      return
    }
    setSaveStatus({ state: 'idle' })
    const newIndex = currentQIndex + direction
    if (newIndex >= 0 && newIndex < totalQuestions) setCurrentQIndex(newIndex)
  }, [currentQIndex, totalQuestions, isScience, hasMath, hasBiology, hasCs])

  if (isSubmitted) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-xl text-center max-w-xl mx-auto my-8 border border-gray-100">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">✓</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Assessment Completed!</h2>
        <p className="text-gray-600 font-medium mb-4">
          Calculating your official O*NET RIASEC Pearson Match Scores...
        </p>
        <p className="text-sm text-blue-600 font-semibold">Redirecting to your traceable results dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-xl max-w-4xl mx-auto my-6 border border-gray-100">
      {/* Top Stream Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            Official O*NET 12th Assessment ({stream})
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-2">{title}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium">Answered Progress:</p>
          <p className="text-xl font-extrabold text-indigo-600">
            {Object.values(answers).filter((a) => a !== -1).length} / {totalQuestions}
          </p>
          <p className={`text-xs font-bold mt-1 ${secondsLeft <= 60 ? 'text-red-500' : 'text-gray-600'}`}>
            Time Left: {new Date(secondsLeft * 1000).toISOString().substring(14, 19)}
          </p>
        </div>
      </div>

      {/* Direct Subject Multi-Select for 12th Science Stream */}
      {currentQIndex === 0 && isScience && (
        <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">
            Science Subject Eligibility Selection:
          </p>
          <p className="text-xs text-gray-600 mb-3">
            Select all subjects studied in Class 12th (Multi-select enabled):
          </p>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-800">
            <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-blue-400">
              <input
                type="checkbox"
                checked={hasMath}
                onChange={(e) => {
                  setHasMath(e.target.checked)
                  setSaveStatus({ state: 'idle' })
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>Mathematics</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-blue-400">
              <input
                type="checkbox"
                checked={hasBiology}
                onChange={(e) => {
                  setHasBiology(e.target.checked)
                  setSaveStatus({ state: 'idle' })
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>Biology</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-blue-400">
              <input
                type="checkbox"
                checked={hasCs}
                onChange={(e) => {
                  setHasCs(e.target.checked)
                  setSaveStatus({ state: 'idle' })
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>Computer Science / Informatics Practices</span>
            </label>
          </div>
        </div>
      )}

      {/* Question Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase">
            Interest Dimension: {currentQuestion.type} ({currentQuestion.id})
          </span>
          <span className="text-xs font-bold text-gray-400">
            Question {currentQIndex + 1} of {totalQuestions}
          </span>
        </div>
        <p className="text-xl font-bold text-gray-900 leading-snug">{currentQuestion.text}</p>
      </div>

      {/* 5-Point Likert Rating Buttons */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4 p-4 bg-gray-50 rounded-xl mb-8 border border-gray-100">
        {labels.map((label, index) => {
          const scoreValue = index + 1
          const isSelected = answers[currentQuestion.id] === scoreValue
          return (
            <div key={scoreValue} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleAnswerSelect(currentQuestion.id, scoreValue)}
                disabled={isLoading}
                className={`w-12 h-12 rounded-full font-extrabold text-base transition-all duration-200 shadow-sm flex items-center justify-center ${
                  isSelected
                    ? `${buttonAccentClass} text-white scale-110 shadow-md ring-2 ring-offset-2 ring-blue-500`
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                {scoreValue}
              </button>
              <span className="text-[10px] sm:text-xs mt-2 text-center text-gray-500 font-medium leading-tight hidden sm:block">
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Error / Status Bar */}
      {saveStatus.state === 'error' && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200">
          {saveStatus.message}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => handleNavigation(-1)}
          disabled={currentQIndex === 0 || isLoading}
          className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 disabled:opacity-40 transition"
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={isLastQuestion ? handleSubmitTest : () => handleNavigation(1)}
          disabled={answers[currentQuestion.id] === -1 || isLoading}
          className={`px-7 py-3 font-extrabold rounded-xl transition duration-200 shadow-md text-white ${
            answers[currentQuestion.id] === -1
              ? 'bg-gray-300 cursor-not-allowed'
              : isLastQuestion
              ? `${buttonAccentClass} hover:opacity-90`
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isLoading ? 'Processing Pearson Engine...' : isLastQuestion ? 'Submit & Calculate Match' : 'Next Question →'}
        </button>
      </div>
    </div>
  )
}