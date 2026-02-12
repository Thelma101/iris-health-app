/**
 * Script: Count entries in the database for Badagry LGA
 * 
 * This script queries the database to count:
 * - Communities in Badagry LGA
 * - Patients in Badagry LGA
 * 
 * Run with: npx ts-node src/migrations/count-badagry-entries.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import connectDb from '../database/connectDb';
import Community from '../models/community.model';
import Patient from '../models/patient.model';

async function countBadagryEntries() {
  try {
    await connectDb();
    console.log('Connected to database\n');

    // Count communities in Badagry LGA (case-insensitive)
    const communityCount = await Community.countDocuments({
      lga: { $regex: /^badagry$/i }
    });

    console.log(`Communities in Badagry LGA: ${communityCount}`);

    // Get community names
    const communities = await Community.find(
      { lga: { $regex: /^badagry$/i } },
      { name: 1, lga: 1, totalTestsConducted: 1, totalPopulation: 1 }
    );

    if (communities.length > 0) {
      console.log('\nCommunity details:');
      communities.forEach(comm => {
        console.log(`  - ${comm.name} (LGA: ${comm.lga})`);
        console.log(`    Population: ${comm.totalPopulation || 0}, Tests: ${comm.totalTestsConducted || 0}`);
      });
    }

    // Count patients in Badagry LGA
    const patientCount = await Patient.countDocuments({
      lga: { $regex: /^badagry$/i }
    });

    console.log(`\nPatients in Badagry LGA: ${patientCount}`);

    // Get total test details for patients in Badagry
    const patients = await Patient.find(
      { lga: { $regex: /^badagry$/i } },
      { numberOfTests: 1, testDetails: 1 }
    );

    let totalTests = 0;
    patients.forEach(patient => {
      totalTests += patient.testDetails?.length || 0;
    });

    console.log(`Total tests conducted in Badagry: ${totalTests}`);

    console.log('\n=== SUMMARY ===');
    console.log(`Total entries in DB for Badagry:`);
    console.log(`  - Communities: ${communityCount}`);
    console.log(`  - Patients: ${patientCount}`);
    console.log(`  - Total: ${communityCount + patientCount}`);
    console.log(`  - Tests conducted: ${totalTests}`);

    process.exit(0);
  } catch (error) {
    console.error('Error counting Badagry entries:', error);
    process.exit(1);
  }
}

countBadagryEntries();
