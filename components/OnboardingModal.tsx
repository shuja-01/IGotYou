'use client';

import React from 'react';
import { X, Check, Activity, HeartPulse, TrendingDown, Flame, Zap, Milk, Wheat, Shield } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { HEALTH_CONDITIONS } from '@/lib/healthRules';

const ICON_MAP: Record<string, React.ReactNode> = {
  Activity: <Activity className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
  HeartPulse: <HeartPulse className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
  TrendingDown: <TrendingDown className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
  Flame: <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />,
  Zap: <Zap className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
  Milk: <Milk className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  Wheat: <Wheat className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="glass-panel relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Health Profile Checklist</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your medical & dietary conditions for automated food safety checks.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileDrawerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 py-3 bg-slate-100/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/50 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium mr-1">Sample Profiles:</span>
          <button
            onClick={() => applyPresetProfile('diabetic')}
            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-400 transition-all"
          >
             diabetic
          </button>
          <button
            onClick={() => applyPresetProfile('hypertensive')}
            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-400 transition-all"
          >
             high_bp
          </button>
          <button
            onClick={() => applyPresetProfile('lactose')}
            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-400 transition-all"
          >
             lactose_sensitive
          </button>
          <button
            onClick={() => applyPresetProfile('gout')}
            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-400 transition-all"
          >
             uric_acid
          </button>
          <button
            onClick={() => applyPresetProfile('gluten')}
            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-400 transition-all"
          >
             celiac_gluten
          </button>
          <button
            onClick={() => applyPresetProfile('healthy')}
            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-400 transition-all"
          >
             clear_all
          </button>
        </div>

        {/* Condition Checkboxes List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {HEALTH_CONDITIONS.map((cond) => {
            const isSelected = activeConditions.includes(cond.id);
            return (
              <div
                key={cond.id}
                onClick={() => toggleCondition(cond.id)}
                className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/50 dark:border-emerald-500/40 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60">
                    {ICON_MAP[cond.iconName]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-white">
                        {cond.name}
                      </h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {cond.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{cond.description}</p>
                  </div>
                </div>

                <div
                  className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 dark:text-slate-950'
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
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Active conditions: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{activeConditions.length}</span>
          </div>
          <button
            onClick={() => setIsProfileDrawerOpen(false)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            Save Profile & View Products
          </button>
        </div>
      </div>
    </div>
  );
};
