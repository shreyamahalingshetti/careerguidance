// NextAuth Configuration for Task Management System
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { sendEmail } from './mailer'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        let isNewUser = false;
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (!dbUser) {
          isNewUser = true;
          // Generate random password as fallback for Prisma schema
          const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)
          const hashedPassword = await bcrypt.hash(randomPassword, 10)
          
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || profile?.name || '',
              password: hashedPassword,
              role: 'STUDENT',
            },
          })
          
          // Fire-and-forget email dispatch ONLY for new users
          const subject = "Welcome to Career Platform 🔔";
          const message = `Hi ${user.name || 'there'},<br/><br/>
          Thank you for logging into career guidance app.<br/><br/>
          Instructions what all are steps:<br/>
          1. Complete your Profile Assessment (Ocean/RIASEC).<br/>
          2. Take the Aptitude test if applicable.<br/>
          3. Generate your personalized career pathway and roadmap.<br/>
          4. Follow your weekly progress and streaks to stay on track!`;

          sendEmail({
            to: user.email,
            subject,
            html: `<p>${message}</p>`,
          });
        }
      }
      return true
    },
    async jwt({ token, account, user }) {
      if (account?.provider === 'google' || user) {
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role as 'STUDENT' | 'COUNSELOR' | 'ADMIN'
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'STUDENT' | 'COUNSELOR' | 'ADMIN'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
}
