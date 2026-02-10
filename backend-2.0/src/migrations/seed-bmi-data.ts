/**
 * Migration: Seed BMI data for existing patients
 * 
 * Adds realistic height, weight, and health metric values to existing patient
 * test records that don't have BMI data, so the Age Range vs BMI chart displays
 * properly.
 * 
 * Run with: npx ts-node src/migrations/seed-bmi-data.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


import connectDb from '../database/connectDb';

// Realistic BMI sample data by age range
const sampleProfiles = [
  // 0-18 (children/teens)
  { minAge: 0, maxAge: 18, heights: [120, 135, 150, 155, 160], weights: [30, 40, 50, 55, 58] },
  // 19-30 (young adults)
  { minAge: 19, maxAge: 30, heights: [160, 165, 170, 175, 168], weights: [55, 62, 70, 78, 85] },
  // 31-45 (adults)
  { minAge: 31, maxAge: 45, heights: [158, 163, 170, 172, 175], weights: [60, 68, 75, 82, 90] },
  // 46-60 (middle age)
  { minAge: 46, maxAge: 60, heights: [155, 160, 165, 168, 170], weights: [65, 72, 78, 85, 95] },
  // 61+ (seniors)
  { minAge: 61, maxAge: 200, heights: [150, 155, 160, 163, 165], weights: [58, 65, 70, 76, 82] },
];

function calculateBMI(weightKg: number, heightCm: number) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  return { bmi, category };
}

function classifyBP(sys: number, dia: number): string {
  if (sys < 120 && dia < 80) return 'Normal';
  if (sys < 130 && dia < 80) return 'Elevated';
  if (sys < 140 || dia < 90) return 'High Blood Pressure Stage 1';
  if (sys >= 140 || dia >= 90) return 'High Blood Pressure Stage 2';
  return 'Normal';
}

async function seedBmiData() {
  try {
    await connectDb();
    console.log('Connected to database');

    // Use raw collection to bypass Mongoose validation (some old records have string testType)
    const collection = mongoose.connection.collection('patients');
    const patients = await collection.find().toArray();
    console.log(`Found ${patients.length} patients`);

    let updated = 0;
    let skipped = 0;

    for (const patient of patients) {
      const age = patient.age || 25;
      
      // Find matching profile for age range
      const profile = sampleProfiles.find(p => age >= p.minAge && age <= p.maxAge) || sampleProfiles[1];
      
      const testDetails = patient.testDetails || [];
      if (!Array.isArray(testDetails) || testDetails.length === 0) continue;
      
      let modified = false;
      const updatedTests = [...testDetails];
      
      for (let i = 0; i < updatedTests.length; i++) {
        const test = updatedTests[i];
        
        // Skip if already has BMI data
        if (test.heightCm && test.weightKg && test.bmi) {
          skipped++;
          continue;
        }
        
        // Pick random values from profile
        const idx = Math.floor(Math.random() * profile.heights.length);
        const heightCm = profile.heights[idx];
        const weightKg = profile.weights[idx];
        const bmiResult = calculateBMI(weightKg, heightCm);
        
        if (bmiResult) {
          updatedTests[i] = {
            ...test,
            heightCm,
            weightKg,
            bmi: bmiResult.bmi,
            bmiCategory: bmiResult.category,
            bloodPressureSystolic: test.bloodPressureSystolic || (100 + Math.floor(Math.random() * 50)),
            bloodPressureDiastolic: test.bloodPressureDiastolic || (60 + Math.floor(Math.random() * 35)),
            bpCategory: test.bpCategory || classifyBP(
              test.bloodPressureSystolic || (100 + Math.floor(Math.random() * 50)),
              test.bloodPressureDiastolic || (60 + Math.floor(Math.random() * 35))
            ),
            glucoseLevel: test.glucoseLevel || (70 + Math.floor(Math.random() * 60)),
            glucoseUnit: test.glucoseUnit || 'mg/dL',
          };
          
          modified = true;
          updated++;
        }
      }
      
      if (modified) {
        await collection.updateOne(
          { _id: patient._id },
          { $set: { testDetails: updatedTests } }
        );
      }
    }

    console.log(`\nSeed complete:`);
    console.log(`  Updated: ${updated} test records`);
    console.log(`  Skipped: ${skipped} (already had BMI data)`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedBmiData();
