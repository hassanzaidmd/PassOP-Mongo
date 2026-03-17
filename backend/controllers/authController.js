import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getCollection } from "../config/db.js";
import crypto from "crypto";


export async function register(req, res) {
    try {

        const { username, email, password } = req.body;

        const users = getCollection("users");

        const existingUser = await users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await users.insertOne({
            username,
            email,
            password: hashedPassword,
            role: "user"
        });

        res.json({
            message: "User registered successfully",
            result
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({message: "Server Error"});
    }
}

export async function login(req,res) {
    try {
        
        const {email, password} = req.body;

        const users = getCollection("users");

        const user = await users.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User Not Found"
            });
        }

        const match = await bcrypt.compare(password,user.password)

        if(!match){
            return res.status(400).json({
                message: "Invalid Password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );

        res.json({
            message: "Login Successful",
            token,
            role: user.role
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
}


export async function forgotPassword(req, res) {

  const { email } = req.body;

  const user = await getCollection("users").findOne({ email });

  if (!user) {
    return res.json({ message: "User not found" });
  }

  // generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // hash token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await getCollection("users").updateOne(
    { email },
    {
      $set: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: Date.now() + 15 * 60 * 1000
      }
    }
  );

  const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

  res.json({
    message: "Reset link generated",
    resetURL
  });
}

export async function resetPassword(req, res) {

  const resetToken = req.params.token;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await getCollection("users").findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.json({ message: "Token invalid or expired" });
  }

  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password,10);

  await getCollection("users").updateOne(
    { _id: user._id },
    {
      $set: {
        password: hashedPassword
      },
      $unset: {
        resetPasswordToken: "",
        resetPasswordExpire: ""
      }
    }
  );

  res.json({
    message: "Password reset successful"
  });
}