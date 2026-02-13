import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Patient from "../models/patient.model";
import Community from "../models/community.model";
import { Types } from "mongoose";
import { uploadBuffer } from "../utils/uploadToCloudinary";
import testTypeModel from "../models/testType.model";
import { calculateBMI, classifyBloodPressure } from "../utils/bmiCalculator";

/**
 * Create patient (also records first test)
 */
// export const createPatient = asyncHandler(
//   async (req: Request, res: Response): Promise<void> => {
//     const {
//       firstName,
//       lastName,
//       phone,
//       age,
//       gender,
//       community,
//       lga,
//     } = req.body;

//     // 🔎 Validate community
//     const communityExists = await Community.findById(community);
//     if (!communityExists) {
//       res.status(404).json({ message: "Community not found" });
//       return;
//     }

//     // 🧠 Parse testDetails (multipart/form-data sends strings)
//     let testDetails: any[] = [];

//     if (req.body.testDetails) {
//       testDetails =
//         typeof req.body.testDetails === "string"
//           ? JSON.parse(req.body.testDetails)
//           : req.body.testDetails;
//     }

//     if (!Array.isArray(testDetails) || testDetails.length === 0) {
//       res.status(400).json({ message: "At least one test detail is required" });
//       return;
//     }

//     // 🧠 Extract files
//     const files = req.files as {
//       testSheet?: Express.Multer.File[];
//       patientImage?: Express.Multer.File[];
//     };

//     let testSheetUrl: string | undefined;
//     let patientImageUrl: string | undefined;

//     // 📄 Validate + upload test sheet (PDF ONLY)
//     if (files?.testSheet?.[0]) {
//       const file = files.testSheet[0];

//       if (file.mimetype !== "application/pdf") {
//         res.status(400).json({
//           message: "testSheet must be a PDF file",
//         });
//         return;
//       }

//       testSheetUrl = await uploadBuffer(
//         file.buffer,
//         "patients/test-sheets",
//         "raw"
//       );
//     }

//     // 🖼 Validate + upload patient image (IMAGE ONLY)
//     if (files?.patientImage?.[0]) {
//       const file = files.patientImage[0];

//       if (!file.mimetype.startsWith("image/")) {
//         res.status(400).json({
//           message: "patientImage must be an image file",
//         });
//         return;
//       }

//       patientImageUrl = await uploadBuffer(
//         file.buffer,
//         "patients/images",
//         "image"
//       );
//     }

//     // 🧠 Attach URLs to each test
//     const enrichedTestDetails = testDetails.map((test) => ({
//       ...test,
//       testSheetUrl,
//       patientImageUrl,
//     }));

//     // 🧾 Create patient
//     const patient = await Patient.create({
//       firstName,
//       lastName,
//       phone,
//       age,
//       gender,
//       community,
//       lga: lga || communityExists.lga,
//       testDetails: enrichedTestDetails,
//       numberOfTests: enrichedTestDetails.length,
//     });

//     // 🔢 Update community stats
//     await Community.findByIdAndUpdate(community, {
//       $inc: { totalTestsConducted: patient.numberOfTests },
//     });

//     const populatedPatient = await patient.populate(
//       "community",
//       "name lga"
//     );

//     res.status(201).json({
//       message: "Patient and test record created successfully",
//       patient: populatedPatient,
//     });
//   }
// );


