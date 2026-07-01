export function Stars({
  value,
  size = "text-base",
}: {
  value: number;
  size?: string;
}) {
  const full = Math.round(value);
  return (
    <span className={`${size} tracking-tight text-flame`} aria-label={`${value} out of 5`}>
      {"★".repeat(full)}
      <span className="text-cream/25">{"★".repeat(5 - full)}</span>
    </span>
  );
}
