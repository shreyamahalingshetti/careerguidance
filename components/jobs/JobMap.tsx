/**
 * JobMap Component (Leaflet + Google Maps Tiles)
 * ==============================================
 * Interactive map showing job locations. Users can also click the map to drop a pin
 * and filter jobs by proximity to that pin.
 *
 * IMPORTANT: This file must be dynamically imported with { ssr: false }
 */

'use client'

import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import type { LatLngBoundsExpression, LatLng } from 'leaflet'

type MapJob = {
  id: string
  title: string
  company: string
  location: string
  lat: number
  lng: number
  matchScore: number
  missingSkills: string[]
  applyUrl: string
}

type Props = {
  jobs: MapJob[]
  selectedJobId: string | null
  onSelectJob: (jobId: string | null) => void
  onLocationPick?: (lat: number, lng: number) => void
}

function markerColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#eab308'
  return '#ef4444'
}

function MapController({ jobs, selectedJobId, onLocationPick, userPin }: { jobs: MapJob[]; selectedJobId: string | null; onLocationPick?: (lat: number, lng: number) => void; userPin: LatLng | null }) {
  const map = useMap()

  // Handle clicks to drop a pin
  useMapEvents({
    click(e) {
      if (onLocationPick) {
        onLocationPick(e.latlng.lat, e.latlng.lng)
      }
    }
  })

  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find(j => j.id === selectedJobId)
      if (job) {
        map.flyTo([job.lat, job.lng], 12, { duration: 1.2 })
        return
      }
    } else if (userPin) {
      map.flyTo([userPin.lat, userPin.lng], 10, { duration: 1.2 })
    } else if (jobs.length > 0) {
      // Fit bounds to all markers if no specific selection
      const bounds: LatLngBoundsExpression = jobs.map(j => [j.lat, j.lng] as [number, number])
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
    }
  }, [jobs, selectedJobId, userPin, map])

  return null
}

export default function JobMap({ jobs, selectedJobId, onSelectJob, onLocationPick }: Props) {
  const [userPin, setUserPin] = useState<{lat: number, lng: number} | null>(null)
  const mappableJobs = jobs.filter(j => j.lat !== null && j.lng !== null)

  const handleLocationPick = (lat: number, lng: number) => {
    setUserPin({ lat, lng })
    onSelectJob(null) // Clear specific job selection
    if (onLocationPick) {
      onLocationPick(lat, lng)
    }
  }

  const defaultCenter: [number, number] = [20.5937, 78.9629] // India

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-700/50 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        className="w-full h-full"
        style={{ minHeight: '400px', background: '#e5e3df' }}
        zoomControl={true}
      >
        {/* Google Maps standard tile layer */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />

        <MapController 
          jobs={mappableJobs} 
          selectedJobId={selectedJobId} 
          onLocationPick={handleLocationPick}
          userPin={userPin as unknown as LatLng}
        />

        {/* The user's custom dropped pin */}
        {userPin && (
          <CircleMarker
            center={[userPin.lat, userPin.lng]}
            radius={8}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', textAlign: 'center' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Your Selected Location</p>
                <p style={{ margin: '4px 0', fontSize: 11, color: '#64748b' }}>Showing jobs near here</p>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* Job markers */}
        {mappableJobs.map(job => {
          const color = markerColor(job.matchScore)
          const isSelected = job.id === selectedJobId

          return (
            <CircleMarker
              key={job.id}
              center={[job.lat, job.lng]}
              radius={isSelected ? 14 : 10}
              eventHandlers={{
                click: () => onSelectJob(job.id)
              }}
              pathOptions={{
                color: isSelected ? '#ffffff' : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.9 : 0.7,
                weight: isSelected ? 3 : 2,
              }}
            >
              {isSelected && (
                <Popup>
                  <div style={{ minWidth: 200, fontFamily: 'sans-serif' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>
                      {job.title}
                    </h3>
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b' }}>
                      {job.company} — {job.location}
                    </p>
                    <div style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#fff',
                      background: color,
                      marginBottom: 8,
                    }}>
                      {job.matchScore}% Match
                    </div>
                    {job.missingSkills.length > 0 && (
                      <p style={{ margin: '4px 0', fontSize: 11, color: '#94a3b8' }}>
                        Missing: {job.missingSkills.slice(0, 3).join(', ')}
                      </p>
                    )}
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        marginTop: 8,
                        padding: '6px 12px',
                        background: '#2563eb',
                        color: '#fff',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      Apply Now →
                    </a>
                  </div>
                </Popup>
              )}
            </CircleMarker>
          )
        })}
      </MapContainer>
      
      {/* Overlay instructions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-xs font-semibold text-slate-700 pointer-events-none">
        Click anywhere on the map to filter jobs near that location
      </div>
    </div>
  )
}
