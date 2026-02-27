const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://techteam_db_user:g2PHdOFTAftpfFAi@cluster0.frlryi6.mongodb.net/jamango_db?appName=Cluster0');
        console.log("Connected successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Connection error:", err);
        process.exit(1);
    }
}
connect();
