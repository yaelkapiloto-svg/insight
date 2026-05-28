import { google, drive_v3 } from "googleapis";
import { getGoogleAuth } from "./auth";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export async function listFolder(folderId: string): Promise<DriveFile[]> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });

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
