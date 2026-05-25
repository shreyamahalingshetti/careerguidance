'use client'

// Personalized Dashboard - Shows user's chosen stream and class
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, BookOpen, Code, CheckCircle2, TrendingUp, Target, Award } from 'lucide-react'

interface UserProfile {
  class: '10th-standard' | '12th-standard' | 'technical-group'
  stream?: string
  field?: string
  specialization?: string
  testCompleted: boolean
}

export default function MyDashboardPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    // Get user profile from localStorage (set after test completion)
    const readProfile = () => {
      try {
        const savedProfile = localStorage.getItem('careerProfile')
        if (savedProfile) setUserProfile(JSON.parse(savedProfile))
        else setUserProfile(null)
      } catch (e) {
        setUserProfile(null)
      }
    }

    readProfile()

    // Update profile if localStorage changes (other tabs) or when window gains focus
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'careerProfile') readProfile()
    }
    const onFocus = () => readProfile()

    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const classInfo = {
    '10th-standard': {
      title: '10th Standard Student',
      icon: GraduationCap,
      colorClasses: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-600 dark:text-blue-400'
      },
      description: 'Exploring career streams after 10th grade'
    },
    '12th-standard': {
      title: '12th Standard Student',
      icon: BookOpen,
      colorClasses: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-600 dark:text-green-400'
      },
      description: 'Choosing your field after 12th grade'
    },
    'technical-group': {
      title: 'Technical Group',
      icon: Code,
      colorClasses: {
        bg: 'bg-purple-100 dark:bg-purple-900',
        text: 'text-purple-600 dark:text-purple-400'
      },
      description: 'Pursuing technical and engineering careers'
    }
  }

  const streamNames: { [key: string]: string } = {
    science: 'Science Stream',
    commerce: 'Commerce Stream',
    arts: 'Arts/Humanities Stream',
    engineering: 'Engineering & Technology',
    medical: 'Medical & Healthcare',
    business: 'Business & Management',
    software: 'Software Development',
    datascience: 'Data Science & AI',
    cybersecurity: 'Cybersecurity',
    hardware: 'Hardware & Embedded Systems'
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">No Profile Found</CardTitle>
            <CardDescription>
              Complete a career assessment test to see your personalized dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/dashboard/10th-standard/test')}
                className="w-full"
                variant="outline"
              >
                Take 10th Standard Test
              </Button>
              <Button
                onClick={() => router.push('/dashboard/12th-standard/test')}
                className="w-full"
                variant="outline"
              >
                Take 12th Standard Test
              </Button>
              <Button
                onClick={() => router.push('/dashboard/technical-group/test')}
                className="w-full"
                variant="outline"
              >
                Take Technical Group Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const classData = classInfo[userProfile.class]
  const ClassIcon = classData.icon
  const selectedStream = userProfile.stream || userProfile.field || userProfile.specialization || 'Not Selected'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Career Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personalized career guidance profile
          </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-right mr-2 hidden sm:block">
              <div className="text-sm font-semibold">{session?.user?.name ?? 'Guest'}</div>
              <div className="text-xs opacity-90">{session?.user?.email ?? ''}</div>
              <div className="text-xs opacity-90">{userProfile?.class?.replace(/-/g, ' ') ?? ''}</div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="px-3 py-2 bg-white text-indigo-600 font-semibold rounded-md hover:bg-gray-100">Logout</button>
          </div>
        </div>

        {/* Profile Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Class Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 ${classData.colorClasses.bg} rounded-full flex items-center justify-center`}>
                  <ClassIcon className={`h-8 w-8 ${classData.colorClasses.text}`} />
                </div>
                <div>
                  <CardTitle className="text-xl">{classData.title}</CardTitle>
                  <CardDescription>{classData.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stream/Field Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Recommended Path</CardTitle>
                  <CardDescription className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                    {streamNames[selectedStream] || selectedStream}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Test Status</CardTitle>
                <Award className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.testCompleted ? 'Completed' : 'Pending'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {userProfile.testCompleted ? 'Assessment done' : 'Take test to see results'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Class</CardTitle>
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.class === '10th-standard' ? '10th' : userProfile.class === '12th-standard' ? '12th' : 'Technical'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {classData.title}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProfile.testCompleted ? '100%' : '0%'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Assessment completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/${userProfile.class}`)}>
            <CardHeader>
              <CardTitle>Explore Your Path</CardTitle>
              <CardDescription>
                Learn more about your recommended {userProfile.class === '10th-standard' ? 'stream' : userProfile.class === '12th-standard' ? 'field' : 'specialization'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Details
              </Button>
            </CardContent>
          </Card>

          {/* Retake Assessment removed per UX request */}
        </div>

        {/* View Results Button */}
        {userProfile.testCompleted && (
          <div className="mt-6 text-center">
            <Button
              size="lg"
              onClick={() => {
                const resultParam = userProfile.stream || userProfile.field || userProfile.specialization
                const paramName = userProfile.class === '10th-standard' ? 'stream' : 
                                 userProfile.class === '12th-standard' ? 'field' : 'specialization'
                router.push(`/dashboard/${userProfile.class}/result?${paramName}=${resultParam}`)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View Detailed Results
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

