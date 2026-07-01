import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-abq py-24 text-center">
      <p className="text-6xl">🔥</p>
      <h1 className="mt-4 font-display text-4xl text-cream">
        This plate&apos;s gone cold
      </h1>
      <p className="mt-2 text-cream/60">
        We couldn&apos;t find what you were looking for.
      </p>
      <Link href="/restaurants" className="btn-primary mt-6">
        Browse all joints
      </Link>
    </div>
  );
}
