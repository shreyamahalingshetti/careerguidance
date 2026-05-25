'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Code, Layout, Server, Settings } from 'lucide-react'

export default function SoftwarePathwaysPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-gray-900 p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/technical-group')}
          className="mb-6 hover:bg-surface-container-high"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Technical Group
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface font-headline dark:text-white mb-4">
            Software Engineering Pathways
          </h1>
          <p className="text-on-surface-variant dark:text-gray-400 text-lg">
            Choose a specialization to view its learning roadmap and opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 bg-surface-container-lowest rounded-[2rem] cursor-pointer group"
            onClick={() => router.push('/roadmap')}
          >
            <CardHeader>
              <div className="mb-4 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl font-bold font-headline group-hover:text-primary transition-colors">Full Stack Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Master both frontend and backend technologies to build end-to-end web applications.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 bg-surface-container-lowest rounded-[2rem] cursor-pointer group"
            onClick={() => router.push('/roadmap?pathway=frontend')}
          >
            <CardHeader>
              <div className="mb-4 w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center">
                <Layout className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle className="text-xl font-bold font-headline group-hover:text-primary transition-colors">Frontend Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Focus on building beautiful, interactive, and responsive user interfaces.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 bg-surface-container-lowest rounded-[2rem] cursor-pointer group"
            onClick={() => router.push('/roadmap?pathway=backend')}
          >
            <CardHeader>
              <div className="mb-4 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <Server className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl font-bold font-headline group-hover:text-primary transition-colors">Backend Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Build robust server-side logic, APIs, and manage databases for scalable applications.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 bg-surface-container-lowest rounded-[2rem] cursor-pointer group"
            onClick={() => router.push('/roadmap?pathway=devops')}
          >
            <CardHeader>
              <div className="mb-4 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl font-bold font-headline group-hover:text-primary transition-colors">DevOps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Streamline development pipelines, manage cloud infrastructure, and automate deployments.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