export const createPatient = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      firstName,
      lastName,
      phone,
      age,
      gender,
      community,
      lga,
    } = req.body;

    const communityExists = await Community.findById(community);
    if (!communityExists) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    let testDetails: any[] = [];

    if (req.body.testDetails) {
      testDetails =
        typeof req.body.testDetails === "string"
          ? JSON.parse(req.body.testDetails)
          : req.body.testDetails;
    }

    if (!Array.isArray(testDetails) || testDetails.length === 0) {
      // Allow creating patient without test details
      testDetails = [];
    }

    // ✅ Validate test types
    for (const test of testDetails) {
      const testTypeDoc = await testTypeModel.findById(test.testType);

      if (!testTypeDoc) {
        res.status(400).json({
          message: `Invalid test type: ${test.testType}`
        });
        return;
      }
    }

    const files = req.files as {
      testSheet?: Express.Multer.File[];
      patientImage?: Express.Multer.File[];
    };

    let testSheetUrl: string | undefined;
    let patientImageUrl: string | undefined;

    if (files?.testSheet?.[0]) {
      const file = files.testSheet[0];
      if (file.mimetype !== "application/pdf") {
        res.status(400).json({ message: "testSheet must be a PDF file" });
        return;
      }

      testSheetUrl = await uploadBuffer(
        file.buffer,
        "patients/test-sheets",
        "raw"
      );
    }

    if (files?.patientImage?.[0]) {
      const file = files.patientImage[0];
      if (!file.mimetype.startsWith("image/")) {
        res.status(400).json({ message: "patientImage must be an image file" });
        return;
      }

      patientImageUrl = await uploadBuffer(
        file.buffer,
        "patients/images",
        "image"
      );
    }

    // Get the authenticated user's ID (field agent or admin who conducted the test)
    const conductedBy = (req as any).user?.id;

    const enrichedTestDetails = testDetails.map((test) => {
      // Auto-calculate BMI if height and weight are provided
      const bmiResult = calculateBMI(test.weightKg, test.heightCm);
      const bpCategory = classifyBloodPressure(test.bloodPressureSystolic, test.bloodPressureDiastolic);

      return {
        ...test,
        testSheetUrl,
        patientImageUrl,
        conductedBy, // Track which field agent conducted this test
        // Health metrics - pass through from request
        heightCm: test.heightCm || undefined,
        weightKg: test.weightKg || undefined,
        bmi: bmiResult?.bmi || undefined,
        bmiCategory: bmiResult?.category || undefined,
        bloodPressureSystolic: test.bloodPressureSystolic || undefined,
        bloodPressureDiastolic: test.bloodPressureDiastolic || undefined,
        bpCategory: bpCategory || undefined,
        glucoseLevel: test.glucoseLevel || undefined,
        glucoseUnit: test.glucoseUnit || undefined,
      };
    });
let positiveCount = 0;
let negativeCount = 0;

for (const test of testDetails) {
  const result = String(test.testResult || '').toLowerCase();
  if (result === "positive") positiveCount++;
  if (result === "negative") negativeCount++;
}

    const adminId = (req as any).user?.id;

    const patient = await Patient.create({
      firstName,
      lastName,
      phone,
      age,
      gender,
      community,
      lga: lga || communityExists.lga,
      testDetails: enrichedTestDetails,
      numberOfTests: enrichedTestDetails.length,
      createdBy: adminId ? new Types.ObjectId(adminId) : undefined,
    });

    await Community.findByIdAndUpdate(community, {
      $inc: {
        totalTestsConducted: patient.numberOfTests,
        topPositive: positiveCount,
        topNegative: negativeCount,
      },
      $set: {
        dateVisited: new Date(),
      },
    });

    const populatedPatient = await patient.populate([
      { path: "community", select: "name lga" },
      { path: "testDetails.testType", select: "name" }
    ]);

    res.status(201).json({
      message: "Patient and test record created successfully",
      patient: populatedPatient,
    });
  }
);


/**
 * Get all patients with their records
 * Supports query params: community, page, limit, search
 */
export const getAllPatients = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { community, page, limit, search } = req.query;

  // Build filter
  const filter: any = {};
  if (community && Types.ObjectId.isValid(community as string)) {
    filter.community = new Types.ObjectId(community as string);
  }
  if (search) {
    const searchRegex = new RegExp(search as string, 'i');
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { phone: searchRegex },
    ];
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const pageSize = Math.min(1000, Math.max(1, parseInt(limit as string) || 50));
  const skip = (pageNum - 1) * pageSize;

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .populate("community", "name lga")
      .populate("testDetails.testType", "name")
      .populate("testDetails.conductedBy", "name email")
      .populate("createdBy", "name email")
      .populate("editHistory.editedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Patient.countDocuments(filter),
  ]);

  res.status(200).json({
    message: "Patients fetched successfully",
    patients,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

/**
 * Get single patient with records
 */
export const getPatientById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const patient = await Patient.findById(id)
    .populate("community", "name lga")
    .populate("testDetails.testType", "name")
    .populate("testDetails.conductedBy", "name email")
    .populate("createdBy", "name email")
    .populate("editHistory.editedBy", "name email");

  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  res.status(200).json({
    message: "Patient fetched successfully",
    patient
  });
});

/**
 * Update patient details or add new test
 */
// export const updatePatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params;
//   const updateData = req.body;

//   const patient = await Patient.findById(id);
//   if (!patient) {
//     res.status(404).json({ message: "Patient not found" });
//     return;
//   }

//   // If new test is added
//   if (updateData.testDetails?.length) {
//     patient.testDetails.push(...updateData.testDetails);
//     patient.numberOfTests = patient.testDetails.length;

//     await Community.findByIdAndUpdate(patient.community, {
//       $inc: { totalTestsConducted: updateData.testDetails.length }
//     });
//   }

