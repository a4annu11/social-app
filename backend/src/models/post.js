import mongoose from "mongoose";
const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    caption: String,

    mediaUrl: String,
    mediaType: {
      type: String,
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);
