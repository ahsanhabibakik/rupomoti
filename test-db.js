const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://rupomotiofficial:iQjPXS0Y1NDeyUrp@rupomotilifestyle.ikspfql.mongodb.net/rupomoti?retryWrites=true&w=majority";
    const client = new MongoClient(uri, {
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: true, // For testing only
        authSource: 'admin'
    });

    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        const db = client.db("rupomoti");
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