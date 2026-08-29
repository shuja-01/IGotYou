'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { ProductCard } from '@/components/ProductCard';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { AccessLockModal } from '@/components/AccessLockModal';
import { MacroCalculatorModal, UserMacroTargets } from '@/components/MacroCalculatorModal';
import { BarcodeScannerModal } from '@/components/BarcodeScannerModal';
import { EmergencyHelpModal } from '@/components/EmergencyHelpModal';
import { Product, EvaluationStatus } from '@/types/health';
import {
  fetchAllProducts,
  SEED_PRODUCTS,
  searchOpenFoodFactsAPI,
  searchFreeDishAPI,
  SUPPORTED_COUNTRIES,
  CountryOption,
  getCountrySeedProducts,
} from '@/lib/productsData';
import { evaluateProductSuitability, HEALTH_CONDITIONS } from '@/lib/healthRules';
import { useProfile } from '@/context/ProfileContext';
import { Globe, Loader2, QrCode } from 'lucide-react';

const LOCAL_STORAGE_COUNTRY_KEY = 'igotyou_selected_country_v1';
const LOCAL_STORAGE_MACRO_KEY = 'igotyou_user_macro_targets_v1';

export default function Home() {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<EvaluationStatus | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('search');

  // Modals state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMacroCalcOpen, setIsMacroCalcOpen] = useState(false);
  const [isEmergencyHelpOpen, setIsEmergencyHelpOpen] = useState(false);
  const [savedMacroTargets, setSavedMacroTargets] = useState<UserMacroTargets | null>(null);

  // Country Selection State
  const [selectedCountry, setSelectedCountryState] = useState<CountryOption>(
    SUPPORTED_COUNTRIES[0]
  );

  // Responsive Pagination
  const [visibleCount, setVisibleCount] = useState(12);
  const [isSearchingAPI, setIsSearchingAPI] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  const { activeConditions, setIsProfileDrawerOpen } = useProfile();

  // Load saved country & macro targets
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem(LOCAL_STORAGE_COUNTRY_KEY);
      if (savedCode) {
        const found = SUPPORTED_COUNTRIES.find((c) => c.code === savedCode);
        if (found) setSelectedCountryState(found);
      }

      const savedMacro = localStorage.getItem(LOCAL_STORAGE_MACRO_KEY);
      if (savedMacro) {
        setSavedMacroTargets(JSON.parse(savedMacro));
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

  // Load products based on country
  useEffect(() => {
    async function loadData() {
      const initialSeed = getCountrySeedProducts(selectedCountry.code);
      setProducts(initialSeed);
    }
    loadData();
  }, [selectedCountry]);

  // Debounced API Search across Open Food Facts & USDA
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setApiProducts([]);
      setIsSearchingAPI(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAPI(true);
      try {
        const [offResults, usdaResults] = await Promise.all([
          searchOpenFoodFactsAPI(
            searchQuery,
            selectedCountry.tag,
            selectedCountry.code
          ),
          searchFreeDishAPI(searchQuery),
        ]);

        const mergedApi = [...offResults, ...usdaResults];
        const uniqueMerged = mergedApi.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.name.toLowerCase() === item.name.toLowerCase())
        );

        setApiProducts(uniqueMerged);
      } catch (err) {
        console.warn('API Search error:', err);
      } finally {
        setIsSearchingAPI(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCountry]);

  // Combine static and live products
  const combinedProducts = useMemo(() => {
    if (!apiProducts || apiProducts.length === 0) return products;
    const existingNames = new Set(products.map((p) => p.name.toLowerCase()));
    const newFromApi = apiProducts.filter((p) => !existingNames.has(p.name.toLowerCase()));
    return [...apiProducts, ...newFromApi, ...products];
  }, [products, apiProducts]);

  // Filter products based on search, category, and evaluation status
  const filteredProducts = combinedProducts.filter((product) => {
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

    if (statusFilter === 'all') return true;
    const evaluation = evaluateProductSuitability(product, activeConditions);
    return evaluation.status === statusFilter;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const activeConditionObjs = HEALTH_CONDITIONS.filter((c) =>
    activeConditions.includes(c.id)
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">
      {/* Sidebar (Desktop Persistent & Mobile Slide-Over Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenEmergencyHelp={() => setIsEmergencyHelpOpen(true)}
        onOpenMacroCalculator={() => setIsMacroCalcOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top Header Navigation */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onFocusSearch={() => {
            const input = document.getElementById('main-food-search-input');
            if (input) input.focus();
          }}
        />

        {/* Dashboard Main Scrollable Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {/* Personalized Dietary Suitability Engine Hero Card */}
          <section className="bg-black dark:bg-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 border border-slate-900">
            <div className="space-y-3 max-w-2xl w-full">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                Personalized Dietary Suitability Engine
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluating food items live against your{' '}
                <strong className="text-white font-bold tabular-nums">
                  {activeConditions.length} active health condition filters
                </strong>
                . Selected Region: {selectedCountry.flag} {selectedCountry.name}.
              </p>

              {/* Active Condition Badge Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-400 font-semibold">Active:</span>
                {activeConditionObjs.length === 0 ? (
                  <span className="px-3 py-1 bg-white text-slate-950 rounded-full text-xs font-bold shadow-xs">
                    🟢 General / Healthy
                  </span>
                ) : (
                  activeConditionObjs.map((cond) => (
                    <span
                      key={cond.id}
                      className="px-3 py-1 bg-white text-slate-950 rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5"
                    >
                      <span>{cond.id === 'diabetes_type_2' ? '⬡' : '♡'}</span>
                      <span>{cond.shortName}</span>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Right Buttons: Change Profile + Scan */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsProfileDrawerOpen(true)}
                className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Change Profile
              </button>

              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                <QrCode className="w-4 h-4 stroke-[2.5]" />
                <span>Scan</span>
              </button>
            </div>
          </section>

          {/* Real-Time Health Evaluation Center Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Real-Time Health Evaluation Center
              </h3>

              {/* Country Region Pill */}
              <div className="self-start sm:self-auto flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">REGION:</span>
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const found = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value);
                    if (found) handleSetSelectedCountry(found);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search and Safety Filter Control */}
            <SearchAndFilter
              searchQuery={searchQuery}
              setSearchQuery={(q) => {
                setSearchQuery(q);
                setVisibleCount(12);
              }}
              selectedCategory={selectedCategory}
              setSelectedCategory={(c) => {
                setSelectedCategory(c);
                setVisibleCount(12);
              }}
              statusFilter={statusFilter}
              setStatusFilter={(s) => {
                setStatusFilter(s);
                setVisibleCount(12);
              }}
              totalResults={filteredProducts.length}
            />

            {/* Live Search Status Indicator */}
            {isSearchingAPI && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 py-1 font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  Searching Open Food Facts live for {selectedCountry.flag} {selectedCountry.name}...
                </span>
              </div>
            )}
            {apiProducts.length > 0 && searchQuery && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 py-0.5 font-medium">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  Found <strong className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">{apiProducts.length}</strong> items for "{searchQuery}"
                </span>
              </div>
            )}
          </section>

          {/* Product Cards Grid (1 col on mobile, 2 cols on tablet, 3 cols on desktop) */}
          <section className="space-y-8">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">No Matching Products Found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Try searching for popular packaged snacks, regional dishes, or reset your filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setStatusFilter('all');
                  }}
                  type="button"
                  className="mt-2 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-5 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      type="button"
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs transition-all hover:scale-[1.01]"
                    >
                      Load More Items ({filteredProducts.length - displayedProducts.length} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Centered Footer */}
          <footer className="pt-12 pb-8 text-center space-y-1 border-t border-slate-200 dark:border-slate-800/80">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              I Got You! Food Suitability Advisor
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © 2026 I Got You! Health Platform. Commercial food safety & nutritional rule engine.
            </p>
          </footer>
        </main>
      </div>

      {/* Interactive Modals */}
      <AccessLockModal />
      <OnboardingModal />
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductFound={(product) => setSelectedProduct(product)}
      />
      <MacroCalculatorModal
        isOpen={isMacroCalcOpen}
        onClose={() => setIsMacroCalcOpen(false)}
        onSaveTargets={(targets) => setSavedMacroTargets(targets)}
      />
      <EmergencyHelpModal
        isOpen={isEmergencyHelpOpen}
        onClose={() => setIsEmergencyHelpOpen(false)}
      />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
