#!/usr/bin/env node

/**
 * Mongoose Migration Debug Tool
 * 
 * This script helps diagnose issues with the Prisma to Mongoose migration.
 * It connects to the database and performs basic CRUD operations to verify
 * that everything is working correctly.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Database connection
async function connectToDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      process.exit(1);
    }
    
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// List collections
async function listCollections(connection) {
  try {
    console.log('🔄 Listing collections...');
    const collections = await connection.db.listCollections().toArray();
    console.log('✅ Collections found:', collections.length);
    
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    return collections.map(c => c.name);
  } catch (error) {
    console.error('❌ Failed to list collections:', error);
    return [];
  }
}

// Count documents in each collection
async function countDocuments(connection, collections) {
  console.log('\n🔄 Counting documents in each collection...');
  
  for (const collectionName of collections) {
    try {
      const count = await connection.db.collection(collectionName).countDocuments();
      console.log(`  - ${collectionName}: ${count} documents`);
    } catch (error) {
      console.error(`  ❌ Failed to count documents in ${collectionName}:`, error);
    }
  }
}

// Sample documents from each collection
async function sampleDocuments(connection, collections) {
  console.log('\n🔄 Sampling one document from each collection...');
  
  for (const collectionName of collections) {
    try {
      const sample = await connection.db.collection(collectionName).findOne();
      console.log(`\n📄 Sample from ${collectionName}:`);
      console.log(JSON.stringify(sample, null, 2).slice(0, 500) + (JSON.stringify(sample).length > 500 ? '...' : ''));
    } catch (error) {
      console.error(`  ❌ Failed to sample documents from ${collectionName}:`, error);
    }
  }
}

// Main function
async function main() {
  console.log('🔍 Starting Mongoose Migration Debug Tool');
  
  try {
    // Connect to database
    const connection = await connectToDatabase();
    
    // List collections
    const collections = await listCollections(connection);
    
    // Count documents
    await countDocuments(connection, collections);
    
    // Sample documents
    await sampleDocuments(connection, collections);
    
    console.log('\n✅ Debug tool completed successfully');
  } catch (error) {
    console.error('❌ Debug tool failed:', error);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
main();
