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

const verifyJWT = (req, res, next) => {
const authorization = req.headers.authorization;
console.log(authorization);

if (!authorization) {
  return res.status(401).send({ error: true, message: 'unauthorized access' })
}

const token = authorization.split(' ')[1];

jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
  if (err) {
    console.log(err.message);
    return res.status(401).send({ error: true, message: 'unauthorized access' })
  }
  console.log(decoded);
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
  const selectedClassesCollections = client.db("summer-camp").collection("selectedClasses");
  const instructorCollections = client.db("summer-camp").collection("instructors");
  const userCollections = client.db("summer-camp").collection("user");

  app.post('/jwt', (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ token });
  })

  // user
  app.post('/users', async (req, res) => {
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await userCollections.findOne(query);
    if (existingUser) {
      return res.send({ message: "user already exist" })
    }
    const result = await userCollections.insertOne(user);
    res.send(result);
  })

  app.get('/users', async (req, res) => {
    const result = await userCollections.find().toArray();
    res.send(result);
  })

  app.get('/users/admin/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;

    if (req.decoded.email !== email) {
      res.send({ admin: false })
    }

    const query = { email: email };
    const user = await userCollections.findOne(query);
    const result = { admin: user?.role === 'admin' };
    res.send(result);
  })
  
  app.get('/users/instructor/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;

    if (req.decoded.email !== email) {
      res.send({ instructor: false })
    }

    const query = { email: email };
    const user = await userCollections.findOne(query);
    const result = { instructor: user?.role === 'instructor' };
    res.send(result);
  })

  // update user
  app.put('/users/admin/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: { role: 'admin' } };
    const result = await userCollections.updateOne(filter, updateDoc);
    res.send(result)
  })

  app.put('/users/instructor/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: { role: 'instructor' } };
    const result = await userCollections.updateOne(filter, updateDoc);
    res.send(result)
  })
  app.put('/classes/agree/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: { status: "Agreed" } };
    const result = await classCollections.updateOne(filter, updateDoc);
    res.send(result)
  })

  app.put('/classes/deny/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: { status: "Deny" } };
    const result = await classCollections.updateOne(filter, updateDoc);
    res.send(result)
  })

  app.put('/classes/feedback/:id', async(req, res) => {
    const id = req.params.id;
    const updatedFeedback = req.body;
    const filter = {_id: new ObjectId(id)};
    const options = {upsert: true};
    const updatedDoc = {
      $set:{
        feedback: updatedFeedback
      }
    }
    const result = await classCollections.updateOne(filter,updatedDoc,options);
    res.send(result);     
  })

  app.get('/classes', async (req, res) => {
  
    const result = await classCollections.find().toArray();
    res.send(result);
  })

  app.get('/agreedClasses', async (req, res) => {
    const query = {status: "Agreed"}
    const result = await classCollections.find(query).toArray();
    res.send(result);
  })

  app.post('/classes', verifyJWT, async (req, res) => {
    const newItem = req.body;
    const result = await classCollections.insertOne(newItem);
    res.send(result);
  })


  app.get('/myClasses', verifyJWT, async (req, res) => {
    const email = req.query.email;
  
    if (!email) {
      res.send([])
    }

    const decodedEmail = req.decoded.email;
   

    if (email !== decodedEmail) {
      return res.status(403).send({ error: true, message: 'forbidden access' })
    }

    const query = { email: email };
    const result = await classCollections.find(query).toArray();
    res.send(result);
  })

  app.get('/selectClasses', verifyJWT, async (req, res) => {
    const email = req.query.email;
    if (!email) {
      res.send([])
    }


    const decodedEmail = req.decoded.email;
   

    if (email !== decodedEmail) {
      return res.status(403).send({ error: true, message: 'forbidden access' })
    }

    const query = { email: email };
    const result = await selectedClassesCollections.find(query).toArray();
    res.send(result);
  })



  app.post('/selectClasses', async (req, res) => {
    const item = req.body;
    const result = await selectedClassesCollections.insertOne(item);
    res.send(result);
  })

  app.delete('/selectedClass/delete/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: id }
    const result = await selectedClassesCollections.deleteOne(query);
    console.log(result);
    res.send(result)
  })

  app.get('/popularClasses', async (req, res) => {
    const result = await classCollections.find().sort({ number_of_student: -1 }).limit(6).toArray();
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