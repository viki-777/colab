import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get all boards for the user
        const boards = await prisma.board.findMany({
          where: {
            user: {
              email: session.user.email
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        });
        res.status(200).json(boards);
        break;

      case 'POST':
        // Create a new board
        const { title, description, type, isPublic } = req.body;

        if (!title) {
          return res.status(400).json({ error: 'Title is required' });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email: session.user.email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: session.user.email,
              name: session.user.name || 'Unknown User',
              image: session.user.image
            }
          });
        }

        // Generate room ID for real-time collaboration
        const roomId = Math.random().toString(36).substring(2, 8);

        const board = await prisma.board.create({
          data: {
            title,
            description,
            type: type || 'WHITEBOARD',
            isPublic: isPublic || false,
            roomId,
            userId: user.id,
            data: {}
          }
        });

        res.status(201).json(board);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
