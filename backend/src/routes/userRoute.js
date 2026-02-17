import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getMyProfile,
  followUser,
  acceptFollowRequest,
  unfollowUser,
  blockUser,
  getFollowStatus,
  togglePrivateAccount,
  getFollowers,
  getFollowing,
  getMyFollowRequests,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyProfile);
router.get("/:username", protect, getUserProfile);
router.put("/update", protect, updateUserProfile);
router.delete("/delete", protect, deleteUserProfile);
router.patch("/toggle-private", protect, togglePrivateAccount);

router.post("/follow/:userId", protect, followUser);
router.post("/accept/:userId", protect, acceptFollowRequest);
router.post("/unfollow/:userId", protect, unfollowUser);
router.post("/block/:userId", protect, blockUser);
router.get("/follow-status/:userId", protect, getFollowStatus);

router.get("/:userId/followers", protect, getFollowers);
router.get("/:userId/following", protect, getFollowing);
router.get("/follow-requests", protect, getMyFollowRequests);

export default router;
