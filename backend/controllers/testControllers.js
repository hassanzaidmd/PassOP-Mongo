import { sendEmail } from "../utils/sendEmail.js";

export const testEmail = async (req, res) => {
  try {
    console.log("[route:test-email] hit");
    await sendEmail(
      "yeay.wohoo0@gmail.com",
      "Test Email",
      "<h2>Email working perfectly</h2>"
    );

    console.log("[route:test-email] email send completed");
    res.json({ message: "Test Email Sent" });
  } catch (error) {
    console.log("[route:test-email] failed:", error?.message);
    res.status(500).json({
      message: "Test email failed",
      error: error.message
    });
  }
};
