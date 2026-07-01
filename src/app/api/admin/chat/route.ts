import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  anthropic,
  MODEL,
  SYSTEM_PROMPT,
  RESEARCH_TOOLS,
  geocode,
} from "@/lib/anthropic";
import { prisma } from "@/lib/db";
import { priceFromDollars } from "@/lib/format";
import { uniqueSlug } from "@/lib/restaurants";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_TURNS = 6;

type ClientMessage = { role: "user" | "assistant"; content: string };

// Persist a save_restaurant_draft tool call as a DRAFT restaurant.
async function saveDraft(input: Record<string, unknown>) {
  const name = String(input.name ?? "").trim();
  const address = String(input.address ?? "").trim();
  const description = String(input.description ?? "").trim();

  let lat: number | null = null;
  let lng: number | null = null;
  if (address) {
    const geo = await geocode(address);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
    }
  }

  const slug = await uniqueSlug(name || "restaurant");
  const restaurant = await prisma.restaurant.create({
    data: {
      slug,
      name: name || "Untitled",
      description,
      address,
      neighborhood: String(input.neighborhood ?? ""),
      phone: input.phone ? String(input.phone) : null,
      website: input.website ? String(input.website) : null,
      priceRange: priceFromDollars(
        typeof input.priceRange === "string" ? input.priceRange : null,
      ),
      hours: (input.hours as object) ?? undefined,
      specialties: Array.isArray(input.specialties)
        ? input.specialties.map(String)
        : [],
      amenities: Array.isArray(input.amenities)
        ? input.amenities.map(String)
        : [],
      sourceUrls: Array.isArray(input.sourceUrls)
        ? input.sourceUrls.map(String)
        : [],
      lat,
      lng,
      status: "DRAFT",
    },
  });
  return restaurant;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const clientMessages: ClientMessage[] = Array.isArray(body?.messages)
    ? body.messages
    : [];
  if (!clientMessages.length) {
    return new Response(JSON.stringify({ error: "No messages" }), {
      status: 400,
    });
  }

  const messages: Anthropic.Messages.MessageParam[] = clientMessages.map(
    (m) => ({ role: m.role, content: m.content }),
  );

  const client = anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(obj)}\n\n`),
        );

      try {
        for (let turn = 0; turn < MAX_TURNS; turn++) {
          const modelStream = client.messages.stream({
            model: MODEL,
            max_tokens: 16000,
            system: SYSTEM_PROMPT,
            tools: RESEARCH_TOOLS,
            messages,
          });

          for await (const event of modelStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              send({ type: "text", text: event.delta.text });
            }
            if (
              event.type === "content_block_start" &&
              event.content_block.type === "server_tool_use"
            ) {
              send({ type: "status", text: "Searching the web…" });
            }
          }

          const finalMessage = await modelStream.finalMessage();
          messages.push({ role: "assistant", content: finalMessage.content });

          // Server-side tool loop hit its cap — re-send to continue.
          if (finalMessage.stop_reason === "pause_turn") {
            continue;
          }

          if (finalMessage.stop_reason !== "tool_use") {
            break; // end_turn / refusal / max_tokens
          }

          // Execute client-side tools (save_restaurant_draft).
          const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
          for (const block of finalMessage.content) {
            if (block.type !== "tool_use") continue;
            if (block.name === "save_restaurant_draft") {
              try {
                const restaurant = await saveDraft(
                  block.input as Record<string, unknown>,
                );
                send({ type: "draft", restaurant });
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: `Saved "${restaurant.name}" as a draft (id ${restaurant.id}). It is now pending review in the dashboard.`,
                });
              } catch (err) {
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: `Failed to save draft: ${(err as Error).message}`,
                  is_error: true,
                });
              }
            }
          }

          if (!toolResults.length) break;
          messages.push({ role: "user", content: toolResults });
        }

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", text: (err as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
