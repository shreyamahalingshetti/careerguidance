'use client'

// Technical Group Test Results Page
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2, Code, Database, Shield, Cpu } from 'lucide-react'

const specializationInfo: {
  [key: string]: {
    title: string
    description: string
    icon: any
    colorClasses: { bg: string; text: string; border: string; dot: string }
    careers: string[]
    skills: string[]
  }
} = {
  software: {
    title: 'Software Development',
    description: 'Based on your answers, Software Development is the best fit for you!',
    icon: Code,
    colorClasses: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500',
      dot: 'bg-blue-500',
    },
    careers: [
      'Full-Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'Mobile App Developer',
      'DevOps Engineer',
      'Software Architect',
    ],
    skills: [
      'JavaScript, TypeScript',
      'React, Angular, Vue.js',
      'Node.js, Python, Java',
      'Database Management',
      'Cloud Platforms (AWS, Azure)',
      'Git & Version Control',
    ],
  },
  datascience: {
    title: 'Data Science & AI',
    description: 'Based on your answers, Data Science & AI is the best fit for you!',
    icon: Database,
    colorClasses: {
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500',
      dot: 'bg-purple-500',
    },
    careers: [
      'Data Scientist',
      'Machine Learning Engineer',
      'AI Engineer',
      'Data Analyst',
      'Business Intelligence Analyst',
      'Research Scientist',
    ],
    skills: [
      'Python, R Programming',
      'Machine Learning Algorithms',
      'TensorFlow, PyTorch',
      'Data Visualization',
      'Statistical Analysis',
      'Big Data Technologies',
    ],
  },
  cybersecurity: {
    title: 'Cybersecurity',
    description: 'Based on your answers, Cybersecurity is the best fit for you!',
    icon: Shield,
    colorClasses: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500',
      dot: 'bg-red-500',
    },
    careers: [
      'Cybersecurity Analyst',
      'Ethical Hacker',
      'Security Engineer',
      'Penetration Tester',
      'Security Consultant',
      'Incident Response Specialist',
    ],
    skills: [
      'Network Security',
      'Ethical Hacking',
      'Security Tools (Wireshark, Metasploit)',
      'Cryptography',
      'Risk Assessment',
      'Security Compliance',
    ],
  },
  hardware: {
    title: 'Hardware & Embedded Systems',
    description: 'Based on your answers, Hardware Engineering is the best fit for you!',
    icon: Cpu,
    colorClasses: {
      bg: 'bg-orange-100 dark:bg-orange-900',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500',
      dot: 'bg-orange-500',
    },
    careers: [
      'Hardware Engineer',
      'Embedded Systems Developer',
      'IoT Developer',
      'Electronics Engineer',
      'Firmware Developer',
      'Hardware Design Engineer',
    ],
    skills: [
      'C/C++ Programming',
      'Embedded Systems',
      'Circuit Design',
      'Microcontrollers (Arduino, Raspberry Pi)',
      'IoT Platforms',
      'Hardware Testing',
    ],
  },
}

