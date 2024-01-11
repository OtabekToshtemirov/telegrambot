const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://shoraqorgon:z5aWu6POS8ZzwiTE@telegrambot.wscpeif.mongodb.net/?retryWrites=true&w=majority"; // Replace with your MongoDB URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}


