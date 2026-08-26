/**
 * Daily Calorie & Macro Calculator Modal — "I Got You!" Health Advisor
 * 
 * Implements the scientific Mifflin-St Jeor equation to calculate Basal Metabolic
 * Rate (BMR) and Total Daily Energy Expenditure (TDEE), adjusting for user fitness
 * goals, macro splits (protein, fats, carbs), hydration (35ml/kg), and daily sodium/sugar limits.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  Flame,
  Dumbbell,
  Droplets,
  Scale,
  Sparkles,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  HeartPulse,
} from 'lucide-react';

export interface UserMacroTargets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  waterLiters: number;
  sodiumMaxMg: number;
  sugarMaxGrams: number;
  inputs: {
    age: number;
    gender: 'male' | 'female';
    heightCm: number;
    weightKg: number;
    activityLevel: string;
    goal: string;
  };
}

interface MacroCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTargets?: (targets: UserMacroTargets) => void;
}

const STORAGE_KEY = 'igotyou_user_macro_targets_v1';

export const MacroCalculatorModal: React.FC<MacroCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSaveTargets,
}) => {
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [heightCm, setHeightCm] = useState<number>(172);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [goal, setGoal] = useState<string>('maintain');

  const [computedTargets, setComputedTargets] = useState<UserMacroTargets | null>(null);

  // Load saved preferences on mount

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: UserMacroTargets = JSON.parse(saved);
        if (parsed && parsed.inputs) {
          setAge(parsed.inputs.age || 28);
          setGender(parsed.inputs.gender || 'male');
          setHeightCm(parsed.inputs.heightCm || 172);
          setWeightKg(parsed.inputs.weightKg || 70);
          setActivityLevel(parsed.inputs.activityLevel || 'moderate');
          setGoal(parsed.inputs.goal || 'maintain');
          setComputedTargets(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const calculateResults = () => {
    // Mifflin-St Jeor Formula
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

    // Macro splits
    const proteinGrams = Math.round(weightKg * 1.8);
    const fatGrams = Math.round((targetCalories * 0.25) / 9);
    const carbGrams = Math.max(
      50,
      Math.round((targetCalories - proteinGrams * 4 - fatGrams * 9) / 4)
    );
    const waterLiters = Number((weightKg * 0.035).toFixed(1));
    const sodiumMaxMg = 2000;
    const sugarMaxGrams = gender === 'female' ? 25 : 36;

    const results: UserMacroTargets = {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      proteinGrams,
      fatGrams,
      carbGrams,
      waterLiters,
      sodiumMaxMg,
      sugarMaxGrams,
      inputs: {
        age,
        gender,
        heightCm,
        weightKg,
        activityLevel,
        goal,
      },
    };

    setComputedTargets(results);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (e) {}

    if (onSaveTargets) {
      onSaveTargets(results);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel relative w-full max-w-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto space-y-6">
        {/* Glow Accent */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Calculator className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Daily Calorie & Macro Calculator</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scientific Mifflin-St Jeor BMR & TDEE Nutrition Advisor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close calculator"
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Biological Gender
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  gender === 'male'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 border-transparent shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                👨 Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  gender === 'female'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 border-transparent shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                👩 Female
              </button>
            </div>
          </div>

          {/* Age */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Age (Years)
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Height */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Height (cm)
            </label>
            <input
              type="number"
              min="100"
              max="230"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Weight (kg)
            </label>
            <input
              type="number"
              min="30"
              max="250"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Activity Level */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Daily Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="sedentary">Sedentary (Little or no exercise)</option>
              <option value="light">Lightly Active (Exercise 1-3 days/week)</option>
              <option value="moderate">Moderately Active (Exercise 3-5 days/week)</option>
              <option value="very">Very Active (Hard exercise 6-7 days/week)</option>
              <option value="extra">Extra Active (Very hard exercise / physical job)</option>
            </select>
          </div>

          {/* Goal */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Fitness & Weight Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="maintain">Maintain Current Weight</option>
              <option value="mild_loss">Mild Weight Loss (-250 kcal/day)</option>
              <option value="loss">Standard Weight Loss (-500 kcal/day)</option>
              <option value="gain">Muscle & Weight Gain (+400 kcal/day)</option>
            </select>
          </div>
        </div>

        {/* Calculate Action */}
        <button
          type="button"
          onClick={calculateResults}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Flame className="w-4 h-4" />
          <span>Calculate Daily Macro Targets</span>
        </button>

        {/* Results Card Display */}
        {computedTargets && (
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Recommended Daily Nutrition Targets
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                TDEE: {computedTargets.tdee} kcal/day
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Calories */}
              <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Calories</span>
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {computedTargets.targetCalories}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">kcal / day</p>
              </div>

              {/* Protein */}
              <div className="bg-teal-500/10 border border-teal-500/25 p-3 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-teal-700 dark:text-teal-400 text-xs font-bold">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Protein</span>
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {computedTargets.proteinGrams}g
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">daily target</p>
              </div>

              {/* Fats */}
              <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-400 text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Fats</span>
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {computedTargets.fatGrams}g
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">daily target</p>
              </div>

              {/* Water */}
              <div className="bg-blue-500/10 border border-blue-500/25 p-3 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-blue-700 dark:text-blue-400 text-xs font-bold">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Water</span>
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {computedTargets.waterLiters}L
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">hydration</p>
              </div>
            </div>

            {/* Health Guideline Limits */}
            <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-700 dark:text-slate-300 font-medium">
              <div>
                <strong>Carbohydrates:</strong> <span className="tabular-nums font-bold">{computedTargets.carbGrams}g</span> / day
              </div>
              <div>
                <strong>Max Sodium:</strong> <span className="tabular-nums font-bold">{computedTargets.sodiumMaxMg}mg</span> / day
              </div>
              <div>
                <strong>Max Added Sugar:</strong> <span className="tabular-nums font-bold">{computedTargets.sugarMaxGrams}g</span> / day
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

