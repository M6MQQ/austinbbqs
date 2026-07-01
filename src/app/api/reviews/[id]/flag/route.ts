import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// Public: flag a review for admin moderation.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.review.update({
    where: { id },
    data: { flagged: true, flagCount: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
}
