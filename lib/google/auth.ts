import { google, Auth } from "googleapis";

let _auth: Auth.GoogleAuth | null = null;

export function getGoogleAuth(): Auth.GoogleAuth {
  if (_auth) return _auth;

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set");

  const credentials = JSON.parse(keyJson);

  _auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  return _auth;
}
