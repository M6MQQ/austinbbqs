"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Draft = { id: string; name: string };
type Msg = {
  role: "user" | "assistant";
  content: string;
  drafts?: Draft[];
};

export function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const history: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setStatus(null);
    scroll();

    // Only send role/content text back to the server.
    const payload = history.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!res.ok || !res.body) throw new Error("Chat request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const applyToLast = (fn: (m: Msg) => Msg) =>
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = fn(copy[copy.length - 1]);
          return copy;
        });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          let evt: { type: string; text?: string; restaurant?: Draft };
          try {
            evt = JSON.parse(json);
          } catch {
            continue;
          }
          if (evt.type === "text" && evt.text) {
            applyToLast((m) => ({ ...m, content: m.content + evt.text }));
            scroll();
          } else if (evt.type === "status") {
            setStatus(evt.text ?? null);
          } else if (evt.type === "draft" && evt.restaurant) {
            const d = evt.restaurant;
            applyToLast((m) => ({
              ...m,
              drafts: [...(m.drafts ?? []), { id: d.id, name: d.name }],
            }));
            scroll();
          } else if (evt.type === "error") {
            applyToLast((m) => ({
              ...m,
              content: m.content + `\n\n⚠️ ${evt.text}`,
            }));
          } else if (evt.type === "done") {
            setStatus(null);
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `⚠️ ${(err as Error).message}`,
        };
        return copy;
      });
    } finally {
      setBusy(false);
      setStatus(null);
      scroll();
    }
  }

  return (
    <div className="card flex h-[70vh] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-cream/40">
            Start by asking to research a restaurant…
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <div
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-ember/80 text-cream"
                  : "bg-smoke/70 text-cream/90"
              }`}
            >
              {m.content || (busy && i === messages.length - 1 ? "…" : "")}
              {m.drafts?.map((d) => (
                <Link
                  key={d.id}
                  href={`/admin/restaurants/${d.id}`}
                  className="mt-2 flex items-center justify-between gap-2 rounded-md border border-flame/50 bg-flame/10 px-3 py-2 text-flame hover:bg-flame/20"
                >
                  <span>📝 Draft saved: <strong>{d.name}</strong></span>
                  <span className="text-xs">Review →</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {status && (
          <p className="text-xs italic text-cream/50">{status}</p>
        )}
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-bark/50 p-3">
        <input
          className="input"
          placeholder="Research and add Terry Black's Barbecue…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
        />
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
