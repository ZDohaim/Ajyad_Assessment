"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CompanyDetailSkeleton } from "@/components/ui/page-skeletons";
import { formatCurrency, formatDate, formatPct } from "@/lib/utils";
import { BidOutcomeDistribution, TenderStatus } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CompanyDetail {
  id: string;
  name: string;
  sector: string;
  region: string;
  total_participations: number;
  total_wins: number;
  win_rate: number;
  avg_bid: number;
  avg_rank: number | null;
  bid_distribution: BidOutcomeDistribution;
  proposals: Array<{
    id: string;
    tender_id: string;
    bid_amount: number;
    is_winner: boolean;
    rank: number | null;
    submitted_at: string | null;
    tender: {
      id: string;
      title: string;
      agency: string;
      sector: string;
      status: TenderStatus;
      deadline: string;
    } | null;
  }>;
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCompany(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <CompanyDetailSkeleton />;
  }

  if (!company) {
    return <div className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>Company not found</div>;
  }

  const chartData = company.proposals.slice(0, 20).reverse().map((p) => ({
    name: (p.tender?.title?.slice(0, 20) ?? "Unknown") + "...",
    bid: p.bid_amount,
    won: p.is_winner,
  }));

  const stats = [
    { label: "Participations", value: company.total_participations },
    { label: "Total Wins", value: company.total_wins, accent: true },
    { label: "Win Rate", value: formatPct(company.win_rate), accent: company.win_rate > 0.3 },
    { label: "Avg Bid", value: formatCurrency(company.avg_bid) },
    {
      label: "Avg Rank",
      value: company.avg_rank ? company.avg_rank.toFixed(1) : "—",
    },
  ];

  const distributionTotal = company.bid_distribution.evaluated_count;

  return (
    <div className="p-8 max-w-5xl">
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Back to Companies
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{company.name}</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {company.sector} · {company.region}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderTop: s.accent ? "2px solid var(--accent)" : "2px solid var(--border)",
            }}
          >
            <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
              {s.label}
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: s.accent ? "var(--accent)" : "var(--text-primary)" }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-secondary)" }}>
              Bid vs Winner Distribution
            </h2>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Shows where this company&apos;s bids land relative to the winner across evaluated tenders.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
              Evaluated
            </div>
            <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {distributionTotal}
            </div>
          </div>
        </div>

        {distributionTotal > 0 ? (
          <>
            <div className="flex h-3 overflow-hidden rounded-full mb-4" style={{ background: "var(--surface-elevated)" }}>
              {company.bid_distribution.buckets.map((bucket) => (
                <div
                  key={bucket.key}
                  title={`${bucket.label}: ${bucket.count}`}
                  style={{
                    width: `${bucket.percentage * 100}%`,
                    background:
                      bucket.key === "won"
                        ? "var(--accent)"
                        : bucket.key === "lowest_lost"
                          ? "#0F766E"
                          : bucket.key === "close_lost"
                            ? "#D97706"
                            : "#B45309",
                    minWidth: bucket.count > 0 ? "8px" : "0",
                  }}
                />
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {company.bid_distribution.buckets.map((bucket) => {
                const color =
                  bucket.key === "won"
                    ? "var(--accent)"
                    : bucket.key === "lowest_lost"
                      ? "#0F766E"
                      : bucket.key === "close_lost"
                        ? "#D97706"
                        : "#B45309";

                return (
                  <div
                    key={bucket.key}
                    className="rounded-xl p-4"
                    style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        <div className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {bucket.label}
                        </div>
                      </div>
                      <div className="text-sm font-semibold" style={{ color }}>
                        {formatPct(bucket.percentage)}
                      </div>
                    </div>
                    <div className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                      {bucket.description}
                    </div>
                    <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      {bucket.count} of {distributionTotal} evaluated bids
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-xl p-4 text-sm" style={{ background: "var(--surface-elevated)", color: "var(--text-secondary)" }}>
            Not enough comparable bids yet to calculate a distribution.
          </div>
        )}

        {company.bid_distribution.unevaluable_count > 0 && (
          <p className="text-xs mt-4" style={{ color: "var(--text-tertiary)" }}>
            {company.bid_distribution.unevaluable_count} proposal
            {company.bid_distribution.unevaluable_count === 1 ? "" : "s"} excluded due to missing winner pricing or single-bidder tenders.
          </p>
        )}
      </div>

      {/* Bid History Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl p-5 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-secondary)" }}>
            Bid History
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(v: number) => [formatCurrency(v), "Bid"]}
              />
              <Bar dataKey="bid" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.won ? "#005A61" : "#CBD5E1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "#005A61" }} />
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Won</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "#CBD5E1" }} />
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Lost</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-5 py-4" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Recent Activity</h2>
        </div>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="text-left">Tender</th>
              <th className="text-left">Agency</th>
              <th className="text-right">Bid</th>
              <th className="text-center">Rank</th>
              <th className="text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {company.proposals.slice(0, 15).map((p) => (
              <tr key={p.id} className={p.is_winner ? "winner" : ""}>
                <td>
                  {p.tender ? (
                    <Link
                      href={`/tenders/${p.tender_id}`}
                      className="hover:underline line-clamp-1 font-medium"
                      style={{ color: "var(--text-primary)", maxWidth: "250px", display: "block" }}
                    >
                      {p.tender.title}
                    </Link>
                  ) : (
                    <span style={{ color: "var(--text-secondary)" }}>Unknown</span>
                  )}
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {formatDate(p.submitted_at)}
                  </div>
                </td>
                <td className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {p.tender?.agency ?? "—"}
                </td>
                <td className="text-right font-mono text-sm" style={{ color: "var(--text-primary)" }}>
                  {formatCurrency(p.bid_amount)}
                </td>
                <td className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                  {p.rank ?? "—"}
                </td>
                <td className="text-center">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={
                      p.is_winner
                        ? { background: "var(--accent-muted)", color: "var(--accent)", border: "1px solid rgba(0,90,97,0.2)" }
                        : { background: "rgba(148,163,184,0.12)", color: "var(--text-tertiary)", border: "1px solid rgba(148,163,184,0.25)" }
                    }
                  >
                    {p.is_winner ? "Won" : "Lost"}
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
