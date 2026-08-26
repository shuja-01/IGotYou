/**
 * Theme Context & Provider — "I Got You!" Health Advisor
 * 
 * Manages light and dark theme switching synchronized across localStorage,
 * document.documentElement class mutations (Tailwind class-based dark mode),
 * and the CSS color-scheme property for native form controls and scrollbars.
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const LOCAL_STORAGE_THEME_KEY = 'igotyou_theme_v1';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  /**
   * Applies the theme class and native color-scheme directly onto <html>
   */
  const applyDOMTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  };

  // Sync state with localStorage or pre-hydration DOM classes on client mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        applyDOMTheme(savedTheme);
      } else {
        const isDark = document.documentElement.classList.contains('dark');
        const initial = isDark ? 'dark' : 'light';
        setThemeState(initial);
        applyDOMTheme(initial);
      }
    } catch (e) {
      applyDOMTheme('dark');
    }
  }, []);

  /**
   * Explicitly sets the theme, updates DOM, and persists to localStorage
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyDOMTheme(newTheme);
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
  };

  /**
   * Toggles between 'light' and 'dark'
   */
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};



