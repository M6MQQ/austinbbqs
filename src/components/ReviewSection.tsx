"use client";

import { useState } from "react";
import { Stars } from "./Stars";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
};

export function ReviewSection({
  restaurantId,
  initialReviews,
}: {
  restaurantId: string;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          authorName: name,
          rating,
          body,
        }),
      });
      if (!res.ok) throw new Error("Could not post review");
      const { review } = await res.json();
      setReviews([
        {
          id: review.id,
          authorName: review.authorName,
          rating: review.rating,
          body: review.body,
          createdAt: review.createdAt,
        },
        ...reviews,
      ]);
      setName("");
      setBody("");
      setRating(5);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function flag(id: string) {
    setFlagged((prev) => new Set(prev).add(id));
    await fetch(`/api/reviews/${id}/flag`, { method: "POST" }).catch(() => {});
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-display text-3xl text-cream">Reviews</h2>
        {avg !== null && (
          <span className="flex items-center gap-2 text-cream/70">
            <Stars value={avg} />
            <span>
              {avg.toFixed(1)} · {reviews.length} review
              {reviews.length === 1 ? "" : "s"}
            </span>
          </span>
        )}
      </div>

      <form onSubmit={submit} className="card mb-8 p-5">
        <h3 className="mb-3 font-semibold text-cream">Leave a review</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="rv-name">
              Name (optional)
            </label>
            <input
              id="rv-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anonymous"
              maxLength={80}
            />
          </div>
          <div>
            <label className="label" htmlFor="rv-rating">
              Rating
            </label>
            <select
              id="rv-rating"
              className="input"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)} ({n})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="label" htmlFor="rv-body">
            Your review
          </label>
          <textarea
            id="rv-body"
            className="input min-h-24"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="How was the brisket?"
            maxLength={4000}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="btn-primary mt-3"
          disabled={submitting}
        >
          {submitting ? "Posting…" : "Post review"}
        </button>
      </form>

      {reviews.length === 0 ? (
        <p className="text-cream/60">
          No reviews yet. Be the first to weigh in.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((rv) => (
            <li key={rv.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-cream">
                    {rv.authorName}
                  </span>
                  <Stars value={rv.rating} size="text-sm" />
                </div>
                <span className="text-xs text-cream/40">
                  {new Date(rv.createdAt).toLocaleDateString()}
                </span>
              </div>
              {rv.body && (
                <p className="mt-2 text-cream/80">{rv.body}</p>
              )}
              <button
                onClick={() => flag(rv.id)}
                disabled={flagged.has(rv.id)}
                className="mt-2 text-xs text-cream/40 hover:text-flame disabled:opacity-50"
              >
                {flagged.has(rv.id) ? "Reported" : "Report"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
