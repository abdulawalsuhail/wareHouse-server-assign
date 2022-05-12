const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.ciqeb.mongodb.net:27017,cluster0-shard-00-01.ciqeb.mongodb.net:27017,cluster0-shard-00-02.ciqeb.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-35hjy9-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }   );

async function run() {
    try {
        await client.connect()
        const manageCollection = client.db('WareHouse').collection('ManageItem')


        app.get('/item', async (req, res) => {
            const query = {}
            const cursor = manageCollection.find(query)
            const manages = await cursor.toArray()
            res.send(manages)
        })
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await manageCollection.findOne(query);
            res.send(service);
        });

        // POST
        app.post('/item', async (req, res) => {
            const newService = req.body;
            const result = await manageCollection.insertOne(newService);
            res.send(result);
        });

        // DELETE
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await manageCollection.deleteOne(query);
            res.send(result);
        });

    }
    finally {

    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Running WareHouse Server');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})