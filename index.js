const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000 ;

// Middleware 
app.use(cors());
app.use(express.json());





const uri = "mongodb+srv://digitaleye07:8nZd3yeoQuYbQSsX@cluster1.helve.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
 console.log("ok")
});


app.get('/' , (req , res) => {
    res.send('server is running');
});

app.listen(port , ()=>{
    console.log('listing port is' , port)
})
