const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config
const port = process.env.PORT || 5000

const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@services.q9saz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("WareHouse").collection("ManageItem");
  console.log('connected')
  // perform actions on the collection object
  client.close();
});

app.get('/', (req, res) => {
    res.send('Running Genius Server');
});

app.get('/hero', (req, res) =>{
    res.send('Hero meets hero ku')
})

app.listen(port, () => {
    console.log('Listening to port', port);
})