import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { authenticate } from "@google-cloud/local-auth";

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const CREDENTIALS_PATH = path.resolve(process.cwd(), "credentials.json");
const TOKEN_PATH = path.resolve(process.cwd(), "token.json");

async function main() {
  console.log("[gmail-auth] starting local auth");
  console.log("[gmail-auth] credentials:", CREDENTIALS_PATH);

  const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH
  });

  const tokens = auth.credentials;

  console.log("[gmail-auth] auth complete");
  console.log("[gmail-auth] access token set:", Boolean(tokens.access_token));
  console.log("[gmail-auth] refresh token set:", Boolean(tokens.refresh_token));
  console.log("[gmail-auth] expiry date:", tokens.expiry_date);

  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), "utf8");

  console.log("[gmail-auth] token saved:", TOKEN_PATH);
  console.log("[gmail-auth] refresh token:");
  console.log(tokens.refresh_token || "(no refresh token returned)");
}

main().catch((error) => {
  console.error("[gmail-auth] failed");
  console.error(error);
  process.exit(1);
});
