import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// Toggle or set publish status. Body: { status: "DRAFT" | "PUBLISHED" }.
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const next =
    body.status === "PUBLISHED" || body.status === "DRAFT"
      ? body.status
      : existing.status === "PUBLISHED"
        ? "DRAFT"
        : "PUBLISHED";

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: { status: next },
  });
  return NextResponse.json({ restaurant });
}
