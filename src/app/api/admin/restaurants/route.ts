import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { restaurantInput } from "@/lib/validation";
import { uniqueSlug } from "@/lib/restaurants";

// List all restaurants (including drafts) for the admin dashboard.
export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { reviews: true } },
    },
  });
  return NextResponse.json({ restaurants });
}

// Create a restaurant.
export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = restaurantInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const slug = await uniqueSlug(data.name);

  const restaurant = await prisma.restaurant.create({
    data: {
      slug,
      name: data.name,
      description: data.description,
      address: data.address,
      neighborhood: data.neighborhood,
      city: data.city,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      phone: data.phone ?? null,
      website: data.website ?? null,
      priceRange: data.priceRange ?? null,
      hours: data.hours ?? undefined,
      specialties: data.specialties,
      amenities: data.amenities,
      status: data.status ?? "DRAFT",
      featured: data.featured ?? false,
      sourceUrls: data.sourceUrls,
    },
  });
  return NextResponse.json({ restaurant }, { status: 201 });
}
