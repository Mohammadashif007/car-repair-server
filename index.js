const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const uri =
    `mongodb+srv://${process.env.SECRET_USER}:${process.env.SECRET_KEY}@cluster0.owkdtwy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const servicesCollection = client.db('carServices').collection('services');

        const bookingCollection = client.db('carServices').collection('bookings');

        const newBookings = client.db('carService').collection('newBookings');


        app.get('/services', async(req, res) => {
            const cursor = await servicesCollection.find().toArray();
            res.send(cursor);
        })

        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};

            const options = {
                projection: { _id: 1, title: 1, img:1, price: 1, service_id: 1 },
              };

            const cursor = await servicesCollection.findOne(query, options);
            res.send(cursor);
        })

        app.post('/services', async(req, res) => {
            const service = req.body;
            console.log(service);
            const result = await servicesCollection.insertOne(service);
            res.send(result);
        })

       

// bookings
        app.get('/bookings', async(req, res) => {
            const bookings = await bookingCollection.find().toArray();
            res.send(bookings);
        })

        app.post('/bookings', async(req, res) => {
            const service = req.body;
            console.log(service);
            const bookedService = await bookingCollection.insertOne(service);
            res.send(bookedService);
            
        })

//bookings by email

        app.post('/newBookings', async(req, res) => {
            const booking = req.body;
            const result = await newBookings.insertOne(booking);
            res.send(result);

        })

        app.patch('/newBookings/:id', async(req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;
            const filter = {_id : new ObjectId(id)}
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
              };

            const result = await newBookings.updateOne(filter, updateDoc);
            res.send(result); 
        } )

        app.delete('/newBookings/:id', async(req, res) => {
            const id = req.params;
            const query = {_id: new ObjectId(id)}
            const result = await newBookings.deleteOne(query);
            res.send(result);
        })

        app.get('/newBookings', async(req, res) => {
            let query = {};
            if(req.query?.email){
                query = {email: req.query.email};
            } 
            const result = await newBookings.find(query).toArray();
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(port, () => {
    console.log("Server is running on port" + " " + port);
});
