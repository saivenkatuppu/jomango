const { MongoClient } = require('mongodb');

const oldUri = 'mongodb://saivenkatuppu46_db_user:scaAZuA3aocpkZM7@ac-k6ekv79-shard-00-00.g5rhptc.mongodb.net:27017,ac-k6ekv79-shard-00-01.g5rhptc.mongodb.net:27017,ac-k6ekv79-shard-00-02.g5rhptc.mongodb.net:27017/jamango_db?ssl=true&authSource=admin&retryWrites=true&w=majority';
// Bypass SRV DNS query issues with direct hosts
const newUri = 'mongodb://venturemond_db_user:qUcaE4bfAuBtq5F6@ac-y4mzg3v-shard-00-00.brmnphx.mongodb.net:27017,ac-y4mzg3v-shard-00-01.brmnphx.mongodb.net:27017,ac-y4mzg3v-shard-00-02.brmnphx.mongodb.net:27017/jamango_db?ssl=true&replicaSet=atlas-kmkrnk-shard-0&authSource=admin&retryWrites=true&w=majority';

async function migrate() {
    try {
        console.log('Connecting to databases...');
        const oldClient = await MongoClient.connect(oldUri);
        const newClient = await MongoClient.connect(newUri);

        console.log('Connected. Starting migration...');

        const oldDb = oldClient.db('jamango_db');
        const newDb = newClient.db('jamango_db');

        // Get all collections from the old db
        const collections = await oldDb.listCollections().toArray();

        for (const info of collections) {
            if (info.name === 'system.indexes') continue;
            console.log(`\nMigrating collection: ${info.name}`);

            const oldCol = oldDb.collection(info.name);
            const newCol = newDb.collection(info.name);

            // Fetch all documents
            const docs = await oldCol.find({}).toArray();

            if (docs.length > 0) {
                // Insert into the new DB
                await newCol.insertMany(docs);
                console.log(`- Inserted ${docs.length} documents into ${info.name}`);
            } else {
                console.log(`- Skipping ${info.name} (0 documents)`);
            }
        }

        console.log('\nMigration completed successfully!');
        await oldClient.close();
        await newClient.close();
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
