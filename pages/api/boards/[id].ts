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
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Board ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        // Get specific board
        const foundBoard = await prisma.board.findFirst({
          where: {
            id,
            user: {
              email: session.user.email
            }
          }
        });

        if (!foundBoard) {
          return res.status(404).json({ error: 'Board not found' });
        }

        res.status(200).json(foundBoard);
        break;

      case 'PUT':
        // Update board
        const { title, description, data, isPublic } = req.body;

        const updatedBoard = await prisma.board.updateMany({
          where: {
            id,
            user: {
              email: session.user.email
            }
          },
          data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(data && { data }),
            ...(isPublic !== undefined && { isPublic }),
            updatedAt: new Date()
          }
        });

        if (updatedBoard.count === 0) {
          return res.status(404).json({ error: 'Board not found' });
        }

        // Fetch the updated board
        const updatedBoardData = await prisma.board.findUnique({
          where: { id }
        });

        res.status(200).json(updatedBoardData);
        break;

      case 'DELETE':
        // Delete board
        const deletedBoard = await prisma.board.deleteMany({
          where: {
            id,
            user: {
              email: session.user.email
            }
          }
        });

        if (deletedBoard.count === 0) {
          return res.status(404).json({ error: 'Board not found' });
        }

        res.status(200).json({ message: 'Board deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
