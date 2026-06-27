import { listFolder, type DriveFile } from "@/lib/google/drive";
import { matchMonth, matchContentType, matchMetric } from "@/lib/fuzzy";

export interface TopContentFile {
  metric: string;
  contentType: string;
  driveFileId: string;
}

function guessYear(name: string): string | null {
  const m = name.match(/\b(20\d{2})\b/);
  return m ? m[1] : null;
}

function findMonthFolder(folders: DriveFile[], targetMonth: string): DriveFile | null {
  const [year, mm] = targetMonth.split("-");
  for (const folder of folders) {
    const name = folder.name.trim();
    const folderYear = guessYear(name);
    if (folderYear && folderYear !== year) continue;

    const monthCode = matchMonth(name.replace(/\b20\d{2}\b/, "").trim());
    if (monthCode === mm) return folder;
  }
  return null;
}

function findContentTypeFolder(folders: DriveFile[], contentType: string): DriveFile | null {
  for (const folder of folders) {
    const matched = matchContentType(folder.name);
    if (matched === contentType) return folder;
  }
  return null;
}

function findMetricFile(files: DriveFile[], metric: string): DriveFile | null {
  for (const file of files) {
    const nameNoExt = file.name.replace(/\.[^.]+$/, "");
    const matched = matchMetric(nameNoExt);
    if (matched === metric) return file;
  }
  return null;
}

export interface BestImage {
  contentType: string;
  metric: string;
  driveFileId: string;
}

const PREFERRED_METRICS = ["views", "reach", "interactions"] as const;
const CONTENT_TYPES_TO_PICK = ["reels", "stories", "posts"] as const;

/**
 * For a given (rootFolder, month), return one "headline" image per content type
 * (Reel / Story / Post), preferring views.png, falling back to reach, interactions.
 */
export async function findBestImagePerContentType(
  rootFolderId: string,
  month: string
): Promise<BestImage[]> {
  const rootItems = await listFolder(rootFolderId);
  const monthFolder = findMonthFolder(
    rootItems.filter((f) => f.mimeType === "application/vnd.google-apps.folder"),
    month
  );
  if (!monthFolder) return [];

  const monthItems = await listFolder(monthFolder.id);
  const results: BestImage[] = [];

  for (const contentType of CONTENT_TYPES_TO_PICK) {
    const ctFolder = findContentTypeFolder(
      monthItems.filter((f) => f.mimeType === "application/vnd.google-apps.folder"),
      contentType
    );
    if (!ctFolder) continue;

    const ctFiles = (await listFolder(ctFolder.id)).filter((f) =>
      f.mimeType.startsWith("image/")
    );

    for (const metric of PREFERRED_METRICS) {
      const file = findMetricFile(ctFiles, metric);
      if (file) {
        results.push({ contentType, metric, driveFileId: file.id });
        break;
      }
    }
  }

  return results;
}

/**
 * Find a single screenshot for a specific (month, contentType, metric).
 * Returns the Drive file ID or null if not found.
 */
export async function findScreenshot(
  rootFolderId: string,
  month: string,
  contentType: string,
  metric: string
): Promise<string | null> {
  const rootItems = await listFolder(rootFolderId);
  const monthFolder = findMonthFolder(
    rootItems.filter((f) => f.mimeType === "application/vnd.google-apps.folder"),
    month
  );
  if (!monthFolder) return null;

  const monthItems = await listFolder(monthFolder.id);
  const ctFolder = findContentTypeFolder(
    monthItems.filter((f) => f.mimeType === "application/vnd.google-apps.folder"),
    contentType
  );
  if (!ctFolder) return null;

  const ctFiles = await listFolder(ctFolder.id);
  const file = findMetricFile(
    ctFiles.filter((f) => f.mimeType.startsWith("image/")),
    metric
  );
  return file?.id ?? null;
}

export async function matchDriveFiles(
  rootFolderId: string,
  month: string,
  contentTypes: string[],
  metrics: string[]
): Promise<TopContentFile[]> {
  const rootItems = await listFolder(rootFolderId);
  const monthFolder = findMonthFolder(
    rootItems.filter((f) => f.mimeType === "application/vnd.google-apps.folder"),
    month
  );
  if (!monthFolder) return [];

  const monthItems = await listFolder(monthFolder.id);
  const results: TopContentFile[] = [];

  for (const contentType of contentTypes) {
    const ctFolder = findContentTypeFolder(
      monthItems.filter((f) => f.mimeType === "application/vnd.google-apps.folder"),
      contentType
    );
    if (!ctFolder) continue;

    const ctFiles = await listFolder(ctFolder.id);

    for (const metric of metrics) {
      const file = findMetricFile(
        ctFiles.filter((f) => f.mimeType.startsWith("image/")),
        metric
      );
      if (file) {
        results.push({ metric, contentType, driveFileId: file.id });
      }
    }
  }

  return results;
}
