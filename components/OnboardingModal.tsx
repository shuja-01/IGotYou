'use client';

import React from 'react';
import { X, Check, Activity, HeartPulse, TrendingDown, Flame, Zap, Milk, Wheat, ShieldCheck } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { HEALTH_CONDITIONS } from '@/lib/healthRules';

const ICON_MAP: Record<string, React.ReactNode> = {
  Activity: <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  HeartPulse: <HeartPulse className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
  TrendingDown: <TrendingDown className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
  Flame: <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
  Zap: <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
  Milk: <Milk className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  Wheat: <Wheat className="w-5 h-5 text-amber-700 dark:text-yellow-400" />,
};

export const OnboardingModal: React.FC = () => {
  const {
    activeConditions,
    toggleCondition,
    applyPresetProfile,
    isProfileDrawerOpen,
    setIsProfileDrawerOpen,
  } = useProfile();

  if (!isProfileDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div
        className="glass-panel relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Your Health Profile Checklist</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your medical & dietary conditions for automated food safety evaluations.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileDrawerOpen(false)}
            type="button"
            aria-label="Close profile modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 py-3 bg-slate-100/90 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-semibold mr-1">Quick Presets:</span>
          <button
            type="button"
            onClick={() => applyPresetProfile('diabetic')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs"
          >
            Diabetic
          </button>
          <button
            type="button"
            onClick={() => applyPresetProfile('hypertensive')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs"
          >
            High Blood Pressure
          </button>
          <button
            type="button"
            onClick={() => applyPresetProfile('lactose')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs"
          >
            Lactose Sensitive
          </button>
          <button
            type="button"
            onClick={() => applyPresetProfile('gout')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs"
          >
            Gout / Uric Acid
          </button>
          <button
            type="button"
            onClick={() => applyPresetProfile('gluten')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all text-xs"
          >
            Celiac / Gluten Free
          </button>
          <button
            type="button"
            onClick={() => applyPresetProfile('healthy')}
            className="px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-transparent transition-all text-xs"
          >
            Reset All
          </button>
        </div>

        {/* Condition Checkboxes List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {HEALTH_CONDITIONS.map((cond) => {
            const isSelected = activeConditions.includes(cond.id);
            return (
              <div
                key={cond.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleCondition(cond.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCondition(cond.id);
                  }
                }}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isSelected
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-500/60 dark:border-emerald-500/50 shadow-sm'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 shrink-0">
                    {ICON_MAP[cond.iconName]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                        {cond.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {cond.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{cond.description}</p>
                  </div>
                </div>

                <div
                  className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Active conditions: <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">{activeConditions.length}</span>
          </div>
          <button
            onClick={() => setIsProfileDrawerOpen(false)}
            type="button"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Save Profile & View Products
          </button>
        </div>
      </div>
    </div>
  );
};

