'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info, ChevronRight, Milk, Wheat } from 'lucide-react';
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
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'caution':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'harmful':
        return <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />;
    }
  };

  const getStatusBadgeStyles = () => {
    switch (evaluation.status) {
      case 'safe':
        return 'bg-emerald-50/95 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/40 shadow-sm';
      case 'caution':
        return 'bg-amber-50/95 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40 shadow-sm';
      case 'harmful':
        return 'bg-rose-50/95 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-500/40 shadow-sm';
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectProduct(product);
        }
      }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group hover:scale-[1.015] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {/* Product Image & Badge Header */}
      <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(fallbackUrl)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent dark:from-slate-950/90 dark:via-slate-950/30 pointer-events-none" />

        {/* Dynamic Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${getStatusBadgeStyles()}`}
          >
            {getStatusIcon()}
            <span>{evaluation.statusLabel}</span>
          </div>
        </div>

        {/* Category & Allergen Pills */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          {product.nutrition_per_100g.contains_lactose && (
            <span
              title="Contains Lactose"
              className="bg-blue-600/90 text-white p-1 rounded-md text-[10px] backdrop-blur-md shadow-sm"
            >
              <Milk className="w-3 h-3" />
            </span>
          )}
          {product.nutrition_per_100g.contains_gluten && (
            <span
              title="Contains Gluten"
              className="bg-amber-600/90 text-white p-1 rounded-md text-[10px] backdrop-blur-md shadow-sm"
            >
              <Wheat className="w-3 h-3" />
            </span>
          )}
          <span className="bg-slate-900/85 dark:bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-700/60 dark:border-slate-800">
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
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Nutritional Highlights */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-200 dark:border-slate-800/80 text-center text-xs">
          <div className="bg-slate-50 dark:bg-slate-900/70 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">Sugar</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{product.nutrition_per_100g.sugar_g}g</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/70 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">Sodium</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{product.nutrition_per_100g.sodium_mg}mg</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/70 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">Sat Fat</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">{product.nutrition_per_100g.saturated_fat_g}g</span>
          </div>
        </div>

        {/* Evaluation Warning Summary snippet */}
        {evaluation.warnings.length > 0 ? (
          <div className="text-xs space-y-1">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{evaluation.warnings[0].reason}</span>
            </p>
          </div>
        ) : (
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Fits active profile conditions</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold group-hover:text-emerald-500 dark:group-hover:text-emerald-300">
          <span>View Health Evaluation</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

