'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Database, BrainCircuit, Bot } from 'lucide-react'

export default function DataPathwaysPage() {
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
            Data Science & AI Pathways
          </h1>
          <p className="text-on-surface-variant dark:text-gray-400 text-lg">
            Choose a specialization to view its learning roadmap and opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 bg-surface-container-lowest rounded-[2rem] cursor-pointer group"
            onClick={() => router.push('/roadmap?pathway=data-engineer')}
          >
            <CardHeader>
              <div className="mb-4 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                <Database className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-xl font-bold font-headline group-hover:text-primary transition-colors">Data Engineer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Design and build data pipelines, data warehouses, and robust architectures for processing large datasets.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 bg-surface-container-lowest rounded-[2rem] cursor-pointer group"
            onClick={() => router.push('/roadmap?pathway=machine-learning')}
          >
            <CardHeader>
              <div className="mb-4 w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-xl font-bold font-headline group-hover:text-primary transition-colors">Machine Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Develop predictive models, design algorithms, and draw insights from complex data.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 bg-surface-container-lowest rounded-[2rem] cursor-pointer group md:col-span-2 md:w-1/2 md:mx-auto"
            onClick={() => router.push('/roadmap?pathway=ai-engineer')}
          >
            <CardHeader>
              <div className="mb-4 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-xl font-bold font-headline group-hover:text-primary transition-colors">AI Engineer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Build intelligent systems, integrate large language models, and develop advanced AI applications.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
