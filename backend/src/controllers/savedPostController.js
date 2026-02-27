import mongoose from "mongoose";
import SavedPost from "../models/SavedPost.js";

export const toggleSavePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const existing = await SavedPost.findOne({
      user: userId,
      post: postId,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({
        success: true,
        saved: false,
        message: "Post removed from saved",
      });
    }

    await SavedPost.create({
      user: userId,
      post: postId,
    });

    res.json({
      success: true,
      saved: true,
      message: "Post saved successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSavedPosts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const savedPosts = await mongoose.model("SavedPost").aggregate([
      // 1 Match only my saved posts
      {
        $match: { user: userId },
      },

      // 2 Sort newest saved first
      { $sort: { createdAt: -1 } },

      { $skip: skip },
      { $limit: limit },

      // 3 Lookup post
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "post",
        },
      },
      { $unwind: "$post" },

      // 4 Lookup author
      {
        $lookup: {
          from: "users",
          localField: "post.author",
          foreignField: "_id",
          as: "post.author",
        },
      },
      { $unwind: "$post.author" },

      // 5 Add like data
      {
        $addFields: {
          "post.likesCount": { $size: "$post.likes" },
          "post.isLiked": { $in: [userId, "$post.likes"] },
          "post.isSaved": true, // obviously true here
        },
      },

      // 6 Clean fields
      {
        $project: {
          _id: 0,
          post: {
            _id: 1,
            caption: 1,
            media: 1,
            createdAt: 1,
            likesCount: 1,
            isLiked: 1,
            isSaved: 1,
            author: {
              _id: "$post.author._id",
              username: "$post.author.username",
              profilePicture: "$post.author.profilePicture",
            },
          },
        },
      },
    ]);

    const posts = savedPosts.map((item) => item.post);

    res.json({
      success: true,
      page,
      limit,
      posts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
