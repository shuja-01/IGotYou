'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  QrCode,
  Sparkles,
  Search,
  Upload,
  AlertCircle,
  Loader2,
  RefreshCw,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Product } from '@/types/health';
import { getFallbackProductImage } from '@/lib/productsData';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: Product) => void;
}

// Sample real-world barcodes for instant testing
const SAMPLE_BARCODES = [
  { name: 'Uncle Chipps Spicy Treat', code: '8901491101837', brand: 'Uncle Chipps' },
  { name: 'Coca-Cola 330ml', code: '5449000000996', brand: 'Coca-Cola' },
  { name: 'Britannia Bourbon', code: '8901063012017', brand: 'Britannia' },
  { name: 'Dutch Lady Milk', code: '9556001001234', brand: 'Dutch Lady' },
  { name: 'KitKat 4-Finger', code: '7613035652599', brand: 'Nestlé' },
];

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onProductFound,
}) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isStoppingRef = useRef<boolean>(false);

  // Initialize and start Html5Qrcode camera
  const startScanner = async () => {
    if (typeof window === 'undefined') return;
    setCameraError('');
    setIsCameraActive(false);

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

      // Stop any existing instance
      await stopScanner();

      const viewportElem = document.getElementById('barcode-scanner-viewport');
      if (!viewportElem) return;

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.ITF,
      ];

      const html5QrCode = new Html5Qrcode('barcode-scanner-viewport', {
        formatsToSupport,
        verbose: false,
      });

      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode },
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxWidth = Math.max(220, Math.floor(minEdge * 0.85));
            const qrboxHeight = Math.max(140, Math.floor(minEdge * 0.55));
            return { width: qrboxWidth, height: qrboxHeight };
          },
          aspectRatio: 1.333333,
        },
        async (decodedText) => {
          if (decodedText && !isLoading && !isStoppingRef.current) {
            isStoppingRef.current = true;
            await stopScanner();
            lookupBarcode(decodedText);
          }
        },
        () => {
          // Frame non-match, ignore
        }
      );

      setIsCameraActive(true);
      isStoppingRef.current = false;
    } catch (err: any) {
      console.warn('Failed to start camera scanner:', err);
      setIsCameraActive(false);
      setCameraError(
        'Unable to access camera (permissions denied or in use). You can enter the barcode manually or upload an image below.'
      );
    }
  };

  // Stop scanner instance safely
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      } finally {
        scannerRef.current = null;
        setIsCameraActive(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow DOM element to render
      const timer = setTimeout(() => {
        startScanner();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
      setErrorMessage('');
      setIsLoading(false);
    }
  }, [isOpen, facingMode]);

  // Image Upload Barcode Scanning
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
      const tempScanner = new Html5Qrcode('barcode-file-temp', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });

      const decodedText = await tempScanner.scanFile(file, true);
      tempScanner.clear();

      if (decodedText) {
        await stopScanner();
        lookupBarcode(decodedText);
      } else {
        setErrorMessage('No barcode or QR code detected in the uploaded image.');
      }
    } catch (err: any) {
      console.warn('File scan error:', err);
      setErrorMessage('Could not decode barcode from this image. Please try a clearer photo or enter manually.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Lookup barcode in Open Food Facts database
  const lookupBarcode = async (barcodeToSearch: string) => {
    const code = barcodeToSearch.trim();
    if (!code) {
      setErrorMessage('Please provide a valid barcode number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'IGotYouHealthAdvisor/1.0 (https://igotyou.app)',
        },
      });

      if (!res.ok) {
        throw new Error(`Open Food Facts API error: HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.status === 1 && data.product) {
        const p = data.product;
        const nutriments = p.nutriments || {};
        const sugar = Number(nutriments['sugars_100g'] || nutriments['sugars'] || 0);
        const sodium = Math.round(
          Number(nutriments['sodium_100g'] || (nutriments['salt_100g'] || 0) / 2.5) * 1000
        );
        const satFat = Number(nutriments['saturated-fat_100g'] || 0);
        const transFat = Number(nutriments['trans-fat_100g'] || 0);
        const cholesterol = Math.round(Number(nutriments['cholesterol_100g'] || 0) * 1000);
        const calories = Math.round(
          Number(nutriments['energy-kcal_100g'] || (Number(nutriments['energy_100g']) || 0) / 4.184 || 150)
        );

        const allergens = (p.allergens_tags || []).join(' ').toLowerCase();
        const ingredients = (p.ingredients_text || '').toLowerCase();

        const containsLactose =
          allergens.includes('milk') ||
          allergens.includes('lactose') ||
          ingredients.includes('milk') ||
          ingredients.includes('cheese') ||
          ingredients.includes('cream');

        const containsGluten =
          allergens.includes('gluten') ||
          allergens.includes('wheat') ||
          ingredients.includes('wheat') ||
          ingredients.includes('barley') ||
          ingredients.includes('rye');

        const harmfulTags: string[] = [];
        if (sugar > 10) harmfulTags.push('high_sugar');
        if (sodium > 400) harmfulTags.push('high_sodium');
        if (satFat > 5) harmfulTags.push('high_saturated_fat');
        if (containsLactose) harmfulTags.push('lactose');
        if (containsGluten) harmfulTags.push('gluten');

        const category = p.categories?.split(',')[0]?.trim() || 'Snacks';
        const imageUrl =
          p.image_front_url ||
          p.image_url ||
          getFallbackProductImage(category);

        const formattedProduct: Product = {
          id: `barcode-${p.code || code}-${Date.now()}`,
          name: p.product_name || p.product_name_en || 'Scanned Packaged Product',
          brand: p.brands || 'Scanned Brand',
          category,
          image_url: imageUrl,
          serving_size: p.serving_size || '100g',
          nutrition_per_100g: {
            calories,
            sugar_g: Number(sugar.toFixed(1)),
            sodium_mg: sodium,
            saturated_fat_g: Number(satFat.toFixed(1)),
            trans_fat_g: Number(transFat.toFixed(1)),
            cholesterol_mg: cholesterol,
            contains_lactose: containsLactose,
            contains_gluten: containsGluten,
            purine_level: 'low',
          },
          harmful_tags: harmfulTags,
          description:
            p.ingredients_text ||
            `Scanned product (Barcode: ${code}) fetched directly via Open Food Facts database.`,
        };

        await stopScanner();
        onClose();
        onProductFound(formattedProduct);
      } else {
        setErrorMessage(`Product with barcode "${code}" was not found in Open Food Facts. Try another barcode.`);
      }
    } catch (err: any) {
      console.error('Barcode lookup failed:', err);
      setErrorMessage('Network error while querying Open Food Facts database. Please check your internet connection.');
    } finally {
      setIsLoading(false);
      isStoppingRef.current = false;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      lookupBarcode(manualBarcode.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Hidden container for file scanning */}
      <div id="barcode-file-temp" className="hidden" />

      <div
        className="glass-panel relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Live Barcode & QR Scanner</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Point your camera at any food packaging barcode (EAN-13, UPC)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            type="button"
            aria-label="Close scanner"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Camera Viewfinder Area */}
          <div className="relative w-full min-h-[260px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
            {/* HTML5 QR Code Mount Point */}
            <div id="barcode-scanner-viewport" className="w-full h-full" />

            {/* Inactive or Permission Denied Screen */}
            {!isCameraActive && !isLoading && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-3 z-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-md">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {cameraError ? 'Camera Disabled / In Use' : 'Starting Camera Stream...'}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                    {cameraError || 'Please allow camera permission in your browser.'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={startScanner}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-semibold transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <div className="text-center">
                  <p className="text-xs font-bold text-white">Evaluating Scanned Barcode...</p>
                  <p className="text-[10px] text-slate-400">Querying Open Food Facts & analyzing health suitability</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar: Switch Camera & Upload Photo */}
          <div className="flex items-center justify-between text-xs">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Scan from Photo / Gallery</span>
            </button>

            {isCameraActive && (
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch Camera ({facingMode === 'environment' ? 'Back' : 'Front'})</span>
              </button>
            )}
          </div>

          {/* Error Message alert */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Manual Barcode Input Form */}
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Or Enter Barcode Manually (EAN-13 / UPC)</span>
              <span className="text-[10px] font-normal text-slate-400">8–13 digits</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="e.g. 8901491101837"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !manualBarcode.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Evaluate'}
              </button>
            </div>
          </form>

          {/* Sample Barcode Presets */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Quick Test Real Barcodes:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_BARCODES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setManualBarcode(item.code);
                    lookupBarcode(item.code);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1"
                >
                  <span>{item.name}</span>
                  <span className="text-[10px] text-slate-400 tabular-nums">({item.code})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
