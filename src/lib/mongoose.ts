import mongoose from 'mongoose'

type MongooseConnection = typeof mongoose
type ConnectionObject = {
  conn: MongooseConnection | null
  promise: Promise<MongooseConnection> | null
}

declare global {
  var mongoose: ConnectionObject | undefined
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI or DATABASE_URL environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect(): Promise<MongooseConnection> {
  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI as string, opts)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect
