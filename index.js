require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@food-app.gjb98.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


const run = async () => {
  try {
    const productsCollection = client.db("watch_shop").collection("products");
    const ordersCollection = client.db("watch_shop").collection("orders");
    const usersCollection = client.db("watch_shop").collection("users");
    const reviewsCollection = client.db("watch_shop").collection("reviews");

    // GET data
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const getOrders = await cursor.toArray();
      console.log(getOrders);
      res.send(getOrders);
    });

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const products = await productsCollection.findOne(query);

      console.log("Load product with id: ", id);
      res.send(products);

      app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        res.json({ admin: isAdmin });
      });

      app.get("/reviews", async (req, res) => {
        const cursor = reviewsCollection.find({});
        const products = await cursor.toArray();
        res.send(products);
      });

      // POST data
      app.post("/products", async (req, res) => {
        const products = req.body;
        const result = await productsCollection.insertOne(products);
        res.json(result);
      });

      app.post("/users", async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
      });

      app.post("/purchase", async (req, res) => {
        const newOrder = req.body;
        const result = await ordersCollection.insertOne(newOrder);

        console.log("Got new order", req.body);
        console.log("Added order", result);

        res.json(result);
      });

      app.post("/reviews", async (req, res) => {
        const newReview = req.body;
        const result = await reviewsCollection.insertOne(newReview);
        res.json(result);
      });

      // PUT method
      app.put("/users", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.json(result);
      });

      app.put("/users/admin", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: "admin" } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      });

      app.put("/products/:id", async (req, res) => {
        const id = req.params.id;
        const updatedProducts = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateProduct = {
          $set: {
            productName: updatedProducts.productName,
            productDescription: updatedProducts.productDescription,
            productPrice: updatedProducts.productPrice,
            productImage: updatedProducts.productImage,
          },
        };
        const result = await productsCollection.updateOne(
          filter,
          updateProduct,
          options
        );
        res.json(result);
      });

      app.put("/orders/:id", async (req, res) => {
        const id = req.params.id;
        const updatedOrder = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateOrder = {
          $set: {
            id: updatedOrder.id,
            userName: updatedOrder.userName,
            userEmail: updatedOrder.userEmail,
            userAddress: updatedOrder.userAddress,
            userPhone: updatedOrder.userPhone,
            orderName: updatedOrder.orderName,
            orderPrice: updatedOrder.orderPrice,
            orderStatus: updatedOrder.orderStatus,
          },
        };
        const result = await ordersCollection.updateOne(
          filter,
          updateOrder,
          options
        );
        res.json(result);
      });

      // DELETE method
      app.delete("/products/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await productsCollection.deleteOne(query);

        console.log("Deleting product with id:", result);
        res.json(result);
      });

      app.delete("/orders/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await ordersCollection.deleteOne(query);
        console.log("Deleting Order with id:", result);
        res.json(result);
      });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Watch Shop Website Backend is Running.");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
