import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteImage } from "@/lib/storage";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

// Delete an image (file + record). If it was primary, promote the next one.
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const image = await prisma.restaurantImage.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ ok: true });

  await deleteImage(image.path);
  await prisma.restaurantImage.delete({ where: { id } });

  if (image.isPrimary) {
    const next = await prisma.restaurantImage.findFirst({
      where: { restaurantId: image.restaurantId },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.restaurantImage.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }
  return NextResponse.json({ ok: true });
}

// Update caption / primary flag. Body: { caption?, isPrimary? }.
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const image = await prisma.restaurantImage.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.isPrimary === true) {
    // Only one primary per restaurant.
    await prisma.restaurantImage.updateMany({
      where: { restaurantId: image.restaurantId },
      data: { isPrimary: false },
    });
  }

  const updated = await prisma.restaurantImage.update({
    where: { id },
    data: {
      caption: typeof body.caption === "string" ? body.caption : undefined,
      isPrimary: typeof body.isPrimary === "boolean" ? body.isPrimary : undefined,
    },
  });
  return NextResponse.json({ image: updated });
}
