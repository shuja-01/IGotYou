'use client';

import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

const PASSCODE_STORAGE_KEY = 'igotyou_access_unlocked_v1';

export const AccessLockModal: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Read environment variable set in Vercel
  const requiredPasscode =
    process.env.NEXT_PUBLIC_ACCESS_PASSCODE ||
    process.env.NEXT_PUBLIC_SITE_PASSWORD ||
    process.env.NEXT_PUBLIC_APP_PASSWORD ||
    process.env.NEXT_PUBLIC_ACCESS_CODE ||
    '';

  useEffect(() => {
    // If no environment passcode is set, keep site unlocked automatically
    if (!requiredPasscode) {
      setIsUnlocked(true);
      return;
    }

    // Check if user has previously unlocked the session
    try {
      const savedState = localStorage.getItem(PASSCODE_STORAGE_KEY);
      if (savedState === 'true' || savedState === requiredPasscode) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    } catch (e) {
      setIsUnlocked(false);
    }
  }, [requiredPasscode]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || passcode.trim() === '') {
      setErrorMessage('Please enter the access passcode.');
      return;
    }

    if (passcode.trim() === requiredPasscode.trim()) {
      try {
        localStorage.setItem(PASSCODE_STORAGE_KEY, 'true');
      } catch (e) {}
      setIsUnlocked(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Incorrect passcode. Please check Vercel environment settings.');
    }
  };

  // If unlocked or no protection required, render nothing
  if (isUnlocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
        {/* Glow background accent */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Icon Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Lock className="w-7 h-7 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protected Application</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Enter Access Passcode
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              This application is protected. Please enter the passcode to access the health advisor.
            </p>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
              <span>Access Passcode</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Enter passcode..."
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Unlock Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
          Environment Variable: <code className="text-emerald-500">NEXT_PUBLIC_ACCESS_PASSCODE</code>
        </p>
      </div>
    </div>
  );
};
