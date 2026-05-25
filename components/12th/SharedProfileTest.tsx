"use client"

import React, { useState, useCallback, FC, useMemo, useEffect } from 'react'
import { PROFILE_QUESTIONS, SCALES } from '@/lib/constants'

type Answers = { [key: string]: number }
interface ISummaryScore { [key: string]: number }
interface IClusterFit { cluster: string; score: number; breakdown?: { [key: string]: number } }

interface SharedProps {
  title: string
  headerColorClass?: string
  buttonAccentClass?: string
  clusterWeights: { [cluster: string]: any }
  stream?: string
}

const calculateNormalizedScores = (answers: Answers): ISummaryScore => {
  const factorSums: { [key: string]: number } = {}
  const factorCounts: { [key: string]: number } = {}

  PROFILE_QUESTIONS.forEach((q) => {
    const rawScore = answers[q.id]
    if (rawScore === undefined || rawScore === -1) return
    const finalScore = q.isReversed ? 6 - rawScore : rawScore
    factorSums[q.type] = (factorSums[q.type] || 0) + finalScore
    factorCounts[q.type] = (factorCounts[q.type] || 0) + 1
  })

  const normalizedScores: ISummaryScore = {}
  Object.entries(factorSums).forEach(([type, sum]) => {
    const average = sum / factorCounts[type]
    normalizedScores[type] = parseFloat((((average - 1) / 4) * 100).toFixed(1))
  })
  return normalizedScores
}

const mapToCareerClusters = (scores: ISummaryScore, clusterWeights: any): IClusterFit[] => {
  const results: IClusterFit[] = []
  for (const [cluster, weights] of Object.entries(clusterWeights as Record<string, any>)) {
    let weightedSum = 0
    let breakdown: { [trait: string]: number } = {}
    Object.entries(weights as Record<string, any>).forEach(([trait, weight]) => {
      if (trait === 'TotalWeight') return
      const userScore = scores[trait] !== undefined ? scores[trait] : 50
      weightedSum += userScore * (weight as number)
      breakdown[trait] = parseFloat((userScore * (weight as number)).toFixed(1))
    })
    const totalAbsoluteWeight = (weights as Record<string, any>).TotalWeight
    const finalScore = weightedSum / totalAbsoluteWeight
    results.push({ cluster, score: parseFloat(finalScore.toFixed(1)), breakdown })
  }
  results.sort((a, b) => b.score - a.score)
  return results
}

