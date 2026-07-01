"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { imageUrl } from "@/lib/images";

type Img = {
  id: string;
  path: string;
  caption: string;
  isPrimary: boolean;
};

export function ImageManager({
  restaurantId,
  images,
}: {
  restaurantId: string;
  images: Img[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("restaurantId", restaurantId);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Upload failed");
        break;
      }
    }
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
    setBusy(false);
  }

  async function setPrimary(id: string) {
    await fetch(`/api/admin/images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPrimary: true }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-cream">Photos</h2>
        <label className="btn-ghost cursor-pointer text-sm">
          {busy ? "Uploading…" : "Upload"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={busy}
            onChange={(e) => upload(e.target.files)}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {images.length === 0 ? (
        <p className="mt-3 text-sm text-cream/50">No photos yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-lg border border-bark/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(img.path)}
                alt={img.caption}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex items-center justify-between gap-1 p-2 text-xs">
                {img.isPrimary ? (
                  <span className="tag">Primary</span>
                ) : (
                  <button
                    onClick={() => setPrimary(img.id)}
                    className="text-cream/60 hover:text-flame"
                  >
                    Make primary
                  </button>
                )}
                <button
                  onClick={() => remove(img.id)}
                  className="text-red-300 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
