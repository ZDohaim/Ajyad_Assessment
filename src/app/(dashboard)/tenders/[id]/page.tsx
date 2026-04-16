"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/tenders/StatusBadge";
import { TenderDetailSkeleton } from "@/components/ui/page-skeletons";
import { formatCurrency, formatDate, formatDiffPct } from "@/lib/utils";
import { TenderWithProposals } from "@/types";
import dynamic from "next/dynamic";

const PDFExportButton = dynamic(() => import("@/components/pdf/TenderPDF"), {
  ssr: false,
  loading: () => (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium opacity-50"
      style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
    >
      Export PDF
    </button>
  ),
});

export default function TenderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = useState<TenderWithProposals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTender({ ...data, bidder_count: data.proposals?.length ?? 0, winning_bid: null });
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <TenderDetailSkeleton />;
  }

  if (!tender) {
    return <div className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>Tender not found</div>;
  }

  const winningBid = tender.proposals?.find((p) => p.is_winner)?.bid_amount ?? null;

  return (
    <div className="p-8 max-w-5xl">
      {/* Back link */}
      <Link href="/tenders" className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Back to Tenders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={tender.status} />
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{tender.title}</h1>
        </div>
        <PDFExportButton tender={tender} />
      </div>

      {/* Metadata Card */}
      <div className="rounded-xl p-6 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: "Agency", value: tender.agency },
            { label: "Sector", value: tender.sector },
            { label: "Region", value: tender.region },
            { label: "Est. Value", value: formatCurrency(tender.estimated_value) },
            { label: "Published", value: formatDate(tender.published_at) },
            { label: "Deadline", value: formatDate(tender.deadline) },
            { label: "Awarded", value: formatDate(tender.awarded_at) },
            { label: "Bidders", value: String(tender.proposals?.length ?? 0) },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--text-tertiary)" }}>{m.label}</div>
              <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {tender.description && (
          <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--text-tertiary)" }}>Description</div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{tender.description}</p>
          </div>
        )}
      </div>

      {/* Proposals */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div className="px-5 py-4" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
            Submitted Proposals
          </h2>
        </div>

        {(!tender.proposals || tender.proposals.length === 0) ? (
          <div className="py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            No proposals submitted for this tender
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Company</th>
                <th className="text-right">Bid Amount</th>
                <th className="text-center">Rank</th>
                <th className="text-right">vs Winner</th>
              </tr>
            </thead>
            <tbody>
              {tender.proposals.map((p) => (
                <tr key={p.id} className={p.is_winner ? "winner" : ""}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/companies/${p.company_id}`}
                        className="font-medium hover:underline"
                        style={{ color: p.is_winner ? "var(--accent)" : "var(--text-primary)" }}
                      >
                        {p.company?.name ?? "Unknown"}
                      </Link>
                      {p.is_winner && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--accent-muted)", color: "var(--accent)", border: "1px solid rgba(0,90,97,0.2)" }}>
                          Winner
                        </span>
                      )}
                    </div>
                    {p.company?.sector && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{p.company.sector}</div>
                    )}
                  </td>
                  <td className="text-right font-mono font-medium" style={{ color: "var(--text-primary)" }}>
                    {formatCurrency(p.bid_amount)}
                  </td>
                  <td className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                    {p.rank ?? "—"}
                  </td>
                  <td className="text-right text-sm font-mono" style={{ color: p.is_winner ? "var(--accent)" : "var(--text-tertiary)" }}>
                    {winningBid ? formatDiffPct(p.bid_amount, winningBid) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
