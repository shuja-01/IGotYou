'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { ProductCard } from '@/components/ProductCard';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { Product, EvaluationStatus } from '@/types/health';
import {
  fetchAllProducts,
  SEED_PRODUCTS,
  searchOpenFoodFactsAPI,
  SUPPORTED_COUNTRIES,
  CountryOption,
  getCountrySeedProducts,
} from '@/lib/productsData';
import { evaluateProductSuitability, HEALTH_CONDITIONS } from '@/lib/healthRules';
import { useProfile } from '@/context/ProfileContext';
import { ShieldCheck, SlidersHorizontal, Sparkles, ChevronDown, Globe, Loader2 } from 'lucide-react';

const LOCAL_STORAGE_COUNTRY_KEY = 'igotyou_selected_country_v1';

export default function Home() {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<EvaluationStatus | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Country Selection State
  const [selectedCountry, setSelectedCountryState] = useState<CountryOption>(
    SUPPORTED_COUNTRIES[0]
  );

  // Responsive Pagination: 6 on mobile, 12 on desktop
  const [visibleCount, setVisibleCount] = useState(12);
  const [isSearchingAPI, setIsSearchingAPI] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  const { activeConditions, setIsProfileDrawerOpen } = useProfile();

  // Load saved country preference
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem(LOCAL_STORAGE_COUNTRY_KEY);
      if (savedCode) {
        const found = SUPPORTED_COUNTRIES.find((c) => c.code === savedCode);
        if (found) setSelectedCountryState(found);
      }
    } catch (e) {}
  }, []);

  const handleSetSelectedCountry = (country: CountryOption) => {
    setSelectedCountryState(country);
    setSearchQuery('');
    setVisibleCount(12);
    try {
      localStorage.setItem(LOCAL_STORAGE_COUNTRY_KEY, country.code);
    } catch (e) {}
  };

  // Detect mobile screen for initial visible count
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      setVisibleCount(isMobile ? 6 : 12);
    }
  }, []);

  // Fetch products whenever selected country changes
  useEffect(() => {
    async function loadData() {
      if (selectedCountry.code === 'IN') {
        const items = await fetchAllProducts();
        setProducts(items && items.length > 0 ? items : SEED_PRODUCTS);
      } else {
        const countryItems = getCountrySeedProducts(selectedCountry.code);
        setProducts(countryItems);
      }
    }
    loadData();
  }, [selectedCountry]);

  // Live Open Food Facts API Search Debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setApiProducts([]);
      setIsSearchingAPI(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAPI(true);
      const results = await searchOpenFoodFactsAPI(
        searchQuery,
        selectedCountry.tag,
        selectedCountry.code
      );
      setApiProducts(results);
      setIsSearchingAPI(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCountry]);

  // Combine Products cleanly
  const combinedProducts = React.useMemo(() => {
    if (apiProducts.length === 0) return products;
    const existingNames = new Set(products.map((p) => p.name.toLowerCase()));
    const newFromApi = apiProducts.filter((p) => !existingNames.has(p.name.toLowerCase()));
    return [...apiProducts, ...newFromApi, ...products];
  }, [products, apiProducts]);

  // Filter products based on search, category, and evaluation status
  const filteredProducts = combinedProducts.filter((product) => {
    // 1. Search Query & Category Filter
    const matchesQuery =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    if (!matchesQuery || !matchesCategory) return false;

    // 2. Safety Status Filter
    if (statusFilter === 'all') return true;
    const evaluation = evaluateProductSuitability(product, activeConditions);
    return evaluation.status === statusFilter;
  });

  // Slice visible products for mobile/desktop pagination
  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const activeConditionObjs = HEALTH_CONDITIONS.filter((c) =>
    activeConditions.includes(c.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header with Country Selector */}
      <Header
        selectedCountry={selectedCountry}
        setSelectedCountry={handleSetSelectedCountry}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Profile Banner */}
        <section className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-gradient-to-r from-emerald-500/10 via-slate-100 to-teal-500/10 dark:from-slate-900/90 dark:via-slate-900/50 dark:to-emerald-950/20 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Instant Health Evaluation Active</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Food Safety Advisor for Commercial Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Evaluating food items live against your{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {activeConditions.length} active health condition filters
                </strong>
                . Country Region:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedCountry.flag} {selectedCountry.name}
                </span>
                .
              </p>
            </div>

            {/* Active condition badge tags */}
            <div className="flex flex-wrap items-center gap-2 bg-white/80 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full md:w-auto shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-1">Active:</span>
              {activeConditionObjs.length === 0 ? (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-500/20">
                  None Selected (Showing Standard Specs)
                </span>
              ) : (
                activeConditionObjs.map((cond) => (
                  <span
                    key={cond.id}
                    className="text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/30 px-3 py-1 rounded-xl shadow-sm"
                  >
                    {cond.shortName}
                  </span>
                ))
              )}
              <button
                onClick={() => setIsProfileDrawerOpen(true)}
                className="ml-auto text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-4 pl-2"
              >
                Change
              </button>
            </div>
          </div>
        </section>

        {/* Search & Filter Controls */}
        <section className="space-y-2">
          <SearchAndFilter
            searchQuery={searchQuery}
            setSearchQuery={(q) => {
              setSearchQuery(q);
              setVisibleCount(6);
            }}
            selectedCategory={selectedCategory}
            setSelectedCategory={(c) => {
              setSelectedCategory(c);
              setVisibleCount(6);
            }}
            statusFilter={statusFilter}
            setStatusFilter={(s) => {
              setStatusFilter(s);
              setVisibleCount(6);
            }}
            totalResults={filteredProducts.length}
            placeholder={selectedCountry.searchPlaceholder}
          />

          {/* Open Food Facts Live Search Status Indicator */}
          {isSearchingAPI && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                Searching Open Food Facts global database for {selectedCountry.flag} {selectedCountry.name}...
              </span>
            </div>
          )}
          {apiProducts.length > 0 && searchQuery && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 py-0.5">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Found <strong className="text-emerald-600 dark:text-emerald-400">{apiProducts.length}</strong> commercial products for "{searchQuery}"
              </span>
            </div>
          )}
        </section>

        {/* Products Card Grid */}
        <section className="space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="glass-panel text-center py-16 px-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Matching Products Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Try searching for standard commercial brands, select a different country, or reset your safety status filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setStatusFilter('all');
                }}
                className="mt-2 text-xs font-semibold bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 px-4 py-2 rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {displayedProducts.length < filteredProducts.length && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-6 py-3 rounded-2xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Load More Products ({filteredProducts.length - displayedProducts.length} remaining)</span>
                    <ChevronDown className="w-4 h-4 text-emerald-500" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-8 text-center text-xs text-slate-500 dark:text-slate-500 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">I Got You! Food Suitability Advisor</span>
          </div>
          <p>© 2026 I Got You! Health Platform. Commercial food safety & nutritional rule engine.</p>
        </div>
      </footer>

      {/* Interactive Modals */}
      <OnboardingModal />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
