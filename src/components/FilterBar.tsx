"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { titleizeTag, PRICE_OPTIONS } from "@/lib/format";

type Current = {
  q: string;
  specialty: string;
  neighborhood: string;
  price: string;
  amenity: string;
  sort: string;
};

export function FilterBar({
  specialties,
  amenities,
  neighborhoods,
  current,
}: {
  specialties: string[];
  amenities: string[];
  neighborhoods: string[];
  current: Current;
}) {
  const router = useRouter();
  const [q, setQ] = useState(current.q);

  const apply = useCallback(
    (patch: Partial<Current>) => {
      const next = { ...current, ...patch };
      const params = new URLSearchParams();
      if (next.q) params.set("q", next.q);
      if (next.specialty) params.set("specialty", next.specialty);
      if (next.neighborhood) params.set("neighborhood", next.neighborhood);
      if (next.price) params.set("price", next.price);
      if (next.amenity) params.set("amenity", next.amenity);
      if (next.sort && next.sort !== "featured") params.set("sort", next.sort);
      router.push(`/restaurants?${params.toString()}`);
    },
    [current, router],
  );

  return (
    <div className="card p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="label" htmlFor="q">
            Search
          </label>
          <input
            id="q"
            className="input"
            placeholder="Franklin, brisket, East Austin…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          label="Specialty"
          value={current.specialty}
          onChange={(v) => apply({ specialty: v })}
          options={specialties}
        />
        <Select
          label="Neighborhood"
          value={current.neighborhood}
          onChange={(v) => apply({ neighborhood: v })}
          options={neighborhoods}
          raw
        />
        <div>
          <span className="label">Price</span>
          <select
            className="input"
            value={current.price}
            onChange={(e) => apply({ price: e.target.value })}
          >
            <option value="">Any</option>
            {PRICE_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <Select
          label="Amenity"
          value={current.amenity}
          onChange={(v) => apply({ amenity: v })}
          options={amenities}
        />
        <div>
          <span className="label">Sort</span>
          <select
            className="input"
            value={current.sort}
            onChange={(e) => apply({ sort: e.target.value })}
          >
            <option value="featured">Featured</option>
            <option value="name">Name (A–Z)</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {(current.q ||
        current.specialty ||
        current.neighborhood ||
        current.price ||
        current.amenity) && (
        <button
          className="mt-3 text-sm text-flame hover:underline"
          onClick={() => {
            setQ("");
            router.push("/restaurants");
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  raw = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  raw?: boolean;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {raw ? o : titleizeTag(o)}
          </option>
        ))}
      </select>
    </div>
  );
}
