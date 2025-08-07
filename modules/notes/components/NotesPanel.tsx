import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown, FaStickyNote, FaPlus } from 'react-icons/fa';
import { BsFileTextFill } from 'react-icons/bs';
import CollaborativeEditor from './CollaborativeEditor';
import { DEFAULT_EASE } from '@/common/constants/easings';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const NotesPanel = ({ roomId }: { roomId: string }) => {
  const [opened, setOpened] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  useEffect(() => {
    // Fetch existing notes for this room
    fetchNotes();
  }, [roomId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const createNote = async () => {
    if (!newNoteTitle.trim()) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNoteTitle,
          content: '',
        }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes([newNote, ...notes]);
        setActiveNote(newNote);
        setNewNoteTitle('');
        setShowNewNoteForm(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId));
        if (activeNote?.id === noteId) {
          setActiveNote(null);
        }
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <motion.div
      className="absolute bottom-0 right-0 z-50 flex h-[400px] w-full flex-col overflow-hidden rounded-t-md sm:right-4 sm:w-[400px]"
      animate={{ y: opened ? 0 : 350 }}
      transition={{ ease: DEFAULT_EASE, duration: 0.2 }}
    >
      <button
        className="flex w-full cursor-pointer items-center justify-between bg-green-600 py-2 px-4 font-semibold text-white hover:bg-green-700"
        onClick={() => setOpened(!opened)}
      >
        <div className="flex items-center gap-2">
          <BsFileTextFill className="mt-[-2px]" />
          Collaborative Notes
          {notes.length > 0 && (
            <span className="rounded-full bg-green-800 px-2 py-1 text-xs">
              {notes.length}
            </span>
          )}
        </div>

        <motion.div
          animate={{ rotate: opened ? 0 : 180 }}
          transition={{ ease: DEFAULT_EASE, duration: 0.2 }}
        >
          <FaChevronDown />
        </motion.div>
      </button>

      <div className="flex flex-1 bg-white">
        {/* Notes Sidebar */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50">
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={() => setShowNewNoteForm(true)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              <FaPlus size={12} />
              New Note
            </button>
          </div>

          <div className="h-[300px] overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                  activeNote?.id === note.id ? 'bg-green-100 border-l-4 border-l-green-600' : ''
                }`}
                onClick={() => setActiveNote(note)}
              >
                <h4 className="font-medium text-sm truncate">{note.title}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-xs mt-1"
                >
                  Delete
                </button>
              </div>
            ))}

            {notes.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                <FaStickyNote className="mx-auto mb-2" size={24} />
                No notes yet. Create your first collaborative note!
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {activeNote ? (
            <div className="h-full">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-sm truncate">{activeNote.title}</h3>
              </div>
              <div className="h-[300px] p-2 overflow-hidden">
                <CollaborativeEditor documentId={activeNote.id} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              <div className="text-center">
                <BsFileTextFill size={32} className="mx-auto mb-2 opacity-50" />
                Select a note to start editing
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showNewNoteForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-80 mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Note</h3>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Enter note title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowNewNoteForm(false);
                  setNewNoteTitle('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={createNote}
                disabled={!newNoteTitle.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NotesPanel;
