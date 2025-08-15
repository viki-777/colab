import { NextApiRequest, NextApiResponse } from 'next'
import { userService } from '../../../lib/userService'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const users = userService.getAll()
    res.status(200).json({ users })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}
