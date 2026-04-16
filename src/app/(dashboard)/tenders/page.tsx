"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/tenders/StatusBadge";
import { TendersPageSkeleton } from "@/components/ui/page-skeletons";
import { formatCurrency, formatDate, competitionLevel } from "@/lib/utils";
import { TenderStatus } from "@/types";

interface TenderRow {
  id: string;
  title: string;
  agency: string;
  sector: string;
  region: string;
  status: TenderStatus;
  deadline: string | null;
  bidder_count: number;
  winning_bid: number | null;
}

const SECTORS = ["IT", "Construction", "Healthcare", "Transport", "Energy", "Consulting", "Facilities", "Defence"];
const STATUSES = ["active", "awarded", "expired"];

function TendersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tenders, setTenders] = useState<TenderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencies, setAgencies] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  const agency = searchParams.get("agency") || "";
  const sector = searchParams.get("sector") || "";
  const region = searchParams.get("region") || "";
  const status = searchParams.get("status") || "";

  // Load filter options once on mount
  useEffect(() => {
    fetch("/api/tenders")
      .then((r) => r.json())
      .then((data: TenderRow[]) => {
        setAgencies([...new Set(data.map((t) => t.agency))].sort() as string[]);
        setRegions([...new Set(data.map((t) => t.region))].sort() as string[]);
      });
  }, []);

  const fetchTenders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (agency) params.set("agency", agency);
    if (sector) params.set("sector", sector);
    if (region) params.set("region", region);
    if (status) params.set("status", status);

    const res = await fetch(`/api/tenders?${params.toString()}`);
    const data = await res.json();
    setTenders(data);
    setLoading(false);
  }, [agency, sector, region, status]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/tenders?${params.toString()}`);
  }

  if (loading) {
    return <TendersPageSkeleton />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Tenders</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {tenders.length} opportunities
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { key: "agency", label: "Agency", options: agencies, value: agency },
          { key: "sector", label: "Sector", options: SECTORS, value: sector },
          { key: "region", label: "Region", options: regions, value: region },
          { key: "status", label: "Status", options: STATUSES, value: status },
        ].map((f) => (
          <div key={f.key} className="relative">
            <select
              value={f.value}
              onChange={(e) => setFilter(f.key, e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm cursor-pointer outline-none"
              style={{
                background: f.value ? "var(--accent-muted)" : "var(--surface)",
                border: `1px solid ${f.value ? "var(--accent)" : "var(--border)"}`,
                color: f.value ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              <option value="">{f.label}: All</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              <svg className="w-3.5 h-3.5" style={{ color: f.value ? "var(--accent)" : "var(--text-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ))}

        {(agency || sector || region || status) && (
          <button
            onClick={() => router.push("/tenders")}
            className="px-3 py-2 rounded-lg text-sm transition-all"
            style={{ color: "var(--text-secondary)", border: "1px solid var(--border)", background: "var(--surface)" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {tenders.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "var(--text-secondary)" }}>
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No tenders match your filters</p>
            <button onClick={() => router.push("/tenders")} className="mt-2 text-sm" style={{ color: "var(--accent)" }}>
              Clear filters
            </button>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Title</th>
                <th className="text-left">Agency</th>
                <th className="text-left">Sector</th>
                <th className="text-left">Status</th>
                <th className="text-left">Deadline</th>
                <th className="text-right">Bidders</th>
                <th className="text-right">Winning Bid</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((t) => {
                const comp = competitionLevel(t.bidder_count);
                return (
                  <tr key={t.id}>
                    <td style={{ maxWidth: "300px" }}>
                      <Link
                        href={`/tenders/${t.id}`}
                        className="font-medium hover:underline line-clamp-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {t.title}
                      </Link>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{t.region}</div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{t.agency}</td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--background)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                        {t.sector}
                      </span>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="text-sm" style={{ color: "var(--text-secondary)" }}>{formatDate(t.deadline)}</td>
                    <td className="text-right">
                      <span className={`text-sm font-mono font-medium ${comp.color}`}>
                        {t.bidder_count}
                      </span>
                    </td>
                    <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                      {formatCurrency(t.winning_bid)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function TendersPage() {
  return (
    <Suspense fallback={<TendersPageSkeleton />}>
      <TendersContent />
    </Suspense>
  );
}
