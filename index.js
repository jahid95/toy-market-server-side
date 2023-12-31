const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.i1asljh.mongodb.net/?retryWrites=true&w=majority`;

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
    

    const carCollection = client.db('kidsCarsDb').collection('cars');
    const toyCollection = client.db('kidsCarsDb').collection('toys');

    app.get('/cars',async(req,res)=>{
        const cursor = carCollection.find();
        const result  = await  cursor.toArray();
        res.send(result)
    })

    app.get('/cars/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }

        const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: { name: 1, price: 1, image:1, rating:1, catagory:1, storeQty:1,seller:1},
        };

        const result = await carCollection.findOne(query, options);
        res.send(result);
    })

 //create db from client read and write operation
    app.get('/toys', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await toyCollection.find(query).toArray();
            res.send(result);
        })

    app.post('/toys', async (req, res) => {
        const booking = req.body;
        console.log(booking);
        const result = await toyCollection.insertOne(booking);
        res.send(result);
    });

    //delete operation

    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
  })

  //update operation
  app.patch('/toys/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateToy = req.body;    
    const updateStatus = {
        $set: {
            status: updateToy.status
        },
    };
    const result = await toyCollection.updateOne(filter, updateStatus);
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


app.get('/', (req, res)=>{
    res.send('Doctor is running');
})

app.listen(port, ()=>{
    console.log(`cars doctor server running on port ${port}`);
})