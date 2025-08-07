import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/common/context/Auth.context';
import { useRoom } from '@/common/recoil/room';
import ThemeToggle from '@/common/components/ThemeToggle';
import Reactions from './Reactions';
import { FaArrowLeft, FaUsers, FaShareAlt, FaEdit, FaSave, FaGlobe, FaLock } from 'react-icons/fa';

interface Board {
  id: string;
  title: string;
  description?: string;
  type: 'WHITEBOARD' | 'NOTEBOOK';
  isPublic: boolean;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
}

interface BoardHeaderProps {
  roomId: string;
}

const BoardHeader = ({ roomId }: BoardHeaderProps) => {
  const { user } = useAuth();
  const { users } = useRoom();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const onlineUsers = users.size;

  useEffect(() => {
    fetchBoardInfo();
  }, [roomId]);

  const fetchBoardInfo = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/board`);
      if (response.ok) {
        const boardData = await response.json();
        setBoard(boardData);
        setEditTitle(boardData.title);
      }
    } catch (error) {
      console.error('Error fetching board info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!board || !editTitle.trim()) return;

    try {
      const response = await fetch(`/api/boards/${board.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
        }),
      });

      if (response.ok) {
        setBoard({ ...board, title: editTitle });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating board title:', error);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    // You could add a toast notification here
    alert('Board link copied to clipboard!');
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="absolute top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="w-32 h-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <button
            onClick={goToDashboard}
            className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 group"
            title="Back to Dashboard"
          >
            <FaArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100" />
          </button>

          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {board && (
              <span className={`px-1 sm:px-2 py-1 text-xs rounded-full ${
                board.type === 'WHITEBOARD' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {board.type === 'WHITEBOARD' ? '🎨' : '📝'}
              </span>
            )}

            {isEditing ? (
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="px-2 sm:px-3 py-1 text-sm sm:text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-0 flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 text-green-600 hover:text-green-700"
                  title="Save"
                >
                  <FaSave className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(board?.title || '');
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Cancel"
                >
                  <span className="text-sm">×</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                <h1 className="text-sm sm:text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {board?.title || 'Untitled Board'}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hidden sm:block"
                  title="Edit title"
                >
                  <FaEdit className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Section - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <FaUsers className="w-4 h-4" />
            <span>{onlineUsers} online</span>
          </div>

          {board?.isPublic ? (
            <div className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
              <FaGlobe className="w-3 h-3" />
              <span>Public </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <FaLock className="w-3 h-3" />
              <span>Private</span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3 px-3">
          <div className="space-x-2 hidden sm:block">
            <ThemeToggle />
          </div>
          
          <Reactions roomId={roomId} />
          
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors duration-200 text-xs sm:text-sm"
          >
            <FaShareAlt className="w-3 h-3" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {user?.image && (
            <img
              src={user.image}
              alt={user.name}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 dark:border-gray-600"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;
