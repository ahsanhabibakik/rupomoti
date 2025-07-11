import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongooseConnection: {
    conn: mongoose.Connection | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize the global connection reference
global.mongooseConnection = global.mongooseConnection || { conn: null, promise: null };

/**
 * Database connection options
 */
const options: mongoose.ConnectOptions = {
  // No need for bufferCommands with a persistent connection
};

/**
 * Connect to MongoDB using a cached connection
 */
async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  // If we already have a connection, return it
  if (global.mongooseConnection.conn) {
    return global.mongooseConnection.conn;
  }

  // If a connection is being established, wait for it
  if (!global.mongooseConnection.promise) {
    global.mongooseConnection.promise = mongoose.connect(MONGODB_URI, options);
  }

  try {
    // Store the connection
    const instance = await global.mongooseConnection.promise;
    global.mongooseConnection.conn = instance.connection;
  } catch (e) {
    // If connection fails, clear the promise to retry next time
    global.mongooseConnection.promise = null;
    throw e;
  }

  return global.mongooseConnection.conn;
}

export default dbConnect;
