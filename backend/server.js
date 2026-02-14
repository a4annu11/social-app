import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/db/connectDB.js";
import authRoute from "./src/routes/authRoute.js";
import userRoute from "./src/routes/userRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/auth", authRoute);
app.use("/user", userRoute);

app.listen(PORT, "0.0.0.0", () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
