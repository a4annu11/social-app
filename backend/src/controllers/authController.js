import bcrypt from "bcryptjs";
import User from "../models/users.js";
import { generateToken } from "../utils/generateToken.js";
import admin from "../config/firebase.js";

export const registerUser = async (req, res) => {
  try {
    const { name, username, password, email } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const formattedUsername = username.toLowerCase();

    const existingUser = await User.findOne({ username: formattedUsername });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username: formattedUsername,
      password: hashedPassword,
      email,
    });

    //Firebase Custom Token
    const firebaseToken = await admin
      .auth()
      .createCustomToken(user._id.toString());

    return res.status(201).json({
      success: true,
      token: generateToken(user._id),
      firebaseToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const formattedUsername = username.toLowerCase();

    const user = await User.findOne({ username: formattedUsername });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //Firebase Custom Token
    const firebaseToken = await admin
      .auth()
      .createCustomToken(user._id.toString());

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      firebaseToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
