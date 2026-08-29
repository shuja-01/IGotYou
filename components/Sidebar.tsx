'use client';

import React from 'react';
import {
  LayoutDashboard,
  Search,
  HeartPulse,
  History,
  LifeBuoy,
  AlertTriangle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { HEALTH_CONDITIONS } from '@/lib/healthRules';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onOpenEmergencyHelp?: () => void;
  onOpenMacroCalculator?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'search',
  setActiveTab,
  onOpenEmergencyHelp,
  onOpenMacroCalculator,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user, activeConditions, setIsProfileDrawerOpen } = useProfile();

  // Format active conditions subtitle
  const activeConditionObjs = HEALTH_CONDITIONS.filter((c) =>
    activeConditions.includes(c.id)
  );

  let conditionsSummary = 'Standard Health Profile';
  if (activeConditionObjs.length === 1) {
    conditionsSummary = `Managing ${activeConditionObjs[0].name}`;
  } else if (activeConditionObjs.length === 2) {
    conditionsSummary = `Managing ${activeConditionObjs[0].shortName} & ${activeConditionObjs[1].shortName}`;
  } else if (activeConditionObjs.length > 2) {
    conditionsSummary = `Managing ${activeConditionObjs[0].shortName}, ${activeConditionObjs[1].shortName} +${activeConditionObjs.length - 2}`;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Food Search', icon: Search, isActivePill: true },
    {
      id: 'profile',
      label: 'Health Profile',
      icon: HeartPulse,
      onClick: () => {
        setIsProfileDrawerOpen(true);
        if (onCloseMobile) onCloseMobile();
      },
    },
    { id: 'history', label: 'History', icon: History },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  const sidebarInnerContent = (
    <div className="flex flex-col justify-between h-full space-y-6">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand Logo & Mobile Close Button */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-emerald-400 dark:text-emerald-600 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              I Got You<span className="text-emerald-500">!</span>
            </h1>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              type="button"
              aria-label="Close menu"
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Guardian Profile Mini Card */}
        <div
          onClick={() => {
            setIsProfileDrawerOpen(true);
            if (onCloseMobile) onCloseMobile();
          }}
          className="group cursor-pointer bg-slate-50 dark:bg-slate-900/90 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 hover:border-emerald-400/50 rounded-2xl p-3 flex items-center gap-3 transition-all shadow-xs"
        >
          {/* Avatar with subtle glow */}
          <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-200 p-0.5 shadow-sm shrink-0">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
              <span className="text-lg">🤖</span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {user?.full_name || 'Health Guardian'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
              {conditionsSummary}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (setActiveTab) {
                    setActiveTab(item.id);
                  }
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  item.isActivePill || (isSelected && item.id === 'search')
                    ? 'bg-emerald-300 dark:bg-emerald-400 text-slate-950 shadow-xs scale-[1.01]'
                    : isSelected
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Emergency Help Button */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => {
            if (onOpenEmergencyHelp) onOpenEmergencyHelp();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-extrabold py-3 px-4 rounded-2xl text-xs shadow-md shadow-rose-600/20 transition-all"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Emergency Help</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 flex-col justify-between p-5 min-h-screen sticky top-0 transition-colors duration-200">
        {sidebarInnerContent}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop Overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-950 p-5 h-full z-10 shadow-2xl flex flex-col justify-between animate-slideRight">
            {sidebarInnerContent}
          </div>
        </div>
      )}
    </>
  );
};