export default function TechnicalGroupResultClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const specialization = searchParams?.get('specialization') || 'software'
  const [profile, setProfile] = useState<any | null>(null)
  const [saved, setSaved] = useState<any | null>(null)
  const [savedError, setSavedError] = useState<string | null>(null)

  const domainToSpecMap: { [key: string]: string } = {
    datascience: 'datascience',
    aiml: 'datascience',
    cybersecurity: 'cybersecurity',
    fullstack: 'software',
    devops: 'software',
    cloudarchitect: 'software',
  }

  const derivedSpecKey =
    profile?.rankedDomains && profile.rankedDomains.length > 0
      ? domainToSpecMap[profile.rankedDomains[0].domain] ?? profile.rankedDomains[0].domain
      : domainToSpecMap[specialization] ?? specialization

  const result = specializationInfo[derivedSpecKey] || specializationInfo.software
  const Icon = result.icon

  useEffect(() => {
    try {
      const raw = localStorage.getItem('careerProfile')
      if (raw) setProfile(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const res = await fetch('/api/assessments/latest?standard=technical-group')
        if (!res.ok) {
          const txt = await res.text().catch(() => '')
          throw new Error(txt || 'Failed to load saved marks')
        }
        const json = await res.json()
        if (cancelled) return
        setSaved(json?.assessment ?? null)
      } catch (e: any) {
        if (cancelled) return
        setSavedError(e?.message || 'Failed to load saved marks')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => router.push('/dashboard/technical-group')} className="mb-6">
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
            Your Technical Assessment Result
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{result.description}</p>
        </div>

        <Card className={`mb-6 border-2 ${result.colorClasses.border}`}>
          <CardHeader className="text-center">
            <div
              className={`mx-auto mb-4 w-16 h-16 ${result.colorClasses.bg} rounded-full flex items-center justify-center`}
            >
              <Icon className={`h-8 w-8 ${result.colorClasses.text}`} />
            </div>
            <CardTitle className="text-2xl sm:text-3xl">{result.title}</CardTitle>
            <CardDescription className="text-base mt-2">Recommended specialization based on your interests and preferences</CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Saved Marks (from Database)</CardTitle>
            <CardDescription>Latest saved technical assessment for your account</CardDescription>
          </CardHeader>
          <CardContent>
            {savedError ? (
              <p className="text-sm text-red-600">{savedError}</p>
            ) : !saved ? (
              <p className="text-sm text-gray-600">Loading…</p>
            ) : (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div><span className="font-semibold">Assessment ID:</span> {saved.id}</div>
                {saved.finalScore?.recommendedStream && (
                  <div><span className="font-semibold">Top Recommendation:</span> {saved.finalScore.recommendedStream}</div>
                )}
                {typeof saved.finalScore?.confidence === 'number' && (
                  <div><span className="font-semibold">Confidence:</span> {saved.finalScore.confidence}%</div>
                )}
                {typeof saved.finalScore?.flexibility === 'number' && (
                  <div><span className="font-semibold">Flexibility:</span> {saved.finalScore.flexibility}%</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Career Options</CardTitle>
            <CardDescription>Potential career paths in {result.title}</CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Key Skills to Develop</CardTitle>
            <CardDescription>Essential skills for {result.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.skills.map((skill, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${result.colorClasses.dot}`} />
                    <p className="font-medium text-gray-900 dark:text-white">{skill}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {profile?.insights && (
          <Card className="mt-6 mb-6">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Personalized Insights</CardTitle>
              <CardDescription>AI-generated summary, recommendations and next steps</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.insights.summary && (
                <p className="mb-4 text-gray-700 dark:text-gray-300">{profile.insights.summary}</p>
              )}

              {Array.isArray(profile.insights.recommendations) && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {profile.insights.recommendations.map((r: string, i: number) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(profile.insights.nextSteps) && (
                <div className="mb-2">
                  <h4 className="font-semibold mb-2">Next Steps</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {profile.insights.nextSteps.map((s: string, i: number) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {profile?.rankedDomains && (() => {
          const ranked = profile.rankedDomains as any[]
          const total = ranked.reduce((s: number, r: any) => s + (r.score || 0), 0) || 1
          const top = ranked[0]
          const topSpecKey = domainToSpecMap[top.domain] ?? top.domain
          const topSpec = specializationInfo[topSpecKey as keyof typeof specializationInfo] || specializationInfo.software
          const topPercent = (top.score / total) * 100

          return (
            <>
              <div className="mb-6 p-6 rounded-lg border-2 border-indigo-300 bg-indigo-50 dark:bg-gray-900 dark:border-indigo-700 text-center">
                <div className="text-sm uppercase text-gray-600">Top Recommended Cluster</div>
                <div className="text-3xl font-bold mt-2 text-indigo-800 dark:text-white">{topSpec.title}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">Fit Score: {topPercent.toFixed(1)}%</div>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Cluster Ranking Summary</CardTitle>
                  <CardDescription>Top domain matches with fit percentages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ranked.slice(0, 5).map((r: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded bg-gray-50 dark:bg-gray-800 flex justify-between items-center"
                      >
                        <div className="text-sm text-gray-800 dark:text-white">{idx + 1}. {r.name || r.domain}</div>
                        <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{((r.score / total) * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6 border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">{`The ${topSpec.title} Specialist`}</CardTitle>
                  <CardDescription>A concise profile and targeted recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-700 dark:text-gray-300">
                    {profile.insights?.summary ??
                      `You show strong alignment with ${topSpec.title}. Focus on ${topSpec.skills.slice(0, 3).join(', ')} and begin hands-on projects to showcase skills.`}
                  </p>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Top Clusters</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {Object.entries(profile.riasecScores || {})
                        .sort((a: any, b: any) => (b[1] as number) - (a[1] as number))
                        .slice(0, 4)
                        .map((r: any, i: number) => (
                          <li key={i}>{`${r[0]} — score ${Math.round(r[1])}`}</li>
                        ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Recommended Careers</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {topSpec.careers.slice(0, 6).map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ol>
                  </div>

                  {Array.isArray(profile.insights?.recommendations) && (
                    <div className="mb-2">
                      <h4 className="font-semibold mb-2">AI Recommendations</h4>
                      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                        {profile.insights.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )
        })()}

        <div className="mt-6 flex justify-center">
          <Button onClick={() => router.push('/my-dashboard')} size="lg" className="bg-purple-600 hover:bg-purple-700">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
