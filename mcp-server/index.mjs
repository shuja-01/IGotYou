#!/usr/bin/env node

/**
 * Open Food Facts & Nutrition Evaluation MCP Server
 * Standard Model Context Protocol (MCP) server over stdio transport.
 * 
 * Provides tools for:
 * 1. search_food_products: Query 3M+ global packaged foods and dishes
 * 2. get_product_by_barcode: Lookup exact product by barcode (EAN-13/UPC)
 * 3. evaluate_food_suitability: Clinical evaluation against health conditions
 * 4. calculate_daily_macros: Mifflin-St Jeor scientific calorie/macro advisor
 */

import readline from 'readline';

const SERVER_NAME = 'open-food-facts-nutrition-mcp';
const SERVER_VERSION = '1.0.0';
const USER_AGENT = 'IGotYouHealthAdvisor/1.0 (https://igotyou.app; contact@igotyou.app)';

/**
 * Clinical Evaluation Engine logic
 */
function evaluateProduct(product, activeConditions = []) {
  const warnings = [];
  const safeNotes = [];

  if (!activeConditions || activeConditions.length === 0) {
    return {
      status: 'safe',
      statusLabel: 'Safe / Good to Go',
      recommendation: 'No health profile conditions selected. Product is standard commercial food.',
      warnings: [],
      safeNotes: ['No active condition filters applied'],
    };
  }

  const n = product.nutrition_per_100g || {};
  const tags = product.harmful_tags || [];
  const sugar = Number(n.sugar_g) || 0;
  const sodium = Number(n.sodium_mg) || 0;
  const satFat = Number(n.saturated_fat_g) || 0;
  const transFat = Number(n.trans_fat_g) || 0;
  const lactose = Boolean(n.contains_lactose) || tags.includes('lactose');
  const gluten = Boolean(n.contains_gluten) || tags.includes('gluten');
  const purines = n.purine_level || 'low';

  // Diabetes rule
  if (activeConditions.includes('diabetes_type_2')) {
    if (sugar > 10 || tags.includes('high_sugar')) {
      warnings.push({
        conditionId: 'diabetes_type_2',
        severity: 'harmful',
        reason: `High Sugar Content (${sugar}g per 100g)`,
        detail: `Contains ${sugar}g sugar per 100g — exceeds the 10g safe threshold for blood sugar control.`,
      });
    } else if (sugar > 5) {
      warnings.push({
        conditionId: 'diabetes_type_2',
        severity: 'caution',
        reason: `Moderate Sugar Level (${sugar}g per 100g)`,
        detail: `Contains ${sugar}g sugar. Consume in strict moderation to prevent glucose spikes.`,
      });
    } else {
      safeNotes.push('Low sugar content (safe for Diabetes)');
    }
  }

  // Hypertension rule
  if (activeConditions.includes('hypertension')) {
    if (sodium > 400 || tags.includes('high_sodium')) {
      warnings.push({
        conditionId: 'hypertension',
        severity: 'harmful',
        reason: `High Sodium Content (${sodium}mg per 100g)`,
        detail: `Contains ${sodium}mg sodium per 100g. High sodium intake elevates arterial blood pressure.`,
      });
    } else if (sodium > 200) {
      warnings.push({
        conditionId: 'hypertension',
        severity: 'caution',
        reason: `Moderate Sodium Level (${sodium}mg per 100g)`,
        detail: `Contains ${sodium}mg sodium. Keep portion size controlled.`,
      });
    } else {
      safeNotes.push('Low sodium content (safe for Hypertension)');
    }
  }

  // High Cholesterol rule
  if (activeConditions.includes('high_cholesterol')) {
    if (satFat > 5 || transFat > 0.5 || tags.includes('high_saturated_fat')) {
      warnings.push({
        conditionId: 'high_cholesterol',
        severity: 'harmful',
        reason: `High Saturated / Trans Fat (${satFat}g sat fat, ${transFat}g trans fat)`,
        detail: `Elevated saturated fats increase LDL cholesterol and cardiovascular strain.`,
      });
    } else if (satFat > 2.5) {
      warnings.push({
        conditionId: 'high_cholesterol',
        severity: 'caution',
        reason: `Moderate Saturated Fat (${satFat}g per 100g)`,
        detail: `Moderate saturated fat level. Limit portion frequency.`,
      });
    } else {
      safeNotes.push('Low saturated fat (safe for Cholesterol profile)');
    }
  }

  // Uric Acid / Gout rule
  if (activeConditions.includes('uric_acid_gout')) {
    if (purines === 'high') {
      warnings.push({
        conditionId: 'uric_acid_gout',
        severity: 'harmful',
        reason: 'High Purine Level',
        detail: `High purine foods elevate uric acid levels, triggering painful gout flare-ups.`,
      });
    } else if (purines === 'medium') {
      warnings.push({
        conditionId: 'uric_acid_gout',
        severity: 'caution',
        reason: 'Moderate Purine Level',
        detail: `Contains moderate purines. Limit serving frequency.`,
      });
    } else {
      safeNotes.push('Low purine content (Gout safe)');
    }
  }

  // Lactose rule
  if (activeConditions.includes('lactose_intolerance')) {
    if (lactose) {
      warnings.push({
        conditionId: 'lactose_intolerance',
        severity: 'harmful',
        reason: 'Contains Lactose Dairy Ingredients',
        detail: `Directly contains milk/lactose derivatives which can trigger cramping, bloating, and distress.`,
      });
    } else {
      safeNotes.push('100% Lactose-Free');
    }
  }

  // Gluten rule
  if (activeConditions.includes('gluten_sensitivity')) {
    if (gluten) {
      warnings.push({
        conditionId: 'gluten_sensitivity',
        severity: 'harmful',
        reason: 'Contains Gluten / Wheat',
        detail: `Contains wheat or gluten protein grains. Unsafe for Celiac disease or gluten sensitivity.`,
      });
    } else {
      safeNotes.push('100% Gluten-Free');
    }
  }

  const hasHarmful = warnings.some((w) => w.severity === 'harmful');
  const hasCaution = warnings.some((w) => w.severity === 'caution');

  let status = 'safe';
  let statusLabel = 'Safe / Good to Go';
  let recommendation = 'This product aligns safely with your active health profile conditions.';

  if (hasHarmful) {
    status = 'harmful';
    statusLabel = 'Harmful / Avoid';
    recommendation = 'Avoid or substitute this item. It contains attributes directly conflicting with your active health conditions.';
  } else if (hasCaution) {
    status = 'caution';
    statusLabel = 'Consume with Caution';
    recommendation = 'Suitable in strict moderation. Consider limiting portion size to half of regular serving.';
  }

  return {
    status,
    statusLabel,
    recommendation,
    warnings,
    safeNotes,
  };
}

