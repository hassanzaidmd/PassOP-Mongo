import nodemailer from "nodemailer";
import dns from "dns";

// Some deployment hosts have broken IPv6 egress for SMTP.
// Prefer IPv4 so Gmail's SMTP endpoint is reachable more reliably.
if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"PassOp <${process.env.EMAIL}>"`,
            to,
            subject,
            html
        });

        console.log("Email Sent:", info.response);
        return info;
    }
    catch (error) {
        console.log("Email Error:", error);
        throw error;
    }
};
