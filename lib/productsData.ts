import { Product } from '@/types/health';
import seedProductsRaw from '@/data/seed_products.json';
import countryProductsRaw from '@/data/country_products.json';
import countryDishesRaw from '@/data/country_dishes.json';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const SEED_PRODUCTS: Product[] = seedProductsRaw as Product[];
export const COUNTRY_PRODUCTS: Record<string, Product[]> = countryProductsRaw as Record<string, Product[]>;
export const COUNTRY_DISHES: Record<string, Product[]> = countryDishesRaw as Record<string, Product[]>;

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
    searchPlaceholder: 'Search items or dishes (e.g. Chole Bhature, Samosa, Uncle Chipps, Parle-G, Maggi)...',
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    tag: 'malaysia',
    searchPlaceholder: 'Search items or dishes (e.g. Nasi Lemak, Roti Canai, Laksa, 100PLUS, Milo, Julie\'s)...',
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    tag: 'singapore',
    searchPlaceholder: 'Search items or dishes (e.g. Chicken Rice, Chili Crab, Kaya Toast, IRVINS, F&N, Pokka)...',
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    tag: 'indonesia',
    searchPlaceholder: 'Search items or dishes (e.g. Nasi Goreng, Rendang, Satay, Indomie, Teh Botol, Kopiko)...',
  },
];

// Category Fallback Images
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Dishes: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
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
  const dishes = COUNTRY_DISHES[countryCode] || COUNTRY_DISHES['IN'] || [];
  if (countryCode === 'IN') {
    return [...dishes, ...SEED_PRODUCTS];
  }
  const products = COUNTRY_PRODUCTS[countryCode] || [];
  return [...dishes, ...products];
}

export async function fetchAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) {
    return getCountrySeedProducts('IN');
  }
  try {
    const fetchPromise = supabase.from('products').select('*');
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 1500)
    );

    const res = (await Promise.race([fetchPromise, timeoutPromise])) as any;
    if (!res.error && res.data && res.data.length > 0) {
      const dishes = COUNTRY_DISHES['IN'] || [];
      return [...dishes, ...(res.data as Product[])];
    }
  } catch (err) {
    console.warn('Supabase fetch failed, using seed dataset:', err);
  }
  return getCountrySeedProducts('IN');
}

/**
 * Free Live Dish & Recipe Nutrition Fetcher via USDA FoodData Central API
 */
export async function searchFreeDishAPI(query: string): Promise<Product[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(
      query.trim()
    )}&pageSize=10`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const data = await response.json();
    if (!data || !data.foods || !Array.isArray(data.foods)) return [];

    return data.foods.map((item: any, idx: number): Product => {
      const nutrientsList = item.foodNutrients || [];

      const getNutrientVal = (namePattern: RegExp): number => {
        const found = nutrientsList.find((n: any) =>
          namePattern.test(n.nutrientName || n.name || '')
        );
        return found ? Number(found.value || found.amount || 0) : 0;
      };

      const calories = Math.round(getNutrientVal(/Energy/i) || 180);
      const sugar = Number(getNutrientVal(/Sugars/i).toFixed(1));
      const sodium = Math.round(getNutrientVal(/Sodium/i));
      const satFat = Number(getNutrientVal(/saturated/i).toFixed(1));
      const transFat = Number(getNutrientVal(/trans/i).toFixed(1));
      const cholesterol = Math.round(getNutrientVal(/Cholesterol/i));

      const nameLower = (item.description || '').toLowerCase();
      const ingredientsLower = (item.ingredients || '').toLowerCase();
      const fullText = `${nameLower} ${ingredientsLower}`;

      const containsLactose =
        fullText.includes('milk') ||
        fullText.includes('butter') ||
        fullText.includes('cheese') ||
        fullText.includes('cream') ||
        fullText.includes('whey') ||
        fullText.includes('paneer');

      const containsGluten =
        fullText.includes('wheat') ||
        fullText.includes('flour') ||
        fullText.includes('naan') ||
        fullText.includes('bhature') ||
        fullText.includes('samosa') ||
        fullText.includes('noodle') ||
        fullText.includes('bread') ||
        fullText.includes('roti') ||
        fullText.includes('pasta');

      const harmfulTags: string[] = [];
      if (sugar > 10) harmfulTags.push('high_sugar');
      if (sodium > 400) harmfulTags.push('high_sodium');
      if (satFat > 5) harmfulTags.push('high_saturated_fat');
      if (containsLactose) harmfulTags.push('lactose');
      if (containsGluten) harmfulTags.push('gluten');

      return {
        id: `usda-dish-${item.fdcId || idx}-${Date.now()}`,
        name: item.description || 'Cooked Traditional Dish',
        brand: item.brandOwner || item.brandName || 'Cooked Dish / Recipe',
        category: 'Dishes',
        image_url: getFallbackProductImage('Dishes'),
        serving_size: item.servingSize ? `${item.servingSize}${item.servingSizeUnit || 'g'}` : '100g',
        nutrition_per_100g: {
          calories,
          sugar_g: sugar,
          sodium_mg: sodium,
          saturated_fat_g: satFat,
          trans_fat_g: transFat,
          cholesterol_mg: cholesterol,
          contains_lactose: containsLactose,
          contains_gluten: containsGluten,
          purine_level: 'medium',
        },
        harmful_tags: harmfulTags,
        description:
          item.ingredients ||
          `${item.description} fetched live from free USDA Food & Nutrition Database.`,
      };
    });
  } catch (e) {
    console.warn('USDA Dish API fetch error:', e);
    return [];
  }
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
    if (categoriesText.includes('meal') || categoriesText.includes('dish') || categoriesText.includes('curry') || categoriesText.includes('rice')) {
      category = 'Dishes';
    } else if (categoriesText.includes('beverage') || categoriesText.includes('drink') || categoriesText.includes('juice')) {
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
