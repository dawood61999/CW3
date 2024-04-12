require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path'); 

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// MongoDB connection string
const uri = "mongodb+srv://dariousfline123:dawood123123@cluster0.lvdgwhm.mongodb.net/";

const client = new MongoClient(uri);

let database;

app.get('/', (req, res) => {
    res.send('Express.js server is running');
});

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
        database = client.db("cw2collection");
    } catch (error) {
        console.error('Could not connect to MongoDB', error);
        process.exit(1);
    }
}
connectToMongoDB();

// Getting route for fetching all lessons
app.get('/lessons', async (req, res) => {
    const lessons = await database.collection('lessons').find({}).toArray();
    res.json(lessons);
});

// Getting route for fetching a lesson by ID
app.get('/lessons/:id', async (req, res) => {
    const { id } = req.params;
    const lesson = await database.collection('lessons').findOne({ _id: new ObjectId(id) });
    res.json(lesson);
});

// Getting route for fetching all orders
app.get('/orders', async (req, res) => {
    const orders = await database.collection('orders').find({}).toArray();
    res.json(orders);
});

// POST route for placing an order
app.post('/orders', async (req, res) => {
    const order = req.body;

    // Updates the stock of each lesson in the order
    for (const lesson of order.lessons) {
        const filter = { _id: new ObjectId(lesson.id) };
        const updateDoc = { $inc: { stock: -lesson.quantity } }; // Decrement stock by the quantity ordered
        await database.collection('lessons').updateOne(filter, updateDoc);
    }

    const result = await database.collection('orders').insertOne(order);
    res.json(result);
});

// Getting route to test the search query
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const lessons = await database.collection('lessons').find({ title: { $regex: query, $options: 'i' } }).toArray();
        res.json(lessons);
    } catch (error) {
        console.error('Error searching lessons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Getting route to get images from the static folder
app.get('/images/:imageName', (req, res) => {
    const { imageName } = req.params;
    res.sendFile(path.join(__dirname, `images/${imageName}`));
});

// PUT route for updating lesson left
app.put('/lessons/:id', async (req, res) => {
    const { id } = req.params;
    const { space } = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: { space } };
    const result = await database.collection('lessons').updateOne(filter, updateDoc);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
