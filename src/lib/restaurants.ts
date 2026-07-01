import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";

/** Generate a slug unique among restaurants, ignoring an optional current id. */
export async function uniqueSlug(
  name: string,
  ignoreId?: string,
): Promise<string> {
  const base = slugify(name) || "restaurant";
  let candidate = base;
  let n = 1;
  // Loop until we find a free slug.
  while (true) {
    const existing = await prisma.restaurant.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === ignoreId) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}
