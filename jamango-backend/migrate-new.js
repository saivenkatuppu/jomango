const { MongoClient } = require('mongodb');

// The OLD database from which we want to pull data
const oldUri = 'mongodb://venturemond_db_user:qUcaE4bfAuBtq5F6@ac-y4mzg3v-shard-00-00.brmnphx.mongodb.net:27017,ac-y4mzg3v-shard-00-01.brmnphx.mongodb.net:27017,ac-y4mzg3v-shard-00-02.brmnphx.mongodb.net:27017/jamango_db?ssl=true&replicaSet=atlas-kmkrnk-shard-0&authSource=admin&retryWrites=true&w=majority';

// The NEW database to which we want to push data
const newUri = 'mongodb+srv://techteam_db_user:g2PHdOFTAftpfFAi@cluster0.frlryi6.mongodb.net/jamango_db?appName=Cluster0';

async function migrate() {
    let oldClient, newClient;
    try {
        console.log('Connecting to old and new databases...');
        oldClient = await MongoClient.connect(oldUri);
        newClient = await MongoClient.connect(newUri);

        console.log('Connected! Starting data migration...');

        const oldDb = oldClient.db('jamango_db');
        const newDb = newClient.db('jamango_db');

        // Get all collections from the old db
        const collections = await oldDb.listCollections().toArray();

        for (const info of collections) {
            if (info.name === 'system.indexes') continue;
            console.log(`\nMigrating collection: ${info.name}`);

            const oldCol = oldDb.collection(info.name);
            const newCol = newDb.collection(info.name);

            // Fetch all documents from the old collection
            const docs = await oldCol.find({}).toArray();

            if (docs.length > 0) {
                // Insert them into the new collection
                await newCol.insertMany(docs);
                console.log(`- Successfully inserted ${docs.length} documents into ${info.name}`);
            } else {
                console.log(`- Skipping ${info.name} (0 documents)`);
            }
        }

        console.log('\nMigration completed successfully! The data was successfully transferred to your new account.');
    } catch (err) {
        console.error('\nMigration failed!', err);
        console.log('\nHINT: Make sure to white-list IP 0.0.0.0/0 in MongoDB Atlas Network Access of the new cluster (Cluster0).');
    } finally {
        if (oldClient) await oldClient.close();
        if (newClient) await newClient.close();
        process.exit();
    }
}

migrate();
