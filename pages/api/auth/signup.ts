import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      }
    })
    
    res.status(201).json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
