import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/db/connectDB.js";
import authRoute from "./src/routes/authRoute.js";
import userRoute from "./src/routes/userRoute.js";
import postRoute from "./src/routes/postRoute.js";
import storyRoute from "./src/routes/storyRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/auth", authRoute);
app.use("/user/profile", userRoute);
app.use("/content", postRoute);
app.use("/story", storyRoute);
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, "0.0.0.0", () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
