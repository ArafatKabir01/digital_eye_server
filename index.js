const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000 ;
const stripe = require("stripe")('sk_test_51LfiUIIj1Rdiz6xlvspM1QiUtOYKM4itxDPPLibCFsMEyMf7QO53cAV75AgfuPAaImdQmpKVKbqoFRWWiQNaFp4H00G4bB8t1p');
// Middleware 
app.use(cors());
app.use(express.json());






const uri = "mongodb+srv://digitaleye07:8nZd3yeoQuYbQSsX@cluster1.helve.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//       return res.status(401).send({ message: 'UnAuthorized access' });
//   }
//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//       if (err) {
//           return res.status(403).send({ message: 'Forbidden access' })
//       }
//       req.decoded = decoded;
//       next();
//   });
// }
async function run(){
    try {
        await client.connect()
        const cameraPartsCollection = client.db('DigitalEye').collection('cameraParts');
        const orderPartsCollection = client.db('DigitalEye').collection('customerOrder');
        const userCollection = client.db('DigitalEye').collection('user');
        
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

      app.get('/myOrder/:id' , async(req , res )=>{
        const id = req.params.id
        const query = {_id: ObjectId(id)}
        const orders = await orderPartsCollection.find(query).toArray();
        res.send(orders)
      })
      app.delete('/myOrder/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const result = await orderPartsCollection.deleteOne(query)
        res.send(result)


    })

    // app.post("/create-payment-intent", async (req, res) => {
      
    //   const price = req.body.price
      
    //  const amount = price * 100
    //  console.log(amount) 
    //   // Create a PaymentIntent with the order amount and currency
    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount : amount,
    //     currency: 'usd',
    //     automatic_payment_methods: {
    //       enabled: true,
    //     },
    //   });
    //   res.send({clientSecret: paymentIntent.client_secret})
    // });
// admin 
// app.put('/user/admin/:email',  async (req, res) => {
//   const email = req.params.email;
//   const filter = { email: email };
//   const updateDoc = {
//     $set: { role: 'admin' },
//   };
//   const result = await userCollection.updateOne(filter, updateDoc);
//   res.send(result);
// })

// app.put('/user/:email', async (req, res) => {
//   const email = req.params.email;
//   const user = req.body;
//   const filter = { email: email };
//   const options = { upsert: true };
//   const updateDoc = {
//     $set: user,
//   };
//   const result = await userCollection.updateOne(filter, updateDoc, options);
//   const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET) 
//   res.send({ result, token });
// });

// app.get('/admin/:email', async(req, res) =>{
//   const email = req.params.email;
//   const user = await userCollection.findOne({email: email});
//   const isAdmin = user.role === 'admin';
//   res.send({admin: isAdmin})
// })
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
