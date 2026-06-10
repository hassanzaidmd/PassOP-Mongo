import nodemailer from "nodemailer";
import dns from "dns";

// Some deployment hosts have broken IPv6 egress for SMTP.
// Prefer IPv4 so Gmail's SMTP endpoint is reachable more reliably.
if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
}

const SMTP_HOST = "smtp.gmail.com";
const SMTP_CANDIDATES = [
    {
        port: 465,
        secure: true,
        label: "465-secure"
    },
    {
        port: 587,
        secure: false,
        label: "587-starttls"
    }
];
let transporterPromise = null;

async function createTransporter(candidate) {
    const resolved = await dns.promises.lookup(SMTP_HOST, { family: 4 });
    console.log("[mail] resolved smtp host:", SMTP_HOST);
    console.log("[mail] resolved smtp ipv4:", resolved.address);
    console.log("[mail] using smtp candidate:", candidate.label);
    console.log("[mail] smtp port:", candidate.port);
    console.log("[mail] smtp secure:", candidate.secure);

    return nodemailer.createTransport({
        host: resolved.address,
        port: candidate.port,
        secure: candidate.secure,
        requireTLS: true,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            servername: SMTP_HOST
        }
    });
}

async function getTransporter(candidate) {
    if (!transporterPromise) {
        console.log("[mail] creating smtp transport");
        transporterPromise = createTransporter(candidate);
    }

    return transporterPromise;
}

function logMailError(stage, error) {
    console.log(`[mail:${stage}] failed`);
    console.log(`[mail:${stage}] message:`, error?.message);
    console.log(`[mail:${stage}] code:`, error?.code);
    console.log(`[mail:${stage}] errno:`, error?.errno);
    console.log(`[mail:${stage}] syscall:`, error?.syscall);
    console.log(`[mail:${stage}] command:`, error?.command);
    console.log(`[mail:${stage}] address:`, error?.address);
    console.log(`[mail:${stage}] port:`, error?.port);
    console.log(`[mail:${stage}] response:`, error?.response);
    console.log(`[mail:${stage}] stack:`, error?.stack);
}

export const sendEmail = async (to, subject, html) => {
    console.log("[mail] send requested");
    console.log("[mail] to:", to);
    console.log("[mail] subject:", subject);
    console.log("[mail] smtp host:", SMTP_HOST);
    console.log("[mail] auth user set:", Boolean(process.env.EMAIL));

    let lastError;

    for (const candidate of SMTP_CANDIDATES) {
        try {
            transporterPromise = null;

            console.log("[mail] verifying smtp connection");
            const transporter = await getTransporter(candidate);
            await transporter.verify();
            console.log("[mail] smtp verification passed");

            console.log("[mail] sending message");
            const info = await transporter.sendMail({
                from: `"PassOp <${process.env.EMAIL}>"`,
                to,
                subject,
                html
            });

            console.log("[mail] sent");
            console.log("[mail] response:", info.response);
            console.log("[mail] messageId:", info.messageId);
            return info;
        }
        catch (error) {
            lastError = error;
            logMailError(candidate.label, error);
        }
    }

    throw lastError;
};
