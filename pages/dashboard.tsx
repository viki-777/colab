import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/common/context/Auth.context';
import Header from '@/common/components/Header';

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

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('lastOpened');
  const [newBoard, setNewBoard] = useState({
    title: '',
    description: '',
    type: 'WHITEBOARD' as 'WHITEBOARD' | 'NOTEBOOK',
    isPublic: false
  });
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBoards();
    }
  }, [isAuthenticated, user]);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards');
      if (response.ok) {
        const data = await response.json();
        setBoards(data);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!newBoard.title.trim()) return;

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBoard),
      });

      if (response.ok) {
        const board = await response.json();
        setBoards([board, ...boards]);
        setNewBoard({ title: '', description: '', type: 'WHITEBOARD', isPublic: false });
        setShowCreateModal(false);
        
        if (board.roomId) {
          router.push(`/${board.roomId}`);
        }
      }
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const deleteBoard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this board?')) return;

    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBoards(boards.filter(board => board.id !== id));
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  const openBoard = (board: Board) => {
    if (board.roomId) {
      router.push(`/${board.roomId}`);
    }
  };

  const handleCreateButtonClick = () => {
    setShowCreateModal(true);
  };

  const createTemplateBoard = (templateType: string) => {
    const templates = {
      'blank': { title: 'Blank Board', description: '', type: 'WHITEBOARD' as const },
      'flowchart': { title: 'Flowchart', description: 'Process flows and diagrams', type: 'WHITEBOARD' as const },
      'brainstorming': { title: 'Brainstorming', description: 'Collaborative idea generation', type: 'WHITEBOARD' as const },
    };

    const template = templates[templateType as keyof typeof templates];
    if (template) {
      setNewBoard({
        ...template,
        isPublic: false
      });
      setShowCreateModal(true);
    }
  };

  if (isLoading || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-indigo-900 dark:via-black dark:via-zinc-900 dark:to-blue-900 min-h-screen pt-0">
        {/* Template Selection Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button
                onClick={() => createTemplateBoard('blank')}
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[70px] sm:min-w-[80px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                <div className="w-10 h-7 sm:w-12 sm:h-8 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded mb-1 sm:mb-2 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">+</span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 text-center">Blank</span>
              </button>

              <button
                onClick={() => createTemplateBoard('flowchart')}
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[70px] sm:min-w-[80px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                <div className="w-10 h-7 sm:w-12 sm:h-8 bg-blue-100 dark:bg-blue-900/50 rounded mb-1 sm:mb-2 flex items-center justify-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded"></div>
                    <div className="w-1 h-4 bg-blue-400"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded"></div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300 text-center">Flowchart</span>
              </button>

              <button
                onClick={() => createTemplateBoard('brainstorming')}
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[70px] sm:min-w-[80px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                <div className="w-10 h-7 sm:w-12 sm:h-8 bg-orange-100 dark:bg-orange-900/50 rounded mb-1 sm:mb-2 flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-px">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-orange-400 rounded"></div>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300 text-center">Brainstorming</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Boards</h1>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={handleCreateButtonClick}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
              >
                Explore templates
              </button>
              <button
                onClick={handleCreateButtonClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
              >
                <span className="text-base">+</span>
                <span>Create new</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">Filter by</span>
                <select 
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="whiteboard">Whiteboards</option>
                  <option value="notebook">Notebooks</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">Owned by</span>
                <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Anyone</option>
                  <option>Me</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">Sort by</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lastOpened">Last opened</option>
                  <option value="created">Created</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
              </button>
            </div>
          </div>

          {/* Boards Display */}
          {viewMode === 'list' ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="hidden md:block">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Opened</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {boards.map((board) => (
                      <tr 
                        key={board.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => openBoard(board)}
                        tabIndex={0}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-3 text-lg">{board.type === 'WHITEBOARD' ? '📋' : '📝'}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{board.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Modified by {user?.name || 'You'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user?.name || 'You'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(board.updatedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteBoard(board.id); }}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-500 ml-4 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 7h12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7M10 11v6M14 11v6" />
                          </svg>


                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {boards.length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No boards yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first board to get started.</p>
                  <button
                    onClick={handleCreateButtonClick}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                  >
                    Create a Board
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => openBoard(board)}
                  tabIndex={0}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        board.type === 'WHITEBOARD' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      }`}>
                        {board.type === 'WHITEBOARD' ? '🎨 Whiteboard' : '📝 Notebook'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteBoard(board.id); }}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <button
  type="button"
  className="inline-flex items-center rounded-xl px-3 py-2 text-sm hover:bg-red-50 text-red-600"
  aria-label="Delete"
  title="Delete"
>
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 7h12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7M10 11v6M14 11v6" />
  </svg>
  Delete
</button>

                      </button>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">{board.title}</h3>
                    {board.description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{board.description}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Updated {new Date(board.updatedAt).toLocaleDateString()}</span>
                      {board.isPublic && <span className="text-green-600 dark:text-green-400">Public</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowCreateModal(false)}
            ></div>
            
            <div 
              className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
              style={{ zIndex: 60 }}
            >
              <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/90 px-6 sm:px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Board</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Start your creative journey</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="px-6 sm:px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Board Title *</label>
                  <input type="text" value={newBoard.title} onChange={(e) => setNewBoard({...newBoard, title: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100" placeholder="Enter board title" autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Description</label>
                  <textarea value={newBoard.description} onChange={(e) => setNewBoard({...newBoard, description: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none" placeholder="Add a description (optional)" rows={3}></textarea>
                </div>
                <div className="relative p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <label className="flex items-center cursor-pointer group">
                    <input type="checkbox" checked={newBoard.isPublic} onChange={(e) => setNewBoard({...newBoard, isPublic: e.target.checked})} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Make this board public</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Anyone with the link can view.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => { setShowCreateModal(false); setNewBoard({ title: '', description: '', type: 'WHITEBOARD', isPublic: false }); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >Cancel</button>
                <button
                  onClick={createBoard}
                  disabled={!newBoard.title.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 dark:focus:ring-offset-gray-800"
                >Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;