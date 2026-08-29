'use client';

import React from 'react';
import { X, AlertTriangle, PhoneCall, ShieldAlert, HeartPulse, Hospital, CheckCircle2 } from 'lucide-react';

interface EmergencyHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyHelpModal: React.FC<EmergencyHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="glass-panel relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Emergency Health Protocol</h2>
              <p className="text-xs text-rose-100 font-medium">Critical Food Allergen & Medical Action Steps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-rose-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2">
            <h3 className="font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-2 text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Immediate Anaphylaxis / Allergen Signs
            </h3>
            <p className="text-rose-700 dark:text-rose-400 leading-relaxed font-medium">
              If experiencing swelling of the lips, tongue, throat, difficulty breathing, dizziness, or severe rash after consuming a food item, seek immediate emergency medical care.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Emergency Hotlines by Region:
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">🇮🇳 India</span>
                <p className="text-slate-500 dark:text-slate-400">National Ambulance: <strong className="text-emerald-600 dark:text-emerald-400">112 / 108</strong></p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">🇲🇾 Malaysia</span>
                <p className="text-slate-500 dark:text-slate-400">MERS Emergency: <strong className="text-emerald-600 dark:text-emerald-400">999 / 112</strong></p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">🇸🇬 Singapore</span>
                <p className="text-slate-500 dark:text-slate-400">SCDF Ambulance: <strong className="text-emerald-600 dark:text-emerald-400">995</strong></p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">🇮🇩 Indonesia</span>
                <p className="text-slate-500 dark:text-slate-400">National Emergency: <strong className="text-emerald-600 dark:text-emerald-400">112 / 118</strong></p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Diabetic Glucose Spike or Severe BP Spike:
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              If blood glucose exceeds 250 mg/dL or blood pressure spikes above 180/120 mmHg, rest immediately, hydrate, follow your prescribed physician insulin/medication protocol, and contact your healthcare provider.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Emergency Protocol
          </button>
        </div>
      </div>
    </div>
  );
};
