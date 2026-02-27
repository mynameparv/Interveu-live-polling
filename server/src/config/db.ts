import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/live-polling';

    // If using Atlas, ensure we're not connecting to the 'test' database if permissions are missing
    if (mongoUri.includes('cluster0.uk399cy.mongodb.net')) {
      // Check if DB name is present. Atlas URIs usually look like ...net/dbname?... or ...net/?... 
      const urlMatch = mongoUri.match(/mongodb\.net\/([^?]*)/);
      if (!urlMatch || !urlMatch[1] || urlMatch[1] === '') {
        console.log('No database specified in Atlas URI, defaulting to "live-polling"');
        mongoUri = mongoUri.replace('mongodb.net/', 'mongodb.net/live-polling');
      }
    }

    // If it's a localhost URI and we want a guaranteed successful dev environment:
    if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('Using in-memory MongoDB for local development');
    }

    await mongoose.connect(mongoUri, {
      dbName: 'live-polling' // Explicitly set dbName as a fallback
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    setTimeout(connectDB, 5000);
  }
};

