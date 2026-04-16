"use client";

import { TenderWithProposals } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import dynamic from "next/dynamic";

// PDFDownloadLink must be client-only
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false, loading: () => null }
);

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#005A61",
  },
  logo: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
  exportDate: { fontSize: 9, color: "#64748B" },
  title: { fontSize: 15, fontWeight: "bold", color: "#1A1A1A", marginBottom: 4 },
  badge: {
    fontSize: 9,
    color: "#005A61",
    backgroundColor: "rgba(0,90,97,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  metaItem: { width: "45%" },
  metaLabel: { fontSize: 8, color: "#64748B", textTransform: "uppercase", marginBottom: 2 },
  metaValue: { fontSize: 10, color: "#1A1A1A" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 6, paddingHorizontal: 8 },
  tableRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  winnerRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "rgba(0,90,97,0.06)", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  col1: { width: "38%", fontSize: 9, color: "#1A1A1A" },
  col2: { width: "24%", fontSize: 9, color: "#374151", textAlign: "right" },
  col3: { width: "14%", fontSize: 9, color: "#374151", textAlign: "center" },
  col4: { width: "24%", fontSize: 9, color: "#374151", textAlign: "right" },
  headerText: { fontSize: 8, fontWeight: "bold", color: "#6b7280", textTransform: "uppercase" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#9ca3af" },
});

function TenderPDFDoc({ tender }: { tender: TenderWithProposals }) {
  const winningBid = tender.proposals.find((p) => p.is_winner)?.bid_amount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>TenderTrack</Text>
          <Text style={styles.exportDate}>Exported {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</Text>
        </View>

        <Text style={styles.title}>{tender.title}</Text>
        <Text style={styles.badge}>{tender.status.toUpperCase()}</Text>

        <View style={styles.metaGrid}>
          {[
            { label: "Agency", value: tender.agency },
            { label: "Sector", value: tender.sector },
            { label: "Region", value: tender.region },
            { label: "Published", value: formatDate(tender.published_at) },
            { label: "Deadline", value: formatDate(tender.deadline) },
            { label: "Awarded", value: formatDate(tender.awarded_at) },
            { label: "Est. Value", value: formatCurrency(tender.estimated_value) },
            { label: "Total Bidders", value: String(tender.proposals.length) },
          ].map((m) => (
            <View key={m.label} style={styles.metaItem}>
              <Text style={styles.metaLabel}>{m.label}</Text>
              <Text style={styles.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Submitted Proposals</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.col1, styles.headerText]}>Company</Text>
          <Text style={[styles.col2, styles.headerText]}>Bid Amount</Text>
          <Text style={[styles.col3, styles.headerText]}>Rank</Text>
          <Text style={[styles.col4, styles.headerText]}>vs Winner</Text>
        </View>
        {tender.proposals.map((p) => {
          const diffPct =
            winningBid && !p.is_winner
              ? `+${(((p.bid_amount - winningBid) / winningBid) * 100).toFixed(1)}%`
              : p.is_winner
              ? "Winner"
              : "—";
          return (
            <View key={p.id} style={p.is_winner ? styles.winnerRow : styles.tableRow}>
              <Text style={[styles.col1, p.is_winner ? { color: "#005A61", fontWeight: "bold" } : {}]}>
                {p.company?.name ?? "Unknown"}
              </Text>
              <Text style={styles.col2}>{formatCurrency(p.bid_amount)}</Text>
              <Text style={styles.col3}>{String(p.rank ?? "—")}</Text>
              <Text style={[styles.col4, p.is_winner ? { color: "#005A61" } : {}]}>{diffPct}</Text>
            </View>
          );
        })}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>TenderTrack — Procurement Intelligence</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export default function PDFExportButton({ tender }: { tender: TenderWithProposals }) {
  return (
    <PDFDownloadLink
      document={<TenderPDFDoc tender={tender} />}
      fileName={`tender-${tender.id.slice(0, 8)}.pdf`}
    >
      {({ loading }: { loading: boolean }) => (
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {loading ? "Generating..." : "Export PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
