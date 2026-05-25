'use client'

// 10th Standard Students Page
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, GraduationCap, ClipboardCheck } from 'lucide-react'

export default function TenthStandardPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            10th Standard Students
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Explore career options after completing 10th grade
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/dashboard/10th-standard/test')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Take Career Assessment Test
          </Button>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Science Stream</CardTitle>
              <CardDescription>Physics, Chemistry, Biology/Mathematics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ideal for students interested in engineering, medicine, research, and technology fields.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commerce Stream</CardTitle>
              <CardDescription>Accountancy, Business Studies, Economics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Perfect for careers in business, finance, accounting, and management.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Arts/Humanities Stream</CardTitle>
              <CardDescription>History, Geography, Literature, Psychology</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Great for careers in law, journalism, teaching, social work, and creative fields.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}