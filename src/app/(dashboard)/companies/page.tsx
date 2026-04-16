"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompaniesPageSkeleton } from "@/components/ui/page-skeletons";
import { formatCurrency, formatPct } from "@/lib/utils";
import { CompanyStats } from "@/types";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"win_rate" | "total_wins" | "total_participations">("total_wins");

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      });
  }, []);

  const filtered = companies
    .filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.sector?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));

  if (loading) {
    return <CompaniesPageSkeleton />;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Companies</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {companies.length} vendors tracked
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <option value="total_wins">Sort: Most Wins</option>
          <option value="win_rate">Sort: Best Win Rate</option>
          <option value="total_participations">Sort: Most Active</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="text-left">Company</th>
              <th className="text-right">Participations</th>
              <th className="text-right">Wins</th>
              <th className="text-right">Win Rate</th>
              <th className="text-right">Avg Bid</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link
                    href={`/companies/${c.id}`}
                    className="font-medium hover:underline"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {c.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    {c.sector && (
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{c.sector}</span>
                    )}
                    {c.region && (
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>· {c.region}</span>
                    )}
                  </div>
                </td>
                <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                  {c.total_participations}
                </td>
                <td className="text-right font-mono text-sm font-medium" style={{ color: c.total_wins > 0 ? "var(--accent)" : "var(--text-secondary)" }}>
                  {c.total_wins}
                </td>
                <td className="text-right">
                  <WinRateBar rate={c.win_rate} />
                </td>
                <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                  {formatCurrency(c.avg_bid)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WinRateBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  const color = pct >= 40 ? "#22d3a0" : pct >= 20 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-8 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}
