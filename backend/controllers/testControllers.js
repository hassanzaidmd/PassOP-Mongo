import { sendEmail } from "../utils/sendEmail.js";

export const testEmail = async (req, res) => {
  try {
    await sendEmail(
      "yeay.wohoo0@gmail.com",
      "Test Email",
      "<h2>Email working perfectly</h2>"
    );

    res.json({ message: "Test Email Sent" });
  } catch (error) {
    res.status(500).json({
      message: "Test email failed",
      error: error.message
    });
  }
};
