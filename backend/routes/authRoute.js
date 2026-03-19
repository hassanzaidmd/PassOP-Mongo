import express from "express";
import { register,login,forgotPassword,resetPassword,verify2FA, verifyOtp } from "../controllers/authController.js";
import { testEmail } from "../controllers/testControllers.js";

const router = express.Router();

router.post("/register",register);
router.post("/verify-otp",verifyOtp);
router.post("/login",login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-2fa", verify2FA);
// routes
router.get("/test-email", testEmail);

export default router;