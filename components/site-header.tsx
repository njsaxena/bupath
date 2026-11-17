"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlanner } from "./planner-provider";

const navigation = [
  { href: "/my-semester", label: "My semester" },
  { href: "/find-classes", label: "Find classes" },
  { href: "/academic-info", label: "Academic info" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/my-semester" aria-label="BUPath home">
          <span className="brand-mark" aria-hidden="true">BU</span>
          <span>BUPath</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              aria-current={pathname === item.href ? "page" : undefined}
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="header-settings" href="/academic-info">Edit plan</Link>
      </div>
    </header>
  );
}

export function StorageNotice() {
  const { storageWarning } = usePlanner();
  if (!storageWarning) return null;
  return <p className="storage-warning" role="status">{storageWarning}</p>;
}
