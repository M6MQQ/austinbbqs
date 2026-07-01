"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stars } from "@/components/Stars";

type FlaggedReview = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  flagCount: number;
  hidden: boolean;
  restaurantName: string;
};

export function FlaggedReviews({ reviews }: { reviews: FlaggedReview[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(id: string, patch: Record<string, unknown>) {
    setBusy(id);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
    setBusy(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setBusy(id);
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(null);
  }

  return (
    <ul className="space-y-3">
      {reviews.map((rv) => (
        <li
          key={rv.id}
          className="card flex flex-wrap items-start justify-between gap-3 p-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-cream">{rv.authorName}</span>
              <Stars value={rv.rating} size="text-sm" />
              <span className="text-xs text-cream/40">
                on {rv.restaurantName} · flagged {rv.flagCount}×
                {rv.hidden ? " · hidden" : ""}
              </span>
            </div>
            {rv.body && <p className="mt-1 text-cream/80">{rv.body}</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => act(rv.id, { flagged: false })}
              disabled={busy === rv.id}
              className="rounded border border-bark/70 px-2 py-1 text-xs hover:border-flame/60"
            >
              Keep (clear flag)
            </button>
            <button
              onClick={() => act(rv.id, { hidden: !rv.hidden, flagged: false })}
              disabled={busy === rv.id}
              className="rounded border border-bark/70 px-2 py-1 text-xs hover:border-flame/60"
            >
              {rv.hidden ? "Unhide" : "Hide"}
            </button>
            <button
              onClick={() => remove(rv.id)}
              disabled={busy === rv.id}
              className="rounded border border-red-800/70 px-2 py-1 text-xs text-red-300 hover:border-red-500"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