const SharedProfileTest: FC<SharedProps> = ({ title, headerColorClass = 'bg-indigo-700', buttonAccentClass = 'bg-indigo-600', clusterWeights, stream = 'General' }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>(Array(PROFILE_QUESTIONS.length).fill(-1).reduce((acc, _, i) => ({ ...acc, [PROFILE_QUESTIONS[i].id]: -1 }), {}))
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<IClusterFit[] | null>(null)
  const [aiInsights, setAIInsights] = useState<any | null>(null)
  const [aiError, setAIError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ state: 'idle' | 'saving' | 'saved' | 'error'; message?: string; assessmentId?: string }>(
    { state: 'idle' }
  )
  const [shuffledQuestions] = useState(() => [...PROFILE_QUESTIONS].sort(() => Math.random() - 0.5))
  // Timer for the quiz (15 minutes = 900 seconds)
  const QUIZ_DURATION_SECONDS = 15 * 60
  const [secondsLeft, setSecondsLeft] = useState<number>(QUIZ_DURATION_SECONDS)

  const totalQuestions = shuffledQuestions.length
  const currentQuestion = useMemo(() => shuffledQuestions[currentQIndex], [currentQIndex, shuffledQuestions])
  const isLastQuestion = currentQIndex === totalQuestions - 1
  const labels = currentQuestion.factor === 'RIASEC' ? SCALES.Interest.labels : SCALES.Agreement.labels

  const handleSubmitTest = useCallback(async () => {
    setIsLoading(true)
    setSaveStatus({ state: 'saving' })
    const normalizedScores = calculateNormalizedScores(answers)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const clusterFits = mapToCareerClusters(normalizedScores, clusterWeights)
      setResults(clusterFits)
      // POST normalized scores and clusterFits to the server to fetch AI insights.
      let insightsVar = null
      try {
        setAIError(null)
        const res = await fetch('/api/career-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ normalizedScores, clusterFits, stream }),
        })
        if (res.ok) {
          const json = await res.json()
          insightsVar = json
          setAIInsights(json)
        } else {
          // Not OK: capture server error message
          try {
            const txt = await res.text()
            setAIError(`Server error: ${txt}`)
          } catch (e) {
            setAIError('Server returned an error')
          }
        }
      } catch (fetchErr) {
        console.error('Network error while calling AI route:', fetchErr)
        setAIError('Network error contacting AI route')
      }
      // Persist a careerProfile so the dashboard reflects completion
      try {
        const elapsedSeconds = QUIZ_DURATION_SECONDS - secondsLeft
        const profileToSave = {
          class: '12th-standard',
          stream,
          testCompleted: true,
          normalizedScores,
          results: clusterFits,
          insights: (typeof insightsVar !== 'undefined' ? insightsVar : null),
          elapsedSeconds
        }
        localStorage.setItem('careerProfile', JSON.stringify(profileToSave))
      } catch (err) {
        console.warn('Unable to persist careerProfile to localStorage', err)
      }

      // Save to DB (Supabase via Prisma)
      try {
        const profileAnswers: Record<string, number | null> = {}
        for (const q of shuffledQuestions) {
          const v = answers[q.id]
          profileAnswers[q.id] = v === undefined || v === -1 ? null : v
        }

        const res = await fetch('/api/assessments/12th/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            standard: '12th-standard',
            region: stream.toLowerCase(),
            timeExpired: secondsLeft <= 0,
            profileAnswers,
          }),
        })

        if (res.ok) {
          const json = await res.json()
          setSaveStatus({ state: 'saved', assessmentId: json?.assessmentId, message: 'Marks saved.' })
        } else {
          const txt = await res.text().catch(() => '')
          let msg = 'Failed to save marks.'
          try {
            const json = JSON.parse(txt)
            if (json && typeof json.error === 'string') msg = json.error
          } catch (e) {
            if (txt) msg = txt
          }
          setSaveStatus({ state: 'error', message: msg })
        }
      } catch (e) {
        setSaveStatus({ state: 'error', message: 'Network error saving marks.' })
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [answers, clusterWeights, stream, QUIZ_DURATION_SECONDS, secondsLeft, shuffledQuestions])

  useEffect(() => {
    // Start countdown timer when the quiz interface is active and not submitted
    if (isSubmitted) return
    setSecondsLeft(QUIZ_DURATION_SECONDS)
    const timer = setInterval(() => {
      setSecondsLeft(prev => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isSubmitted, QUIZ_DURATION_SECONDS])

  useEffect(() => {
    if (secondsLeft === 0 && !isSubmitted) {
      // Auto-submit when time expires
      handleSubmitTest()
    }
  }, [secondsLeft, isSubmitted, handleSubmitTest])

  const handleAnswerSelect = useCallback((qId: string, score: number) => {
    // Record the selected answer, but do not auto-advance.
    // Users should move forward only by clicking "Next Question".
    setAnswers(prev => ({ ...prev, [qId]: score }))
  }, [])

  const handleNavigation = useCallback((direction: number) => {
    const newIndex = currentQIndex + direction
    if (newIndex >= 0 && newIndex < totalQuestions) setCurrentQIndex(newIndex)
  }, [currentQIndex, totalQuestions])

  const handleSkip = useCallback(() => {
    if (isLoading) return
    if (isLastQuestion) {
      handleSubmitTest()
      return
    }
    handleNavigation(1)
  }, [isLastQuestion, isLoading, handleNavigation, handleSubmitTest])

  const renderInterface = () => (
    <div className="p-8 bg-white rounded-xl shadow-lg">
      <header className="mb-6 flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <span className="text-sm font-semibold uppercase px-3 py-1 rounded-full bg-blue-100 text-blue-700">{currentQuestion.factor} - {currentQuestion.type}</span>
          <h3 className="text-xl font-bold mt-1 text-gray-800">Question {currentQIndex + 1} of {totalQuestions}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Answered:</p>
          <p className="text-lg font-bold text-indigo-600">{Object.values(answers).filter(a => a !== -1).length}/{totalQuestions}</p>
          <p className={`text-sm font-semibold mt-1 ${secondsLeft <= 60 ? 'text-red-500' : 'text-gray-700'}`}>{new Date(secondsLeft * 1000).toISOString().substr(14, 5)}</p>
        </div>
      </header>

      <p className="text-lg mb-8 text-gray-900 font-medium">{currentQuestion.text}</p>

      <div className="flex justify-between items-center space-x-2 p-4 bg-gray-50 rounded-lg shadow-inner">
        {labels.map((label, index) => {
          const scoreValue = index + 1
          const isSelected = answers[currentQuestion.id] === scoreValue
          return (
            <div key={scoreValue} className="flex flex-col items-center flex-1">
              <button onClick={() => handleAnswerSelect(currentQuestion.id, scoreValue)} disabled={isLoading} className={`w-12 h-12 rounded-full text-lg font-bold transition duration-200 shadow-md flex items-center justify-center ${isSelected ? `${buttonAccentClass} text-white transform scale-110` : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-blue-50'}`} title={label}>{scoreValue}</button>
              <p className="text-xs mt-2 text-center text-gray-500 max-w-[80%]">{label}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={() => handleNavigation(-1)} disabled={currentQIndex === 0 || isLoading} className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition shadow-md">&larr; Previous</button>
        <div className="flex gap-3">
          <button onClick={handleSkip} disabled={isLoading} className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 transition shadow-md">
            Skip
          </button>
          <button onClick={isLastQuestion ? handleSubmitTest : () => handleNavigation(1)} disabled={answers[currentQuestion.id] === -1 || isLoading} className={`px-8 py-3 font-bold rounded-lg transition duration-200 shadow-xl flex items-center ${answers[currentQuestion.id] === -1 ? 'bg-indigo-300 text-white cursor-not-allowed' : isLastQuestion ? `${buttonAccentClass} hover:opacity-90 text-white` : 'bg-green-600 hover:bg-green-700 text-white'}`}>
            {isLoading ? 'Analyzing...' : (isLastQuestion ? 'Final Submission' : 'Next Question →')}
          </button>
        </div>
      </div>
    </div>
  )

  const renderResults = () => {
    if (!results) return null
    const topCluster = results[0]
    const attempted = Object.values(answers).filter((a) => a !== -1).length
    const skipped = totalQuestions - attempted
    return (
      <div className="p-10 text-center bg-white rounded-xl shadow-2xl">
        <h2 className="text-4xl font-extrabold text-blue-700 mb-4">{title} — Career Path Analysis</h2>
        <p className="text-xl text-gray-600 mb-8">Your profile has been matched against relevant career clusters.</p>

        <div className="mb-6 p-4 rounded-lg border bg-gray-50 text-left">
          <div className="text-sm text-gray-600">Marks</div>
          <div className="text-lg font-semibold text-gray-900">Top Fit Score: {topCluster.score}%</div>
          <div className="text-sm text-gray-700">Attempted: {attempted}/{totalQuestions} · Skipped: {skipped}</div>
          {saveStatus.state === 'saving' && <div className="text-sm text-gray-600 mt-2">Saving marks…</div>}
          {saveStatus.state === 'saved' && (
            <div className="text-sm text-green-700 mt-2">
              {saveStatus.message} {saveStatus.assessmentId ? `Assessment ID: ${saveStatus.assessmentId}` : ''}
            </div>
          )}
          {saveStatus.state === 'error' && <div className="text-sm text-red-600 mt-2">{saveStatus.message}</div>}
        </div>
        <div className={`bg-blue-50 border-4 ${['Engineering','Medicine','Research'].includes(topCluster.cluster) ? 'border-blue-800' : 'border-blue-600'} p-6 rounded-xl mb-8 shadow-lg`}>
          <p className="text-2xl font-semibold text-gray-700">Top Recommended Cluster</p>
          <h3 className={`text-5xl font-black ${['Engineering','Medicine','Research'].includes(topCluster.cluster) ? 'text-blue-900' : 'text-blue-800'} mt-2`}>{topCluster.cluster}</h3>
          <p className="text-lg text-gray-600 mt-2">Fit Score: <span className={`font-bold ${['Engineering','Medicine','Research'].includes(topCluster.cluster) ? 'text-blue-900' : 'text-indigo-600'}`}>{topCluster.score}%</span></p>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Cluster Ranking Summary</h3>

        <div className="space-y-4">
          {results.map((r, index) => {
            const isHighlighted = index === 0
            const isScienceCluster = ['Engineering','Medicine','Research'].includes(r.cluster)
            return (
            <div key={r.cluster} className={`p-4 rounded-lg flex justify-between items-center ${isHighlighted ? 'bg-indigo-100' : 'bg-gray-100'}`}>
              <div>
                <p className={`font-bold text-lg ${isScienceCluster ? 'text-blue-900' : 'text-gray-800'}`}>{index + 1}. {r.cluster.replace(/([A-Z])/g, ' $1').trim()}</p>
              </div>
              <span className={`text-3xl font-extrabold ${isHighlighted ? 'text-indigo-700' : (isScienceCluster ? 'text-blue-900' : 'text-gray-700')}`}>{r.score}%</span>
            </div>
          )})}
        </div>

        <div className="mt-8">
          {/* AI Insights Display */}
          {aiError ? (
            <div className="p-4 border rounded-md bg-yellow-50 text-sm text-red-600 mb-4">{aiError}</div>
          ) : (aiInsights && (
            <div className="p-6 bg-white rounded-lg shadow-inner mb-6">
              {aiInsights?.fallback && (
                <div className="mb-3 text-sm text-yellow-600 border border-yellow-100 rounded p-2 bg-yellow-50">Note: Showing local fallback insights because AI SDK is not available.</div>
              )}
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{aiInsights.personaTitle}</h3>
              <p className="text-gray-700 mb-4">{aiInsights.summary}</p>
              {aiInsights.topClusters?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold">Top Clusters</h4>
                  <ul className="list-disc pl-6 text-left text-gray-700">
                    {aiInsights.topClusters.map((c: any) => <li key={c.name}>{c.name} — {c.explanation}</li>)}
                  </ul>
                </div>
              )}
              {aiInsights.recommendedCareers?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold">Recommended Careers</h4>
                  <ul className="list-decimal pl-6 text-left text-gray-700">
                    {aiInsights.recommendedCareers.map((rc: any, i: number) => <li key={`${rc.name}-${i}`}>{rc.name} — {rc.fitReason}</li>)}
                  </ul>
                </div>
              )}
              {aiInsights.nextSteps?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold">Next Steps</h4>
                  <ul className="list-disc pl-6 text-left text-gray-700">
                    {aiInsights.nextSteps.map((step: string, i: number) => <li key={`ns-${i}`}>{step}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-4 justify-center">
          <button onClick={() => (window.location.href = '/my-dashboard')} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-md">Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white rounded-xl shadow-2xl min-h-[70vh]">
      <header className={`${headerColorClass} p-4 rounded-t-xl bg-gray-50`}> 
        <h1 className="text-2xl font-bold text-black dark:text-white text-center selection:text-white">{title}</h1>
      </header>
      {isSubmitted ? renderResults() : renderInterface()}
    </div>
  )
}

export default SharedProfileTest