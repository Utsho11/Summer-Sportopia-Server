const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.2g6iibi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
try {
    // Connect the client to the server	(optional starting in v4.7)

const classCollections = client.db("summer-camp").collection("classes");
const instructorCollections = client.db("summer-camp").collection("instructors");

app.get('/class', async (req, res) => {
    const result = await classCollections.find().toArray();
    res.send(result);
    })
    
app.get('/instructor', async (req, res) => {
    const result = await instructorCollections.find().toArray();
    res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
res.send('Summer Camp IS RUNNING');
})


app.listen(port, () => {
console.log(`SERVER IS RUNNING ON: ${port}`);
})
