/**
 * BMI Calculator Utility (Client-side)
 * Formula: BMI = weight(kg) / height(m)²
 *
 * WHO BMI Categories:
 *   < 18.5       → Underweight
 *   18.5 – 24.9  → Normal
 *   25.0 – 29.9  → Overweight
 *   ≥ 30.0       → Obese
 */

export interface BMIResult {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
}

/**
 * Calculate BMI from weight in kg and height in cm.
 * Returns null if either value is missing or invalid.
 */
export function calculateBMI(
  weightKg: number | undefined | null,
  heightCm: number | undefined | null
): BMIResult | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let category: BMIResult['category'];
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25) {
    category = 'Normal';
  } else if (bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  return { bmi, category };
}

/**
 * Classify blood pressure based on AHA guidelines.
 */
export type BPCategory =
  | 'Normal'
  | 'Elevated'
  | 'High (Stage 1)'
  | 'High (Stage 2)'
  | 'Crisis';

export function classifyBloodPressure(
  systolic: number | undefined | null,
  diastolic: number | undefined | null
): BPCategory | null {
  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
    return null;
  }

  if (systolic >= 180 || diastolic >= 120) return 'Crisis';
  if (systolic >= 140 || diastolic >= 90) return 'High (Stage 2)';
  if (systolic >= 130 || diastolic >= 80) return 'High (Stage 1)';
  if (systolic >= 120 && diastolic < 80) return 'Elevated';
  return 'Normal';
}

/**
 * Get a color class for BMI category (for UI badges).
 */
export function getBMICategoryColor(category: string): string {
  switch (category) {
    case 'Underweight':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'Normal':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'Overweight':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Obese':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Get a color class for BP category (for UI badges).
 */
export function getBPCategoryColor(category: string): string {
  switch (category) {
    case 'Normal':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'Elevated':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'High (Stage 1)':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'High (Stage 2)':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'Crisis':
      return 'text-red-800 bg-red-100 border-red-300';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}
