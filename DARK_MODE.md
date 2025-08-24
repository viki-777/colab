# Dark Mode Implementation

## Overview
Your application now defaults to dark mode with the ability to switch to light mode using the theme toggle component.

## How It Works

### 1. Theme Context (`/common/context/Theme.context.tsx`)
- **Default Mode**: Dark mode by default
- **State Management**: Uses React Context to manage theme state globally
- **Persistence**: Saves user preference in localStorage
- **CSS Classes**: Automatically adds/removes `dark` class on document element

### 2. Theme Toggle Component (`/common/components/ThemeToggle.tsx`)
- **Location**: Already integrated in Header and BoardHeader components
- **Icons**: Sun icon for light mode, Moon icon for dark mode
- **Usage**: Click to toggle between light and dark themes

### 3. CSS Implementation
- **Tailwind Config**: Uses `darkMode: 'class'` strategy
- **Global Styles**: Default dark background and text colors
- **Component Styles**: All components use `dark:` prefixed classes for dark mode variants

## Where Theme Toggle Appears
- **Main Header**: `/common/components/Header.tsx` (line 47)
- **Board Header**: `/modules/room/components/board/BoardHeader.tsx` (line 208)

## Using Dark Mode in Components

### Basic Example
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content that adapts to theme
</div>
```

### Form Elements
```tsx
<input className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
```

### Accessing Theme in Code
```tsx
import { useTheme } from '@/common/context/Theme.context';

const MyComponent = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div>
      Current theme: {theme}
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  );
};
```

## Pages with Dark Mode Support
- ✅ **Authentication Pages**: `/auth/signin` and `/auth/signup` - Default dark styling
- ✅ **Dashboard**: Full dark mode support with `dark:` classes
- ✅ **Room/Board**: Theme toggle available in BoardHeader
- ✅ **Global Layout**: Dark mode applied via global CSS

## Color Palette
- **Dark Backgrounds**: `bg-gray-800`, `bg-gray-900`, `bg-zinc-800`
- **Dark Text**: `text-gray-100`, `text-gray-200`
- **Dark Borders**: `border-gray-600`, `border-gray-700`
- **Dark Inputs**: `bg-gray-800/70`, `bg-gray-700`

## Benefits
1. **Better UX**: Reduced eye strain in low-light conditions
2. **Modern Design**: Follows current design trends
3. **User Choice**: Easy toggle between themes
4. **Consistent**: Theme persists across page reloads and sessions
5. **Accessible**: Proper contrast ratios maintained

## User Experience
- **First Visit**: App loads in dark mode by default
- **Theme Switch**: Users can click the sun/moon icon to toggle
- **Persistence**: Choice is remembered in browser storage
- **Smooth Transitions**: CSS transitions for theme changes
