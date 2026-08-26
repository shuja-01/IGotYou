'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertOctagon, AlertTriangle, CheckCircle2, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { Product } from '@/types/health';
import { evaluateProductSuitability } from '@/lib/healthRules';
import { useProfile } from '@/context/ProfileContext';
import { getFallbackProductImage } from '@/lib/productsData';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { activeConditions } = useProfile();
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    if (product) {
      setImgSrc(product.image_url || getFallbackProductImage(product.category));
    }
  }, [product]);

  if (!product) return null;

  const evaluation = evaluateProductSuitability(product, activeConditions);
  const { nutrition_per_100g: n } = product;
  const fallbackUrl = getFallbackProductImage(product.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div
        className="glass-panel relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              {product.category}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Serving Size: {product.serving_size || '100g'}</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Header Product Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative w-full md:w-48 h-48 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
              <img
                src={imgSrc || fallbackUrl}
                alt={product.name}
                onError={() => setImgSrc(fallbackUrl)}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {product.brand}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">{product.name}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{product.description}</p>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border ${evaluation.statusBg} ${evaluation.statusBorder} flex items-start gap-3`}
              >
                {evaluation.status === 'safe' && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
                {evaluation.status === 'caution' && (
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                {evaluation.status === 'harmful' && (
                  <AlertOctagon className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{evaluation.statusLabel}</span>
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{evaluation.recommendation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* "Why This Affects You" Section */}
          <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Why This Affects Your Health Profile</span>
            </div>

            {evaluation.warnings.length > 0 ? (
              <div className="space-y-3">
                {evaluation.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                      w.severity === 'harmful'
                        ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
                        : 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    <div className="mt-0.5">
                      {w.severity === 'harmful' ? (
                        <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{w.conditionName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                          {w.reason}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{w.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  No health conflicts found for your currently selected condition profile.
                </span>
              </div>
            )}
          </div>

          {/* Full Nutritional Facts Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Nutritional Facts (Per 100g)</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium">Calories</span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{n.calories} kcal</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium">Sugar</span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{n.sugar_g} g</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium">Sodium</span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{n.sodium_mg} mg</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium">Saturated Fat</span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{n.saturated_fat_g} g</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium">Trans Fat</span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{n.trans_fat_g} g</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium">Cholesterol</span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{n.cholesterol_mg} mg</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium">Contains Lactose</span>
                <span className={`text-sm font-bold ${n.contains_lactose ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {n.contains_lactose ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium">Contains Gluten</span>
                <span className={`text-sm font-bold ${n.contains_gluten ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {n.contains_gluten ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            Close Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};

