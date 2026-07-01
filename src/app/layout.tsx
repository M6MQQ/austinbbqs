import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://austinbbqs.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Austin BBQ — The Best Barbecue in Austin, Texas",
    template: "%s · Austin BBQ",
  },
  description:
    "A curated guide to the best BBQ joints in Austin, Texas. Find brisket, ribs, and sausage by neighborhood, price, and specialty.",
  openGraph: {
    title: "Austin BBQ",
    description:
      "A curated guide to the best BBQ joints in Austin, Texas.",
    url: siteUrl,
    siteName: "Austin BBQ",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-bark/50 bg-smoke/80 backdrop-blur">
          <div className="container-abq flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="font-display text-2xl tracking-wide text-flame">
                Austin BBQ
              </span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-3 text-sm font-medium">
              <Link href="/restaurants" className="btn-ghost">
                All Joints
              </Link>
              <Link href="/map" className="btn-ghost">
                Map
              </Link>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <footer className="border-t border-bark/50 py-8 text-center text-sm text-cream/50">
          <div className="container-abq">
            <p>
              © {new Date().getFullYear()} austinbbqs.com — smoked with love in
              Austin, TX.
            </p>
            <p className="mt-1">
              <Link href="/admin" className="hover:text-flame">
                Admin
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
