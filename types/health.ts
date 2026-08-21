export type ConditionId =
  | 'diabetes_type_2'
  | 'hypertension'
  | 'hypotension'
  | 'high_cholesterol'
  | 'uric_acid_gout'
  | 'lactose_intolerance'
  | 'gluten_sensitivity';

export interface HealthCondition {
  id: ConditionId;
  name: string;
  shortName: string;
  category: string;
  description: string;
  iconName: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  conditions: ConditionId[];
  created_at?: string;
}

export interface NutritionPer100g {
  calories: number;
  sugar_g: number;
  sodium_mg: number;
  saturated_fat_g: number;
  trans_fat_g: number;
  cholesterol_mg: number;
  contains_lactose: boolean;
  contains_gluten: boolean;
  purine_level: 'low' | 'medium' | 'high';
  caffeine_mg?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'Snacks' | 'Biscuits' | 'Dairy' | 'Soft Drinks' | 'Instant Foods' | 'Chocolates';
  image_url: string;
  serving_size?: string;
  nutrition_per_100g: NutritionPer100g;
  harmful_tags: string[];
  description?: string;
}

export type EvaluationStatus = 'safe' | 'caution' | 'harmful';

export interface ConditionWarning {
  conditionId: ConditionId;
  conditionName: string;
  severity: 'harmful' | 'caution';
  reason: string;
  detail: string;
}

export interface EvaluationResult {
  status: EvaluationStatus;
  statusLabel: string;
  statusBadgeColor: string;
  statusBg: string;
  statusBorder: string;
  warnings: ConditionWarning[];
  recommendation: string;
  safeNotes: string[];
}
