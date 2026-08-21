import { Product } from '@/types/health';
import seedProductsRaw from '@/data/seed_products.json';
import countryProductsRaw from '@/data/country_products.json';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const SEED_PRODUCTS: Product[] = seedProductsRaw as Product[];
export const COUNTRY_PRODUCTS: Record<string, Product[]> = countryProductsRaw as Record<string, Product[]>;

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  tag: string;
  searchPlaceholder: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    tag: 'india',
    searchPlaceholder: 'Search by brand (e.g. Uncle Chipps, Parle-G, Amul, Maggi, Kurkure)...',
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    tag: 'malaysia',
    searchPlaceholder: 'Search by brand (e.g. 100PLUS, Milo, Dutch Lady, Julie\'s, 7-Eleven, Mixue)...',
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    tag: 'singapore',
    searchPlaceholder: 'Search by brand (e.g. IRVINS, F&N, Pokka, Prima Taste, Tiger, Khong Guan)...',
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    tag: 'indonesia',
    searchPlaceholder: 'Search by brand (e.g. Indomie, Teh Botol, Beng-Beng, SilverQueen, Chitato)...',
  },
];

// Category Fallback Images
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Snacks: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
  Biscuits: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
  Dairy: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
  'Soft Drinks': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
  'Instant Foods': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
  Chocolates: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80',
  Default: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
};

export function getFallbackProductImage(category: string): string {
  return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.Default;
}

export function getCountrySeedProducts(countryCode: string): Product[] {
  if (countryCode === 'IN') return SEED_PRODUCTS;
  return COUNTRY_PRODUCTS[countryCode] || SEED_PRODUCTS;
}

export async function fetchAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) {
    return SEED_PRODUCTS;
  }
  try {
    const fetchPromise = supabase.from('products').select('*');
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 1500)
    );

    const res = (await Promise.race([fetchPromise, timeoutPromise])) as any;
    if (!res.error && res.data && res.data.length > 0) {
      return res.data as Product[];
    }
  } catch (err) {
    console.warn('Supabase fetch failed, using seed dataset:', err);
  }
  return SEED_PRODUCTS;
}

function parseOpenFoodFactsItems(rawItems: any[]): Product[] {
  return rawItems.map((item: any, idx: number): Product => {
    const nutriments = item.nutriments || {};
    const sugar = Number(nutriments['sugars_100g'] || nutriments['sugars'] || 0);
    const sodium = Math.round(
      Number(nutriments['sodium_100g'] || (nutriments['salt_100g'] || 0) / 2.5) * 1000
    );
    const satFat = Number(nutriments['saturated-fat_100g'] || nutriments['saturated-fat'] || 0);
    const transFat = Number(nutriments['trans-fat_100g'] || 0);
    const cholesterol = Math.round(Number(nutriments['cholesterol_100g'] || 0) * 1000);
    const calories = Math.round(
      Number(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 100)
    );

    const allergens = (item.allergens_tags || []).join(' ').toLowerCase();
    const ingredients = (item.ingredients_text || '').toLowerCase();

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

    let category: Product['category'] = 'Snacks';
    const categoriesText = (item.categories || '').toLowerCase();
    if (categoriesText.includes('beverage') || categoriesText.includes('drink') || categoriesText.includes('juice')) {
      category = 'Soft Drinks';
    } else if (categoriesText.includes('biscuit') || categoriesText.includes('cookie')) {
      category = 'Biscuits';
    } else if (categoriesText.includes('milk') || categoriesText.includes('dairy') || categoriesText.includes('yogurt')) {
      category = 'Dairy';
    } else if (categoriesText.includes('chocolate') || categoriesText.includes('sweet') || categoriesText.includes('candy')) {
      category = 'Chocolates';
    } else if (categoriesText.includes('noodle') || categoriesText.includes('cereal') || categoriesText.includes('soup')) {
      category = 'Instant Foods';
    }

    const imageUrl =
      item.image_front_url ||
      item.image_url ||
      item.image_small_url ||
      getFallbackProductImage(category);

    return {
      id: `off-${item.id || item._id || idx}-${Date.now()}`,
      name: item.product_name || item.product_name_en || 'Commercial Product',
      brand: item.brands || 'Commercial Brand',
      category,
      image_url: imageUrl,
      serving_size: item.serving_size || '100g',
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
        item.ingredients_text ||
        `${item.brands || 'Commercial'} food product fetched live from global database.`,
    };
  });
}

/**
 * Open Food Facts API Search with User-Agent & Fail-safe Error Handling
 */
export async function searchOpenFoodFactsAPI(
  query: string,
  countryTag: string = 'india',
  countryCode: string = 'IN'
): Promise<Product[]> {
  if (!query || query.trim().length < 2) return [];

  const searchTerm = query.trim();

  try {
    const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(
      searchTerm
    )}&countries_tags_en=${encodeURIComponent(countryTag)}&page_size=20`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data && data.products && Array.isArray(data.products) && data.products.length > 0) {
          return parseOpenFoodFactsItems(data.products);
        }
      }
    }
  } catch (e) {
    console.warn('Open Food Facts search fetch error:', e);
  }

  return [];
}
