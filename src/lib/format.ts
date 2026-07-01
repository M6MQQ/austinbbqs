import type { PriceRange } from "@prisma/client";

export function priceLabel(p: PriceRange | null | undefined): string {
  switch (p) {
    case "ONE":
      return "$";
    case "TWO":
      return "$$";
    case "THREE":
      return "$$$";
    case "FOUR":
      return "$$$$";
    default:
      return "";
  }
}

export const PRICE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: "ONE", label: "$" },
  { value: "TWO", label: "$$" },
  { value: "THREE", label: "$$$" },
  { value: "FOUR", label: "$$$$" },
];

export function priceFromDollars(s: string | null | undefined): PriceRange | null {
  switch ((s ?? "").trim()) {
    case "$":
      return "ONE";
    case "$$":
      return "TWO";
    case "$$$":
      return "THREE";
    case "$$$$":
      return "FOUR";
    default:
      return null;
  }
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Titleize a tag like "dog-friendly" -> "Dog Friendly". */
export function titleizeTag(t: string): string {
  return t
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
