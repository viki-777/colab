import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { noteId } = req.query;

  if (req.method === 'GET') {
    try {
      const note = await prisma.note.findUnique({
        where: {
          id: noteId as string,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.status(200).json(note);
    } catch (error) {
      console.error('Error fetching note:', error);
      res.status(500).json({ error: 'Failed to fetch note' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, content } = req.body;

      const note = await prisma.note.update({
        where: {
          id: noteId as string,
        },
        data: {
          title,
          content,
          updatedAt: new Date(),
        },
      });

      res.status(200).json(note);
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Failed to update note' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.note.delete({
        where: {
          id: noteId as string,
        },
      });

      res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
