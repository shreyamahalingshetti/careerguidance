"use client"
import React from 'react'
import SharedProfileTest from './SharedProfileTest'

const CLUSTER_WEIGHTS = {
  SocialSciences: { Social: 0.35, Investigative: 0.20, Agreeableness: 0.20, Neuroticism: -0.10, TotalWeight: 0.85 },
  CreativeArts: { Artistic: 0.35, Openness: 0.30, Extraversion: 0.10, Conventional: -0.15, Realistic: -0.10, TotalWeight: 1.0 },
  Journalism: { Enterprising: 0.25, Social: 0.20, Extraversion: 0.25, Openness: 0.15, Conscientiousness: -0.10, TotalWeight: 0.95 },
  CivilService: { Conventional: 0.25, Investigative: 0.25, Conscientiousness: 0.25, Openness: 0.10, Agreeableness: -0.10, TotalWeight: 1.0 },
}

export default function ArtsTest() {
  return (
    <SharedProfileTest title="12th Pass Arts Profile Assessment" headerColorClass="bg-indigo-700" buttonAccentClass="bg-red-600" clusterWeights={CLUSTER_WEIGHTS} stream="Arts" />
  )
}
