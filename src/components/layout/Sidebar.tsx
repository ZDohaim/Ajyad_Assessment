"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    href: "/tenders",
    label: "Tenders",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/companies",
    label: "Companies",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/insights",
    label: "Insights",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 240;
const STORAGE_KEY = "sidebar-collapsed";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapse state
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    // Update CSS variable so layout responds without React context
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${next ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px`
    );
  }

  // Sync CSS variable on mount
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px`
    );
  }, [collapsed]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const w = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40 overflow-hidden"
      style={{
        width: `${w}px`,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Logo + collapse toggle */}
      <div
        className="flex items-center px-4 py-4"
        style={{
          borderBottom: "1px solid var(--border)",
          minHeight: "64px",
          gap: collapsed ? 0 : "10px",
        }}
      >
        {/* Logo icon — always visible */}
        <div className="w-8 h-8 flex-shrink-0 relative">
          <Image
            src="/jyadlogo.png"
            alt="Jyad Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>

        {/* Wordmark — hidden when collapsed */}
        <div
          className="flex-1 min-w-0 overflow-hidden"
          style={{
            opacity: collapsed ? 0 : 1,
            transition: "opacity 150ms ease",
            pointerEvents: collapsed ? "none" : "auto",
          }}
        >
          <div className="text-sm font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
            Tender Tracking
          </div>
          <div className="text-xs whitespace-nowrap" style={{ color: "var(--text-tertiary)" }}>
            Intelligence
          </div>
        </div>

        {/* Collapse toggle — always visible */}
        <button
          onClick={toggle}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          {collapsed ? (
            // Chevrons right
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            // Chevrons left
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <div className="mb-1 px-4">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-tertiary)" }}
            >
              Menu
            </span>
          </div>
        )}
        <div className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className="flex items-center rounded-lg text-sm font-medium transition-colors"
                style={{
                  gap: collapsed ? 0 : "10px",
                  padding: collapsed ? "10px 0" : "9px 10px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  background: active ? "var(--accent-muted)" : "transparent",
                  borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                }}
              >
                {item.icon}
                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div
        className="py-3 overflow-hidden"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="space-y-0.5 px-2">
          <Link
            href="/account"
            title={collapsed ? "Account" : undefined}
            className="flex items-center rounded-lg text-sm font-medium transition-colors"
            style={{
              gap: collapsed ? 0 : "10px",
              padding: collapsed ? "10px 0" : "9px 10px",
              justifyContent: collapsed ? "center" : "flex-start",
              color: pathname === "/account" ? "var(--accent)" : "var(--text-secondary)",
              background: pathname === "/account" ? "var(--accent-muted)" : "transparent",
              borderLeft: pathname === "/account" ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {!collapsed && <span className="whitespace-nowrap">Account</span>}
          </Link>

          <button
            onClick={handleSignOut}
            title={collapsed ? "Sign out" : undefined}
            className="w-full flex items-center rounded-lg text-sm font-medium transition-colors"
            style={{
              gap: collapsed ? 0 : "10px",
              padding: collapsed ? "10px 0" : "9px 10px",
              justifyContent: collapsed ? "center" : "flex-start",
              color: "var(--text-tertiary)",
              borderLeft: "2px solid transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span className="whitespace-nowrap">Sign out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