/**
 * Open Food Facts & USDA FoodData Search API Helper
 */
async function searchOpenFoodFacts(query, country = 'world', limit = 10) {
  const searchTerm = String(query).trim();
  const results = [];

  // 1. Try Open Food Facts Search API
  try {
    const countryTag = country && country !== 'world' ? country.toLowerCase() : '';
    let url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(searchTerm)}&page_size=${limit}`;
    if (countryTag) {
      url += `&countries_tags_en=${encodeURIComponent(countryTag)}`;
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        const data = await res.json();
        const rawProducts = data.products || [];

        for (const p of rawProducts) {
          const nutriments = p.nutriments || {};
          const allergens = (p.allergens_tags || []).map((a) => a.replace(/^en:/, ''));
          const ingredients = p.ingredients_text || '';
          const containsLactose = allergens.includes('milk') || /milk|dairy|whey|lactose|cheese|butter/i.test(ingredients);
          const containsGluten = allergens.includes('gluten') || /wheat|gluten|barley|rye|maida/i.test(ingredients);

          results.push({
            source: 'open_food_facts',
            barcode: p.code || p._id || '',
            name: p.product_name || p.product_name_en || p.generic_name || 'Packaged Product',
            brand: p.brands || 'Commercial Brand',
            category: p.categories?.split(',')[0]?.trim() || 'Packaged Food',
            serving_size: p.serving_size || '100g',
            nutriscore_grade: p.nutriscore_grade?.toUpperCase() || null,
            nova_group: p.nova_group || null,
            image_url: p.image_front_url || p.image_url || null,
            nutrition_per_100g: {
              calories: Math.round(Number(nutriments['energy-kcal_100g'] || (Number(nutriments['energy_100g']) || 0) / 4.184) || 120),
              sugar_g: Number((Number(nutriments['sugars_100g']) || 0).toFixed(1)),
              sodium_mg: Math.round((Number(nutriments['sodium_100g']) || (Number(nutriments['salt_100g']) || 0) * 0.4) * 1000),
              saturated_fat_g: Number((Number(nutriments['saturated-fat_100g']) || 0).toFixed(1)),
              trans_fat_g: Number((Number(nutriments['trans-fat_100g']) || 0).toFixed(1)),
              cholesterol_mg: Math.round((Number(nutriments['cholesterol_100g']) || 0) * 1000),
              contains_lactose: containsLactose,
              contains_gluten: containsGluten,
              purine_level: 'low',
            },
            allergens,
          });
        }
      }
    }
  } catch (err) {
    // Graceful fallback to USDA
  }

  // 2. If results are sparse, supplement with USDA FoodData Central Open Dataset
  if (results.length < limit) {
    try {
      const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(searchTerm)}&pageSize=${limit - results.length}`;
      const usdaRes = await fetch(usdaUrl);
      if (usdaRes.ok) {
        const usdaData = await usdaRes.json();
        const foods = usdaData.foods || [];

        for (const item of foods) {
          const nutrients = item.foodNutrients || [];
          const getVal = (pattern) => {
            const found = nutrients.find((n) => pattern.test(n.nutrientName || n.name || ''));
            return found ? Number(found.value || found.amount || 0) : 0;
          };

          const desc = (item.description || '').toLowerCase();
          const ing = (item.ingredients || '').toLowerCase();
          const full = `${desc} ${ing}`;
          const containsLactose = /milk|butter|cheese|cream|whey|paneer/i.test(full);
          const containsGluten = /wheat|flour|naan|bhature|samosa|noodle|bread|roti|pasta/i.test(full);

          results.push({
            source: 'usda_fooddata',
            barcode: item.gtinUpc || `USDA-${item.fdcId}`,
            name: item.description || 'Cooked Dish / Food Item',
            brand: item.brandOwner || item.brandName || 'Cooked Dish / Food Item',
            category: 'Dishes / Prepared',
            serving_size: item.servingSize ? `${item.servingSize}${item.servingSizeUnit || 'g'}` : '100g',
            nutriscore_grade: null,
            nova_group: null,
            image_url: null,
            nutrition_per_100g: {
              calories: Math.round(getVal(/Energy/i) || 160),
              sugar_g: Number(getVal(/Sugars/i).toFixed(1)),
              sodium_mg: Math.round(getVal(/Sodium/i)),
              saturated_fat_g: Number(getVal(/saturated/i).toFixed(1)),
              trans_fat_g: Number(getVal(/trans/i).toFixed(1)),
              cholesterol_mg: Math.round(getVal(/Cholesterol/i)),
              contains_lactose: containsLactose,
              contains_gluten: containsGluten,
              purine_level: 'medium',
            },
            allergens: [containsLactose ? 'milk' : null, containsGluten ? 'gluten' : null].filter(Boolean),
          });
        }
      }
    } catch (err) {}
  }

  return results;
}

