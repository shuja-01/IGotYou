'use client';

import React from 'react';
import { Search, ShieldCheck, AlertTriangle, AlertOctagon, X } from 'lucide-react';
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

const CATEGORIES = ['All', 'Snacks', 'Biscuits', 'Dairy', 'Soft Drinks', 'Instant Foods', 'Chocolates'];

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
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-10 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dynamic Safety Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Safety
          </button>
          <button
            onClick={() => setStatusFilter('safe')}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              statusFilter === 'safe'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 border-transparent shadow-sm'
                : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe</span>
          </button>
          <button
            onClick={() => setStatusFilter('caution')}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              statusFilter === 'caution'
                ? 'bg-amber-500 text-slate-950 border-transparent shadow-sm font-bold'
                : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Caution</span>
          </button>
          <button
            onClick={() => setStatusFilter('harmful')}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              statusFilter === 'harmful'
                ? 'bg-rose-600 text-white dark:bg-rose-500 dark:text-white border-transparent shadow-sm font-bold'
                : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Harmful</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 self-center">
          Showing <strong className="text-slate-800 dark:text-slate-200 font-semibold">{totalResults}</strong> items
        </span>
      </div>
    </div>
  );
};
