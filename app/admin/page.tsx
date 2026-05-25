'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Database, BarChart3, Users, Shield, LogOut, User, ArrowLeft } from 'lucide-react'

type SkillGapRecord = {
  id: string
  userName: string | null
  userEmail: string | null
  pathway: string | null
  nodeId: string | null
  score: number
  accuracy: number
  retryCount: number
  timeTaken: number
  firstAttemptScore: number
  mlLabel: string
  mlConfidence: number
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [records, setRecords] = useState<SkillGapRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)

  // Close profile dropdown on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!profileRef.current) return
      if (!profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  // Redirect non-admin users
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/login')
      return
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  // Fetch records
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') return
    fetchRecords()
  }, [session])

  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/skill-gap-records')
      if (!res.ok) throw new Error('Failed to fetch records')
      const data = await res.json()
      setRecords(data.records || [])
    } catch (e) {
      setError('Failed to load skill gap records.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    window.open('/api/skill-gap-records/csv', '_blank')
  }

  const initials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    if (email) return (email[0] || 'U').toUpperCase()
    return 'U'
  }

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Strong':   return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Moderate': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Weak':     return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300'
      default:         return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Stats
  const totalRecords = records.length
  const uniqueUsers = new Set(records.map(r => r.userEmail)).size
  const labelCounts = records.reduce((acc, r) => {
    acc[r.mlLabel] = (acc[r.mlLabel] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const avgConfidence = totalRecords > 0
    ? (records.reduce((sum, r) => sum + r.mlConfidence, 0) / totalRecords).toFixed(1)
    : '0'

  if (status === 'loading' || (session?.user?.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low dark:bg-gray-900">
        <p className="text-xl font-semibold text-on-surface-variant animate-pulse">Loading Admin Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {session?.user && (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-container-high dark:hover:bg-white/10"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white font-semibold shadow-md">
                  {initials(session.user.name, session.user.email)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-on-surface dark:text-white truncate max-w-[180px]">
                    {session.user.name || session.user.email}
                  </div>
                  <div className="text-xs text-on-surface-variant dark:text-gray-300">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">ADMIN</span>
                  </div>
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-outline-variant/30 bg-surface-container-lowest dark:bg-gray-900 shadow-xl overflow-hidden z-50">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest dark:hover:bg-gray-800"
                    onClick={() => { setProfileOpen(false); router.push('/profile') }}
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 dark:hover:bg-gray-800"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-8 text-center px-4 py-8 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="flex items-center justify-center gap-3 mb-3 relative z-10">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface font-headline dark:text-white tracking-tight">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-sm sm:text-base text-on-surface-variant dark:text-gray-400 relative z-10">
            ML Skill Gap Detection — Student Performance Records
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{totalRecords}</p>
                <p className="text-xs text-on-surface-variant font-medium">Total Records</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-tertiary-container rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-tertiary-dim" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{uniqueUsers}</p>
                <p className="text-xs text-on-surface-variant font-medium">Unique Students</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-secondary-dim" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{avgConfidence}%</p>
                <p className="text-xs text-on-surface-variant font-medium">Avg Confidence</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
            <CardContent className="p-5 flex flex-wrap gap-2 items-center justify-center">
              {['Strong', 'Moderate', 'Weak', 'Critical'].map(label => (
                <span key={label} className={`text-xs font-bold px-2 py-1 rounded-full border ${getLabelColor(label)}`}>
                  {label}: {labelCounts[label] || 0}
                </span>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Download Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-surface-container-lowest dark:bg-gray-800 rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-on-surface dark:text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export Dataset
            </h2>
            <p className="text-sm text-on-surface-variant dark:text-gray-400 mt-1">
              Download all skill gap records as a CSV file for analysis or retraining the ML model
            </p>
          </div>
          <Button
            onClick={handleDownloadCSV}
            disabled={totalRecords === 0}
            className="bg-primary text-white hover:bg-primary-dim rounded-full shadow-md font-bold px-8 flex items-center gap-2"
            size="lg"
          >
            <Download className="h-5 w-5" />
            Download CSV ({totalRecords} records)
          </Button>
        </div>

        {/* Records Table */}
        <Card className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
          <CardHeader className="border-b border-outline-variant/20 px-6 py-4">
            <CardTitle className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Skill Gap Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <p className="text-on-surface-variant animate-pulse text-lg">Loading records...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-error font-semibold">{error}</p>
                <Button onClick={fetchRecords} className="mt-4" variant="outline">Retry</Button>
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center">
                <Database className="h-12 w-12 text-on-surface-variant/30 mx-auto mb-4" />
                <p className="text-on-surface-variant text-lg font-medium">No skill gap records yet</p>
                <p className="text-on-surface-variant/60 text-sm mt-1">Records will appear here when students complete quizzes with the ML model active</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-high/50 dark:bg-gray-800">
                      <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Student</th>
                      <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Pathway</th>
                      <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Node</th>
                      <th className="text-center px-4 py-3 font-semibold text-on-surface-variant">Score</th>
                      <th className="text-center px-4 py-3 font-semibold text-on-surface-variant">Accuracy</th>
                      <th className="text-center px-4 py-3 font-semibold text-on-surface-variant">Retries</th>
                      <th className="text-center px-4 py-3 font-semibold text-on-surface-variant">Time(s)</th>
                      <th className="text-center px-4 py-3 font-semibold text-on-surface-variant">1st Score</th>
                      <th className="text-center px-4 py-3 font-semibold text-on-surface-variant">ML Label</th>
                      <th className="text-center px-4 py-3 font-semibold text-on-surface-variant">Confidence</th>
                      <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, idx) => (
                      <tr
                        key={record.id}
                        className={`border-t border-outline-variant/10 hover:bg-surface-container-high/30 transition-colors ${
                          idx % 2 === 0 ? '' : 'bg-surface-container-low/30'
                        }`}
                      >
                        <td className="px-4 py-3 text-on-surface-variant font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-on-surface text-sm">{record.userName || '—'}</div>
                          <div className="text-xs text-on-surface-variant">{record.userEmail}</div>
                        </td>
                        <td className="px-4 py-3 text-on-surface text-xs font-medium capitalize">{record.pathway || '—'}</td>
                        <td className="px-4 py-3 text-on-surface text-xs font-medium">{record.nodeId || '—'}</td>
                        <td className="px-4 py-3 text-center font-bold text-on-surface">{record.score}</td>
                        <td className="px-4 py-3 text-center text-on-surface">{(record.accuracy * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 text-center text-on-surface">{record.retryCount}</td>
                        <td className="px-4 py-3 text-center text-on-surface">{record.timeTaken}s</td>
                        <td className="px-4 py-3 text-center text-on-surface">{record.firstAttemptScore}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getLabelColor(record.mlLabel)}`}>
                            {record.mlLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-on-surface">{record.mlConfidence}%</td>
                        <td className="px-4 py-3 text-on-surface-variant text-xs">
                          {new Date(record.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
