import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    caption: {
      type: String,
      trim: true,
    },

    media: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],

    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    hashtags: [{ type: String }],

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

postSchema.index({ taggedUsers: 1 });
postSchema.index({ hashtags: 1 });

export default mongoose.model("Post", postSchema);
