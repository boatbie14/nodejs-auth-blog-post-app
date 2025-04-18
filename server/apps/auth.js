import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../utils/db.js";

const authRouter = Router();

dotenv.config();

// Todo
authRouter.post("/register", async (req, res) => {
  try {
    const { username, password, firstname, lastname } = req.body;

    // Check
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please add username and password..",
      });
    }

    //Check Unique Username
    const membersCollection = db.collection("users");
    const existingUser = await membersCollection.findOne({ username: username });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    //Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //Perpare new user data
    const newUser = {
      username,
      password: hashedPassword,
      firstname: firstname || "",
      lastname: lastname || "",
      created_at: new Date(),
    };

    //Insert new data
    const result = await membersCollection.insertOne(newUser);

    return res.status(201).json({
      message: "User has been created successfully",
      user: {
        _id: result.insertedId,
        username: newUser.username,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        created_at: newUser.created_at,
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: e.message,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    //Check not empty
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please add username and password..",
      });
    }

    //Check username
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ username: username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    //Hash and checkpassword
    const isPasswordValid = await bcrypt.compare(password, user.password);

    //Not Match
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    //Create Token
    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstname,
        lastName: user.lastname,
      },
      process.env.SECRET_KEY,
      { expiresIn: "900000" }
    );

    //Return Data
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        _id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: e.message,
    });
  }
});

export default authRouter;