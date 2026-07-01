import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// Admin moderation: hide/unhide or clear the flag. Body: { hidden?, flagged? }.
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.review.update({
    where: { id },
    data: {
      hidden: typeof body.hidden === "boolean" ? body.hidden : undefined,
      flagged: typeof body.flagged === "boolean" ? body.flagged : undefined,
    },
  });
  return NextResponse.json({ review: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.review.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
