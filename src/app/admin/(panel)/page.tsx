import Link from "next/link";
import { prisma } from "@/lib/db";
import { priceLabel } from "@/lib/format";
import { AdminRestaurantRow } from "@/components/admin/AdminRestaurantRow";
import { FlaggedReviews } from "@/components/admin/FlaggedReviews";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [restaurants, flagged, counts] = await Promise.all([
    prisma.restaurant.findMany({
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      include: {
        _count: { select: { reviews: true, images: true } },
      },
    }),
    prisma.review.findMany({
      where: { flagged: true },
      include: { restaurant: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.restaurant.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const published =
    counts.find((c) => c.status === "PUBLISHED")?._count ?? 0;
  const drafts = counts.find((c) => c.status === "DRAFT")?._count ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-cream">Dashboard</h1>
          <p className="mt-1 text-cream/60">
            {published} published · {drafts} draft
            {drafts === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin/restaurants/new" className="btn-primary">
          + Add restaurant
        </Link>
      </div>

      {flagged.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-2xl text-flame">
            Flagged reviews ({flagged.length})
          </h2>
          <FlaggedReviews
            reviews={flagged.map((r) => ({
              id: r.id,
              authorName: r.authorName,
              rating: r.rating,
              body: r.body,
              flagCount: r.flagCount,
              hidden: r.hidden,
              restaurantName: r.restaurant.name,
            }))}
          />
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 font-display text-2xl text-cream">
          Restaurants ({restaurants.length})
        </h2>
        <div className="overflow-hidden rounded-xl border border-bark/60">
          <table className="w-full text-sm">
            <thead className="bg-char/80 text-left text-cream/60">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Area</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Photos</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bark/40">
              {restaurants.map((r) => (
                <AdminRestaurantRow
                  key={r.id}
                  r={{
                    id: r.id,
                    name: r.name,
                    slug: r.slug,
                    neighborhood: r.neighborhood,
                    city: r.city,
                    price: priceLabel(r.priceRange),
                    images: r._count.images,
                    reviews: r._count.reviews,
                    status: r.status,
                  }}
                />
              ))}
            </tbody>
          </table>
          {restaurants.length === 0 && (
            <p className="px-4 py-6 text-center text-cream/50">
              No restaurants yet. Add one manually or via AI research.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
