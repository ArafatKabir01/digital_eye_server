const express = require('express');
const cors = require('cors');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const e = require('express');
const app = express();
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
    const headPhoneCollection = client.db('DigitalEye').collection('cameraParts');
    const orderPartsCollection = client.db('DigitalEye').collection('customerOrder');
    const userCollection = client.db('DigitalEye').collection('user');
    const paymentCollection = client.db('DigitalEye').collection('paymentCollection');
    const reviewCollection = client.db('DigitalEye').collection('CustomerReviews');

    app.get('/allParts', async (req, res) => {
      const query = {};
      const cursor = headPhoneCollection.find(query);
      const allParts = await cursor.toArray();
      res.send(allParts)
    });
    app.get('/part/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const purchaseProduct = await headPhoneCollection.findOne(query);
      res.send(purchaseProduct);

    });

    app.post('/allParts', async (req, res) => {
      const newParts = req.body;
      const result = await headPhoneCollection.insertOne(newParts);
      console.log(newParts)
      res.send(result);
    });

    app.delete('/parts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await headPhoneCollection.deleteOne(query)
      res.send(result)


    })
    app.put('/product/:id', async (req, res) => {
      const newProduct = req.body;
      const id = req.params.id;
     
      const filter = { _id: ObjectId(id)}
      const option ={upsert : true};
      const newProductInfo = {
        $set: newProduct
      };
      const result = await headPhoneCollection.updateOne(filter , newProductInfo ,option)
      res.send(result);
      

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
    // put review
    app.put('/customerReview/:id', async (req, res) => {
      const newReview = req.body;
      const email = newReview.email
      const productId = newReview.productId
      const filter = {email: (email) , productId: (productId)}
      const option ={upsert : true};
      const customerReview = {
        $set: newReview
      };
      const result = await reviewCollection.updateOne(filter , customerReview ,option)
      res.send(result);
      

    })
    app.delete('/review/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await reviewCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/customerReview', async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const order = await cursor.toArray();
      res.send(order)
    });
    // put user
    app.put('/userInfo', async (req, res) => {
      const newuserInfo = req.body;
      const email = newuserInfo.email
      const filter = {email: (email)}
      const option ={upsert : true};
      const userInfo = {
        $set: newuserInfo
      };
      const result = await userCollection.updateOne(filter , userInfo ,option)
      res.send(result);

    })
    app.get('/userInfo/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const purchaseProduct = await userCollection.findOne(query);
      res.send(purchaseProduct);

    });
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
    // admin
    app.get('/admin/:email', async (req, res) => {
      const useremail = req.params.email;
      const user = await userCollection.findOne({ email: useremail })
      
      res.send(user)
    })

    app.post('/create-payment-intent', verifyJwt, async (req, res) => {
      const product = req.body;
      const price = product.price;
      const amount = price * 100;
      console.log(amount)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });
      res.send({ clientSecret: paymentIntent.client_secret })
    });

    // get user 
    app.get('/users', verifyJwt, async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const allusers = await cursor.toArray();
      res.send(allusers)

    })



    // paid user
    app.patch('/buying/:id', verifyJwt, async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId
        }
      }

      const result = await paymentCollection.insertOne(payment);
      const updatedBooking = await orderPartsCollection.updateOne(filter, updatedDoc);
      res.send(updatedBooking);
    })


    app.get('/myOrder', verifyJwt, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const userEmail = req.query.email;
      if (decodedEmail === userEmail) {
        const query = { email: userEmail }
        const orders = await orderPartsCollection.find(query).toArray();
        res.send(orders)
      }

    });

    app.get('/myOrder/:id', verifyJwt, async (req, res) => {
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
