const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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
const selectedClassesCollections = client.db("summer-camp").collection("selectedClasses");
const instructorCollections = client.db("summer-camp").collection("instructors");
const userCollections = client.db("summer-camp").collection("user");

// user
app.post('/users', async(req,res) =>{
  const user = req.body;
  const query = { email: user.email };
  const existingUser = await userCollections.findOne(query);
  if (existingUser) {
    return res.send({ message: "user already exist" })
  }
  const result = await userCollections.insertOne(user);
  res.send(result);
})

app.get('/classes',async(req,res) =>{
    const result = await classCollections.find().toArray();
    res.send(result);
})


app.get('/selectClasses',async(req,res) =>{
  const email = req.query.email;
  if(!email){
    res.send([])
  }
  const query = {email: email};
  const result = await selectedClassesCollections.find(query).toArray();
  res.send(result);
})

app.post('/selectClasses',async(req,res) =>{
  const item = req.body;
  console.log(item);
  const result = await selectedClassesCollections.insertOne(item);
  res.send(result);
})

app.delete('/selectClasses/:id',async(req,res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await selectedClassesCollections.deleteOne(query);
  res.send(result);
})

app.get('/popularClasses', async (req, res) => {
    const result = await classCollections.find().sort({number_of_student: -1}).limit(6).toArray();
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
