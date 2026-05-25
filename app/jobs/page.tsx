/**
 * Jobs Recommendation Page
 * ========================
 * Split-screen layout:
 *   Left (60%) → Job recommendation cards with match scores
 *   Right (40%) → Interactive Google Map with color-coded markers
 *
 * URL params:
 *   ?pathway=frontend&progress=5&total=12
 */

'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import JobCard from '@/components/jobs/JobCard'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Briefcase, Search, X } from 'lucide-react'
import {
  computeReadinessLevel,
  getUserSkills,
  analyzeJobMatch,
  type ReadinessLevel,
  type MatchResult,
} from '@/lib/skill-matcher'

// Dynamically import Leaflet Map (requires window)
const JobMap = dynamic(() => import('@/components/jobs/JobMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-container rounded-2xl border border-outline-variant/30">
      <p className="text-on-surface-variant text-sm animate-pulse">Loading Map…</p>
    </div>
  ),
})

type Job = {
  id: string
  title: string
  company: string
  location: string
  city: string
  lat: number | null
  lng: number | null
  applyUrl: string
  requiredSkills: string[]
  employmentType: string
  datePosted: string
  description: string
}

type AnalyzedJob = Job & { match: MatchResult }

// Readiness level badge colors
const LEVEL_STYLES: Record<ReadinessLevel, { bg: string; label: string }> = {
  beginner:     { bg: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/50', label: '🌱 Beginner' },
  intermediate: { bg: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/50', label: '⚡ Intermediate' },
  advanced:     { bg: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50', label: '🚀 Advanced' },
}

// Distance formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function JobsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Read progress from URL params
  const pathway = searchParams?.get('pathway') || 'full-stack'
  const progress = parseInt(searchParams?.get('progress') || '3', 10)
  const total = parseInt(searchParams?.get('total') || '12', 10)

  // Compute user context
  const readiness = computeReadinessLevel(progress, total)
  const userSkills = getUserSkills(pathway, progress)
  const levelStyle = LEVEL_STYLES[readiness]

  // State
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [userLocationPin, setUserLocationPin] = useState<{lat: number, lng: number} | null>(null)
  const [source, setSource] = useState<string>('')

  // Filter States
  const [filterRole, setFilterRole] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')

  // Build the location string for the API based on filters
  const locationQuery = useMemo(() => {
    const parts = [filterDistrict, filterState, filterCountry].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'India'
  }, [filterCountry, filterState, filterDistrict])

  // Fetch jobs from API
  useEffect(() => {
    setLoading(true)
    setError(null)
    
    let url = `/api/jobs?pathway=${pathway}&level=${readiness}&location=${encodeURIComponent(locationQuery)}`
    if (filterRole.trim()) {
      url += `&query=${encodeURIComponent(filterRole.trim())}`
    }

    const timer = setTimeout(() => {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setJobs(data.jobs || [])
          setSource(data.source || '')
        })
        .catch(() => setError('Failed to load job recommendations. Please try again.'))
        .finally(() => setLoading(false))
    }, 500)

    return () => clearTimeout(timer)
  }, [pathway, readiness, locationQuery, filterRole])

  // Analyze each job against user skills and sort by match score
  const analyzedJobs: AnalyzedJob[] = useMemo(() => {
    return jobs
      .map(job => ({
        ...job,
        match: analyzeJobMatch(job.requiredSkills, userSkills, readiness),
      }))
      .sort((a, b) => b.match.score - a.match.score)
  }, [jobs, userSkills, readiness])

  // Strict visual filtering
  const visibleJobs = useMemo(() => {
    let filtered = analyzedJobs

    if (selectedJobId) {
      filtered = filtered.filter(j => j.id === selectedJobId)
    } else {
      // Pin filtering (within 250km radius)
      if (userLocationPin) {
        filtered = filtered.filter(j => {
          if (!j.lat || !j.lng) return false
          const dist = getDistance(userLocationPin.lat, userLocationPin.lng, j.lat, j.lng)
          return dist <= 250
        })
      }
      
      // Text filtering
      if (filterRole) {
        const q = filterRole.toLowerCase()
        filtered = filtered.filter(j => 
          j.title.toLowerCase().includes(q) || 
          j.requiredSkills.some(s => s.toLowerCase().includes(q))
        )
      }
      if (filterCountry || filterState || filterDistrict) {
        const qLoc = locationQuery.toLowerCase()
        filtered = filtered.filter(j => j.location.toLowerCase().includes(qLoc) || j.city?.toLowerCase().includes(qLoc))
      }
    }
    return filtered
  }, [analyzedJobs, selectedJobId, userLocationPin, filterRole, locationQuery, filterCountry, filterState, filterDistrict])

  // Prepare map data
  const mapJobs = useMemo(() => {
    return analyzedJobs
      .filter(j => j.lat !== null && j.lng !== null)
      .map(j => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        lat: j.lat!,
        lng: j.lng!,
        matchScore: j.match.score,
        missingSkills: j.match.missingSkills,
        applyUrl: j.applyUrl,
      }))
  }, [analyzedJobs])

  const avgMatch = visibleJobs.length > 0
    ? Math.round(visibleJobs.reduce((sum, j) => sum + j.match.score, 0) / visibleJobs.length)
    : 0

  return (
    <div className="min-h-screen bg-surface-container-lowest dark:bg-slate-950 text-on-surface dark:text-slate-200 pb-10">
      {/* Header aligned with dashboard */}
      <header className="border-b border-outline-variant/30 bg-surface-container-low/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white font-headline">
                Job Recommendations
              </h1>
              <span className={`text-xs px-3 py-1 rounded-full border font-bold ${levelStyle.bg}`}>
                {levelStyle.label}
              </span>
            </div>
            <p className="text-on-surface-variant dark:text-slate-500 font-medium text-sm">
              {pathway.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} pathway
              · {progress}/{total} nodes completed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-center px-4 py-2 rounded-xl bg-surface dark:bg-slate-800/60 border border-outline-variant/30 shadow-sm">
                <p className="text-lg font-bold text-primary dark:text-white">{visibleJobs.length}</p>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Jobs Found</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-surface dark:bg-slate-800/60 border border-outline-variant/30 shadow-sm">
                <p className="text-lg font-bold text-secondary dark:text-blue-400">{avgMatch}%</p>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Avg Match</p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* Filter Bar styled like Dashboard Cards */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <Card className="bg-surface border-outline-variant/30 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Role Filter
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input 
                    type="text" 
                    placeholder="e.g. Frontend Developer" 
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>
              <div className="w-full sm:w-[150px]">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Country
                </label>
                <input 
                  type="text" 
                  placeholder="India" 
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div className="w-full sm:w-[150px]">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">State</label>
                <input 
                  type="text" 
                  placeholder="Karnataka" 
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div className="w-full sm:w-[150px]">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">City</label>
                <input 
                  type="text" 
                  placeholder="Bangalore" 
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              {(selectedJobId || userLocationPin) && (
                <div className="flex items-end h-[62px]">
                  <button 
                    onClick={() => { setSelectedJobId(null); setUserLocationPin(null); }}
                    className="text-xs font-bold bg-error/10 text-error hover:bg-error/20 border border-error/20 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 h-[42px]"
                  >
                    <X className="w-4 h-4" /> Clear Map Pin
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left panel: Job cards */}
          <div className="lg:w-[60%] space-y-4 h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-hide">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 rounded-3xl bg-surface-container-low animate-pulse border border-outline-variant/30" />
                ))}
              </div>
            ) : error ? (
              <div className="mt-12 text-center p-8 bg-error/5 rounded-3xl border border-error/20">
                <p className="text-error font-bold text-lg mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dim transition"
                >
                  Retry Search
                </button>
              </div>
            ) : visibleJobs.length > 0 ? (
              <>
                {source === 'mock' && !selectedJobId && !userLocationPin && (
                  <div className="text-sm font-medium text-secondary-dim bg-secondary/10 px-4 py-3 rounded-2xl border border-secondary/20 mb-4">
                    ⚡ Showing demo jobs. Add <code className="font-bold">RAPIDAPI_KEY</code> to your <code className="font-bold">.env</code> for live real-world listings.
                  </div>
                )}
                {userLocationPin && (
                  <div className="text-sm font-bold text-primary bg-primary/10 px-4 py-3 rounded-2xl border border-primary/20 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Showing jobs within 250km of selected location
                  </div>
                )}
                <AnimatePresence mode="popLayout">
                  {visibleJobs.map((job, index) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      match={job.match}
                      index={index}
                      isSelected={selectedJobId === job.id}
                      onSelect={(id) => setSelectedJobId(id === selectedJobId ? null : id)}
                    />
                  ))}
                </AnimatePresence>
              </>
            ) : (
              <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-sm">
                <Search className="w-12 h-12 text-outline mx-auto mb-4 opacity-50" />
                <p className="text-on-surface font-headline text-xl font-bold mb-2">No jobs found matching your filters</p>
                <p className="text-on-surface-variant text-sm max-w-md mx-auto">Try clearing your filters, adjusting your role search, or clicking a different area on the map.</p>
                {(filterRole || filterCountry || filterState || filterDistrict || selectedJobId || userLocationPin) && (
                  <button 
                    onClick={() => {
                      setFilterRole(''); setFilterCountry(''); setFilterState(''); setFilterDistrict(''); setSelectedJobId(null); setUserLocationPin(null);
                    }}
                    className="mt-6 px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-bold transition-colors border border-primary/20"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right panel: Leaflet Map */}
          <div className="lg:w-[40%] h-[calc(100vh-250px)] min-h-[400px] sticky top-[210px] rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-outline-variant/30 dark:shadow-none bg-surface-container">
            <JobMap 
              jobs={mapJobs} 
              selectedJobId={selectedJobId} 
              onSelectJob={(id) => setSelectedJobId(id)}
              onLocationPick={(lat, lng) => setUserLocationPin({lat, lng})}
            />
            {/* Map legend overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-md border border-outline-variant/50 rounded-2xl px-5 py-2.5 flex items-center justify-center gap-5 shadow-lg z-[1000]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">Mid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">Low</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <p className="text-xl font-bold text-on-surface-variant animate-pulse">Loading Workspace…</p>
      </div>
    }>
      <JobsContent />
    </Suspense>
  )
}

