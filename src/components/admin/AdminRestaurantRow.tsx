"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  city: string;
  price: string;
  images: number;
  reviews: number;
  status: "DRAFT" | "PUBLISHED";
};

export function AdminRestaurantRow({ r }: { r: Row }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    await fetch(`/api/admin/restaurants/${r.id}/publish`, { method: "POST" });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/admin/restaurants/${r.id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <tr className="bg-smoke/40">
      <td className="px-4 py-2 font-medium text-cream">{r.name}</td>
      <td className="px-4 py-2 text-cream/70">{r.neighborhood || r.city}</td>
      <td className="px-4 py-2 text-flame">{r.price}</td>
      <td className="px-4 py-2 text-cream/70">{r.images}</td>
      <td className="px-4 py-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            r.status === "PUBLISHED"
              ? "bg-green-700/70 text-white"
              : "bg-yellow-700/50 text-yellow-100"
          }`}
        >
          {r.status === "PUBLISHED" ? "Published" : "Draft"}
        </span>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={togglePublish}
            disabled={busy}
            className="rounded border border-bark/70 px-2 py-1 text-xs hover:border-flame/60 disabled:opacity-50"
          >
            {r.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </button>
          <Link
            href={`/admin/restaurants/${r.id}`}
            className="rounded border border-bark/70 px-2 py-1 text-xs hover:border-flame/60"
          >
            Edit
          </Link>
          {r.status === "PUBLISHED" && (
            <Link
              href={`/restaurants/${r.slug}`}
              target="_blank"
              className="rounded border border-bark/70 px-2 py-1 text-xs hover:border-flame/60"
            >
              View
            </Link>
          )}
          <button
            onClick={remove}
            disabled={busy}
            className="rounded border border-red-800/70 px-2 py-1 text-xs text-red-300 hover:border-red-500 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
