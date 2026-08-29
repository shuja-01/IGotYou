'use client';

import React from 'react';
import { Search, User, Bell, Sun, Moon, Menu, ShieldCheck } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onFocusSearch?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'search',
  setActiveTab,
  onFocusSearch,
  onOpenMobileSidebar,
}) => {
  const { setIsProfileDrawerOpen } = useProfile();
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-200 sticky top-0 z-30">
      {/* Left: Mobile Hamburger Menu & Brand Logo */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            type="button"
            aria-label="Open Navigation Menu"
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Mobile Brand Logo */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600 stroke-[2.5]" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            I Got You<span className="text-emerald-500">!</span>
          </h1>
        </div>

        {/* Desktop Navigation Tabs (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('dashboard')}
            className={`text-xs font-semibold pb-1 transition-all ${
              activeTab === 'dashboard'
                ? 'text-slate-950 dark:text-white font-extrabold border-b-2 border-slate-950 dark:border-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('search')}
            className={`text-xs pb-1 transition-all ${
              activeTab === 'search'
                ? 'text-slate-950 dark:text-white font-extrabold border-b-2 border-slate-950 dark:border-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold'
            }`}
          >
            Food Search
          </button>

          <button
            type="button"
            onClick={() => setIsProfileDrawerOpen(true)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white pb-1 transition-all"
          >
            Health Profile
          </button>
        </nav>
      </div>

      {/* Right Utility Bar: Search + Profile + Notifications + Theme Switch */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Search Quick Action */}
        <button
          type="button"
          onClick={onFocusSearch}
          aria-label="Search food products"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <Search className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Profile Avatar Trigger */}
        <button
          type="button"
          onClick={() => setIsProfileDrawerOpen(true)}
          aria-label="Open User Profile"
          className="p-1 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <div className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <User className="w-4 h-4" />
          </div>
        </button>

        {/* Notifications Icon */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors hidden sm:flex"
        >
          <Bell className="w-4 h-4 stroke-[2.2]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 stroke-[2.2]" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 stroke-[2.2]" />
          )}
        </button>
      </div>
    </header>
  );
};
