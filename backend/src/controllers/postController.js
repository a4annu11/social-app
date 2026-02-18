import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caption, media } = req.body;

    // media = array of base64 strings or urls
    const uploadedMedia = [];

    if (media && media.length > 0) {
      for (let item of media) {
        const uploadRes = await cloudinary.uploader.upload(item, {
          folder: "posts",
          resource_type: "auto", // supports image + video
        });

        uploadedMedia.push({
          url: uploadRes.secure_url,
          public_id: uploadRes.public_id,
          type: uploadRes.resource_type,
        });
      }
    }

    const post = await Post.create({
      author: userId,
      caption,
      media: uploadedMedia,
    });

    res.status(201).json(post);
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

    // If media is provided, replace all media
    if (media && media.length > 0) {
      // 1️⃣ Delete old media safely using public_id
      for (let item of post.media) {
        await cloudinary.uploader.destroy(item.public_id, {
          resource_type: item.type,
        });
      }

      // 2️⃣ Upload new media
      const uploadedMedia = [];

      for (let item of media) {
        const uploadRes = await cloudinary.uploader.upload(item, {
          folder: "posts",
          resource_type: "auto",
        });

        uploadedMedia.push({
          url: uploadRes.secure_url,
          public_id: uploadRes.public_id, // IMPORTANT
          type: uploadRes.resource_type,
        });
      }

      post.media = uploadedMedia;
    }

    await post.save();

    res.json(post);
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

    // Delete media from Cloudinary safely
    for (let item of post.media) {
      await cloudinary.uploader.destroy(item.public_id, {
        resource_type: item.type,
      });
    }

    await Comment.deleteMany({ post: postId });
    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
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

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!text?.trim())
      return res.status(400).json({ message: "Comment text required" });

    const comment = await Comment.create({
      post: postId,
      author: userId,
      text,
      parentComment: parentComment || null,
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });

    res.status(201).json(comment);
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

    res.json({ message: "Comment deleted" });
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

    res.json(rootComments);
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
          isLiked: { $in: [userId, "$likes"] },
        },
      },

      {
        $project: {
          // Remove unwanted post fields
          likes: 0,
          __v: 0,

          // Remove unwanted author fields
          "author.password": 0,
          "author.email": 0,
          "author.blockedUsers": 0,
          "author.__v": 0,
        },
      },
    ]);

    res.json({
      page,
      limit,
      posts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
