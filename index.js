const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000 ;

// Middleware 
app.use(cors());
app.use(express.json());





const uri = "mongodb+srv://digitaleye07:8nZd3yeoQuYbQSsX@cluster1.helve.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try {
        await client.connect()
        const cameraPartsCollection = client.db('DigitalEye').collection('cameraParts');
        const orderPartsCollection = client.db('DigitalEye').collection('customerOrder');
        
        app.get('/allParts' , async(req , res)=>{
            const query ={};
            const cursor = cameraPartsCollection.find(query);
            const allParts = await cursor.toArray();
            res.send(allParts)
          });
          app.get('/part/:id', async (req , res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const purchaseProduct = await cameraPartsCollection.findOne(query);
            res.send(purchaseProduct);
      
          });

          app.post('/allParts' , async(req , res)=> {
            const newParts = req.body;
            const result = await cameraPartsCollection.insertOne(newParts);
            console.log(newParts)
            res.send(result);
          });

          app.delete('/parts/:id', async(req , res)=>{
            const id = req.params.id;
            const query ={_id: ObjectId(id)}
            const result = await cameraPartsCollection.deleteOne(query)
            res.send(result)
      
      
          })

          // Order Collection
          app.get('/orderparts', async (req, res) => {
            const query = {};
            const cursor = orderPartsCollection.find(query);
            const order = await cursor.toArray();
            res.send(order)
        });

          app.post('/customerorder', async (req, res) => {
            const newProduct = req.body;
                const result = await orderPartsCollection.insertOne(newProduct);
                res.send(result);
            

        });

        app.get('/myOrder', async (req, res) => {
          const userEmail = req.query.email;
          console.log(userEmail)
          const query = { email : userEmail }
          console.log(query , "q")
          const orders = orderPartsCollection.find(query);
          const result = await orders.toArray()
          res.send(result)
      });
      app.delete('/myOrder/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const result = await orderPartsCollection.deleteOne(query)
        res.send(result)


    })

    } finally {
        //await client.close();
        // console.log('its finally')
    }
}
run().catch(console.dir())

app.get('/' , (req , res) => {
    res.send('server is running');
});

app.listen(port , ()=>{
    console.log('listing port is' , port)
})
