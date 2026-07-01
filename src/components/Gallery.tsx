"use client";

import { useState } from "react";
import type { RestaurantImage } from "@prisma/client";
import { imageUrl } from "@/lib/images";

export function Gallery({
  images,
  name,
}: {
  images: RestaurantImage[];
  name: string;
}) {
  const ordered = [...images].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
  );
  const [active, setActive] = useState(0);

  if (ordered.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-bark/30 text-6xl opacity-40">
        🍖
      </div>
    );
  }

  const main = ordered[Math.min(active, ordered.length - 1)];

  return (
    <div>
      <div className="overflow-hidden rounded-xl bg-bark/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl(main.path)}
          alt={main.caption || name}
          className="aspect-[16/9] w-full object-cover"
        />
      </div>
      {main.caption && (
        <p className="mt-2 text-sm text-cream/50">{main.caption}</p>
      )}
      {ordered.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {ordered.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border ${
                i === active ? "border-flame" : "border-bark/60"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(img.path)}
                alt={img.caption || `${name} photo ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
