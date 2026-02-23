import mongoose from "mongoose";
import Story from "../models/Story.js";
import Follow from "../models/Follow.js";
import User from "../models/users.js";
import cloudinary from "../config/cloudinary.js";

export const createStory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { media } = req.body;

    if (!media) {
      return res.status(400).json({ message: "Media required" });
    }

    const uploadRes = await cloudinary.uploader.upload(media, {
      folder: "stories",
      resource_type: "auto",
    });

    const story = await Story.create({
      author: userId,
      media: {
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id,
        type: uploadRes.resource_type,
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ success: true, story });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const viewStory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId } = req.params;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (!story.viewers.includes(userId)) {
      story.viewers.push(userId);
      await story.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStoryViewers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId } = req.params;

    const story = await Story.findById(storyId).populate(
      "viewers",
      "username name profilePicture",
    );

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      success: true,
      viewersCount: story.viewers.length,
      viewers: story.viewers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storyId } = req.params;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await cloudinary.uploader.destroy(story.media.public_id, {
      resource_type: story.media.type,
    });

    await story.deleteOne();

    res.json({ success: true, message: "Story deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStoryFeed = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1 Get following list
    const following = await Follow.find({
      follower: userId,
      status: "accepted",
    }).select("following");

    const followingIds = following.map(
      (f) => new mongoose.Types.ObjectId(f.following),
    );

    // Include self
    followingIds.push(userId);

    // 2 Get blocked users
    const currentUser = await User.findById(userId).select("blockedUsers");

    const blockedIds = currentUser.blockedUsers.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    // 3 Aggregation
    const stories = await Story.aggregate([
      // Only active stories
      {
        $match: {
          author: { $in: followingIds },
          expiresAt: { $gt: new Date() },
          author: { $nin: blockedIds },
        },
      },

      { $sort: { createdAt: -1 } },

      // Join author
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },

      // Add seen field
      {
        $addFields: {
          isSeen: { $in: [userId, "$viewers"] },
        },
      },

      // Remove heavy fields
      {
        $project: {
          viewers: 0,
          "author.password": 0,
          "author.email": 0,
          "author.blockedUsers": 0,
          "author.followersCount": 0,
          "author.followingCount": 0,
          "author.__v": 0,
        },
      },

      // Group by user
      {
        $group: {
          _id: "$author._id",
          user: { $first: "$author" },
          stories: { $push: "$$ROOT" },
          hasUnseen: {
            $max: { $cond: [{ $eq: ["$isSeen", false] }, 1, 0] },
          },
        },
      },

      // Sort unseen users first
      {
        $sort: {
          hasUnseen: -1,
          "stories.createdAt": -1,
        },
      },
    ]);

    res.json({
      success: true,
      stories,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
