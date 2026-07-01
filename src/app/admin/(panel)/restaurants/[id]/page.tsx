import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { RestaurantForm } from "@/components/admin/RestaurantForm";
import { ImageManager } from "@/components/admin/ImageManager";
import type { WeekHours } from "@/lib/hours";

export const dynamic = "force-dynamic";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await prisma.restaurant.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!r) notFound();

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-4xl text-cream">Edit Restaurant</h1>
          {r.status === "PUBLISHED" && (
            <Link
              href={`/restaurants/${r.slug}`}
              target="_blank"
              className="btn-ghost text-sm"
            >
              View live ↗
            </Link>
          )}
        </div>
        <RestaurantForm
          initial={{
            id: r.id,
            name: r.name,
            description: r.description,
            address: r.address,
            neighborhood: r.neighborhood,
            city: r.city,
            lat: r.lat,
            lng: r.lng,
            phone: r.phone,
            website: r.website,
            priceRange: r.priceRange,
            hours: r.hours as WeekHours | null,
            specialties: r.specialties,
            amenities: r.amenities,
            status: r.status,
            featured: r.featured,
            sourceUrls: r.sourceUrls,
          }}
        />
      </div>
      <div>
        <ImageManager
          restaurantId={r.id}
          images={r.images.map((i) => ({
            id: i.id,
            path: i.path,
            caption: i.caption,
            isPrimary: i.isPrimary,
          }))}
        />
      </div>
    </div>
  );
}
