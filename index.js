const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.173efa4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const port = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const spotsCollection = client.db("rihlaDB").collection("spots");
    const countriesCollection = client.db("rihlaDB").collection("countries");

    // Add new spot
    app.post("/spots", async (req, res) => {
      const newSpot = req.body;
      const result = await spotsCollection.insertOne(newSpot);
      res.send(result);
    });

    // Get all spots
    app.get("/spots", async (req, res) => {
      const cursor = spotsCollection.find();
      const spots = await cursor.toArray();
      res.send(spots);
    });

    // Get single spot
    app.get("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const spot = await spotsCollection.findOne(query);
      res.send(spot);
    });

    // Get Country specific data
    app.get("/tourist-spots/:country", async (req, res) => {
      const query = { country: req.params.country };
      const cursor = spotsCollection.find(query);
      const spots = await cursor.toArray();
      res.send(spots);
    });

    // Get all countries data
    app.get("/countries", async (req, res) => {
      const cursor = countriesCollection.find();
      const countries = await cursor.toArray();
      res.send(countries);
    });

    // Get sorted by avg spots
    app.get("/spots/sort-by-avg", async (req, res) => {
      const sortedSpots = await spotsCollection
        .find({})
        .sort({ avgCost: 1 })
        .toArray();
      const finalSort = sortedSpots.sort((a, b) => {
        return a.avgCost - b.avgCost;
      });
      console.log(sortedSpots);
      res.send(sortedSpots);
    });

    // Get all user specific spots
    app.get("/my-list/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const spots = await spotsCollection.find(query).toArray();
      console.log(spots);
      res.send(spots);
    });

    // Update single spot
    app.put("/update-spot/:id", async (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) };
      const options = { upsert: true };
      const spot = req.body;
      console.log(spot);
      const updateSpot = {
        $set: {
          spotName: spot.spotName,
          photoURL: spot.photoURL,
          totalVisitors: spot.totalVisitors,
          season: spot.season,
          travelTime: spot.travelTime,
          avgCost: spot.avgCost,
          desc: spot.desc,
          country: spot.country,
          location: spot.location,
        },
      };
      const result = await spotsCollection.updateOne(
        filter,
        updateSpot,
        options
      );
      res.send(result);
    });

    // Delete single spot
    app.delete("/delete-spot/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await spotsCollection.deleteOne(query);
      res.send(result);
    });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Testing route
app.get("/", (req, res) => {
  res.send("Express on vercel");
});
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
