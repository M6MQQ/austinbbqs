import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { reviewInput } from "@/lib/validation";

// Public: create a review. Shown immediately (moderated-after via flagging).
export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = reviewInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: data.restaurantId },
    select: { id: true, status: true },
  });
  if (!restaurant || restaurant.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      restaurantId: data.restaurantId,
      authorName: (data.authorName || "").trim() || "Anonymous",
      rating: data.rating,
      body: data.body.trim(),
    },
  });
  return NextResponse.json({ review }, { status: 201 });
}
