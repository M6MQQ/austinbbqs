import Link from "next/link";
import type { Restaurant, RestaurantImage } from "@prisma/client";
import { priceLabel, titleizeTag } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { isOpenNow, type WeekHours } from "@/lib/hours";
import { OpenBadge } from "./OpenBadge";

type CardRestaurant = Restaurant & {
  images: RestaurantImage[];
  _count?: { reviews: number };
};

export function RestaurantCard({ r }: { r: CardRestaurant }) {
  const primary =
    r.images.find((i) => i.isPrimary) ?? r.images[0] ?? null;
  const open = isOpenNow(r.hours as WeekHours | null);

  return (
    <Link
      href={`/restaurants/${r.slug}`}
      className="card group overflow-hidden transition hover:border-flame/60 hover:shadow-flame/10"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bark/40">
        {primary ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl(primary.path)}
            alt={r.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-40">
            🍖
          </div>
        )}
        <div className="absolute left-3 top-3">
          <OpenBadge open={open} />
        </div>
        {r.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-ember px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-cream">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl leading-tight text-cream group-hover:text-flame">
            {r.name}
          </h3>
          <span className="shrink-0 font-semibold text-flame">
            {priceLabel(r.priceRange)}
          </span>
        </div>
        <p className="mt-1 text-sm text-cream/60">
          {r.neighborhood || r.city}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-cream/75">
          {r.description}
        </p>
        {r.specialties.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {r.specialties.slice(0, 4).map((s) => (
              <span key={s} className="tag">
                {titleizeTag(s)}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
