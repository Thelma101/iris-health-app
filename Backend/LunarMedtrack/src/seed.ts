import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";

// Import models
import Admin from "./models/admin.model";
import FieldAgent from "./models/fieldAgent.model";
import Community from "./models/community.model";
import Patient from "./models/patient.model";
import Visitation from "./models/visitation.model";
import Inventory from "./models/inventory.model";

const MONGO_URI = process.env.MONGO_URI || "";

async function seed() {
  try {
    console.log("🌱 Starting database seed...");
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      Admin.deleteMany({}),
      FieldAgent.deleteMany({}),
      Community.deleteMany({}),
      Patient.deleteMany({}),
      Visitation.deleteMany({}),
      Inventory.deleteMany({})
    ]);
    console.log("✅ Cleared all collections");

    // Hash passwords
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("12345", saltRounds);

    // Create Admin
    console.log("👤 Creating Admin user...");
    const admin = await Admin.create({
      email: "tee@mail.com",
      password: hashedPassword,
      name: "Tee Admin"
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create Field Agents
    console.log("👥 Creating Field Agents...");
    const fieldAgent1 = await FieldAgent.create({
      email: "tee@test.com",
      password: hashedPassword,
      firstName: "Tee",
      lastName: "Agent",
      phone: "+2348012345678",
      status: "Active"
    });

    const fieldAgent2 = await FieldAgent.create({
      email: "john@test.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      phone: "+2348098765432",
      status: "Active"
    });
    console.log(`✅ Field Agents created: ${fieldAgent1.email}, ${fieldAgent2.email}`);

    // Create Communities
    console.log("🏘️  Creating Communities...");
    const community1 = await Community.create({
      name: "Ikeja Central",
      lga: "Ikeja",
      dateVisited: new Date("2026-01-10"),
      visitationSummary: "Initial community health assessment completed",
      fieldOfficers: [fieldAgent1._id],
      totalPopulation: 15000,
      totalTestsConducted: 45
    });

    const community2 = await Community.create({
      name: "Lekki Phase 1",
      lga: "Eti-Osa",
      dateVisited: new Date("2026-01-15"),
      visitationSummary: "Follow-up malaria testing campaign",
      fieldOfficers: [fieldAgent1._id, fieldAgent2._id],
      totalPopulation: 25000,
      totalTestsConducted: 78
    });

    const community3 = await Community.create({
      name: "Agege Market Area",
      lga: "Agege",
      dateVisited: new Date("2026-01-18"),
      visitationSummary: "Blood pressure screening program",
      fieldOfficers: [fieldAgent2._id],
      totalPopulation: 35000,
      totalTestsConducted: 120
    });
    console.log(`✅ Communities created: ${community1.name}, ${community2.name}, ${community3.name}`);

    // Create Patients
    console.log("🏥 Creating Patients...");
    const patient1 = await Patient.create({
      firstName: "Adaeze",
      lastName: "Okonkwo",
      phone: "+2348011111111",
      age: 35,
      gender: "female",
      community: community1._id,
      lga: "Ikeja",
      numberOfTests: 2,
      testDetails: [
        {
          testType: "Malaria RDT",
          testResult: "Negative",
          dateConducted: new Date("2026-01-10"),
          officerNotes: "Patient showing no symptoms"
        },
        {
          testType: "Blood Pressure",
          testResult: "120/80 mmHg - Normal",
          dateConducted: new Date("2026-01-12"),
          officerNotes: "Healthy BP reading"
        }
      ]
    });

    const patient2 = await Patient.create({
      firstName: "Chukwuemeka",
      lastName: "Eze",
      phone: "+2348022222222",
      age: 42,
      gender: "male",
      community: community1._id,
      lga: "Ikeja",
      numberOfTests: 1,
      testDetails: [
        {
          testType: "HIV Screening",
          testResult: "Negative",
          dateConducted: new Date("2026-01-11"),
          officerNotes: "Routine screening completed"
        }
      ]
    });

    const patient3 = await Patient.create({
      firstName: "Fatima",
      lastName: "Yusuf",
      phone: "+2348033333333",
      age: 28,
      gender: "female",
      community: community2._id,
      lga: "Eti-Osa",
      numberOfTests: 3,
      testDetails: [
        {
          testType: "Malaria RDT",
          testResult: "Positive",
          dateConducted: new Date("2026-01-15"),
          officerNotes: "Started treatment - Artemether/Lumefantrine"
        },
        {
          testType: "Blood Glucose",
          testResult: "95 mg/dL - Normal",
          dateConducted: new Date("2026-01-15"),
          officerNotes: "Fasting glucose test"
        },
        {
          testType: "Malaria RDT",
          testResult: "Negative",
          dateConducted: new Date("2026-01-18"),
          officerNotes: "Follow-up test - treatment successful"
        }
      ]
    });

    const patient4 = await Patient.create({
      firstName: "Oluwaseun",
      lastName: "Adeyemi",
      phone: "+2348044444444",
      age: 55,
      gender: "male",
      community: community3._id,
      lga: "Agege",
      numberOfTests: 2,
      testDetails: [
        {
          testType: "Blood Pressure",
          testResult: "145/95 mmHg - Stage 1 Hypertension",
          dateConducted: new Date("2026-01-18"),
          officerNotes: "Referred to clinic for follow-up"
        },
        {
          testType: "Blood Glucose",
          testResult: "180 mg/dL - High",
          dateConducted: new Date("2026-01-18"),
          officerNotes: "Suspected diabetes - referred for HbA1c test"
        }
      ]
    });
    console.log(`✅ Patients created: ${patient1.firstName}, ${patient2.firstName}, ${patient3.firstName}, ${patient4.firstName}`);

    // Create Visitations
    console.log("📋 Creating Visitations...");
    const visitation1 = await Visitation.create({
      patientId: patient1._id,
      communityId: community1._id,
      visitDate: new Date("2026-01-10"),
      vitals: { bp: "120/80", temp: 36.8, pulse: 72 },
      symptoms: ["None reported"],
      diagnostics: ["Malaria RDT - Negative"],
      treatments: ["None required"],
      notes: "Routine health check completed successfully"
    });

    const visitation2 = await Visitation.create({
      patientId: patient3._id,
      communityId: community2._id,
      visitDate: new Date("2026-01-15"),
      vitals: { bp: "118/75", temp: 38.5, pulse: 88 },
      symptoms: ["Fever", "Headache", "Body aches"],
      diagnostics: ["Malaria RDT - Positive"],
      treatments: ["Artemether/Lumefantrine 20/120mg", "Paracetamol 500mg"],
      notes: "Patient started on antimalarial treatment. Follow-up in 3 days."
    });

    const visitation3 = await Visitation.create({
      communityId: community3._id,
      visitDate: new Date("2026-01-18"),
      vitals: {},
      symptoms: [],
      diagnostics: [],
      treatments: [],
      notes: "Community-wide blood pressure screening event. 120 residents tested."
    });

    const visitation4 = await Visitation.create({
      patientId: patient4._id,
      communityId: community3._id,
      visitDate: new Date("2026-01-18"),
      vitals: { bp: "145/95", temp: 37.0, pulse: 78, weight: 85 },
      symptoms: ["Frequent urination", "Fatigue", "Blurred vision"],
      diagnostics: ["Blood Pressure - Stage 1 Hypertension", "Blood Glucose - Elevated"],
      treatments: ["Lifestyle modification counseling", "Referral to clinic"],
      notes: "Patient shows signs of hypertension and possible diabetes. Urgent follow-up needed."
    });
    console.log(`✅ Visitations created: 4 records`);

    // Create Inventory
    console.log("📦 Creating Inventory...");
    const inventory1 = await Inventory.create({
      itemName: "Malaria RDT Kits",
      category: "Diagnostic Supplies",
      quantityAvailable: 250,
      unit: "kits",
      lowStockThreshold: 50,
      communityId: community1._id
    });

    const inventory2 = await Inventory.create({
      itemName: "Blood Pressure Monitor",
      category: "Equipment",
      quantityAvailable: 5,
      unit: "units",
      lowStockThreshold: 2,
      communityId: community1._id
    });

    const inventory3 = await Inventory.create({
      itemName: "Paracetamol 500mg",
      category: "Medication",
      quantityAvailable: 500,
      unit: "tablets",
      lowStockThreshold: 100,
      communityId: community2._id
    });

    const inventory4 = await Inventory.create({
      itemName: "Artemether/Lumefantrine",
      category: "Medication",
      quantityAvailable: 120,
      unit: "doses",
      lowStockThreshold: 30,
      communityId: community2._id
    });

    const inventory5 = await Inventory.create({
      itemName: "Blood Glucose Test Strips",
      category: "Diagnostic Supplies",
      quantityAvailable: 300,
      unit: "strips",
      lowStockThreshold: 50,
      communityId: community3._id
    });

    const inventory6 = await Inventory.create({
      itemName: "Disposable Gloves",
      category: "PPE",
      quantityAvailable: 1000,
      unit: "pairs",
      lowStockThreshold: 200,
      communityId: community3._id
    });
    console.log(`✅ Inventory items created: 6 records`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log(`   - Admins: 1`);
    console.log(`   - Field Agents: 2`);
    console.log(`   - Communities: 3`);
    console.log(`   - Patients: 4`);
    console.log(`   - Visitations: 4`);
    console.log(`   - Inventory Items: 6`);
    console.log("\n🔐 Login Credentials:");
    console.log(`   Admin:       tee@mail.com / 12345`);
    console.log(`   Field Agent: tee@test.com / 12345`);
    console.log(`   Field Agent: john@test.com / 12345`);
    console.log("=".repeat(50) + "\n");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();
