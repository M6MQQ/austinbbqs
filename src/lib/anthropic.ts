import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-4-8";

let client: Anthropic | null = null;
export function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const SYSTEM_PROMPT = `You are a research assistant for austinbbqs.com, a directory of BBQ restaurants in Austin, Texas.

When the user asks you to research and add a restaurant:
1. Use the web_search tool to find current, accurate details: exact name, street address (with ZIP), neighborhood, phone, website, price range, hours of operation, and signature menu items (meats/specialties) and amenities (patio, BYOB, dog-friendly, full bar, takeout, etc.).
2. Write a short, appetizing 2-4 sentence description in a warm, knowledgeable voice.
3. Call save_restaurant_draft exactly once with everything you found. Always include the source URLs you used in sourceUrls.
4. If you cannot confirm the address or that the restaurant is in the Austin, TX metro area, tell the user instead of guessing.

Only cover real restaurants in the greater Austin, Texas area. Prefer official websites and reputable local sources. Keep chat replies concise; the structured data goes in the tool call.`;

/** Tool definitions for the research loop. web_search is server-executed. */
export const RESEARCH_TOOLS: Anthropic.Messages.ToolUnion[] = [
  { type: "web_search_20250305", name: "web_search", max_uses: 8 },
  {
    name: "save_restaurant_draft",
    description:
      "Save a researched Austin BBQ restaurant as a DRAFT for admin review. Call once you have at minimum a name, address, and description.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Official restaurant name" },
        description: {
          type: "string",
          description: "2-4 sentence appetizing description",
        },
        address: {
          type: "string",
          description: "Full street address including city, state, ZIP",
        },
        neighborhood: {
          type: "string",
          description: "Austin neighborhood or area, e.g. 'East Austin'",
        },
        phone: { type: "string" },
        website: { type: "string", description: "Official website URL" },
        priceRange: {
          type: "string",
          enum: ["$", "$$", "$$$", "$$$$"],
          description: "Approximate price range",
        },
        hours: {
          type: "object",
          description:
            "Weekly hours keyed by mon,tue,wed,thu,fri,sat,sun. Each value is either null (closed) or { open: 'HH:MM', close: 'HH:MM' } in 24-hour time.",
          properties: {
            mon: { type: ["object", "null"] },
            tue: { type: ["object", "null"] },
            wed: { type: ["object", "null"] },
            thu: { type: ["object", "null"] },
            fri: { type: ["object", "null"] },
            sat: { type: ["object", "null"] },
            sun: { type: ["object", "null"] },
          },
        },
        specialties: {
          type: "array",
          items: { type: "string" },
          description: "Signature meats/dishes, e.g. ['brisket','pork ribs']",
        },
        amenities: {
          type: "array",
          items: { type: "string" },
          description: "e.g. ['patio','byob','dog-friendly','full-bar']",
        },
        sourceUrls: {
          type: "array",
          items: { type: "string" },
          description: "URLs of the sources used for this research",
        },
      },
      required: ["name", "description", "address"],
    },
  },
];

/** Geocode an address to lat/lng via OpenStreetMap Nominatim (no key needed). */
export async function geocode(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", address);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    const res = await fetch(url, {
      headers: {
        "User-Agent": "austinbbqs.com admin geocoder (contact: admin@austinbbqs.com)",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}