//   // Update patient bio data
//   if (updateData.firstName) patient.firstName = updateData.firstName;
//   if (updateData.lastName) patient.lastName = updateData.lastName;
//   if (updateData.phone) patient.phone = updateData.phone;
//   if (updateData.age) patient.age = updateData.age;
//   if (updateData.gender) patient.gender = updateData.gender;

//   await patient.save();

//   const populatedPatient = await patient.populate("community", "name lga");

//   res.status(200).json({
//     message: "Patient updated successfully",
//     patient: populatedPatient
//   });
// });
export const updatePatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  const patient = await Patient.findById(id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  // Update existing test details ONLY (no creation)
  if (updateData.testDetails?.length) {
    for (const test of updateData.testDetails) {
      if (!test._id) {
        res.status(400).json({ message: "Test detail _id is required for update" });
        return;
      }

      const existingTest = (patient.testDetails as any).id(test._id);

      if (!existingTest) {
        res.status(404).json({ message: `Test detail not found with id ${test._id}` });
        return;
      }

      const testTypeId = test.testType;

      if (!Types.ObjectId.isValid(testTypeId)) {
        res.status(400).json({
          message: `Invalid test type ID format: ${testTypeId}`
        });
        return;
      }

      const testTypeDoc = await testTypeModel.findById(testTypeId);

      if (!testTypeDoc) {
        res.status(400).json({
          message: `Test type not found with ID: ${testTypeId}`
        });
        return;
      }

      // ✅ UPDATE existing test (NO PUSH)
      existingTest.testType = new Types.ObjectId(testTypeId);
      if (test.testResult !== undefined) existingTest.testResult = test.testResult;
      if (test.dateConducted) existingTest.dateConducted = new Date(test.dateConducted);
      if (test.officerNotes !== undefined) existingTest.officerNotes = test.officerNotes;
      if (test.testSheetUrl !== undefined) existingTest.testSheetUrl = test.testSheetUrl;
      if (test.patientImageUrl !== undefined) existingTest.patientImageUrl = test.patientImageUrl;
      // Health metrics
      if (test.heightCm !== undefined) existingTest.heightCm = test.heightCm;
      if (test.weightKg !== undefined) existingTest.weightKg = test.weightKg;
      if (test.bmi !== undefined) existingTest.bmi = test.bmi;
      if (test.bmiCategory !== undefined) existingTest.bmiCategory = test.bmiCategory;
      if (test.bloodPressureSystolic !== undefined) existingTest.bloodPressureSystolic = test.bloodPressureSystolic;
      if (test.bloodPressureDiastolic !== undefined) existingTest.bloodPressureDiastolic = test.bloodPressureDiastolic;
      if (test.bpCategory !== undefined) existingTest.bpCategory = test.bpCategory;
      if (test.glucoseLevel !== undefined) existingTest.glucoseLevel = test.glucoseLevel;
      if (test.glucoseUnit !== undefined) existingTest.glucoseUnit = test.glucoseUnit;
    }
  }

  // Update patient bio data
  const changes: string[] = [];
  if (updateData.firstName !== undefined && updateData.firstName !== patient.firstName) {
    changes.push(`firstName: ${patient.firstName} → ${updateData.firstName}`);
    patient.firstName = updateData.firstName;
  }
  if (updateData.lastName !== undefined && updateData.lastName !== patient.lastName) {
    changes.push(`lastName: ${patient.lastName} → ${updateData.lastName}`);
    patient.lastName = updateData.lastName;
  }
  if (updateData.phone !== undefined && updateData.phone !== patient.phone) {
    changes.push(`phone updated`);
    patient.phone = updateData.phone;
  }
  if (updateData.age !== undefined && updateData.age !== patient.age) {
    changes.push(`age: ${patient.age} → ${updateData.age}`);
    patient.age = updateData.age;
  }
  if (updateData.gender !== undefined && updateData.gender !== patient.gender) {
    changes.push(`gender: ${patient.gender} → ${updateData.gender}`);
    patient.gender = updateData.gender;
  }

  // Record edit history if there are changes
  const editAction = updateData.testDetails?.length ? 'update_test' : 'update_patient';
  const editSummary = updateData.testDetails?.length
    ? `Test details updated${changes.length ? '; ' + changes.join(', ') : ''}`
    : changes.join(', ') || 'Patient record updated';

  const adminId = (req as any).user?.id;
  if (adminId) {
    if (!patient.editHistory) patient.editHistory = [];
    patient.editHistory.push({
      editedBy: new Types.ObjectId(adminId),
      editedAt: new Date(),
      action: editAction,
      changes: editSummary,
    } as any);
  }

  try {
    await patient.save();
  } catch (error: any) {
    res.status(400).json({
      message: "Validation failed",
      error: error.message,
      details: error.errors
    });
    return;
  }

  const populatedPatient = await patient.populate([
    { path: "community", select: "name lga" },
    { path: "testDetails.testType", select: "name" }
  ]);

  res.status(200).json({
    message: "Patient updated successfully",
    patient: populatedPatient
  });
});

