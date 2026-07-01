import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { priceLabel, titleizeTag } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import {
  isOpenNow,
  formatTime,
  ORDERED_DAYS,
  DAY_LABELS,
  type WeekHours,
} from "@/lib/hours";
import { OpenBadge } from "@/components/OpenBadge";
import { Gallery } from "@/components/Gallery";
import { ReviewSection } from "@/components/ReviewSection";
import { MapEmbed } from "@/components/MapEmbed";

export const dynamic = "force-dynamic";

async function getRestaurant(slug: string) {
  return prisma.restaurant.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) return { title: "Not found" };
  const primary = r.images.find((i) => i.isPrimary) ?? r.images[0];
  return {
    title: r.name,
    description: r.description.slice(0, 160),
    openGraph: {
      title: `${r.name} · Austin BBQ`,
      description: r.description.slice(0, 200),
      images: primary ? [imageUrl(primary.path)] : undefined,
    },
  };
}

export default async function RestaurantDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRestaurant(slug);
  if (!r) notFound();

  const hours = r.hours as WeekHours | null;
  const open = isOpenNow(hours);
  const avg =
    r.reviews.length > 0
      ? r.reviews.reduce((s, rv) => s + rv.rating, 0) / r.reviews.length
      : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://austinbbqs.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    servesCuisine: "Barbecue",
    description: r.description,
    url: `${siteUrl}/restaurants/${r.slug}`,
    telephone: r.phone ?? undefined,
    priceRange: priceLabel(r.priceRange) || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: r.address,
      addressLocality: r.city,
      addressRegion: "TX",
    },
    geo:
      r.lat && r.lng
        ? { "@type": "GeoCoordinates", latitude: r.lat, longitude: r.lng }
        : undefined,
    aggregateRating:
      avg !== null
        ? {
            "@type": "AggregateRating",
            ratingValue: avg.toFixed(1),
            reviewCount: r.reviews.length,
          }
        : undefined,
  };

  return (
    <article className="container-abq py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <OpenBadge open={open} />
        {r.featured && <span className="tag">Featured</span>}
        <span className="text-sm text-cream/60">{r.neighborhood || r.city}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-5xl text-cream">{r.name}</h1>
        <span className="text-2xl font-semibold text-flame">
          {priceLabel(r.priceRange)}
        </span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Gallery images={r.images} name={r.name} />

          <p className="mt-6 text-lg leading-relaxed text-cream/85">
            {r.description}
          </p>

          {r.specialties.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 font-display text-xl text-cream">
                Specialties
              </h2>
              <div className="flex flex-wrap gap-2">
                {r.specialties.map((s) => (
                  <span key={s} className="tag">
                    {titleizeTag(s)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {r.amenities.length > 0 && (
            <div className="mt-5">
              <h2 className="mb-2 font-display text-xl text-cream">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {r.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-bark/70 bg-char/60 px-2.5 py-0.5 text-xs text-cream/80"
                  >
                    {titleizeTag(a)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {r.lat && r.lng && (
            <div className="mt-8">
              <h2 className="mb-3 font-display text-xl text-cream">Location</h2>
              <MapEmbed
                points={[
                  {
                    id: r.id,
                    name: r.name,
                    slug: r.slug,
                    lat: r.lat,
                    lng: r.lng,
                    neighborhood: r.neighborhood,
                    price: priceLabel(r.priceRange),
                  },
                ]}
                height="360px"
                zoom={15}
                center={[r.lat, r.lng]}
              />
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 font-display text-xl text-cream">Details</h2>
            <dl className="space-y-2 text-sm">
              {r.address && (
                <div>
                  <dt className="text-cream/50">Address</dt>
                  <dd className="text-cream/90">{r.address}</dd>
                </div>
              )}
              {r.phone && (
                <div>
                  <dt className="text-cream/50">Phone</dt>
                  <dd>
                    <a
                      href={`tel:${r.phone}`}
                      className="text-flame hover:underline"
                    >
                      {r.phone}
                    </a>
                  </dd>
                </div>
              )}
              {r.website && (
                <div>
                  <dt className="text-cream/50">Website</dt>
                  <dd>
                    <a
                      href={r.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-flame hover:underline"
                    >
                      {r.website.replace(/^https?:\/\//, "")}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {hours && (
            <div className="card p-5">
              <h2 className="mb-3 font-display text-xl text-cream">Hours</h2>
              <ul className="space-y-1 text-sm">
                {ORDERED_DAYS.map((d) => {
                  const dh = hours[d];
                  return (
                    <li key={d} className="flex justify-between">
                      <span className="text-cream/60">{DAY_LABELS[d]}</span>
                      <span className="text-cream/90">
                        {dh
                          ? `${formatTime(dh.open)} – ${formatTime(dh.close)}`
                          : "Closed"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <div className="mt-12">
        <ReviewSection
          restaurantId={r.id}
          initialReviews={r.reviews.map((rv) => ({
            id: rv.id,
            authorName: rv.authorName,
            rating: rv.rating,
            body: rv.body,
            createdAt: rv.createdAt.toISOString(),
          }))}
        />
      </div>
    </article>
  );
}
