"use client"
import React from 'react'
import SharedProfileTest from './SharedProfileTest'

const CLUSTER_WEIGHTS = {
  Accounting: { Conventional: 0.35, Investigative: 0.20, Conscientiousness: 0.25, Neuroticism: -0.15, Social: -0.10, TotalWeight: 1.05 },
  Management: { Enterprising: 0.30, Social: 0.25, Extraversion: 0.20, Openness: 0.15, Realistic: -0.10, TotalWeight: 1.0 },
  CorporateLaw: { Conventional: 0.25, Enterprising: 0.25, Conscientiousness: 0.25, Extraversion: 0.15, Agreeableness: -0.10, TotalWeight: 1.0 },
  DataAnalytics: { Investigative: 0.35, Conventional: 0.15, Openness: 0.25, Conscientiousness: 0.15, Extraversion: -0.10, TotalWeight: 1.0 },
}

export default function CommerceTest() {
  return (
    <SharedProfileTest title="12th Pass Commerce Profile Assessment" headerColorClass="bg-indigo-700" buttonAccentClass="bg-indigo-600" clusterWeights={CLUSTER_WEIGHTS} stream="Commerce" />
  )
}
