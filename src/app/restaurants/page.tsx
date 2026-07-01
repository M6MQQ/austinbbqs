import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { RestaurantCard } from "@/components/RestaurantCard";
import { FilterBar } from "@/components/FilterBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All BBQ Joints",
  description:
    "Browse every BBQ restaurant in Austin. Filter by neighborhood, price, specialty, and amenities.",
};

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const specialty = first(sp.specialty);
  const neighborhood = first(sp.neighborhood);
  const price = first(sp.price);
  const amenity = first(sp.amenity);
  const sort = first(sp.sort) || "featured";

  const where: Prisma.RestaurantWhereInput = { status: "PUBLISHED" };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { neighborhood: { contains: q, mode: "insensitive" } },
    ];
  }
  if (specialty) where.specialties = { has: specialty };
  if (amenity) where.amenities = { has: amenity };
  if (neighborhood) where.neighborhood = neighborhood;
  if (["ONE", "TWO", "THREE", "FOUR"].includes(price))
    where.priceRange = price as Prisma.RestaurantWhereInput["priceRange"];

  const orderBy: Prisma.RestaurantOrderByWithRelationInput[] =
    sort === "name"
      ? [{ name: "asc" }]
      : sort === "newest"
        ? [{ createdAt: "desc" }]
        : [{ featured: "desc" }, { name: "asc" }];

  // All published for filter option lists (small dataset).
  const [restaurants, all] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      orderBy,
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.restaurant.findMany({
      where: { status: "PUBLISHED" },
      select: { specialties: true, amenities: true, neighborhood: true },
    }),
  ]);

  const specialties = [
    ...new Set(all.flatMap((r) => r.specialties)),
  ].sort();
  const amenities = [...new Set(all.flatMap((r) => r.amenities))].sort();
  const neighborhoods = [
    ...new Set(all.map((r) => r.neighborhood).filter(Boolean)),
  ].sort();

  return (
    <div className="container-abq py-10">
      <h1 className="font-display text-4xl text-cream">All BBQ Joints</h1>
      <p className="mt-1 text-cream/60">
        {restaurants.length} joint{restaurants.length === 1 ? "" : "s"} found
      </p>

      <div className="mt-6">
        <FilterBar
          specialties={specialties}
          amenities={amenities}
          neighborhoods={neighborhoods}
          current={{ q, specialty, neighborhood, price, amenity, sort }}
        />
      </div>

      {restaurants.length === 0 ? (
        <p className="mt-10 text-cream/60">
          No joints match your filters. Try widening your search.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
