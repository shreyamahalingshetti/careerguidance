import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

// App Router expects named exports for HTTP methods.
// Re-export the NextAuth handler for GET and POST so Next.js can invoke them.
export { handler as GET, handler as POST }