// Prisma Client Singleton
// Prevents multiple instances in development AND production (Vercel serverless)

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with better error handling
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

// Cache the client globally to prevent multiple instances
// This is safe in all environments — on serverless, globalThis is reset per cold start anyway
globalForPrisma.prisma = prisma

