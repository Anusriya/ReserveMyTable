const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Database and collection names
const dbName = "restaurantDB";
const collectionName = "reservations";

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}
connectToMongoDB();

// API endpoint to save reservation
app.post('/api/reservations', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const newReservation = {
            name: req.body.name,
            date: req.body.date,
            time: req.body.time,
            tableSize: req.body.tableSize,
            status: "Table Reserved",
            createdAt: new Date()
        };

        const result = await collection.insertOne(newReservation);
        res.status(201).json({ 
            message: "Reservation saved successfully",
            id: result.insertedId
        });
    } catch (err) {
        console.error("Error saving reservation:", err);
        res.status(500).json({ error: "Failed to save reservation" });
    }
});

// API endpoint to get all reservations
app.get('/api/reservations', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const reservations = await collection.find({}).toArray();
        res.json(reservations);
    } catch (err) {
        console.error("Error fetching reservations:", err);
        res.status(500).json({ error: "Failed to fetch reservations" });
    }
});

// API endpoint to update reservation status (payment confirmation)
app.put('/api/reservations/:id/confirm', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const result = await collection.updateOne(
            { _id: new require('mongodb').ObjectId(req.params.id) },
            { $set: { status: "Confirmed" } }
        );
        
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Reservation not found" });
        }
        
        res.json({ message: "Reservation confirmed successfully" });
    } catch (err) {
        console.error("Error confirming reservation:", err);
        res.status(500).json({ error: "Failed to confirm reservation" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});