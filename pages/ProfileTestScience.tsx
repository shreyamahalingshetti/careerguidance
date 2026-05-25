import React from 'react'
import dynamic from 'next/dynamic'

// Lightweight wrapper that dynamically loads the real test component.
const ScienceTest = dynamic(() => import('./ProfileTestScience_New').then((m) => m.default), { ssr: false })

export default function ProfileTestSciencePage() {
  return <ScienceTest />
}