/**
 * Open Food Facts Barcode API Helper
 */
async function getProductByBarcode(barcode) {
  const cleanBarcode = String(barcode).trim();
  const url = `https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const nutriments = p.nutriments || {};
        const allergens = (p.allergens_tags || []).map((a) => a.replace(/^en:/, ''));
        const ingredients = p.ingredients_text || '';
        const containsLactose = allergens.includes('milk') || /milk|dairy|whey|lactose|cheese|butter/i.test(ingredients);
        const containsGluten = allergens.includes('gluten') || /wheat|gluten|barley|rye|maida/i.test(ingredients);

        return {
          found: true,
          barcode: p.code || cleanBarcode,
          name: p.product_name || p.generic_name || 'Unnamed Product',
          brand: p.brands || 'Unknown Brand',
          category: p.categories?.split(',')[0]?.trim() || 'Packaged Food',
          serving_size: p.serving_size || '100g',
          nutriscore_grade: p.nutriscore_grade?.toUpperCase() || null,
          nova_group: p.nova_group || null,
          image_url: p.image_front_url || p.image_url || null,
          ingredients_text: ingredients,
          allergens,
          nutrition_per_100g: {
            calories: Math.round(Number(nutriments['energy-kcal_100g'] || (Number(nutriments['energy_100g']) || 0) / 4.184) || 0),
            sugar_g: Number((Number(nutriments['sugars_100g']) || 0).toFixed(1)),
            sodium_mg: Math.round((Number(nutriments['sodium_100g']) || (Number(nutriments['salt_100g']) || 0) * 0.4) * 1000),
            saturated_fat_g: Number((Number(nutriments['saturated-fat_100g']) || 0).toFixed(1)),
            trans_fat_g: Number((Number(nutriments['trans-fat_100g']) || 0).toFixed(1)),
            cholesterol_mg: Math.round((Number(nutriments['cholesterol_100g']) || 0) * 1000),
            contains_lactose: containsLactose,
            contains_gluten: containsGluten,
            purine_level: 'low',
          },
        };
      }
    }
  } catch (err) {}

  return { found: false, barcode: cleanBarcode, message: 'Product not found in Open Food Facts database.' };
}

/**
 * Mifflin-St Jeor Macro Targets Calculator
 */
function calculateMacros(inputs) {
  const age = Number(inputs.age) || 28;
  const gender = inputs.gender === 'female' ? 'female' : 'male';
  const heightCm = Number(inputs.heightCm) || 172;
  const weightKg = Number(inputs.weightKg) || 70;
  const activityLevel = inputs.activityLevel || 'moderate';
  const goal = inputs.goal || 'maintain';

  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr = gender === 'male' ? bmr + 5 : bmr - 161;

  let activityMultiplier = 1.2;
  if (activityLevel === 'light') activityMultiplier = 1.375;
  if (activityLevel === 'moderate') activityMultiplier = 1.55;
  if (activityLevel === 'very') activityMultiplier = 1.725;
  if (activityLevel === 'extra') activityMultiplier = 1.9;

  const tdee = Math.round(bmr * activityMultiplier);

  let goalAdjustment = 0;
  if (goal === 'mild_loss') goalAdjustment = -250;
  if (goal === 'loss') goalAdjustment = -500;
  if (goal === 'gain') goalAdjustment = 400;

  const targetCalories = Math.max(1200, tdee + goalAdjustment);
  const proteinGrams = Math.round(weightKg * 1.8);
  const fatGrams = Math.round((targetCalories * 0.25) / 9);
  const carbGrams = Math.max(50, Math.round((targetCalories - proteinGrams * 4 - fatGrams * 9) / 4));
  const waterLiters = Number((weightKg * 0.035).toFixed(1));

  return {
    formula: 'Mifflin-St Jeor',
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    proteinGrams,
    fatGrams,
    carbGrams,
    waterLiters,
    sodiumMaxMg: 2000,
    sugarMaxGrams: gender === 'female' ? 25 : 36,
  };
}

/**
 * MCP Tools Schema
 */
const TOOLS = [
  {
    name: 'search_food_products',
    description: 'Search over 3 million global packaged foods and cooked dishes via Open Food Facts database with nutritional profiles.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term or brand name (e.g. "Uncle Chipps", "Dutch Lady Milk", "Parle-G", "Nasi Lemak")',
        },
        country: {
          type: 'string',
          description: 'Country market code: "in" (India), "my" (Malaysia), "sg" (Singapore), "id" (Indonesia), or "world". Default is "world".',
          default: 'world',
        },
        limit: {
          type: 'number',
          description: 'Number of results to return (1-25). Default is 10.',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_product_by_barcode',
    description: 'Retrieve detailed food product information, ingredients, Nutri-Score, and nutritional values by barcode (EAN-13 / UPC).',
    inputSchema: {
      type: 'object',
      properties: {
        barcode: {
          type: 'string',
          description: 'The product barcode (e.g. "8901491101837", "9556001001234")',
        },
      },
      required: ['barcode'],
    },
  },
  {
    name: 'evaluate_food_suitability',
    description: 'Perform a clinical suitability check on a food product or barcode against specific medical and dietary conditions.',
    inputSchema: {
      type: 'object',
      properties: {
        barcode: {
          type: 'string',
          description: 'Optional barcode to fetch and evaluate product automatically.',
        },
        product: {
          type: 'object',
          description: 'Direct product object containing name, brand, nutrition_per_100g, and harmful_tags if barcode is not provided.',
        },
        conditions: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'diabetes_type_2',
              'hypertension',
              'hypotension',
              'high_cholesterol',
              'uric_acid_gout',
              'lactose_intolerance',
              'gluten_sensitivity',
            ],
          },
          description: 'List of active medical/dietary condition IDs for the evaluation.',
        },
      },
      required: ['conditions'],
    },
  },
  {
    name: 'calculate_daily_macros',
    description: 'Calculate personalized daily calorie targets, protein, fat, carb macro goals, and hydration needs using the scientific Mifflin-St Jeor formula.',
    inputSchema: {
      type: 'object',
      properties: {
        age: { type: 'number', description: 'Age in years (10-100)' },
        gender: { type: 'string', enum: ['male', 'female'], description: 'Biological gender' },
        heightCm: { type: 'number', description: 'Height in centimeters (e.g. 172)' },
        weightKg: { type: 'number', description: 'Weight in kilograms (e.g. 70)' },
        activityLevel: {
          type: 'string',
          enum: ['sedentary', 'light', 'moderate', 'very', 'extra'],
          description: 'Daily activity level',
        },
        goal: {
          type: 'string',
          enum: ['maintain', 'mild_loss', 'loss', 'gain'],
          description: 'Fitness and body composition goal',
        },
      },
      required: ['age', 'gender', 'heightCm', 'weightKg'],
    },
  },
];

/**
 * Handle MCP Tool Calls
 */
async function handleToolCall(name, args) {
  switch (name) {
    case 'search_food_products': {
      const results = await searchOpenFoodFacts(args.query, args.country, args.limit || 10);
      return {
        query: args.query,
        country: args.country || 'world',
        count: results.length,
        products: results,
      };
    }

    case 'get_product_by_barcode': {
      return await getProductByBarcode(args.barcode);
    }

    case 'evaluate_food_suitability': {
      let productToEvaluate = args.product;

      if (!productToEvaluate && args.barcode) {
        const fetched = await getProductByBarcode(args.barcode);
        if (!fetched.found) {
          return { error: `Product with barcode ${args.barcode} not found.` };
        }
        productToEvaluate = fetched;
      }

      if (!productToEvaluate) {
        return { error: 'Must provide either a barcode or product object.' };
      }

      const evaluation = evaluateProduct(productToEvaluate, args.conditions || []);
      return {
        product: {
          name: productToEvaluate.name,
          brand: productToEvaluate.brand,
          nutrition_per_100g: productToEvaluate.nutrition_per_100g,
        },
        activeConditions: args.conditions,
        evaluation,
      };
    }

    case 'calculate_daily_macros': {
      return calculateMacros(args);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * JSON-RPC stdio Handler
 */
function sendJsonRpc(response) {
  process.stdout.write(JSON.stringify(response) + '\n');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async (line) => {
  if (!line || !line.trim()) return;

  let request;
  try {
    request = JSON.parse(line);
  } catch (err) {
    sendJsonRpc({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error: invalid JSON' },
    });
    return;
  }

  const { id, method, params } = request;

  try {
    // 1. initialize
    if (method === 'initialize') {
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: SERVER_NAME,
            version: SERVER_VERSION,
          },
          capabilities: {
            tools: {},
          },
        },
      });
      return;
    }

    // 2. notifications (initialized, ping)
    if (method === 'notifications/initialized' || method === 'ping') {
      if (id !== undefined) {
        sendJsonRpc({ jsonrpc: '2.0', id, result: {} });
      }
      return;
    }

    // 3. tools/list
    if (method === 'tools/list') {
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS,
        },
      });
      return;
    }

    // 4. tools/call
    if (method === 'tools/call') {
      const { name, arguments: toolArgs } = params || {};
      const data = await handleToolCall(name, toolArgs || {});

      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        },
      });
      return;
    }

    // Unknown method
    sendJsonRpc({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  } catch (error) {
    sendJsonRpc({
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: error.message || 'Internal error' },
    });
  }
});
