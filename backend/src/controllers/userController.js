import mongoose from "mongoose";
import User from "../models/users.js";
import cloudinary from "../config/cloudinary.js";
import admin from "../config/firebase.js";
import Follow from "../models/Follow.js";

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    // .populate("followers following", "username name profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const myId = req.user?.id;

    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let isFollowing = false;
    let isFollower = false;
    let isRequested = false;

    if (myId && myId !== user._id.toString()) {
      const relations = await Follow.find({
        $or: [
          { follower: myId, following: user._id },
          { follower: user._id, following: myId },
        ],
      });

      relations.forEach((rel) => {
        // I follow them
        if (
          rel.follower.toString() === myId &&
          rel.following.toString() === user._id.toString()
        ) {
          if (rel.status === "accepted") {
            isFollowing = true;
          } else if (rel.status === "pending") {
            isRequested = true;
          }
        }

        // They follow me
        if (
          rel.follower.toString() === user._id.toString() &&
          rel.following.toString() === myId &&
          rel.status === "accepted"
        ) {
          isFollower = true;
        }
      });
    }

    res.status(200).json({
      ...user.toObject(),
      isFollowing,
      isFollower,
      isRequested,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, bio } = req.body;
    let profilePicture;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload new profile image if provided.
    if (req.body.profilePicture) {
      // Delete old image if exists
      if (user.profilePicture) {
        const publicId = user.profilePicture.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      const uploadedResponse = await cloudinary.uploader.upload(
        req.body.profilePicture,
        {
          folder: "profile_pictures",
        },
      );

      profilePicture = uploadedResponse.secure_url;
    }

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete profile picture from Cloudinary
    if (user.profilePicture) {
      const publicId = user.profilePicture.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
    }

    // Delete Firebase Auth user
    await admin.auth().deleteUser(userId.toString());

    // Delete MongoDB user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const togglePrivateAccount = async (req, res) => {
  try {
    const myId = req.user.id;

    const user = await User.findById(myId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isPrivate = !user.isPrivate;
    await user.save();

    res.status(200).json({
      message: `Account is now ${user.isPrivate ? "Private" : "Public"}`,
      isPrivate: user.isPrivate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const myId = req.user.id;
    const { userId } = req.params;

    if (myId === userId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(myId),
      User.findById(userId),
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Block check
    if (
      currentUser.blockedUsers.includes(userId) ||
      targetUser.blockedUsers.includes(myId)
    ) {
      return res.status(400).json({ message: "User blocked" });
    }

    const existing = await Follow.findOne({
      follower: myId,
      following: userId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already requested/following" });
    }

    const status = targetUser.isPrivate ? "pending" : "accepted";

    await Follow.create({
      follower: myId,
      following: userId,
      status,
    });

    if (status === "accepted") {
      await Promise.all([
        User.findByIdAndUpdate(myId, { $inc: { followingCount: 1 } }),
        User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } }),
      ]);
    }

    res.json({
      message:
        status === "pending" ? "Follow request sent" : "Followed successfully",
      status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptFollowRequest = async (req, res) => {
  try {
    const myId = req.user.id;
    const { userId } = req.params;

    const follow = await Follow.findOne({
      follower: userId,
      following: myId,
      status: "pending",
    });

    if (!follow) {
      return res.status(404).json({ message: "Request not found" });
    }

    follow.status = "accepted";
    await follow.save();

    await Promise.all([
      User.findByIdAndUpdate(myId, { $inc: { followersCount: 1 } }),
      User.findByIdAndUpdate(userId, { $inc: { followingCount: 1 } }),
    ]);

    res.json({ message: "Request accepted", status: "following" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const myId = req.user.id;
    const { userId } = req.params;

    const follow = await Follow.findOne({
      follower: myId,
      following: userId,
    });

    if (!follow) {
      return res.status(404).json({ message: "Relationship not found" });
    }

    if (follow.status === "accepted") {
      await Promise.all([
        User.findByIdAndUpdate(myId, { $inc: { followingCount: -1 } }),
        User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } }),
      ]);
    }

    await follow.deleteOne();

    res.json({
      message: "Unfollowed / Request cancelled",
      status: "not_following",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const myId = req.user.id;
    const { userId } = req.params;

    await Follow.deleteMany({
      $or: [
        { follower: myId, following: userId },
        { follower: userId, following: myId },
      ],
    });

    await User.findByIdAndUpdate(myId, {
      $addToSet: { blockedUsers: userId },
    });

    res.json({ message: "User blocked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowStatus = async (req, res) => {
  try {
    const myId = req.user.id;
    const { userId } = req.params;

    if (myId === userId) {
      return res.json({ status: "own_profile" });
    }

    const relation = await Follow.findOne({
      follower: myId,
      following: userId,
    });

    if (!relation) {
      return res.json({ status: "not_following" });
    }

    if (relation.status === "pending") {
      return res.json({ status: "requested" });
    }

    res.json({ status: "following" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const followers = await Follow.find({
      following: userId,
      status: "accepted",
    })
      .populate("follower", "username name profilePicture")
      .skip(offset)
      .limit(limit)
      .lean();

    const result = followers.map((f) => f.follower);

    res.json({
      count: result.length,
      limit,
      offset,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const following = await Follow.find({
      follower: userId,
      status: "accepted",
    })
      .populate("following", "username name profilePicture")
      .skip(offset)
      .limit(limit)
      .lean();

    const result = following.map((f) => f.following);

    res.json({
      count: result.length,
      limit,
      offset,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyFollowRequests = async (req, res) => {
  try {
    const myId = req.user.id;

    const requests = await Follow.find({
      following: myId,
      status: "pending",
    })
      .populate("follower", "username name profilePicture")
      .lean();

    const result = requests.map((r) => r.follower);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const followUser = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const myId = req.user.id;
//     const { userId } = req.params;

//     if (myId === userId) {
//       throw new Error("You cannot follow yourself");
//     }

//     const [currentUser, targetUser] = await Promise.all([
//       User.findById(myId).session(session),
//       User.findById(userId).session(session),
//     ]);

//     if (!currentUser || !targetUser) {
//       throw new Error("User not found");
//     }

//     //  Block check
//     if (
//       currentUser.blockedUsers.includes(userId) ||
//       targetUser.blockedUsers.includes(myId)
//     ) {
//       throw new Error("You cannot follow this user");
//     }

//     // Already following
//     if (targetUser.followers.includes(myId)) {
//       throw new Error("Already following");
//     }

//     // Already requested
//     if (targetUser.friendRequests.includes(myId)) {
//       throw new Error("Request already sent");
//     }

//     if (targetUser.isPrivate) {
//       targetUser.friendRequests.push(myId);
//       await targetUser.save({ session });

//       await session.commitTransaction();
//       session.endSession();

//       return res.status(200).json({
//         message: "Follow request sent",
//         status: "requested",
//       });
//     }

//     // Public → follow directly
//     targetUser.followers.push(myId);
//     currentUser.following.push(userId);

//     await targetUser.save({ session });
//     await currentUser.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       message: "Followed successfully",
//       status: "following",
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ message: error.message });
//   }
// };

// export const acceptFollowRequest = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const myId = req.user.id;
//     const { userId } = req.params;

//     const [currentUser, requester] = await Promise.all([
//       User.findById(myId).session(session),
//       User.findById(userId).session(session),
//     ]);

//     if (!currentUser || !requester) {
//       throw new Error("User not found");
//     }

//     if (!currentUser.friendRequests.includes(userId)) {
//       throw new Error("No request found");
//     }

//     // Remove request
//     currentUser.friendRequests = currentUser.friendRequests.filter(
//       (id) => id.toString() !== userId
//     );

//     // Add follow relationship
//     currentUser.followers.push(userId);
//     requester.following.push(myId);

//     await currentUser.save({ session });
//     await requester.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       message: "Request accepted",
//       status: "following",
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ message: error.message });
//   }
// };

// export const unfollowUser = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const myId = req.user.id;
//     const { userId } = req.params;

//     const [currentUser, targetUser] = await Promise.all([
//       User.findById(myId).session(session),
//       User.findById(userId).session(session),
//     ]);

//     if (!currentUser || !targetUser) {
//       throw new Error("User not found");
//     }

//     // If following → remove
//     if (targetUser.followers.includes(myId)) {
//       targetUser.followers = targetUser.followers.filter(
//         (id) => id.toString() !== myId
//       );

//       currentUser.following = currentUser.following.filter(
//         (id) => id.toString() !== userId
//       );
//     }

//     // If request pending → remove request
//     if (targetUser.friendRequests.includes(myId)) {
//       targetUser.friendRequests = targetUser.friendRequests.filter(
//         (id) => id.toString() !== myId
//       );
//     }

//     await targetUser.save({ session });
//     await currentUser.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       message: "Unfollowed or request cancelled",
//       status: "not_following",
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ message: error.message });
//   }
// };

// export const blockUser = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const myId = req.user.id;
//     const { userId } = req.params;

//     const [currentUser, targetUser] = await Promise.all([
//       User.findById(myId).session(session),
//       User.findById(userId).session(session),
//     ]);

//     if (!currentUser || !targetUser) {
//       throw new Error("User not found");
//     }

//     // Remove relationships
//     currentUser.followers = currentUser.followers.filter(
//       (id) => id.toString() !== userId
//     );

//     currentUser.following = currentUser.following.filter(
//       (id) => id.toString() !== userId
//     );

//     targetUser.followers = targetUser.followers.filter(
//       (id) => id.toString() !== myId
//     );

//     targetUser.following = targetUser.following.filter(
//       (id) => id.toString() !== myId
//     );

//     // Remove requests
//     currentUser.friendRequests = currentUser.friendRequests.filter(
//       (id) => id.toString() !== userId
//     );

//     targetUser.friendRequests = targetUser.friendRequests.filter(
//       (id) => id.toString() !== myId
//     );

//     // Add to blocked list
//     if (!currentUser.blockedUsers.includes(userId)) {
//       currentUser.blockedUsers.push(userId);
//     }

//     await currentUser.save({ session });
//     await targetUser.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({ message: "User blocked" });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ message: error.message });
//   }
// };

// export const getFollowStatus = async (req, res) => {
//   try {
//     const myId = req.user.id;
//     const { userId } = req.params;

//     if (myId === userId) {
//       return res.json({ status: "own_profile" });
//     }

//     const targetUser = await User.findById(userId);

//     if (!targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (targetUser.followers.includes(myId)) {
//       return res.json({ status: "following" });
//     }

//     if (targetUser.friendRequests.includes(myId)) {
//       return res.json({ status: "requested" });
//     }

//     res.json({ status: "not_following" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
