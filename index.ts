const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


// start point
const express = require("express");
const dontenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
import type {
  Request,
  Response,
  NextFunction,
} from "express";

interface AuthRequest extends Request {
  user?: any;
}

interface AuthRequest extends Request {
  user?: any;
}

dontenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(express.json());

app.use(cors())





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
app.get("/", (req: Request, res: Response)=> {
  res.send("Server is running fine!");
});

// mongodb start
const uri = process.env.MONGO_DB_URI!;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// jwt create

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);


const verifyToken = async ( req: AuthRequest,
  res: Response,
  next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;

    next();
  } catch (error: any) {
    console.log(error);

    return res.status(403).json({
      msg: "Unauthorized"
    });
  }
};
const donorVerify = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "donor") {
    return res.status(403).json({ msg: "Forbidden" });
  }

  next();
};

async function run() {
  try {

    // await client.connect();

    // mongodbcollection
    console.log("MongoDB Connected");
    const db = client.db("littlenest_db");



    const childCareCentersCollection = db.collection("childcarecenters");
const bookingsCollection = db.collection("bookings");




app.get("/centers", async (req: Request, res: Response) => {
  try {
    const result = await childCareCentersCollection
      .find({})
      .toArray();

    res.send(result);
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
});

app.get("/centers/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const result = await childCareCentersCollection.findOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
});

app.post("/bookings", async (req: Request, res: Response) => {
  try {
    const booking = req.body;

    const result = await bookingsCollection.insertOne(booking);

    res.send(result);
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
});

app.get("/bookings", async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;

    const query = email ? { userEmail: email } : {};

    const result = await bookingsCollection.find(query).toArray();

    res.send(result);
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
});
app.post("/centers", async (req: Request, res: Response) => {
  try {
    const center = req.body;

    const result = await childCareCentersCollection.insertOne(center);

    res.send(result);
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
});

app.get("/my-centers", async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;

    const result = await childCareCentersCollection
      .find({ ownerEmail: email })
      .toArray();

    res.send(result);
  } catch (error: any) {
    res.status(500).send({
      message: error.message,
    });
  }
});


app.patch("/centers/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  const id = req.params.id;

  const result = await childCareCentersCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: req.body,
    }
  );

  res.send(result);
});


    app.delete("/centers/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  const id = req.params.id;

  const result = await childCareCentersCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.error);