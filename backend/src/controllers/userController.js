import User from "../models/users.js";
import cloudinary from "../config/cloudinary.js";
import admin from "../config/firebase.js";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select("-password")
      .populate("followers following", "username name profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
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

    // Upload new profile image if provided
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
