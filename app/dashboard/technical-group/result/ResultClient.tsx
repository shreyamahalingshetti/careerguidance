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
  fullstack: {
    title: 'Software Engineering & Full Stack',
    description: 'Based on your vocational interest profile, Software Engineering & Full Stack is your best match!',
    icon: Code,
    colorClasses: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500',
      dot: 'bg-blue-500',
    },
    careers: [
      'Full-Stack Developer',
      'Backend Engineer',
      'Frontend Developer',
      'Software Architect',
      'Mobile App Developer',
      'DevOps Automation Engineer',
    ],
    skills: [
      'JavaScript, TypeScript',
      'React, Next.js, Node.js',
      'REST APIs & GraphQL',
      'SQL & NoSQL Databases',
      'Git & CI/CD Pipelines',
      'Software Design Patterns',
    ],
  },
  datascience: {
    title: 'Data Science & AI/ML',
    description: 'Based on your vocational interest profile, Data Science & AI/ML is your best match!',
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
      'AI Research Engineer',
      'Data Analyst',
      'Quantitative Analyst',
      'Business Intelligence Engineer',
    ],
    skills: [
      'Python, R Programming',
      'Scikit-Learn, TensorFlow, PyTorch',
      'Data Visualization (Matplotlib, Seaborn)',
      'Statistical Analysis & Linear Algebra',
      'SQL & Big Data Tools (Spark)',
      'Model Evaluation & Tuning',
    ],
  },
  cybersecurity: {
    title: 'Cybersecurity & InfoSec',
    description: 'Based on your vocational interest profile, Cybersecurity & InfoSec is your best match!',
    icon: Shield,
    colorClasses: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500',
      dot: 'bg-red-500',
    },
    careers: [
      'Cybersecurity Analyst',
      'Ethical Hacker / Pen Tester',
      'Security Engineer',
      'Information Security Manager',
      'Incident Response Specialist',
      'Security Compliance Auditor',
    ],
    skills: [
      'Network Security & Protocols',
      'Ethical Hacking Tools (Wireshark, Metasploit)',
      'Cryptography & IAM',
      'Vulnerability Assessment',
      'Security Auditing & Compliance',
      'OS Hardening (Linux/Windows)',
    ],
  },
  devops: {
    title: 'Cloud Systems & DevOps',
    description: 'Based on your vocational interest profile, Cloud Systems & DevOps is your best match!',
    icon: Cpu,
    colorClasses: {
      bg: 'bg-indigo-100 dark:bg-indigo-900',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500',
      dot: 'bg-indigo-500',
    },
    careers: [
      'DevOps Engineer',
      'Cloud Solutions Architect',
      'Site Reliability Engineer (SRE)',
      'Infrastructure Engineer',
      'Cloud Operations Specialist',
      'Systems Administrator',
    ],
    skills: [
      'Docker & Kubernetes',
      'AWS / GCP / Azure Cloud Services',
      'Infrastructure as Code (Terraform)',
      'Linux Administration & Bash',
      'CI/CD Tools (GitHub Actions)',
      'Monitoring & Alerting (Prometheus, Grafana)',
    ],
  },
  uiux: {
    title: 'UI/UX & Web Interface Engineering',
    description: 'Based on your vocational interest profile, UI/UX & Web Interface Engineering is your best match!',
    icon: Code,
    colorClasses: {
      bg: 'bg-pink-100 dark:bg-pink-900',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-500',
      dot: 'bg-pink-500',
    },
    careers: [
      'UI/UX Designer',
      'Front-End Web Engineer',
      'Product Designer',
      'Design System Engineer',
      'UX Researcher',
      'Interactive Media Developer',
    ],
    skills: [
      'Figma & Adobe XD',
      'HTML5, CSS3, Tailwind CSS',
      'Component Libraries & Storybook',
      'User Research & Wireframing',
      'Responsive Web Design',
      'Usability Testing & Accessibility (a11y)',
    ],
  },
  hardware: {
    title: 'Hardware & Embedded Systems',
    description: 'Based on your vocational interest profile, Hardware & Embedded Systems is your best match!',
    icon: Cpu,
    colorClasses: {
      bg: 'bg-orange-100 dark:bg-orange-900',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500',
      dot: 'bg-orange-500',
    },
    careers: [
      'Embedded Systems Engineer',
      'IoT Developer',
      'Hardware Engineer',
      'Robotics Engineer',
      'Firmware Developer',
      'Microcontroller Systems Architect',
    ],
    skills: [
      'C / C++ Embedded Programming',
      'Microcontrollers (Arduino, STM32, ESP32)',
      'Circuit Design & PCB Layout',
      'Real-Time Operating Systems (RTOS)',
      'Hardware Troubleshooting & Oscilloscopes',
      'Sensors & Communication Protocols (I2C, SPI, UART)',
    ],
  },
}

