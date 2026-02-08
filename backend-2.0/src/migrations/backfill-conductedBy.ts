/**
 * Migration Script: Backfill conductedBy field for existing test records
 * 
 * This script updates existing patient test records that don't have
 * a conductedBy field set. It assigns existing tests to field agents
 * based on available context.
 * 
 * Usage:
 *   npx ts-node src/migrations/backfill-conductedBy.ts
 * 
 * Or add to package.json scripts:
 *   "migrate:conductedBy": "ts-node src/migrations/backfill-conductedBy.ts"
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
import patientModel from '../models/patient.model';
import fieldAgentModel from '../models/fieldAgent.model';

const MONGODB_URI: string = process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || '';
if (!MONGODB_URI) {
  console.error('ERROR: No MongoDB connection string found. Set DATABASE_URL, MONGODB_URI, MONGO_URI, or MONGO_URL environment variable.');
  process.exit(1);
}

interface MigrationStats {
  totalPatients: number;
  totalTestRecords: number;
  recordsWithoutConductedBy: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: number;
}

async function runMigration() {
  const stats: MigrationStats = {
    totalPatients: 0,
    totalTestRecords: 0,
    recordsWithoutConductedBy: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    errors: 0,
  };

  console.log('===========================================');
  console.log('Migration: Backfill conductedBy field');
  console.log('===========================================');
  console.log('');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    console.log('');

    // Get all field agents
    console.log('Fetching field agents...');
    const fieldAgents = await fieldAgentModel.find({}).lean();
    console.log(`✓ Found ${fieldAgents.length} field agents`);

    if (fieldAgents.length === 0) {
      console.log('');
      console.log('⚠ No field agents found in database.');
      console.log('  Cannot assign conductedBy without field agents.');
      console.log('  Please create at least one field agent first.');
      console.log('');
      process.exit(1);
    }

    // Use the first field agent as default (or you can modify this logic)
    const defaultAgent = fieldAgents[0];
    console.log(`  Using "${defaultAgent.firstName} ${defaultAgent.lastName}" as default agent for migration`);
    console.log('');

    // Get all patients
    console.log('Fetching patients...');
    const patients = await patientModel.find({}).lean();
    stats.totalPatients = patients.length;
    console.log(`✓ Found ${patients.length} patients`);
    console.log('');

    // Process each patient
    console.log('Processing patients...');
    console.log('');

    for (const patient of patients) {
      const testDetails = patient.testDetails || [];
      stats.totalTestRecords += testDetails.length;

      let patientModified = false;

      for (let i = 0; i < testDetails.length; i++) {
        const test = testDetails[i];

        if (!test.conductedBy) {
          stats.recordsWithoutConductedBy++;

          try {
            // Strategy: Assign to default agent
            // You can modify this to use different logic:
            // - Match by community if agent is assigned to specific communities
            // - Match by date if you track agent schedules
            // - Random distribution among agents
            
            testDetails[i].conductedBy = defaultAgent._id;
            patientModified = true;
            stats.recordsUpdated++;
          } catch (err) {
            console.error(`  Error updating test for patient ${patient._id}:`, err);
            stats.errors++;
          }
        } else {
          stats.recordsSkipped++;
        }
      }

      // Save updated patient if modified
      if (patientModified) {
        await patientModel.updateOne(
          { _id: patient._id },
          { $set: { testDetails: testDetails } }
        );
      }
    }

    // Print summary
    console.log('');
    console.log('===========================================');
    console.log('Migration Summary');
    console.log('===========================================');
    console.log(`Total patients:              ${stats.totalPatients}`);
    console.log(`Total test records:          ${stats.totalTestRecords}`);
    console.log(`Records without conductedBy: ${stats.recordsWithoutConductedBy}`);
    console.log(`Records updated:             ${stats.recordsUpdated}`);
    console.log(`Records skipped (had value): ${stats.recordsSkipped}`);
    console.log(`Errors:                      ${stats.errors}`);
    console.log('===========================================');
    console.log('');

    if (stats.errors === 0) {
      console.log('✓ Migration completed successfully!');
    } else {
      console.log('⚠ Migration completed with some errors.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('');
    console.log('Database connection closed.');
    process.exit(0);
  }
}

// Run the migration
runMigration();
