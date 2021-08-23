const express = require("express");// it is a node.js framework. our server will run on express
const app = express();
const mongoose = require("mongoose");//it helps t crate our mongo modelthat we can create our document inside mongo.db
const dotenv = require("dotenv");//it is used to hide imp things so that no body can steal it
const helmet = require("helmet");//when we make request to server it helps to stay secure
const morgan = require("morgan");//it is used to log everything in the terminal
const multer = require("multer");//Multer adds a body object and a file or files object to the request object
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const router = express.Router();//  it helps us to create router handlers ,it is used to export files and we can import them anywher we want
const path = require("path");//The path module provides utilities for working with file and directory paths 

dotenv.config();

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
  // here we r connecting  with mongoDB
);
app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
    // here we have uded multer to save the images 
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
    //here we have multer to store the posts
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

app.listen(8800, () => {
  console.log("Backend server is running!");
});
