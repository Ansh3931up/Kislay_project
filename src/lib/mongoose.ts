import mongoose from 'mongoose';

// Define the structure for the cached connection object
interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Initialize our cached connection object
const globalCache = global as unknown as {
  mongoose: ConnectionCache | undefined;
};

// Initialize connection variables
const cached: ConnectionCache = globalCache.mongoose || { conn: null, promise: null };

// Store the connection in the global object
if (!globalCache.mongoose) {
  globalCache.mongoose = cached;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Connect to MongoDB database
 */
async function dbConnect(): Promise<typeof mongoose> {
  // If we have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a promise to a connection, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // If there's an error, clear the promise so we can retry
    cached.promise = null;
    throw error;
  }
}

export default dbConnect; 