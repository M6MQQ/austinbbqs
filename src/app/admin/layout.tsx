export const metadata = {
  robots: { index: false, follow: false },
};

// Root admin layout: applies noindex to all /admin routes (including login).
// The authenticated nav lives in the (panel) route group.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
