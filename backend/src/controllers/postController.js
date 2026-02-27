import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caption, media, taggedUsers = [], hashtags = [] } = req.body;

    const validFollowing = await Follow.find({
      follower: userId,
      following: { $in: taggedUsers },
      status: "accepted",
    }).select("following");

    const validUserIds = validFollowing.map((f) => f.following);

    const post = await Post.create({
      author: userId,
      caption,
      media: media || [],
      taggedUsers: validUserIds,
      hashtags: hashtags.map((tag) => tag.toLowerCase()),
    });

    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { caption, media } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    // Update caption
    if (caption !== undefined) {
      post.caption = caption;
    }

    if (media) {
      // Find deleted media
      const oldPublicIds = post.media.map((item) => item.public_id);
      const newPublicIds = media.map((item) => item.public_id);

      const removedMedia = post.media.filter(
        (item) => !newPublicIds.includes(item.public_id),
      );

      //  Delete only removed files
      for (let item of removedMedia) {
        await cloudinary.uploader.destroy(item.public_id, {
          resource_type: item.type,
        });
      }

      // Replace media array
      post.media = media;
    }

    await post.save();

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    //  Delete all media in parallel
    await Promise.all(
      post.media.map((item) =>
        cloudinary.uploader.destroy(item.public_id, {
          resource_type: item.type,
        }),
      ),
    );

    await Comment.deleteMany({ post: postId });
    await post.deleteOne();

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getSinglePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const post = await Post.findById(postId).populate(
      "author",
      "username profilePicture",
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.some((id) => id.toString() === userId);

    res.json({
      success: true,
      ...post._doc,
      likesCount: post.likes.length,
      isLiked,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.some((id) => id.toString() === userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      isLiked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { text, parentComment } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent)
        return res.status(404).json({ message: "Parent comment not found" });
    }

    const comment = await Comment.create({
      post: postId,
      author: userId,
      text,
      parentComment: parentComment || null,
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "username profilePicture")
      .lean();

    res.status(201).json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    // Count replies
    const replies = await Comment.find({ parentComment: commentId });

    const totalToDelete = replies.length + 1;

    await Comment.deleteMany({
      $or: [{ _id: commentId }, { parentComment: commentId }],
    });

    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -totalToDelete },
    });

    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleLikeComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      isLiked: !isLiked,
      likesCount: comment.likes.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 })
      .lean();

    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment) => {
      comment.likesCount = comment.likes.length;
      comment.isLiked = comment.likes.some((id) => id.toString() === userId);
      comment.replies = [];

      commentMap[comment._id] = comment;

      if (!comment.parentComment) {
        rootComments.push(comment);
      }
    });

    comments.forEach((comment) => {
      if (comment.parentComment) {
        commentMap[comment.parentComment]?.replies.push(comment);
      }
    });

    res.json({
      success: true,
      comments: rootComments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
      // 1 Sort newest
      { $sort: { createdAt: -1 } },

      // 2 Pagination
      { $skip: skip },
      { $limit: limit },

      // 3 Populate author
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },

      // 4 Check follow relationship
      {
        $lookup: {
          from: "follows",
          let: { authorId: "$author._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$follower", userId] },
                    { $eq: ["$following", "$$authorId"] },
                    { $eq: ["$status", "accepted"] },
                  ],
                },
              },
            },
          ],
          as: "followData",
        },
      },

      {
        $addFields: {
          isFollowingAuthor: { $gt: [{ $size: "$followData" }, 0] },
        },
      },

      // 5 Filter private accounts
      {
        $match: {
          $or: [
            { "author.isPrivate": false },
            { isFollowingAuthor: true },
            { "author._id": userId },
          ],
        },
      },

      // 6 Like data
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          isLiked: { $in: [userId, "$likes"] },
        },
      },

      // 7 Saved check
      {
        $lookup: {
          from: "savedposts",
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$post", "$$postId"] },
                    { $eq: ["$user", userId] },
                  ],
                },
              },
            },
          ],
          as: "savedData",
        },
      },

      {
        $addFields: {
          isSaved: { $gt: [{ $size: "$savedData" }, 0] },
        },
      },

      // 8 Clean fields
      {
        $project: {
          likes: 0,
          followData: 0,
          savedData: 0,
          __v: 0,

          "author.password": 0,
          "author.email": 0,
          "author.blockedUsers": 0,
          "author.__v": 0,
        },
      },
    ]);

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
export const getUserPosts = async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user.id);
    const { userId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },

      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },

      {
        $addFields: {
          likesCount: { $size: "$likes" },
          isLiked: { $in: [currentUserId, "$likes"] },
        },
      },

      {
        $project: {
          likes: 0,
          __v: 0,
          "author.password": 0,
          "author.email": 0,
          "author.blockedUsers": 0,
          "author.__v": 0,
        },
      },
    ]);

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

export const getTaggedPosts = async (req, res) => {
  try {
    const myId = req.user.id;

    const posts = await Post.find({
      taggedUsers: myId,
    })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
