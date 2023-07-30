import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import {register} from './controllers/auth.js'
import authRoutes from './routes/authRoute.js'
import userRoutes from './routes/userRoute.js'
import postRoutes from './routes/postRoute.js'
import { verifyToken } from "./middleware/auth.js";
import {createPost} from './controllers/posts.js'

/*CONFIGURATIONS*/

const __filename = fileURLToPath(import.meta.url);
//to get the file path of the current module.
const __dirname = path.dirname(__filename);
// path.dirname() is a method from the Node.js path module that extracts the directory path from a given file path.
//the above is only used when we use type = module in backend

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
//enable logging of HTTP requests
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use(cors());

/*FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
//when someonee upload a file in our app, it will stored here in public/assets. in large scale priductio apps, it is tored in cloud storage


/* ROUTES WITH FILES*/
app.post('/auth/register', upload.single('picture'), register)
app.post('/posts', verifyToken, upload.single('picture'), createPost)

/*ROUTES*/
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/posts', postRoutes)

/*MONGOOSE SETUP*/
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(`${error} did not connect`));
 
  