import { NextRequest } from "next/server";
import { downloadFileAsBuffer } from "@/lib/google/drive";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  try {
    const buffer = await downloadFileAsBuffer(fileId);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Drive image fetch error:", err);
    return new Response("Not found", { status: 404 });
  }
}
