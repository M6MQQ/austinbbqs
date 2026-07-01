import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-abq py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-bark/50 pb-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/admin" className="btn-ghost">
            Dashboard
          </Link>
          <Link href="/admin/restaurants/new" className="btn-ghost">
            + New
          </Link>
          <Link href="/admin/chat" className="btn-ghost">
            AI Research
          </Link>
          <Link href="/" className="btn-ghost">
            View site ↗
          </Link>
        </nav>
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
