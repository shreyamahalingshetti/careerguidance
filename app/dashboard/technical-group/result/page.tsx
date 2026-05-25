import { Suspense } from 'react'
import ResultClient from './ResultClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <ResultClient />
    </Suspense>
  )
}

