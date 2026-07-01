"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRICE_OPTIONS } from "@/lib/format";
import { ORDERED_DAYS, DAY_LABELS, type WeekHours } from "@/lib/hours";

export type RestaurantFormValues = {
  id?: string;
  name: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  priceRange: "ONE" | "TWO" | "THREE" | "FOUR" | null;
  hours: WeekHours | null;
  specialties: string[];
  amenities: string[];
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  sourceUrls: string[];
};

const emptyValues: RestaurantFormValues = {
  name: "",
  description: "",
  address: "",
  neighborhood: "",
  city: "Austin",
  lat: null,
  lng: null,
  phone: "",
  website: "",
  priceRange: null,
  hours: null,
  specialties: [],
  amenities: [],
  status: "DRAFT",
  featured: false,
  sourceUrls: [],
};

export function RestaurantForm({
  initial,
}: {
  initial?: RestaurantFormValues;
}) {
  const router = useRouter();
  const v = initial ?? emptyValues;
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(v.name);
  const [description, setDescription] = useState(v.description);
  const [address, setAddress] = useState(v.address);
  const [neighborhood, setNeighborhood] = useState(v.neighborhood);
  const [city, setCity] = useState(v.city);
  const [lat, setLat] = useState(v.lat?.toString() ?? "");
  const [lng, setLng] = useState(v.lng?.toString() ?? "");
  const [phone, setPhone] = useState(v.phone ?? "");
  const [website, setWebsite] = useState(v.website ?? "");
  const [priceRange, setPriceRange] = useState<string>(v.priceRange ?? "");
  const [specialties, setSpecialties] = useState(v.specialties.join(", "));
  const [amenities, setAmenities] = useState(v.amenities.join(", "));
  const [status, setStatus] = useState(v.status);
  const [featured, setFeatured] = useState(v.featured);
  const [hours, setHours] = useState<WeekHours>(v.hours ?? {});

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setDay(day: string, patch: { open?: string; close?: string } | null) {
    setHours((h) => {
      const next = { ...h };
      if (patch === null) {
        next[day] = null;
      } else {
        const cur = next[day] ?? { open: "11:00", close: "20:00" };
        next[day] = { ...cur, ...patch };
      }
      return next;
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      name,
      description,
      address,
      neighborhood,
      city,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      phone: phone || null,
      website: website || null,
      priceRange: priceRange || null,
      hours: Object.keys(hours).length ? hours : null,
      specialties: specialties
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      amenities: amenities
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      status,
      featured,
      sourceUrls: v.sourceUrls,
    };

    const res = await fetch(
      isEdit ? `/api/admin/restaurants/${initial!.id}` : "/api/admin/restaurants",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save");
      setBusy(false);
      return;
    }
    const { restaurant } = await res.json();
    router.push(`/admin/restaurants/${restaurant.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-5">
      {error && (
        <p className="rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name *</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea
            className="input min-h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label className="label">Neighborhood</label>
          <input
            className="input"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label className="label">Latitude</label>
          <input className="input" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="30.2701" />
        </div>
        <div>
          <label className="label">Longitude</label>
          <input className="input" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-97.7312" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="label">Website</label>
          <input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <div>
          <label className="label">Price</label>
          <select className="input" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option value="">—</option>
            {PRICE_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Specialties (comma-separated)</label>
          <input
            className="input"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            placeholder="brisket, pork ribs, sausage"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Amenities (comma-separated)</label>
          <input
            className="input"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            placeholder="patio, byob, dog-friendly"
          />
        </div>
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <span className="text-sm text-cream/80">Feature on homepage</span>
        </label>
      </div>

      <fieldset className="card p-4">
        <legend className="px-1 font-display text-lg text-cream">Hours</legend>
        <div className="space-y-2">
          {ORDERED_DAYS.map((d) => {
            const dh = hours[d];
            const closed = dh === null || dh === undefined ? true : false;
            return (
              <div key={d} className="flex items-center gap-3">
                <span className="w-24 text-sm text-cream/70">{DAY_LABELS[d]}</span>
                <label className="flex items-center gap-1 text-xs text-cream/60">
                  <input
                    type="checkbox"
                    checked={closed}
                    onChange={(e) =>
                      e.target.checked ? setDay(d, null) : setDay(d, {})
                    }
                  />
                  Closed
                </label>
                {!closed && (
                  <>
                    <input
                      type="time"
                      className="input w-32"
                      value={dh?.open ?? "11:00"}
                      onChange={(e) => setDay(d, { open: e.target.value })}
                    />
                    <span className="text-cream/40">–</span>
                    <input
                      type="time"
                      className="input w-32"
                      value={dh?.close ?? "20:00"}
                      onChange={(e) => setDay(d, { close: e.target.value })}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      {v.sourceUrls.length > 0 && (
        <div className="card p-4 text-sm">
          <p className="mb-1 font-medium text-cream/80">AI research sources</p>
          <ul className="list-inside list-disc space-y-0.5 text-cream/60">
            {v.sourceUrls.map((u) => (
              <li key={u}>
                <a href={u} target="_blank" rel="noreferrer" className="text-flame hover:underline break-all">
                  {u}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : isEdit ? "Save changes" : "Create restaurant"}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => router.push("/admin")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
