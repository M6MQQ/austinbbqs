import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { MapEmbed } from "@/components/MapEmbed";
import { priceLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BBQ Map",
  description: "Every Austin BBQ joint on one map.",
};

export default async function MapPage() {
  const restaurants = await prisma.restaurant.findMany({
    where: { status: "PUBLISHED", lat: { not: null }, lng: { not: null } },
    select: {
      id: true,
      name: true,
      slug: true,
      lat: true,
      lng: true,
      neighborhood: true,
      priceRange: true,
    },
  });

  const points = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    lat: r.lat!,
    lng: r.lng!,
    neighborhood: r.neighborhood,
    price: priceLabel(r.priceRange),
  }));

  return (
    <div className="container-abq py-10">
      <h1 className="font-display text-4xl text-cream">BBQ Map</h1>
      <p className="mt-1 text-cream/60">
        {points.length} joint{points.length === 1 ? "" : "s"} plotted across
        Austin.
      </p>
      <div className="mt-6">
        <MapEmbed points={points} />
      </div>
    </div>
  );
}
