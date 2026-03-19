import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

const otpStore = {};

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

    const otp = Math.floor(100000 + 900000 * Math.random()).toString();

    const hashedPassword = await bcrypt.hash(password, 10);

      otpStore[email] = {
      username,
      email,
      password: hashedPassword,
      otp,
      expiry: Date.now() + 5 * 60 * 1000
    };

    await sendEmail(
      email,
      "Your OTP - PassOP",
      `<h2>Your Registration Otp is ${otp}</h2>`
    )

    res.json({
      message: "OTP sent"
    });

  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function login(req, res) {
  try {

    const { email, password } = req.body;

    const users = getCollection("users");

    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User Not Found"
      });
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    // 🔐 2FA CHECK
    if (user.twoFactorEnabled) {

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            twoFactorCode: otp,
            twoFactorExpire: Date.now() + 5 * 60 * 1000
          }
        }
      );

      
    await sendEmail(
      email,
      "Your OTP - PassOP",
      `<h2>Your Login Otp is ${otp}</h2>`
    )

      return res.json({
        message: "OTP sent",
        twoFactor: true,
        userId: user._id
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
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
  console.log(hashedToken)
  console.log(resetToken)

  const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

      await sendEmail(
      email,
      "Your Reset Password link - PassOP",
      `<h2>Your password reset link is ${resetURL}</h2>`
    )

  res.json({
    message: "Reset link generated",
  });
}

export async function resetPassword(req, res) {

  const resetToken = req.params.token;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log(hashedToken)
  console.log(resetToken)
  const user = await getCollection("users").findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.json({ message: "Token invalid or expired" });
  }

  const email = user.email;
  console.log(email)
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

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

  
    await sendEmail(
      email,
      "PassOp Registration Successful",
      `<h2>Congratulation 🎇🎇 You have successfully reset your password on PassOp</h2>`
    )

  res.json({
    message: "Password reset successful"
  });
}

export async function verify2FA(req, res) {

  try {

    const { userId, code } = req.body;

    const users = getCollection("users");

    const user = await users.findOne({ _id: new ObjectId(userId) });
    const email = user.email;

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (
      user.twoFactorCode !== code ||
      user.twoFactorExpire < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    // clear OTP
    await users.updateOne(
      { _id: user._id },
      {
        $unset: {
          twoFactorCode: "",
          twoFactorExpire: ""
        }
      }
    );

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    
    await sendEmail(
      email,
      "PassOp Registration Successful",
      `<h2>You have logged in on PassOp at ${Date.now()}</h2>`
    )

    res.json({
      message: "Login successful",
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
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const users = getCollection("users");

    await users.insertOne({
      username: record.username,
      email: record.email,
      password: record.password,
      role: "user",
      twoFactorEnabled: true
    });

    delete otpStore[email];

    await sendEmail(
      email,
      "PassOp Registration Successful",
      `<h2>Congratulation 🎇🎇 You Have Been successfully registered on PassOp</h2>`
    )

    res.json({
      message: "User registered successfully"
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
}