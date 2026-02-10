/**
 * BMI Calculator Utility
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
  category: "Underweight" | "Normal" | "Overweight" | "Obese";
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

  let category: BMIResult["category"];
  if (bmi < 18.5) {
    category = "Underweight";
  } else if (bmi < 25) {
    category = "Normal";
  } else if (bmi < 30) {
    category = "Overweight";
  } else {
    category = "Obese";
  }

  return { bmi, category };
}

/**
 * Classify blood pressure based on AHA guidelines.
 */
export type BPCategory =
  | "Normal"
  | "Elevated"
  | "High (Stage 1)"
  | "High (Stage 2)"
  | "Crisis";

export function classifyBloodPressure(
  systolic: number | undefined | null,
  diastolic: number | undefined | null
): BPCategory | null {
  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
    return null;
  }

  if (systolic >= 180 || diastolic >= 120) return "Crisis";
  if (systolic >= 140 || diastolic >= 90) return "High (Stage 2)";
  if (systolic >= 130 || diastolic >= 80) return "High (Stage 1)";
  if (systolic >= 120 && diastolic < 80) return "Elevated";
  return "Normal";
}
