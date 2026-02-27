import express from "express";
import {
  createStory,
  deleteStory,
  getStoryFeed,
  getStoryViewers,
  viewStory,
} from "../controllers/storyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createStory);
router.post("/view/:storyId", protect, viewStory);
router.get("/get/viewers/:storyId", protect, getStoryViewers);
router.delete("/delete/:storyId", protect, deleteStory);
router.get("/story-feed", protect, getStoryFeed);

export default router;
