"use client"
import React from 'react'
import SharedProfileTest from './SharedProfileTest'

const CLUSTER_WEIGHTS = {
  Engineering: { Investigative: 0.30, Realistic: 0.25, Conscientiousness: 0.25, Extraversion: -0.10, Social: -0.10, TotalWeight: 0.70 },
  Medicine: { Social: 0.30, Investigative: 0.20, Agreeableness: 0.20, Neuroticism: -0.10, Extraversion: 0.10, TotalWeight: 0.90 },
  Research: { Investigative: 0.25, Artistic: 0.15, Openness: 0.30, Extraversion: -0.15, Conscientiousness: 0.15, TotalWeight: 1.0 },
}

export default function ScienceTest() {
  return (
    <SharedProfileTest title="12th Pass Science Profile Assessment" headerColorClass="bg-indigo-700" buttonAccentClass="bg-blue-600" clusterWeights={CLUSTER_WEIGHTS} stream="Science" />
  )
}
