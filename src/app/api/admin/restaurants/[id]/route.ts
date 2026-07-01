import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { restaurantInput } from "@/lib/validation";
import { uniqueSlug } from "@/lib/restaurants";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!restaurant)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ restaurant });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = restaurantInput.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Regenerate the slug if the name changed.
  let slug = existing.slug;
  if (data.name && data.name !== existing.name) {
    slug = await uniqueSlug(data.name, id);
  }

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: {
      slug,
      name: data.name ?? undefined,
      description: data.description ?? undefined,
      address: data.address ?? undefined,
      neighborhood: data.neighborhood ?? undefined,
      city: data.city ?? undefined,
      lat: data.lat === undefined ? undefined : data.lat,
      lng: data.lng === undefined ? undefined : data.lng,
      phone: data.phone === undefined ? undefined : data.phone,
      website: data.website === undefined ? undefined : data.website,
      priceRange: data.priceRange === undefined ? undefined : data.priceRange,
      hours: data.hours === undefined ? undefined : (data.hours ?? undefined),
      specialties: data.specialties ?? undefined,
      amenities: data.amenities ?? undefined,
      status: data.status ?? undefined,
      featured: data.featured ?? undefined,
      sourceUrls: data.sourceUrls ?? undefined,
    },
  });
  return NextResponse.json({ restaurant });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.restaurant.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
