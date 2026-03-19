import { sendEmail } from "../utils/sendEmail.js";

export const testEmail = async (req,res) => {
    await sendEmail(
        "yeay.wohoo0@gmail.com",
        "Test Email 🚀",
    "<h2>Email working perfectly ✅</h2>"
  );

  res.json({message: "Test Email Sent"});
}