const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Use the Render MongoDB URI directly
const MONGO_URI = 'mongodb+srv://akpatathelma_db_user:3KRDQQMcmZyTgdUx@cluster99.d51jmdz.mongodb.net/lunarmedtrack';

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, unique: true, index: true },
  password: { type: String, required: true },
  name: { type: String }
}, { timestamps: true });

const Admin = mongoose.model("Admin", AdminSchema);

async function createOrUpdateAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // First, delete existing admin
    const deleted = await Admin.deleteMany({ email: 'tee@mail.com' });
    console.log('Deleted existing admins:', deleted.deletedCount);

    const email = 'tee@mail.com';
    const password = '12345';
    const name = 'Tee Admin';

    const hashedPassword = await bcrypt.hash(password, 10);

    // Try to update existing admin or create new one
    const result = await Admin.findOneAndUpdate(
      { email },
      { email, password: hashedPassword, name },
      { upsert: true, new: true }
    );

    console.log('✅ Admin created/updated successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Admin ID:', result._id);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createOrUpdateAdmin();
