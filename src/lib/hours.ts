export type DayHours = { open: string; close: string } | null;
export type WeekHours = Partial<Record<string, DayHours>>;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export const DAY_LABELS: Record<string, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

export const ORDERED_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Current time parts in America/Chicago (Austin's timezone), TZ-safe on the server. */
function austinNow(): { dayKey: string; minutes: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  let hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10,
  );
  const dayKey = weekday.slice(0, 3).toLowerCase();
  return { dayKey, minutes: hour * 60 + minute };
}

function toMinutes(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/** Returns true if the restaurant is currently open based on its weekly hours. */
export function isOpenNow(hours: WeekHours | null | undefined): boolean {
  if (!hours) return false;
  const { dayKey, minutes } = austinNow();
  const today = hours[dayKey];
  if (!today) return false;
  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  if (open === null || close === null) return false;
  if (close <= open) return minutes >= open; // treat as "until late"
  return minutes >= open && minutes < close;
}

export function formatTime(t: string): string {
  const mins = toMinutes(t);
  if (mins === null) return t;
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export { DAY_KEYS };
