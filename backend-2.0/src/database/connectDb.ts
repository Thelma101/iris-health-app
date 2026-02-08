import mongoose from 'mongoose';
mongoose.set("strictQuery", true);


const connectDB = async () => {
  try {
    let uri: string = process.env.MONGO_URI || process.env.MONGO_URL || "";
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    // if (err) throw err;
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}
export default connectDB;