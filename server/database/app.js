const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(express.json());  // Use built-in JSON parser middleware

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

mongoose.connect("mongodb://mongo_db:27017/", { dbName: 'dealershipsDB' });

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

const Reviews = require('./review');
const Dealerships = require('./dealership');

async function initDB() {
  try {
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data['reviews']);
    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data['dealerships']);
    console.log('Database initialized');
  } catch (error) {
    console.error('Error inserting data:', error);
  }
}

// Home route
app.get('/', async (req, res) => {
  res.send("Welcome to the Mongoose API");
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Fetch reviews for a specific dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Fetch all dealers
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

// Fetch dealers by state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const documents = await Dealerships.find({ state: req.params.state });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships by state' });
  }
});

// Fetch dealer by ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const document = await Dealerships.findOne({ id: parseInt(req.params.id) });
    if (!document) return res.status(404).json({ error: 'Dealer not found' });
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealer by ID' });
  }
});

// Insert a new review
app.post('/insert_review', async (req, res) => {
  const data = req.body;
  try {
    const documents = await Reviews.find().sort({ id: -1 });
    let new_id = documents[0]?.id + 1 || 1;

    const review = new Reviews({
      id: new_id,
      name: data['name'],
      dealership: data['dealership'],
      review: data['review'],
      purchase: data['purchase'],
      purchase_date: data['purchase_date'],
      car_make: data['car_make'],
      car_model: data['car_model'],
      car_year: data['car_year'],
    });

    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Initialize DB then start server
initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
