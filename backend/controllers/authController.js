import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { generateOTP, hashOTP, verifyOTP, isOTPExpired } from "../utils/otp.js";


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

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiry = Date.now() + 5 * 60 * 1000;

    const pendingUsers = getCollection("pendingUsers")

    // ✅ MAIN LINE (yahi lagana hai)
    await pendingUsers.updateOne(
      { email },
      {
        $set: {
          username,
          email,
          password: hashedPassword,
          otp: hashedOtp,
          expiry
        }
      },
      { upsert: true }
    );

    console.log(expiry, " aur ", Date.now())

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

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    // 🔐 2FA CHECK
    if (user.twoFactorEnabled) {

      const otp = generateOTP();
      const hashedOtp = await hashOTP(otp);

      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            twoFactorCode: hashedOtp,
            twoFactorExpire: Date.now() + 5 * 60 * 1000
          }
        }
      );

      await sendEmail(
        email,
        "Your OTP - PassOP",
        `<h2>Your Login Otp is ${otp}</h2>`
      );

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
  try {

    const { email } = req.body;

    const users = getCollection("users");

    const user = await users.findOne({ email });

    // 🔐 Always same response
    if (!user) {
      return res.json({
        message: "If account exists, reset link sent"
      });
    }

    // generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await users.updateOne(
      { email },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpire: Date.now() + 15 * 60 * 1000
        }
      }
    );

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Reset Your Password - PassOP",
      `<h2>Click below to reset your password:</h2>
       <a href="${resetURL}">${resetURL}</a>`
    );

    res.json({
      message: "If account exists, reset link sent"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
}

export async function resetPassword(req, res) {
  try {
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
      return res.status(400).json({
        message: "Token invalid or expired"
      });
    }

    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

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
      user.email,
      "Password Changed - PassOP",
      `<h2>Your password has been successfully changed ✅</h2>`
    );

    res.json({
      message: "Password reset successful"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
}
export async function verify2FA(req, res) {
  try {
    const { userId, code } = req.body;

    const users = getCollection("users");

    const user = await users.findOne({ _id: new ObjectId(userId) });

    // ✅ check first
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const email = user.email;

    // ✅ use utils properly
    const isMatch = verifyOTP(code, user.twoFactorCode);

    if (!isMatch || isOTPExpired(user.twoFactorExpire)) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    // ✅ clear OTP securely
    await users.updateOne(
      { _id: user._id },
      {
        $unset: {
          twoFactorCode: "",
          twoFactorExpire: ""
        }
      }
    );

    // ✅ generate token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ better email
    await sendEmail(
      email,
      "Login Alert - PassOP",
      `<h2>You have successfully logged in to PassOP</h2>
       <p>Time: ${new Date().toLocaleString()}</p>`
    );

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
    const pendingUsers = getCollection("pendingUsers");

    const record = await pendingUsers.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "OTP no" });
    }

    // expiry check
    if (isOTPExpired(record.expiry)) {
      console.log(record.expiry, " aur ", Date.now())
      return res.status(400).json({ message: "OTP is expired" });
    }

    // verify OTP
    const isMatch = await verifyOTP(otp, record.otp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const users = getCollection("users");

    await users.insertOne({
      username: record.username,
      email: record.email,
      password: record.password,
      role: "user",
      twoFactorEnabled: true
    });

    // delete from pending
    await pendingUsers.deleteOne({ email });

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