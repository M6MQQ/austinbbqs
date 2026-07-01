import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { saveImage, extensionForMime, uploadDir } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

// Diagnostic: confirm the upload directory resolves and is writable.
export async function GET() {
  const dir = uploadDir();
  try {
    await fs.mkdir(dir, { recursive: true });
    const probe = path.join(dir, ".write-test");
    await fs.writeFile(probe, "ok");
    await fs.rm(probe, { force: true });
    return NextResponse.json({ dir, writable: true });
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    return NextResponse.json({ dir, writable: false, code: e.code ?? null, error: e.message });
  }
}

export async function POST(req: NextRequest) {
  // Track progress so any failure reports exactly which step threw.
  let stage = "parse_form";
  try {
    const form = await req.formData();
    const file = form.get("file");
    const restaurantId = form.get("restaurantId");
    const caption = (form.get("caption") as string) ?? "";

    stage = "validate";
    // Don't use `instanceof File` — the File global is absent on Node < 20.
    // A FormData value is either a string or a File/Blob-like object.
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (typeof restaurantId !== "string" || !restaurantId) {
      return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
    }
    if (!extensionForMime(file.type)) {
      return NextResponse.json(
        { error: `Unsupported type: ${file.type}` },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 12MB)" }, { status: 400 });
    }

    stage = "db_lookup";
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { images: true },
    });
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    stage = "write_file";
    const buffer = Buffer.from(await file.arrayBuffer());
    const { relPath } = await saveImage(buffer, file.type);

    stage = "db_create";
    const isFirst = restaurant.images.length === 0;
    const image = await prisma.restaurantImage.create({
      data: {
        restaurantId,
        path: relPath,
        caption,
        isPrimary: isFirst,
        sortOrder: restaurant.images.length,
      },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (err) {
    // Surface the real cause + failing stage so misconfig is diagnosable.
    const e = err as NodeJS.ErrnoException;
    const dir = uploadDir();
    console.error("Image upload failed", {
      stage,
      dir,
      code: e.code,
      message: e.message,
    });

    let hint = "";
    if (e.code === "EACCES" || e.code === "EROFS") {
      hint = ` The app cannot write to "${dir}". On Railway, attach a Volume mounted at the parent of this path (e.g. mount "/data" when UPLOAD_DIR=/data/uploads) and redeploy.`;
    } else if (e.code === "ENOENT" && stage === "write_file") {
      hint = ` The directory "${dir}" does not exist and could not be created.`;
    }

    return NextResponse.json(
      {
        error: `Upload failed at "${stage}": ${e.message}${hint}`,
        stage,
        code: e.code ?? null,
        dir,
      },
      { status: 500 },
    );
  }
}
