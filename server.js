const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const { join } = require("path");
const asyncHandler = require("./utils/asyncHandler");

const app = express();

app.use(express.static(join(__dirname, "styles")));

app.use(express.urlencoded({ extended: true }));

const client = new MongoClient(process.env.DB_URI);
const pubsCollection = client.db("blog").collection("pubs");
const commentsCollection = client.db("blog").collection("comments");



app.get(
  "/",
  asyncHandler(async function getIndex(req, res, next) {
    const pubs = await pubsCollection.find().toArray();
    res.render("index.ejs", { pubs });
  })
);

app.get(
  "/addpost",
  asyncHandler(function (req, res) {
    res.render("addpost.ejs");
  })
);

app.post(
  "/addpost",
  asyncHandler(async function (req, res) {
    const newpub = await pubsCollection.insertOne(req.body);
    if (newpub.insertedId == 0) {
      throw "error";
    }
    res.redirect("/");
  })
);

app.get(
  "/post/:id",
  asyncHandler(async function (req, res) {
    const id = req.params.id;
    const pub = await pubsCollection.findOne({ _id: new ObjectId(id) });
    if (!pub) {
      throw new Error("publication not found");
    }
    const pubComments = await commentsCollection
      .find({ postId: pub._id })
      .toArray();
    res.render("post.ejs", { pub, pubComments });
  })
);

app.post(
  "/addcomment/:id",
  asyncHandler(async function (req, res) {
    const comment = await commentsCollection.insertOne({
      ...req.body,
      postId: new ObjectId(req.params.id),
    });

    if (comment.insertedId == 0) {
      throw new Error("somthing went wrong");
    }
    res.redirect("/post/" + req.params.id);
  })
);

client
  .connect()
  .then(() =>
    app.listen(process.env.PORT, () => {
      console.log("sever runnig");
    })
  )
  .catch((e) => process.exit(1));
