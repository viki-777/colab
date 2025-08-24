import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const { roomId } = req.query;

  if (!roomId || typeof roomId !== 'string') {
    return res.status(400).json({ error: 'Room ID is required' });
  }

  try {
    switch (method) {
      case 'POST':
        // Save board data manually
        const { moves, title } = req.body;

        if (!moves || !Array.isArray(moves)) {
          return res.status(400).json({ error: 'Moves array is required' });
        }

        // Update board with new moves
        const updatedBoard = await prisma.board.updateMany({
          where: {
            roomId,
            user: {
              email: session.user.email
            }
          },
          data: {
            ...(title && { title }),
            data: {
              moves,
              lastSaved: new Date().toISOString(),
              savedBy: session.user.email,
            } as any,
            updatedAt: new Date(),
          }
        });

        if (updatedBoard.count === 0) {
          return res.status(404).json({ error: 'Board not found or unauthorized' });
        }

        res.status(200).json({ 
          message: 'Board saved successfully', 
          moveCount: moves.length,
          savedAt: new Date().toISOString()
        });
        break;

      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
