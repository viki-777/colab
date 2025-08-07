import { useTheme } from '@/common/context/Theme.context';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <FaSun className="w-4 h-4 text-yellow-500" />
      ) : (
        <FaMoon className="w-4 h-4 text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
