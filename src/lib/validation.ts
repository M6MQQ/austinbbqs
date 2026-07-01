import { z } from "zod";

const dayHours = z
  .object({ open: z.string(), close: z.string() })
  .nullable();

export const hoursSchema = z
  .object({
    mon: dayHours.optional(),
    tue: dayHours.optional(),
    wed: dayHours.optional(),
    thu: dayHours.optional(),
    fri: dayHours.optional(),
    sat: dayHours.optional(),
    sun: dayHours.optional(),
  })
  .nullable();

export const restaurantInput = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  address: z.string().default(""),
  neighborhood: z.string().default(""),
  city: z.string().default("Austin"),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  priceRange: z.enum(["ONE", "TWO", "THREE", "FOUR"]).nullable().optional(),
  hours: hoursSchema.optional(),
  specialties: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  featured: z.boolean().optional(),
  sourceUrls: z.array(z.string()).default([]),
});

export type RestaurantInput = z.infer<typeof restaurantInput>;

export const reviewInput = z.object({
  restaurantId: z.string().min(1),
  authorName: z.string().max(80).optional(),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(4000).default(""),
});
