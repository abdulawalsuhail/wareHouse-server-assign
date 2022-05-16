const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.ciqeb.mongodb.net:27017,cluster0-shard-00-01.ciqeb.mongodb.net:27017,cluster0-shard-00-02.ciqeb.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-35hjy9-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const manageCollection = client.db('WareHouse').collection('ManageItem')


         // AUTH
         app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.send({ accessToken });
        })


        // item api
        app.get('/item', async (req, res) => {
            const query = {}
            const cursor = manageCollection.find(query)
            const manages = await cursor.toArray()
            res.send(manages)
        })
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await manageCollection.findOne(query);
            console.log(item);
            res.send(item);
        });



        // POST api
        app.post('/item', async (req, res) => {
            const newItem = req.body;
            const tokenInfo =req.headers.authorization
            console.log(tokenInfo)
            const result = await manageCollection.insertOne(newItem);
            res.send(result);
        });

        // DELETE api 
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await manageCollection.deleteOne(query);
            res.send(result);
        });


        // Order Collection API

        app.get('/myitems', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = manageCollection.find(query);
                const myItems = await cursor.toArray();
                res.send(myItems);
            }
            else{
                res.status(403).send({message: 'forbidden access'})
            }
        })

        // update quantity 
        app.put('/item/:id', async (req, res) => {
            
            const id = req.params.id
            const data = req.body
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: data.quantity
                }
            }
            const result = await manageCollection.updateOne(filter, updateDoc, option)
            res.send(result)
        })

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