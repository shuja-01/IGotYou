'use client';

import React from 'react';
import { Search, ShieldCheck, AlertTriangle, AlertOctagon, X, Sparkles } from 'lucide-react';
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
  placeholder = 'Search by brand name or food item...',
}) => {
  return (
    <div className="space-y-4">
      {/* Search Input Bar & Status Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              type="button"
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dynamic Safety Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            type="button"
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            All Safety
          </button>
          <button
            onClick={() => setStatusFilter('safe')}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              statusFilter === 'safe'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 border-transparent shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe</span>
          </button>
          <button
            onClick={() => setStatusFilter('caution')}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              statusFilter === 'caution'
                ? 'bg-amber-500 text-slate-950 border-transparent shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Caution</span>
          </button>
          <button
            onClick={() => setStatusFilter('harmful')}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              statusFilter === 'harmful'
                ? 'bg-rose-600 text-white dark:bg-rose-500 dark:text-white border-transparent shadow-md shadow-rose-500/20'
                : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Harmful</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 self-center shrink-0">
          Showing <strong className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">{totalResults}</strong> evaluated items
        </span>
      </div>
    </div>
  );
};

