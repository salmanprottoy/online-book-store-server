const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5000;

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yorqu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const booksCollection = client.db("onlineBookStore").collection("books");
  const ordersCollection = client.db("onlineBookStore").collection("orders");

  app.post("/addBook", (req, res) => {
    const book = req.body;
    booksCollection.insertOne(book).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/books", (req, res) => {
    booksCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/orders", (req, res) => {
    ordersCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/book/:key", (req, res) => {
    //console.log(req.params.id);
    booksCollection.find({ key: req.params.key }).toArray((err, documents) => {
      res.send(documents[0]);
      //console.log(err);
    });
  });

  app.post("/booksByKeys", (req, res) => {
    const bookKeys = req.body;
    booksCollection
      .find({ key: { $in: bookKeys } })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order).then((result) => {
      console.log(result);
      res.send(result);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port, () => {
  console.log(`Node app started at port ${port}`);
});
