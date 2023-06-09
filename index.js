const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());

// jwt
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' })
  }
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}


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
const userCollections = client.db("summer-camp").collection("user");

// jwt
app.post('/jwt', (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  res.send({ token });
})

const verifyInstructor = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const user = await userCollections.findOne(query);

  if (user?.role !== 'instructor') {
    return res.status(403).send({ error: true, message: 'forbidden message' });
  }
  next();
}

const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const user = await userCollections.findOne(query);

  if (user?.role !== 'admin') {
    return res.status(403).send({ error: true, message: 'forbidden message' });
  }
  next();
}

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
