import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveImage, extensionForMime } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Expected multipart form" }, { status: 400 });
  }
  const file = form.get("file");
  const restaurantId = form.get("restaurantId");
  const caption = (form.get("caption") as string) ?? "";

  if (!(file instanceof File)) {
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

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { images: true },
  });
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { relPath } = await saveImage(buffer, file.type);

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
}
