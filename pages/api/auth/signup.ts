import { NextApiRequest, NextApiResponse } from 'next'
import { userService } from '../../../lib/userService'

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
    const user = await userService.create({ name, email, password })
    
    res.status(201).json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'User already exists') {
      return res.status(400).json({ message: 'User already exists' })
    }
    
    res.status(500).json({ message: 'Internal server error' })
  }
}
