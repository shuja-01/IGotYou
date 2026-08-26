/**
 * Health Evaluation Engine — "I Got You!" Food Suitability & Health Advisor
 * 
 * Provides clinical rule-based evaluations comparing packaged food items & cooked dishes
 * against active user health conditions (Diabetes, Hypertension, High Cholesterol, Gout,
 * Lactose Intolerance, Gluten Sensitivity).
 */

import {
  ConditionId,
  HealthCondition,
  Product,
  EvaluationResult,
  ConditionWarning,
  EvaluationStatus,
} from '@/types/health';

/**
 * Standard selectable health conditions and diagnostic definitions
 */
export const HEALTH_CONDITIONS: HealthCondition[] = [
  {
    id: 'diabetes_type_2',
    name: 'Diabetes / High Blood Sugar',
    shortName: 'Diabetes',
    category: 'Metabolic',
    description: 'Sensitivity to sugars, high glycemic food, and refined carbs.',
    iconName: 'Activity',
  },
  {
    id: 'hypertension',
    name: 'High Blood Pressure (Hypertension)',
    shortName: 'High BP',
    category: 'Cardiovascular',
    description: 'Requires low sodium diet to keep blood pressure controlled.',
    iconName: 'HeartPulse',
  },
  {
    id: 'hypotension',
    name: 'Low Blood Pressure (Hypotension)',
    shortName: 'Low BP',
    category: 'Cardiovascular',
    description: 'Requires adequate hydration & balanced sodium; avoid excessive caffeine.',
    iconName: 'TrendingDown',
  },
  {
    id: 'high_cholesterol',
    name: 'High Cholesterol (Hyperlipidemia)',
    shortName: 'High Cholesterol',
    category: 'Cardiovascular',
    description: 'Requires low saturated fat, zero trans fat, and low cholesterol items.',
    iconName: 'Flame',
  },
  {
    id: 'uric_acid_gout',
    name: 'High Uric Acid / Gout',
    shortName: 'Gout / Uric Acid',
    category: 'Metabolic',
    description: 'Avoid high purine foods that trigger joint inflammation.',
    iconName: 'Zap',
  },
  {
    id: 'lactose_intolerance',
    name: 'Lactose Sensitivity',
    shortName: 'Lactose Intolerant',
    category: 'Digestive',
    description: 'Requires lactose-free or dairy-alternative food choices.',
    iconName: 'Milk',
  },
  {
    id: 'gluten_sensitivity',
    name: 'Celiac / Gluten Sensitivity',
    shortName: 'Gluten Sensitive',
    category: 'Digestive',
    description: 'Strictly avoid wheat, barley, rye, and gluten cross-contaminants.',
    iconName: 'Wheat',
  },
];

/**
 * Evaluates food product suitability against a list of active user medical/dietary conditions.
 *
 * Evaluation Logic:
 * - 🟢 Safe: No conflicting nutrient thresholds or allergens found.
 * - 🟡 Caution: Moderate nutrient level (borderline sugar/sodium/sat fat); recommends portion limit.
 * - 🔴 Harmful: Directly exceeds safe thresholds or contains critical allergens (lactose/gluten/purines).
 *
 * @param product Product data containing 100g nutritional facts and harmful tags
 * @param activeConditions Array of condition IDs currently active in user profile
 * @returns EvaluationResult with status classification, warnings, and portion advice
 */
