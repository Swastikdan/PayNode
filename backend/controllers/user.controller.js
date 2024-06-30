import z from "zod";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { User } from "../models/schema.js";

const { JWT_SECRET } = process.env;

const signupBody = z.object({
  username: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.number(),
});

const signinBody = z.object({
  username: z.string().email(),
  password: z.number(),
});

/* Sign-up */
export const userSignup = async (req, res) => {
  const { success, data } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({ message: "Incorrect Input" });
  }

  const { username, firstName, lastName, password } = data;

  const existingUser = await User.findOne({
    username,
  });
  if (existingUser) {
    return res.status(411).json({ message: "User with email already exists" });
  }

  try {
    const newUser = new User({ username, firstName, lastName, password });
    const savedUser = await newUser.save();

    const userId = savedUser._id;
    const token = jwt.sign({ userId }, JWT_SECRET);

    return res
      .status(200)
      .json({ message: "User created successfully", token: token });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/* Sign-in */
export const userSignin = async (req, res) => {
  const { success, data } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({ message: "Incorrect inputs" });
  }

  try {
    const { username, password } = data;

    const user = await User.findOne({ username, password });
    if (user) {
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      return res.status(200).json({ token });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};