export interface Board {
  id: string;
  title: string;
  description?: string;
  type: 'WHITEBOARD' | 'NOTEBOOK';
  isPublic: boolean;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
}