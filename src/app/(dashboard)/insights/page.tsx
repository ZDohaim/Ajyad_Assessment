"use client";

import { useEffect, useState } from "react";
import { BarChart3, Trophy, TrendingDown, type LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { InsightData } from "@/types";
import InsightCard from "@/components/insights/InsightCard";
import { InsightsPageSkeleton } from "@/components/ui/page-skeletons";

export default function InsightsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const hasKey = true; // always try, InsightCard handles errors gracefully

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <InsightsPageSkeleton />;
  }

  if (!data) return null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Market Insights</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Patterns and anomalies in procurement data, with AI-powered analysis
        </p>
      </div>

      <div className="space-y-6">
        {/* Panel 1: Persistent Losers */}
        <InsightPanel
          icon={TrendingDown}
          title="Persistent Underperformers"
          subtitle="Companies with 5+ bids but under 20% win rate"
          count={data.persistent_losers.length}
        >
          {data.persistent_losers.length === 0 ? (
            <Empty text="No persistent underperformers found" />
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">Company</th>
                  <th className="text-right">Bids</th>
                  <th className="text-right">Wins</th>
                  <th className="text-right">Win Rate</th>
                  <th className="text-right">Avg Bid</th>
                </tr>
              </thead>
              <tbody>
                {data.persistent_losers.map((c) => (
                  <tr key={c.company_id}>
                    <td style={{ color: "var(--text-primary)" }}>{c.company_name}</td>
                    <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{c.participations}</td>
                    <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{c.wins}</td>
                    <td className="text-right">
                      <span className="text-sm font-mono font-medium" style={{ color: "#ef4444" }}>
                        {(c.win_rate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{formatCurrency(c.avg_bid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <InsightCard type="losers" data={data.persistent_losers} disabled={!hasKey} />
        </InsightPanel>

        {/* Panel 2: Non-Lowest Winners */}
        <InsightPanel
          icon={Trophy}
          title="Non-Lowest Price Winners"
          subtitle="Tenders where the winning bid was NOT the lowest submitted"
          count={data.non_lowest_winners.length}
        >
          {data.non_lowest_winners.length === 0 ? (
            <Empty text="All awarded tenders went to the lowest bidder" />
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">Tender</th>
                  <th className="text-left">Winner</th>
                  <th className="text-right">Lowest Bid</th>
                  <th className="text-right">Winning Bid</th>
                  <th className="text-right">Premium Paid</th>
                </tr>
              </thead>
              <tbody>
                {data.non_lowest_winners.map((w) => (
                  <tr key={w.tender_id}>
                    <td>
                      <div className="font-medium line-clamp-1" style={{ color: "var(--text-primary)", maxWidth: "220px" }}>{w.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{w.agency}</div>
                    </td>
                    <td style={{ color: "var(--accent)" }}>{w.winner_name}</td>
                    <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{formatCurrency(w.lowest_bid)}</td>
                    <td className="text-right font-mono text-sm font-medium" style={{ color: "var(--text-primary)" }}>{formatCurrency(w.winning_bid)}</td>
                    <td className="text-right">
                      <span className="text-sm font-mono font-medium" style={{ color: "#f59e0b" }}>
                        +{w.difference_pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <InsightCard type="nonlowest" data={data.non_lowest_winners} disabled={!hasKey} />
        </InsightPanel>

        {/* Panel 3: High Variance Agencies */}
        <InsightPanel
          icon={BarChart3}
          title="High Price Variance Agencies"
          subtitle="Agencies with the widest spread between bid prices"
          count={data.high_variance_agencies.length}
        >
          {data.high_variance_agencies.length === 0 ? (
            <Empty text="No variance data available" />
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">Agency</th>
                  <th className="text-right">Tenders</th>
                  <th className="text-right">Avg Spread</th>
                  <th className="text-right">Max Spread</th>
                  <th className="text-right">Volatility</th>
                </tr>
              </thead>
              <tbody>
                {data.high_variance_agencies.map((a) => (
                  <tr key={a.agency}>
                    <td style={{ color: "var(--text-primary)" }}>{a.agency}</td>
                    <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{a.tender_count}</td>
                    <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{a.avg_spread_pct.toFixed(1)}%</td>
                    <td className="text-right font-mono text-sm" style={{ color: "var(--text-secondary)" }}>{a.max_spread_pct.toFixed(1)}%</td>
                    <td className="text-right">
                      <VolatilityBar pct={a.avg_spread_pct} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <InsightCard type="variance" data={data.high_variance_agencies} disabled={!hasKey} />
        </InsightPanel>
      </div>
    </div>
  );
}

function InsightPanel({
  icon, title, subtitle, count, children,
}: {
  icon: LucideIcon; title: string; subtitle: string; count: number; children: React.ReactNode;
}) {
  const Icon = icon;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div className="px-5 py-4 flex items-start justify-between" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          </div>
          <p className="text-xs mt-0.5 ml-6" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "var(--background)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }}>
          {count}
        </span>
      </div>
      <div className="p-5" style={{ background: "var(--surface)" }}>
        {children}
      </div>
    </div>
  );
}

function VolatilityBar({ pct }: { pct: number }) {
  const capped = Math.min(pct, 100);
  const color = pct > 60 ? "#ef4444" : pct > 30 ? "#f59e0b" : "#22d3a0";
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full" style={{ width: `${capped}%`, background: color }} />
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-6 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>{text}</div>
  );
}
