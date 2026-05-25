'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Code, GraduationCap } from 'lucide-react'

type UserProfile = {
  class: '10th-standard' | '12th-standard' | 'technical-group'
  stream?: string
  field?: string
  specialization?: string
  testCompleted?: boolean
}

const streamNames: Record<string, string> = {
  science: 'Science Stream',
  commerce: 'Commerce Stream',
  arts: 'Arts/Humanities Stream',
  engineering: 'Engineering & Technology',
  medical: 'Medical & Healthcare',
  business: 'Business & Management',
  software: 'Software Development',
  datascience: 'Data Science & AI',
  cybersecurity: 'Cybersecurity',
  hardware: 'Hardware & Embedded Systems',
}

function titleForClass(value: UserProfile['class']) {
  if (value === '10th-standard') return '10th Standard'
  if (value === '12th-standard') return '12th Standard'
  return 'Technical Group'
}

function iconForClass(value: UserProfile['class']) {
  if (value === '10th-standard') return GraduationCap
  if (value === '12th-standard') return BookOpen
  return Code
}

export default function CareerProfilePage({
  expectedClass,
  testPath,
}: {
  expectedClass: UserProfile['class']
  testPath: string
}) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('careerProfile')
      if (!raw) {
        setProfile(null)
        return
      }
      setProfile(JSON.parse(raw))
    } catch {
      setProfile(null)
    }
  }, [])

  const ExpectedIcon = useMemo(() => iconForClass(expectedClass), [expectedClass])
  const expectedTitle = titleForClass(expectedClass)

  const matches = profile?.class === expectedClass
  const selectedStream = profile?.stream || profile?.field || profile?.specialization

  if (!profile || !matches) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <ExpectedIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{expectedTitle} Profile</CardTitle>
                <CardDescription>
                  {profile ? 'No saved profile found for this section.' : 'No saved profile found.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => router.push(testPath)}>
              Take Test
            </Button>
            <Button className="w-full" variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
            {profile && !matches && (
              <Button className="w-full" variant="secondary" onClick={() => router.push('/dashboard/my-dashboard')}>
                Open My Dashboard (Saved Profile)
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{expectedTitle} Profile</h1>
            <p className="text-sm text-muted-foreground">Your saved career profile for this section</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Dashboard
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <ExpectedIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{expectedTitle}</CardTitle>
                <CardDescription>{profile.testCompleted ? 'Test completed' : 'Test not completed'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Recommended Path</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedStream ? (streamNames[selectedStream] || selectedStream) : 'Not selected'}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => router.push('/dashboard/my-dashboard')}>Open My Dashboard</Button>
              <Button variant="outline" onClick={() => router.push(testPath)}>
                Retake Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
