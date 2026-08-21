'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info, ChevronRight } from 'lucide-react';
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

  const fallbackUrl = getFallbackProductImage(product.category);
  const [imgSrc, setImgSrc] = useState(product.image_url || fallbackUrl);

  const getStatusIcon = () => {
    switch (evaluation.status) {
      case 'safe':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      case 'caution':
        return <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'harmful':
        return <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
    }
  };

  const getLightStatusBadge = () => {
    switch (evaluation.status) {
      case 'safe':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'caution':
        return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
      case 'harmful':
        return 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30';
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group hover:scale-[1.01] transition-all"
    >
      {/* Product Image & Badge Header */}
      <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {/* Native <img> with instant fallback handler */}
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(fallbackUrl)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent dark:from-slate-950 dark:via-slate-950/20 pointer-events-none" />

        {/* Dynamic Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-sm ${getLightStatusBadge()}`}
          >
            {getStatusIcon()}
            <span>{evaluation.statusLabel}</span>
          </div>
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-slate-900/90 dark:bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-700 dark:border-slate-800">
            {product.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
            {product.brand}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors mt-0.5">
            {product.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        {/* Nutritional Highlights */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200 dark:border-slate-800/80 text-center text-xs">
          <div className="bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="block text-[10px] text-slate-500">Sugar</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{product.nutrition_per_100g.sugar_g}g</span>
          </div>
          <div className="bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="block text-[10px] text-slate-500">Sodium</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{product.nutrition_per_100g.sodium_mg}mg</span>
          </div>
          <div className="bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="block text-[10px] text-slate-500">Sat Fat</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{product.nutrition_per_100g.saturated_fat_g}g</span>
          </div>
        </div>

        {/* Evaluation Warning Summary snippet */}
        {evaluation.warnings.length > 0 ? (
          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400/90 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{evaluation.warnings[0].reason}</span>
            </p>
          </div>
        ) : (
          <div className="text-xs text-emerald-700 dark:text-emerald-400/80 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fits active profile conditions</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold group-hover:text-emerald-500 dark:group-hover:text-emerald-300">
          <span>View Full Evaluation</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
