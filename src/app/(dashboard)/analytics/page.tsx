"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalyticsPageSkeleton } from "@/components/ui/page-skeletons";
import { formatCurrency, formatPct, competitionLevel } from "@/lib/utils";
import { AnalyticsData, CompanyStats } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const SECTORS = ["IT", "Construction", "Healthcare", "Transport", "Energy", "Consulting", "Facilities", "Defence"];

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("");
  const [agency, setAgency] = useState("");
  const [agencies, setAgencies] = useState<string[]>([]);

  useEffect(() => {
    // Load agencies from tenders
    fetch("/api/tenders")
      .then((r) => r.json())
      .then((tenders) => {
        const unique = [...new Set(tenders.map((t: { agency: string }) => t.agency))].sort() as string[];
        setAgencies(unique);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sector) params.set("sector", sector);
    if (agency) params.set("agency", agency);
    fetch(`/api/analytics?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [sector, agency]);

  if (loading) {
    return <AnalyticsPageSkeleton />;
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Market-level competitive intelligence</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-8">
        <FilterSelect label="Sector" value={sector} options={SECTORS} onChange={setSector} />
        <FilterSelect label="Agency" value={agency} options={agencies} onChange={setAgency} />
        {(sector || agency) && (
          <button onClick={() => { setSector(""); setAgency(""); }} className="px-3 py-2 rounded-lg text-sm" style={{ color: "var(--text-tertiary)", border: "1px solid var(--border)" }}>
            Clear
          </button>
        )}
      </div>

      {data ? (
        <div className="space-y-8">
          {/* Section 1: Top Companies */}
          <Section title="Top Performing Companies" subtitle="Ranked by number of wins">
            <TopCompaniesSection companies={data.top_companies} />
          </Section>

          {/* Section 2: Competitive Density */}
          <Section title="Competitive Density" subtitle="Tenders ranked by number of bidders">
            <DensitySection density={data.density} onTenderClick={(id) => router.push(`/tenders/${id}`)} />
          </Section>

          {/* Section 3: Pricing Analysis */}
          <Section title="Pricing Analysis" subtitle="Price spread and variance by tender">
            <PricingSection pricing={data.pricing} />
          </Section>
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="px-5 py-4" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
      </div>
      <div style={{ background: "var(--surface)" }}>{children}</div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm cursor-pointer outline-none"
        style={{
          background: value ? "var(--accent-muted)" : "var(--surface)",
          border: `1px solid ${value ? "var(--accent)" : "var(--border)"}`,
          color: value ? "var(--accent)" : "var(--text-secondary)",
        }}
      >
        <option value="">{label}: All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function TopCompaniesSection({ companies }: { companies: CompanyStats[] }) {
  const top10 = companies.slice(0, 10);
  return (
    <div className="p-5">
      <div dir="ltr">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={top10} layout="vertical" barSize={14} margin={{ left: 32, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={180}
            />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(v: number) => [v, "Wins"]}
            />
            <Bar dataKey="total_wins" radius={[0, 4, 4, 0]} fill="var(--accent)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 overflow-x-auto">
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
            {top10.map((c) => (
              <tr key={c.id}>
                <td><span style={{ color: "var(--text-primary)" }}>{c.name}</span></td>
                <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{c.total_participations}</td>
                <td className="text-right font-mono text-sm font-medium" style={{ color: "var(--accent)" }}>{c.total_wins}</td>
                <td className="text-right text-sm" style={{ color: "var(--text-secondary)" }}>{formatPct(c.win_rate)}</td>
                <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{formatCurrency(c.avg_bid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DensitySection({ density, onTenderClick }: { density: AnalyticsData["density"]; onTenderClick: (id: string) => void }) {
  const top30 = density.slice(0, 30);
  return (
    <div className="p-5">
      <div className="flex items-center gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#ef4444" }} /> High (&gt;8)
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#f59e0b" }} /> Medium (4-8)
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#22d3a0" }} /> Low (&lt;4)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={top30} barSize={12}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="title" hide />
          <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            formatter={(v: number) => [v, "Bidders"]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.title ?? ""}
          />
          <Bar
            dataKey="bidder_count"
            radius={[4, 4, 0, 0]}
            cursor="pointer"
            onClick={(d) => onTenderClick(d.tender_id)}
          >
            {top30.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.bidder_count > 8 ? "#ef4444" : entry.bidder_count >= 4 ? "#f59e0b" : "#22d3a0"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PricingSection({ pricing }: { pricing: AnalyticsData["pricing"] }) {
  const [sortPct, setSortPct] = useState(true);
  const sorted = [...pricing].sort((a, b) =>
    sortPct ? b.spread_pct - a.spread_pct : b.spread - a.spread
  );

  return (
    <div>
      <div className="px-5 py-2 flex justify-end" style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setSortPct(!sortPct)}
          className="text-xs px-3 py-1 rounded-md"
          style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          Sort by {sortPct ? "Spread %" : "Spread SAR"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="text-left">Tender</th>
              <th className="text-right">Min Bid</th>
              <th className="text-right">Winning Bid</th>
              <th className="text-right">Max Bid</th>
              <th className="text-right">Spread</th>
              <th className="text-right">Spread %</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 30).map((p) => (
              <tr key={p.tender_id}>
                <td>
                  <div className="font-medium line-clamp-1" style={{ color: "var(--text-primary)", maxWidth: "250px" }}>{p.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{p.agency}</div>
                </td>
                <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{formatCurrency(p.min_bid)}</td>
                <td className="text-right font-mono text-sm font-medium" style={{ color: "var(--accent)" }}>{formatCurrency(p.winning_bid)}</td>
                <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{formatCurrency(p.max_bid)}</td>
                <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{formatCurrency(p.spread)}</td>
                <td className="text-right">
                  <span className="text-xs font-mono font-medium" style={{ color: p.spread_pct > 50 ? "#ef4444" : p.spread_pct > 25 ? "#f59e0b" : "var(--text-secondary)" }}>
                    {p.spread_pct.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
