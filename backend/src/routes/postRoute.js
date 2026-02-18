import express from "express";
import {
  createPost,
  updatePost,
  deletePost,
  getSinglePost,
  toggleLikePost,
  addComment,
  deleteComment,
  getPostComments,
  toggleLikeComment,
  getFeed,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/posts", protect, createPost);
router.put("/posts/update/:postId", protect, updatePost);
router.get("/posts/:postId", protect, getSinglePost);

router.delete("/posts/:postId", protect, deletePost);

router.put("/posts/:postId/like", protect, toggleLikePost);

router.post("/posts/:postId/comments", protect, addComment);

router.get("/posts/:postId/comments", protect, getPostComments);

router.delete("/comments/:commentId", protect, deleteComment);

router.put("/comments/:commentId/like", protect, toggleLikeComment);

router.get("/feed", protect, getFeed);

export default router;
