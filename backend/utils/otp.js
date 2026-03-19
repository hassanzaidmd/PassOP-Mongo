import bcrypt from "bcrypt";

// 🔹 Generate OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 🔹 Hash OTP
export async function hashOTP(otp) {
  return await bcrypt.hash(otp, 10);
}

// 🔹 Verify OTP
export async function verifyOTP(enteredOtp, hashedOtp) {
  return await bcrypt.compare(enteredOtp, hashedOtp);
}

// 🔹 Expiry check
export function isOTPExpired(expiryTime) {
  return Date.now() > expiryTime;
}