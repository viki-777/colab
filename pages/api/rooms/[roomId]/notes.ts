import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { roomId } = req.query;

  if (req.method === 'GET') {
    try {
      // Get all notes for a room
      const notes = await prisma.note.findMany({
        where: {
          roomId: roomId as string,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      res.status(200).json(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content = '' } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const note = await prisma.note.create({
        data: {
          title,
          content,
          roomId: roomId as string,
          authorId: (session.user as any)?.id || session.user?.email || 'anonymous',
        },
      });

      res.status(201).json(note);
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({ error: 'Failed to create note' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
