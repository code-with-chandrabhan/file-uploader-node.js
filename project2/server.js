import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v2 as cloudinary } from "cloudinary";

// Fix for __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// Cloudinary config
cloudinary.config({
  cloud_name: "dngpsrt5w",
  api_key: "514621175814957",
  api_secret: "71WLy8Ey_7WvMT3cbM806zcxlz8",
});

// MongoDB
mongoose
  .connect(
    "mongodb+srv://chandrabhan8708295629:nXPwfZRKRZAJZAjm@cluster0.rf251kl.mongodb.net/",
    { dbName: "project1" }
  )
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

// Schema
const imagesSchema = new mongoose.Schema({
  filename: String,
  public_id: String,
  imgurl: String,
});

const ImageModel = mongoose.model("cloudinary", imagesSchema);

// Multer config
const storage = multer.diskStorage({
  //   destination: path.join(__dirname, "public/uploads"),
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// GET route
app.get("/", (req, res) => {
  res.render("index", { url: null });
});

// POST route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
      folder: "nodejs_filesuploader",
    });

    const dbSave = await ImageModel.create({
      filename: req.file.filename,
      public_id: cloudinaryResponse.public_id,
      imgurl: cloudinaryResponse.secure_url,
    });

    res.render("index", { url: cloudinaryResponse.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Error uploading file");
  }
});

// Start server
app.listen(3000, () => {
  console.log("server is listening on port 3000");
});
