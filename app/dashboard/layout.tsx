import DashboardChatGate from '../../components/dashboard-chat-gate'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <DashboardChatGate />
    </>
  )
}
