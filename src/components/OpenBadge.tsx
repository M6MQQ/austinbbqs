export function OpenBadge({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        open
          ? "bg-green-600/90 text-white"
          : "bg-black/70 text-cream/70"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${open ? "bg-white" : "bg-cream/50"}`}
      />
      {open ? "Open now" : "Closed"}
    </span>
  );
}
