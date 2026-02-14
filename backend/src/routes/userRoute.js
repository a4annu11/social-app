import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:username", getUserProfile);
router.put("/update", protect, updateUserProfile);
router.delete("/delete", protect, deleteUserProfile);

export default router;
