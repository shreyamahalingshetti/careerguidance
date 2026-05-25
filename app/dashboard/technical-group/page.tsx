'use client'

// Technical Group Page
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Code, ClipboardCheck } from 'lucide-react'

export default function TechnicalGroupPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-gray-900 p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-6 hover:bg-surface-container-high"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-8 py-8 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="mx-auto mb-4 w-16 h-16 bg-primary-container rounded-[2rem] flex items-center justify-center relative z-10 shadow-[0_8px_16px_-6px_rgba(15,82,186,0.3)]">
            <Code className="h-8 w-8 text-primary dark:text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface font-headline dark:text-white mb-2 relative z-10">
            Technical Group
          </h1>
          <p className="text-on-surface-variant dark:text-gray-400 mb-6 relative z-10 font-medium">
            Career guidance for technical and engineering fields
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/dashboard/technical-group/test')}
            className="bg-primary text-white hover:bg-primary-dim rounded-full shadow-md font-bold relative z-10"
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Take Technical Assessment Test
          </Button>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8">
          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 w-full bg-surface-container-lowest rounded-[2rem] group">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-on-surface font-headline">Software Engineering</CardTitle>
              <CardDescription className="text-on-surface-variant/80 font-medium">Programming, Web Development, Mobile Apps</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Full-stack development, mobile app development, software architecture, and cloud computing.
              </p>
              {/* View Pathways link for fullstack careers */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/technical-group/software-pathways')}
                  className="rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  View Pathways
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 w-full bg-surface-container-lowest rounded-[2rem] group">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-on-surface font-headline">Data Science & AI</CardTitle>
              <CardDescription className="text-on-surface-variant/80 font-medium">Machine Learning, Data Analytics, AI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Data analysis, machine learning, artificial intelligence, and big data technologies.
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/technical-group/data-pathways')}
                  className="rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  View Pathways
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 w-full bg-surface-container-lowest rounded-[2rem] group">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-on-surface font-headline">Cybersecurity</CardTitle>
              <CardDescription className="text-on-surface-variant/80 font-medium">Information Security, Ethical Hacking</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Network security, ethical hacking, information security, and digital forensics.
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/roadmap?pathway=cybersecurity')}
                  className="rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  View Pathways
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 w-full bg-surface-container-lowest rounded-[2rem] group">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-on-surface font-headline">Hardware Engineering</CardTitle>
              <CardDescription className="text-on-surface-variant/80 font-medium">Electronics, Embedded Systems, IoT</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Circuit design, embedded systems, IoT development, and hardware engineering.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
