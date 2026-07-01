import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://austinbbqs.com";
  const restaurants = await prisma.restaurant.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/restaurants`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/map`, changeFrequency: "weekly", priority: 0.7 },
    ...restaurants.map((r) => ({
      url: `${base}/restaurants/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
