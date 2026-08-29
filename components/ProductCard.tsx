'use client';

import React from 'react';
import Image from 'next/image';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Product } from '@/types/health';
import { evaluateProductSuitability } from '@/lib/healthRules';
import { useProfile } from '@/context/ProfileContext';
import { getFallbackProductImage } from '@/lib/productsData';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
}) => {
  const { activeConditions } = useProfile();
  const evaluation = evaluateProductSuitability(product, activeConditions);

  const fallbackImage = getFallbackProductImage(product.category);
  const imageUrl = product.image_url || fallbackImage;

  // Identify high-risk nutrients for red highlighting in the 3-column nutrition strip
  const n = product.nutrition_per_100g || {};
  const sugar = n.sugar_g ?? 0;
  const sodium = n.sodium_mg ?? 0;
  const satFat = n.saturated_fat_g ?? 0;

  const isSugarHarmful =
    activeConditions.includes('diabetes_type_2') && (sugar > 10 || product.harmful_tags?.includes('high_sugar'));
  const isSodiumHarmful =
    activeConditions.includes('hypertension') && (sodium > 400 || product.harmful_tags?.includes('high_sodium'));
  const isSatFatHarmful =
    activeConditions.includes('high_cholesterol') && (satFat > 5 || product.harmful_tags?.includes('high_saturated_fat'));

  // Get primary warning reason text
  const primaryWarning = evaluation.warnings?.[0];

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
    >
      {/* Top Media Container */}
      <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top-Right Safety Status Pill */}
        <div className="absolute top-3 right-3 z-10">
          {evaluation.status === 'harmful' && (
            <span className="bg-rose-500 text-white font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <ShieldAlert className="w-3 h-3 stroke-[2.5]" />
              <span>HARMFUL / AVOID</span>
            </span>
          )}
          {evaluation.status === 'caution' && (
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
              <span>CAUTION</span>
            </span>
          )}
          {evaluation.status === 'safe' && (
            <span className="bg-emerald-500 text-white font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
              <span>SAFE / GOOD TO GO</span>
            </span>
          )}
        </div>

        {/* Bottom-Left Category Pill */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white font-bold text-[10px] px-3 py-0.5 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Brand Name */}
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {product.brand}
          </span>

          {/* Product Title */}
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {product.description || `Evaluated commercial packaged food item (${product.serving_size || '100g'}).`}
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {/* 3-Column Nutrition Fact Strip */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center">
            <div>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">Sugar</span>
              <span
                className={`text-xs font-bold tabular-nums ${
                  isSugarHarmful ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {sugar}g
              </span>
            </div>
            <div className="border-x border-slate-100 dark:border-slate-800">
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">Sodium</span>
              <span
                className={`text-xs font-bold tabular-nums ${
                  isSodiumHarmful ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {sodium}mg
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">Sat Fat</span>
              <span
                className={`text-xs font-bold tabular-nums ${
                  isSatFatHarmful ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {satFat}g
              </span>
            </div>
          </div>

          {/* Condition Warning Alert Box */}
          {evaluation.status === 'harmful' && primaryWarning && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 flex items-center gap-2 text-[11px] text-rose-700 dark:text-rose-300 font-medium animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="line-clamp-1">{primaryWarning.reason}</span>
            </div>
          )}

          {evaluation.status === 'caution' && primaryWarning && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300 font-medium animate-fadeIn">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="line-clamp-1">{primaryWarning.reason}</span>
            </div>
          )}

          {evaluation.status === 'safe' && (
            <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="line-clamp-1">Safe for active profile conditions</span>
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors text-center"
          >
            View Health Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};
