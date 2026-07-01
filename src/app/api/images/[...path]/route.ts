import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { resolveImagePath, contentTypeForPath } from "@/lib/storage";

export const runtime = "nodejs";

type Params = { params: Promise<{ path: string[] }> };

// Streams an uploaded image from the Railway Volume.
export async function GET(_req: NextRequest, { params }: Params) {
  const { path: segments } = await params;
  const relPath = segments.join("/");
  const resolved = resolveImagePath(relPath);
  if (!resolved) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  try {
    const data = await fs.readFile(resolved);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypeForPath(resolved),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
