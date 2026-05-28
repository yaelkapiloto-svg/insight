import { google } from "googleapis";
import { getGoogleAuth } from "./auth";

export async function readSheet(
  spreadsheetId: string,
  sheetName: string
): Promise<string[][]> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });

  return (res.data.values as string[][] | null | undefined) ?? [];
}

export function parseRows<T>(
  rows: string[][],
  mapper: (headers: string[], row: string[]) => T
): T[] {
  if (rows.length < 2) return [];
  const [headers, ...dataRows] = rows;
  return dataRows
    .filter((row) => row.some((cell) => cell?.trim()))
    .map((row) => mapper(headers, row));
}
