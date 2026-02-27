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
  getUserPosts,
  getTaggedPosts,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSavedPosts,
  toggleSavePost,
} from "../controllers/savedPostController.js";

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

router.get("/posts/user/:userId", protect, getUserPosts);

router.post("/save/:postId", protect, toggleSavePost);
router.get("/saved", protect, getSavedPosts);
router.get("/posts/my/tagged", protect, getTaggedPosts);

export default router;
