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