"use client"

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>
  }

  if (!session?.user) {
    return null
  }

  const user = session.user as any

  return (
    <div className="max-w-3xl mx-auto my-12 overflow-hidden rounded-lg shadow-md">
      <div className="px-6 py-8 bg-blue-600 text-white">
        <h2 className="text-2xl font-bold mb-1">Profile</h2>
        <p className="text-sm opacity-90">Account details and session information</p>
      </div>
      <div className="p-8 bg-white">
      <div className="space-y-2">
        <p><strong>Name:</strong> {user.name || '-'}</p>
        <p><strong>Email:</strong> {user.email || '-'}</p>
        {user.id && <p><strong>User ID:</strong> {user.id}</p>}
        {user.role && <p><strong>Role:</strong> {user.role}</p>}
      </div>

      <div className="mt-6">
        <Button onClick={() => signOut({ callbackUrl: '/login' })} className="bg-red-600">Logout</Button>
      </div>
      </div>
    </div>
  )
}
