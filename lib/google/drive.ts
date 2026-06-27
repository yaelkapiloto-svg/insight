import { google, drive_v3 } from "googleapis";
import { getGoogleAuth } from "./auth";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export function extractDriveId(input: string): string {
  const trimmed = input.trim();
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  const idParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParam) return idParam[1];
  return trimmed;
}

export async function listFolder(folderIdOrUrl: string): Promise<DriveFile[]> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });
  const folderId = extractDriveId(folderIdOrUrl);

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType)",
    pageSize: 200,
  });

  return (res.data.files as drive_v3.Schema$File[]).map((f) => ({
    id: f.id!,
    name: f.name!,
    mimeType: f.mimeType!,
  }));
}

export async function downloadFileAsBuffer(fileId: string): Promise<Buffer> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(res.data as ArrayBuffer);
}
