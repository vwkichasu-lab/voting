import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log('[DB] Already connected to MongoDB');
    return mongoose.connection;
  }

  try {
    console.log('[DB] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('[DB] Connected to MongoDB successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error.message);
    isConnected = false;
    throw error;
  }
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[DB] Disconnected from MongoDB');
  }
}

export function isDBConnected() {
  return isConnected;
}

export default mongoose;
