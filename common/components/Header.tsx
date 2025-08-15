import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/common/context/Auth.context';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/70 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-2 sm:py-3">
          
          {/* Left: Logo and Name */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <a 
              href="/dashboard"
              className="text-lg sm:text-xl font-bold text-blue-500 dark:text-blue-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 flex items-center focus:outline-none rounded-lg" 
            >
              <img src="/logo.png" alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 inline-block" />
              <span className="hidden sm:inline ml-2">Colabio</span>
            </a>
          </div>

          {/* Right Side: Theme Toggle & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User avatar'}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-gray-300/70 dark:border-gray-600/90 hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-gray-300/70 dark:border-gray-600/90 flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-white/20 rounded-xl shadow-2xl z-50 animate-in fade-in-0 zoom-in-95">
                  <div className="px-4 py-3 border-b border-gray-200/50 dark:border-white/10">
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                  </div>
                  <div className="py-1">
                    <a
                      href="/dashboard"
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 focus:outline-none"
                      onClick={() => setOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Dashboard
                    </a>
                    <button
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 focus:outline-none"
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;