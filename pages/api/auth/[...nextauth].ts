import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug mode
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth authorize called:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
          
          console.log('👤 User lookup result:', user ? {
            id: user.id,
            email: user.email,
            name: user.name,
            hasPassword: !!user.password
          } : 'No user found')
          
          if (!user || !user.password) {
            console.log('❌ No user found or no password for email:', credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('🔑 Password validation:', isPasswordValid)
          
          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', credentials.email)
            return null
          }

          console.log('✅ Authentication successful for:', credentials.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('💥 Error in authorize function:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt', // Use JWT for better compatibility with credentials provider
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist user id to the token right after signin
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        }
      }
    },
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      // Default to dashboard after login
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