export default function TechnicalGroupResultClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const specialization = searchParams?.get('specialization') || 'fullstack'
  const [profile, setProfile] = useState<any | null>(null)
  const [saved, setSaved] = useState<any | null>(null)
  const [savedError, setSavedError] = useState<string | null>(null)

  const domainToSpecMap: { [key: string]: string } = {
    datascience: 'datascience',
    aiml: 'datascience',
    cybersecurity: 'cybersecurity',
    fullstack: 'fullstack',
    software: 'fullstack',
    devops: 'devops',
    cloudarchitect: 'devops',
    uiux: 'uiux',
    hardware: 'hardware',
  }

  const derivedSpecKey =
    profile?.recResult?.recommendedDomainKey ??
    profile?.rankedDomains?.[0]?.key ??
    domainToSpecMap[specialization] ??
    'fullstack'

  const result = specializationInfo[derivedSpecKey] || specializationInfo.fullstack
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

  const riasecScores = profile?.riasecScores || profile?.recResult?.studentRiasecVector || {}
  const rankedDomains = profile?.rankedDomains || profile?.recResult?.rankedDomains || []

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
            <CardDescription className="text-base mt-2">
              Recommended specialization based on Pearson vocational interest vector alignment
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 6D RIASEC Interest Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Your Technical Interest Profile (6D RIASEC)</CardTitle>
            <CardDescription>Average interest score (1.0 to 5.0 scale) across 18 technical interest items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
              {[
                { label: 'Realistic (R)', key: 'R', color: 'bg-amber-100 text-amber-900 border-amber-300' },
                { label: 'Investigative (I)', key: 'I', color: 'bg-blue-100 text-blue-900 border-blue-300' },
                { label: 'Artistic (A)', key: 'A', color: 'bg-pink-100 text-pink-900 border-pink-300' },
                { label: 'Social (S)', key: 'S', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                { label: 'Enterprising (E)', key: 'E', color: 'bg-purple-100 text-purple-900 border-purple-300' },
                { label: 'Conventional (C)', key: 'C', color: 'bg-slate-100 text-slate-900 border-slate-300' },
              ].map(({ label, key, color }) => {
                const score = riasecScores[key] ?? 3.0
                return (
                  <div key={key} className={`p-3 rounded-lg border ${color} flex flex-col justify-between`}>
                    <div className="text-xs font-bold">{label}</div>
                    <div className="text-2xl font-black mt-1">{typeof score === 'number' ? score.toFixed(2) : score}</div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              ℹ️ <strong>Understanding Scores</strong>: Measures vocational interest alignment only. Does not reflect intelligence, academic marks, or job eligibility.
            </p>
          </CardContent>
        </Card>

        {/* Top Technical Domain Matches Card */}
        {rankedDomains.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Your Top Technical Matches (Pearson Vector Fit)</CardTitle>
              <CardDescription>Ranked technical domains based on correlation against official O*NET occupational profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rankedDomains.map((r: any, idx: number) => {
                  const fit = typeof r.fitPercentage === 'number' ? r.fitPercentage : 50.0
                  const isTop = idx === 0
                  const isSecond = idx === 1

                  return (
                    <div
                      key={r.key || idx}
                      className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                        isTop
                          ? 'bg-purple-50 border-purple-300 dark:bg-purple-950/40 dark:border-purple-800'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-gray-900 dark:text-white">
                            {idx + 1}. {r.name}
                          </span>
                          {isTop ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              🏆 Top Recommended
                            </span>
                          ) : isSecond ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              ⭐ Alternative Match
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{r.description}</p>
                      </div>

                      <div className="flex items-baseline gap-2 self-end sm:self-center">
                        <span className="text-2xl font-black text-purple-700 dark:text-purple-300">{fit}%</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {r.alignmentBand || (fit >= 75 ? 'Strong Alignment' : fit >= 50 ? 'Moderate Alignment' : 'Low Alignment')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Saved Assessment Marks</CardTitle>
            <CardDescription>Latest saved technical assessment in database</CardDescription>
          </CardHeader>
          <CardContent>
            {savedError ? (
              <p className="text-sm text-red-600">{savedError}</p>
            ) : !saved ? (
              <p className="text-sm text-gray-600">Loading saved marks…</p>
            ) : (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div><span className="font-semibold">Assessment ID:</span> {saved.id}</div>
                {saved.finalScore?.recommendedStream && (
                  <div><span className="font-semibold">Top Recommendation:</span> {saved.finalScore.recommendedStream}</div>
                )}
                {typeof saved.finalScore?.confidence === 'number' && (
                  <div><span className="font-semibold">Interest Alignment Confidence:</span> {saved.finalScore.confidence}%</div>
                )}
                {typeof saved.finalScore?.flexibility === 'number' && (
                  <div><span className="font-semibold">Path Flexibility:</span> {saved.finalScore.flexibility}%</div>
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

        <Card className="mb-6">
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
              <CardDescription>Dynamic guidance and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.insights.summary && (
                <p className="mb-4 text-gray-700 dark:text-gray-300">{profile.insights.summary}</p>
              )}

              {Array.isArray(profile.insights.recommendations) && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Actionable Recommendations</h4>
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

        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Button onClick={() => router.push('/my-dashboard')} size="lg" className="bg-purple-600 hover:bg-purple-700">
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => {
              const url = derivedSpecKey === 'fullstack' 
                ? '/dashboard/technical-group/software-pathways'
                : derivedSpecKey === 'datascience' 
                ? '/dashboard/technical-group/data-pathways'
                : derivedSpecKey === 'cybersecurity'
                ? '/roadmap?pathway=cybersecurity'
                : '/dashboard/technical-group';
              router.push(url);
            }} 
            size="lg" 
            variant="outline" 
            className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full font-bold shadow-sm"
          >
            View Pathways
          </Button>
        </div>
      </div>
    </div>
  )
}

