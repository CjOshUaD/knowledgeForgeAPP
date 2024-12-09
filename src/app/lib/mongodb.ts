import mongoose from 'mongoose';

export async function connectMongoDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
} 