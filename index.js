const express = require('express');
const cors = require('cors');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const e = require('express');
const app = express();
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors());
app.use(express.json());

function verifyJwt(req, res, next) {
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




const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster1.helve.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect()
    const cameraPartsCollection = client.db('DigitalEye').collection('cameraParts');
    const orderPartsCollection = client.db('DigitalEye').collection('customerOrder');
    const userCollection = client.db('DigitalEye').collection('user');

    app.get('/allParts', async (req, res) => {
      const query = {};
      const cursor = cameraPartsCollection.find(query);
      const allParts = await cursor.toArray();
      res.send(allParts)
    });
    app.get('/part/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const purchaseProduct = await cameraPartsCollection.findOne(query);
      res.send(purchaseProduct);

    });

    app.post('/allParts', async (req, res) => {
      const newParts = req.body;
      const result = await cameraPartsCollection.insertOne(newParts);
      console.log(newParts)
      res.send(result);
    });

    app.delete('/parts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
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
    // put user for admin
    app.put('/user/admin/:email' ,verifyJwt, async(req ,  res)=>{
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({email: requester})
      if(requesterAccount.role === 'admin'){
        const filter = {email : email};
        const updateDoc = {
          $set : {role : "admin"},
        };
        const result = await userCollection.updateOne(filter , updateDoc );
        res.send(result)
      }
      else{
        res.status(403).send({message:'forbidden'})
      }
   
    })
    // admin
    app.get('/admin/:email', async(req , res)=>{
      const email = req.params.email;
      const user = await userCollection.findOne({email: email})
      const isAdmin = user.role === 'admin';
      res.send({admin:isAdmin})
    })
    // Put User 
    app.put('/user/:email' , async(req ,  res)=>{
      const email = req.params.email;
      const user = req.body
      const filter = {email : email};
      const options = {upsert : true};
      const updateDoc = {
        $set : user,

      };
      const result = await userCollection.updateOne(filter , updateDoc , options);
      const token = await jwt.sign({email : email}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "2d"
      })
      res.send({result,token})

    })

    // get user 
    app.get('/users' , verifyJwt, async(req , res) =>{
      const query = {};
      const cursor = userCollection.find(query);
      const allusers = await cursor.toArray();
      res.send(allusers)

    })


    app.get('/myOrder', verifyJwt, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const userEmail = req.query.email;
      if(decodedEmail === userEmail){
        const query = { email: userEmail }
        const orders = await orderPartsCollection.find(query).toArray();
        res.send(orders)
      }
      
    });

    app.get('/myOrder/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const orders = await orderPartsCollection.find(query).toArray();
      res.send(orders)
    })
    app.delete('/myOrder/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await orderPartsCollection.deleteOne(query)
      res.send(result)
    })
    // delete user 
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await userCollection.deleteOne(query)
      res.send(result)
    })
    // Auth
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "2d"
      })
      res.send(accessToken)
    });

  } finally {
    //await client.close();
    // console.log('its finally')
  }
};
run().catch(console.dir())

app.get('/', (req, res) => {
  res.send('server is running');
});

app.listen(port, () => {
  console.log('listing port is', port)
})
