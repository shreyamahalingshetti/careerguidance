'use client'

import { usePathname } from 'next/navigation'
import Chat from '@/components/chat'

export default function DashboardChatGate() {
  const pathname = usePathname() || ''

  const hideOnTests = /^\/dashboard\/(10th-standard|12th-standard|technical-group)\/test(\/|$)/.test(pathname)

  if (hideOnTests) return null

  return <Chat />
}
