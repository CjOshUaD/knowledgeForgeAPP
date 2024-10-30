import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error);
  }
};