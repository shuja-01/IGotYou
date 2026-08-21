'use client';

import React from 'react';
import { ShieldCheck, HeartPulse, UserCheck, Sun, Moon, Globe, Calculator, Flame } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/context/ThemeContext';
import { HEALTH_CONDITIONS } from '@/lib/healthRules';
import { SUPPORTED_COUNTRIES, CountryOption } from '@/lib/productsData';

interface HeaderProps {
  selectedCountry?: CountryOption;
  setSelectedCountry?: (country: CountryOption) => void;
  onOpenMacroCalculator?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCountry = SUPPORTED_COUNTRIES[0],
  setSelectedCountry,
  onOpenMacroCalculator,
}) => {
  const { activeConditions, setIsProfileDrawerOpen } = useProfile();
  const { theme, setTheme } = useTheme();

  const activeConditionObjs = HEALTH_CONDITIONS.filter((c) =>
    activeConditions.includes(c.id)
  );

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                I Got You<span className="text-emerald-500 dark:text-emerald-400">!</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                Health Advisor
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Personalized Food Safety & Suitability Evaluator</p>
          </div>
        </div>

        {/* Header Controls: Country Selector + Active Profile + Macro Calc + Theme Switcher + Edit Profile */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5">
          {/* Country Selector Dropdown */}
          {setSelectedCountry && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-full px-2.5 py-1 text-xs shadow-sm">
              <Globe className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Macro Calculator Trigger Button */}
          {onOpenMacroCalculator && (
            <button
              onClick={onOpenMacroCalculator}
              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Flame className="w-3.5 h-3.5 text-emerald-500" />
              <span>Daily Calorie & Macro Target</span>
            </button>
          )}

          {/* Active Profile Pill */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-500 dark:text-slate-400">Profile:</span>
            {activeConditionObjs.length === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                🟢 General
              </span>
            ) : (
              <div className="flex flex-wrap gap-1 items-center">
                {activeConditionObjs.slice(0, 2).map((c) => (
                  <span
                    key={c.id}
                    className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-medium"
                  >
                    {c.shortName}
                  </span>
                ))}
                {activeConditionObjs.length > 2 && (
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-full text-[10px]">
                    +{activeConditionObjs.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Light / Dark Mode Segmented Pill */}
          <div className="flex items-center bg-slate-200/90 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-semibold shadow-inner">
            <button
              onClick={() => setTheme('light')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                theme === 'light'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-slate-950' : 'text-amber-500'}`} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-slate-950' : 'text-indigo-400'}`} />
              <span>Dark</span>
            </button>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};
