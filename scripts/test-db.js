require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
    const uri = process.env.DATABASE_URL;
    if (!uri) {
        console.error('DATABASE_URL is not set in environment variables.');
        return;
    }
    const client = new MongoClient(uri, {
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: true, // For testing only
        authSource: 'admin'
    });

    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log("Available collections:", collections);
    } catch (e) {
        console.error("Error:", e);
        console.error("Error details:", e.cause || 'No additional details');
    } finally {
        await client.close();
    }
}

main(); 