const express = require('express')
const cors = require('cors')
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const prot = 5000;
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.VITE_USER}:${process.env.VITE_PASSWORD}@cluster0.jt15atw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
     serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
     }
});

const jwttoken=(req,res,next)=>{
       console.log("shamim");
     //   console.log(req.headers.authorization);
       const authorization=req.headers.authorization;
       const token=authorization.split(' ')[1];
       jwt.verify(token,process.env.ACCESS_TOKEN_SECRET , function(err, decoded) {
          if(err){
               return res.status(401).send({error: true, message: 'unauthorized access'})
           }
           req.decoded = decoded;
           next();
        });
        
     
}

async function run() {
     try {
          // Connect the client to the server	(optional starting in v4.7)
          await client.connect();

          const volunteerCollection = client.db("pepoleDB").collection("products");
          const userCollection = client.db("pepoleDB").collection("userData");

          app.post('/jwt', (req, res) => {
               const user = req.body;
               const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h'} )
               res.send({token});
           })

          app.post('/volunteer',async(req,res)=> {
               const body=req.body;
               const result =await volunteerCollection.insertOne(body)
               res.send(result)
          })
          app.get('/volunteer', async (req, res) => {
               const result = await volunteerCollection.find().toArray();
               res.send(result);

          })

          app.get('/volunteer/:id', async (req, res) => {
               const id = req.params.id;
               const query = { _id: new ObjectId(id) };
               const result = await volunteerCollection.find(query).toArray();
               res.send(result)
          })

          app.post('/uservolunteer', async(req,res)=> {
                const valunteer=req.body;
               const result= await  userCollection.insertOne(valunteer)
                res.send(result);
          })

          app.get('/uservolunteer', jwttoken, async(req,res)=>{
               const decoded = req.decoded;
               console.log('came back after verify', decoded)
               let query = {};
               if(decoded.email !==req.query?.email){
                     return res.status(403).send({ error: true, massage:"Not match email" })
               }
               if (req.query?.email) {
                   query = { email: req.query.email }
               }
               const result=await userCollection.find(query).toArray();
               res.send(result)
          })

       app.delete('/uservolunteer/:id', async(req,res)=>{
            const id=req.params.id;
           
            const query = {_id: new ObjectId(id) };
            const result=await userCollection.deleteOne(query);
            res.send(result);
       });

      

          await client.db("admin").command({ ping: 1 });
          console.log("Pinged your deployment. You successfully connected to MongoDB!");
     } finally {
          // Ensures that the client will close when you finish/error
          //     await client.close();
     }
}
run().catch(console.dir);



app.get('/', (req, res,) => {
     res.send("volentenr ")
})

app.listen(prot, () => {
     console.log('CORS-enabled web server listening on port 80', prot)
})