/**
 * Classifies medical test results as positive (+ve / abnormal) or negative (-ve / normal).
 * 
 * +ve (abnormal/concerning): Positive, Reactive, Abnormal, High, Elevated, Present,
 *   Stage 1 Hypertension, Stage 2 Hypertension, Hypertensive Crisis, etc.
 * -ve (normal/clear): Negative, Non-Reactive, Normal, Low, Absent
 * 
 * Returns 'positive', 'negative', or null (unclassifiable).
 */

// Exact matches (lowercase) → classification
const POSITIVE_EXACT = new Set([
  'positive', 'reactive', 'abnormal', 'high', 'elevated', 'present',
  'stage 1 hypertension', 'stage 2 hypertension', 'hypertensive crisis',
  'detected', 'confirmed',
]);

const NEGATIVE_EXACT = new Set([
  'negative', 'non-reactive', 'normal', 'low', 'absent',
  'not detected', 'unconfirmed', 'clear',
]);

// Keyword-based fallback (substring matching)
const POSITIVE_KEYWORDS = ['positive', 'reactive', 'abnormal', 'elevated', 'hypertension', 'crisis', 'high', 'detected', 'present'];
const NEGATIVE_KEYWORDS = ['negative', 'non-reactive', 'normal', 'absent', 'not detected', 'clear'];

export type ResultClass = 'positive' | 'negative' | null;

export function classifyResult(result: string): ResultClass {
  const r = result.toLowerCase().trim();
  if (!r) return null;

  // 1. Exact match
  if (POSITIVE_EXACT.has(r)) return 'positive';
  if (NEGATIVE_EXACT.has(r)) return 'negative';

  // 2. Check "non-reactive" before "reactive" (substring order matters)
  if (r.includes('non-reactive')) return 'negative';

  // 3. Keyword substring matching
  for (const kw of POSITIVE_KEYWORDS) {
    if (r.includes(kw)) return 'positive';
  }
  for (const kw of NEGATIVE_KEYWORDS) {
    if (r.includes(kw)) return 'negative';
  }

  return null;
}
