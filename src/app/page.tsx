import Link from "next/link";
import { prisma } from "@/lib/db";
import { RestaurantCard } from "@/components/RestaurantCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, count] = await Promise.all([
    prisma.restaurant.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.restaurant.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-bark/50">
        <div className="container-abq py-20 sm:py-28 text-center">
          <h1 className="font-display text-5xl sm:text-7xl leading-none text-cream">
            The Best <span className="text-flame">Barbecue</span>
            <br /> in Austin, Texas
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-cream/70">
            {count} smoke-kissed joints, ranked and mapped. Brisket, beef ribs,
            sausage, and the sides worth the wait — find your next plate.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/restaurants" className="btn-primary text-base">
              Browse all joints
            </Link>
            <Link href="/map" className="btn-ghost text-base">
              Open the map
            </Link>
          </div>
        </div>
      </section>

      <section className="container-abq py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl text-cream">Featured Joints</h2>
          <Link
            href="/restaurants"
            className="text-sm font-medium text-flame hover:underline"
          >
            View all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-cream/60">
            No featured joints yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
