'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { EvaluationStatus } from '@/types/health';

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  statusFilter: EvaluationStatus | 'all';
  setStatusFilter: (status: EvaluationStatus | 'all') => void;
  totalResults: number;
  placeholder?: string;
}

const CATEGORIES = ['All', 'Dishes', 'Snacks', 'Biscuits', 'Dairy', 'Soft Drinks', 'Instant Foods', 'Chocolates'];

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  statusFilter,
  setStatusFilter,
  totalResults,
  placeholder = 'Search food items, brands, or categories...',
}) => {
  return (
    <div className="space-y-4">
      {/* Full-width Search Input Bar */}
      <div className="relative w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-700 dark:group-focus-within:text-slate-200 transition-colors" />
        <input
          id="main-food-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            type="button"
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              type="button"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Safety Status Filters Row */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Filter by Safety:
        </span>

        <div className="flex items-center gap-2">
          {/* All Safety */}
          <button
            onClick={() => setStatusFilter('all')}
            type="button"
            className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            All Safety
          </button>

          {/* Safe */}
          <button
            onClick={() => setStatusFilter('safe')}
            type="button"
            className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              statusFilter === 'safe'
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            Safe
          </button>

          {/* Caution */}
          <button
            onClick={() => setStatusFilter('caution')}
            type="button"
            className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              statusFilter === 'caution'
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            Caution
          </button>

          {/* Harmful */}
          <button
            onClick={() => setStatusFilter('harmful')}
            type="button"
            className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              statusFilter === 'harmful'
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            Harmful
          </button>
        </div>
      </div>

      {/* Results Count Line */}
      <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
        Showing <strong className="text-slate-900 dark:text-slate-100 font-extrabold tabular-nums">{totalResults}</strong> evaluated items
      </div>
    </div>
  );
};
