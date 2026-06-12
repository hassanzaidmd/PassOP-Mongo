import fs from "node:fs/promises";
import path from "node:path";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const CREDENTIALS_PATH = path.resolve(process.cwd(), "credentials.json");
const TOKEN_PATH = path.resolve(process.cwd(), "token.json");

let gmailPromise = null;

function logMailError(stage, error) {
    console.log(`[mail:${stage}] failed`);
    console.log(`[mail:${stage}] message:`, error?.message);
    console.log(`[mail:${stage}] name:`, error?.name);
    console.log(`[mail:${stage}] code:`, error?.code);
    console.log(`[mail:${stage}] status:`, error?.status);
    console.log(`[mail:${stage}] response:`, error?.response);
    console.log(`[mail:${stage}] stack:`, error?.stack);
}

function base64UrlEncode(value) {
    return Buffer.from(value)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

async function readJsonIfExists(filePath) {
    try {
        const raw = await fs.readFile(filePath, "utf8");
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}

async function createGmailClient() {
    const credentials = await readJsonIfExists(CREDENTIALS_PATH);
    const token = await readJsonIfExists(TOKEN_PATH);

    const clientId =
        process.env.GMAIL_CLIENT_ID ||
        credentials?.installed?.client_id ||
        credentials?.web?.client_id;

    const clientSecret =
        process.env.GMAIL_CLIENT_SECRET ||
        credentials?.installed?.client_secret ||
        credentials?.web?.client_secret;

    const refreshToken =
        process.env.GMAIL_REFRESH_TOKEN ||
        token?.refresh_token;

    const redirectUri =
        credentials?.installed?.redirect_uris?.[0] ||
        credentials?.web?.redirect_uris?.[0] ||
        "http://localhost";

    console.log("[mail] gmail client config");
    console.log("[mail] client id set:", Boolean(clientId));
    console.log("[mail] client secret set:", Boolean(clientSecret));
    console.log("[mail] refresh token set:", Boolean(refreshToken));
    console.log("[mail] user set:", Boolean(process.env.GMAIL_USER || process.env.EMAIL));

    if (!clientId) {
        throw new Error("GMAIL_CLIENT_ID is missing and credentials.json could not provide it");
    }

    if (!clientSecret) {
        throw new Error("GMAIL_CLIENT_SECRET is missing and credentials.json could not provide it");
    }

    if (!refreshToken) {
        throw new Error("GMAIL_REFRESH_TOKEN is missing and token.json could not provide it");
    }

    const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    auth.setCredentials({ refresh_token: refreshToken });

    return google.gmail({ version: "v1", auth });
}

async function getGmailClient() {
    if (!gmailPromise) {
        console.log("[mail] creating gmail api client");
        gmailPromise = createGmailClient();
    }

    return gmailPromise;
}

export const sendEmail = async (to, subject, html) => {
    try {
        const from = process.env.GMAIL_USER || process.env.EMAIL;

        console.log("[mail] send requested");
        console.log("[mail] to:", to);
        console.log("[mail] subject:", subject);
        console.log("[mail] from:", from);
        console.log("[mail] gmail user set:", Boolean(from));
        console.log("[mail] gmail send scope:", SCOPES[0]);

        if (!from) {
            throw new Error("GMAIL_USER is not set");
        }

        const gmail = await getGmailClient();

        const message = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            "MIME-Version: 1.0",
            'Content-Type: text/html; charset="UTF-8"',
            "",
            html
        ].join("\r\n");

        const raw = base64UrlEncode(message);

        console.log("[mail] sending via gmail api");
        const response = await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw }
        });

        console.log("[mail] sent");
        console.log("[mail] response id:", response.data?.id);
        return response.data;
    }
    catch (error) {
        logMailError("send", error);
        throw error;
    }
};