/**
 * Add a new test to an existing patient
 */
export const addTestToPatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const patient = await Patient.findById(id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  let testDetails: any[] = [];
  if (req.body.testDetails) {
    testDetails =
      typeof req.body.testDetails === "string"
        ? JSON.parse(req.body.testDetails)
        : req.body.testDetails;
  }

  if (!Array.isArray(testDetails) || testDetails.length === 0) {
    res.status(400).json({ message: "At least one test detail is required" });
    return;
  }

  // Validate test types
  for (const test of testDetails) {
    const testTypeDoc = await testTypeModel.findById(test.testType);
    if (!testTypeDoc) {
      res.status(400).json({ message: `Invalid test type: ${test.testType}` });
      return;
    }
  }

  // Get the authenticated user's ID
  const conductedBy = (req as any).user?.id;

  const enrichedTestDetails = testDetails.map((test) => {
    const bmiResult = calculateBMI(test.weightKg, test.heightCm);
    const bpCategory = classifyBloodPressure(test.bloodPressureSystolic, test.bloodPressureDiastolic);

    return {
      ...test,
      conductedBy,
      heightCm: test.heightCm || undefined,
      weightKg: test.weightKg || undefined,
      bmi: bmiResult?.bmi || undefined,
      bmiCategory: bmiResult?.category || undefined,
      bloodPressureSystolic: test.bloodPressureSystolic || undefined,
      bloodPressureDiastolic: test.bloodPressureDiastolic || undefined,
      bpCategory: bpCategory || undefined,
      glucoseLevel: test.glucoseLevel || undefined,
      glucoseUnit: test.glucoseUnit || undefined,
    };
  });

  // Push new tests into patient's testDetails array
  patient.testDetails.push(...enrichedTestDetails as any);
  patient.numberOfTests = patient.testDetails.length;

  // Update community stats
  let positiveCount = 0;
  let negativeCount = 0;
  for (const test of testDetails) {
    const result = String(test.testResult || '').toLowerCase();
    if (result === "positive") positiveCount++;
    if (result === "negative") negativeCount++;
  }

  await Community.findByIdAndUpdate(patient.community, {
    $inc: {
      totalTestsConducted: enrichedTestDetails.length,
      topPositive: positiveCount,
      topNegative: negativeCount,
    },
    $set: { dateVisited: new Date() },
  });

  await patient.save();

  const populatedPatient = await patient.populate([
    { path: "community", select: "name lga" },
    { path: "testDetails.testType", select: "name" },
  ]);

  res.status(201).json({
    message: "Test added to patient successfully",
    patient: populatedPatient,
  });
});

/**
 * Delete patient and their records
 */
export const deletePatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const patient = await Patient.findById(id);
  if (!patient) {
    res.status(404).json({ message: "Patient not found" });
    return;
  }

  // Decrease test count from community
  await Community.findByIdAndUpdate(patient.community, {
    $inc: { totalTestsConducted: -patient.numberOfTests }
  });

  await patient.deleteOne();

  res.status(200).json({ message: "Patient deleted successfully" });
});
export const filterPatients = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { communityId, testType, fromDate, toDate } = req.query;

    const filter: any = {};

    // 🏘 Filter by community
    if (communityId) {
      filter.community = communityId;
    }

    // 🧪 Build testDetails filter
    if (testType || fromDate || toDate) {
      filter.testDetails = {
        $elemMatch: {}
      };

      if (testType) {
        filter.testDetails.$elemMatch.testType = testType;
      }

      if (fromDate || toDate) {
        filter.testDetails.$elemMatch.dateConducted = {};
        if (fromDate) {
          filter.testDetails.$elemMatch.dateConducted.$gte = new Date(fromDate as string);
        }
        if (toDate) {
          filter.testDetails.$elemMatch.dateConducted.$lte = new Date(toDate as string);
        }
      }
    }

    const patients = await Patient.find(filter)
      .populate("community", "name lga")
      .populate("testDetails.testType", "name")
      .sort({ "testDetails.dateConducted": -1 });

    res.status(200).json({
      message: "Filtered patients fetched successfully",
      total: patients.length,
      patients
    });
  }
);