export function evaluateProductSuitability(
  product: Product,
  activeConditions: ConditionId[]
): EvaluationResult {
  const warnings: ConditionWarning[] = [];
  const safeNotes: string[] = [];

  // Fallback for general/unselected profile
  if (!activeConditions || activeConditions.length === 0) {
    return {
      status: 'safe',
      statusLabel: 'Safe / Good to Go',
      statusBadgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      statusBg: 'bg-emerald-950/20',
      statusBorder: 'border-emerald-500/30',
      warnings: [],
      recommendation: 'No health profile conditions selected. Product is standard commercial food.',
      safeNotes: ['No active condition filters applied'],
    };
  }

  const { nutrition_per_100g: n, harmful_tags: tags } = product;

  // Rule 1: Diabetes / High Blood Sugar (>10g sugar = harmful, >5g = caution)
  if (activeConditions.includes('diabetes_type_2')) {
    if (n.sugar_g > 10 || tags.includes('high_sugar')) {
      warnings.push({
        conditionId: 'diabetes_type_2',
        conditionName: 'Diabetes / High Blood Sugar',
        severity: 'harmful',
        reason: `High Sugar Content (${n.sugar_g}g per 100g)`,
        detail: `Contains ${n.sugar_g}g sugar per 100g — significantly exceeds the 10g safe threshold for blood sugar control.`,
      });
    } else if (n.sugar_g > 5) {
      warnings.push({
        conditionId: 'diabetes_type_2',
        conditionName: 'Diabetes / High Blood Sugar',
        severity: 'caution',
        reason: `Moderate Sugar Level (${n.sugar_g}g per 100g)`,
        detail: `Contains ${n.sugar_g}g sugar. Consume in strict moderation to prevent blood glucose spikes.`,
      });
    } else {
      safeNotes.push('Low sugar content (safe for Diabetes)');
    }
  }

  // Rule 2: Hypertension / High Blood Pressure (>400mg sodium = harmful, >200mg = caution)
  if (activeConditions.includes('hypertension')) {
    if (n.sodium_mg > 400 || tags.includes('high_sodium')) {
      warnings.push({
        conditionId: 'hypertension',
        conditionName: 'High Blood Pressure',
        severity: 'harmful',
        reason: `High Sodium Content (${n.sodium_mg}mg per 100g)`,
        detail: `Contains ${n.sodium_mg}mg sodium per 100g. High sodium intake elevates arterial blood pressure.`,
      });
    } else if (n.sodium_mg > 200) {
      warnings.push({
        conditionId: 'hypertension',
        conditionName: 'High Blood Pressure',
        severity: 'caution',
        reason: `Moderate Sodium Level (${n.sodium_mg}mg per 100g)`,
        detail: `Contains ${n.sodium_mg}mg sodium. Keep total daily serving under control.`,
      });
    } else {
      safeNotes.push('Low sodium content (safe for Hypertension)');
    }
  }

  // Rule 3: Hypotension / Low Blood Pressure (Flag excessive caffeine / dehydration risks)
  if (activeConditions.includes('hypotension')) {
    if (n.caffeine_mg && n.caffeine_mg > 60) {
      warnings.push({
        conditionId: 'hypotension',
        conditionName: 'Low Blood Pressure',
        severity: 'caution',
        reason: `High Caffeine Content (${n.caffeine_mg}mg)`,
        detail: `High caffeine drinks can cause rapid fluid loss and transient blood pressure fluctuations.`,
      });
    } else {
      safeNotes.push('Electrolyte balanced (safe for Low BP)');
    }
  }

  // Rule 4: High Cholesterol (>5g saturated fat or >0.5g trans fat = harmful)
  if (activeConditions.includes('high_cholesterol')) {
    if (n.saturated_fat_g > 5 || n.trans_fat_g > 0.5 || tags.includes('high_saturated_fat')) {
      warnings.push({
        conditionId: 'high_cholesterol',
        conditionName: 'High Cholesterol',
        severity: 'harmful',
        reason: `High Saturated / Trans Fat (${n.saturated_fat_g}g sat fat, ${n.trans_fat_g}g trans fat)`,
        detail: `Elevated saturated fats (${n.saturated_fat_g}g) increase blood LDL cholesterol levels and cardiovascular risk.`,
      });
    } else if (n.saturated_fat_g > 2.5) {
      warnings.push({
        conditionId: 'high_cholesterol',
        conditionName: 'High Cholesterol',
        severity: 'caution',
        reason: `Moderate Saturated Fat (${n.saturated_fat_g}g per 100g)`,
        detail: `Moderate saturated fat. Limit portion size.`,
      });
    } else {
      safeNotes.push('Low saturated fat (safe for Cholesterol profile)');
    }
  }

  // Rule 5: Uric Acid / Gout (Purine Level check)
  if (activeConditions.includes('uric_acid_gout')) {
    if (n.purine_level === 'high') {
      warnings.push({
        conditionId: 'uric_acid_gout',
        conditionName: 'High Uric Acid / Gout',
        severity: 'harmful',
        reason: 'High Purine Level',
        detail: `High purine foods elevate uric acid levels in bloodstream, triggering painful gout attacks.`,
      });
    } else if (n.purine_level === 'medium') {
      warnings.push({
        conditionId: 'uric_acid_gout',
        conditionName: 'High Uric Acid / Gout',
        severity: 'caution',
        reason: 'Moderate Purine Level',
        detail: `Contains moderate purines. Limit serving frequency.`,
      });
    } else {
      safeNotes.push('Low purine content (Gout safe)');
    }
  }

  // Rule 6: Lactose Intolerance (Direct dairy/lactose allergen check)
  if (activeConditions.includes('lactose_intolerance')) {
    if (n.contains_lactose || tags.includes('lactose')) {
      warnings.push({
        conditionId: 'lactose_intolerance',
        conditionName: 'Lactose Sensitivity',
        severity: 'harmful',
        reason: 'Contains Lactose Dairy Ingredients',
        detail: `Directly contains milk/lactose derivatives which can trigger severe cramping, bloating, and indigestion.`,
      });
    } else {
      safeNotes.push('100% Lactose-Free');
    }
  }

  // Rule 7: Gluten Sensitivity / Celiac (Direct wheat/gluten grain check)
  if (activeConditions.includes('gluten_sensitivity')) {
    if (n.contains_gluten || tags.includes('gluten')) {
      warnings.push({
        conditionId: 'gluten_sensitivity',
        conditionName: 'Celiac / Gluten Sensitivity',
        severity: 'harmful',
        reason: 'Contains Gluten / Wheat',
        detail: `Contains wheat or gluten protein grains. Unsafe for Celiac disease or gluten allergy.`,
      });
    } else {
      safeNotes.push('100% Gluten-Free');
    }
  }

  // Compute Overall Suitability Classification
  const hasHarmful = warnings.some((w) => w.severity === 'harmful');
  const hasCaution = warnings.some((w) => w.severity === 'caution');

  let status: EvaluationStatus = 'safe';
  let statusLabel = 'Safe / Good to Go';
  let statusBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let statusBg = 'bg-emerald-950/20';
  let statusBorder = 'border-emerald-500/30';
  let recommendation = 'This product aligns safely with your active health profile conditions.';

  if (hasHarmful) {
    status = 'harmful';
    statusLabel = 'Harmful / Avoid';
    statusBadgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
    statusBg = 'bg-red-950/20';
    statusBorder = 'border-red-500/30';
    recommendation =
      'Avoid or substitute this item. It contains nutritional attributes directly conflicting with your active health conditions.';
  } else if (hasCaution) {
    status = 'caution';
    statusLabel = 'Consume with Caution';
    statusBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    statusBg = 'bg-amber-950/20';
    statusBorder = 'border-amber-500/30';
    recommendation =
      'Suitable in strict moderation. Consider limiting portion size to half of regular serving.';
  }

  return {
    status,
    statusLabel,
    statusBadgeColor,
    statusBg,
    statusBorder,
    warnings,
    recommendation,
    safeNotes,
  };
}

