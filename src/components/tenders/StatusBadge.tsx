import { TenderStatus } from "@/types";

const styles: Record<TenderStatus, { bg: string; text: string; border: string; dot: string }> = {
  active: {
    bg: "rgba(13, 148, 136, 0.08)",
    text: "#0D9488",
    border: "rgba(13, 148, 136, 0.2)",
    dot: "#0D9488",
  },
  awarded: {
    bg: "rgba(37, 99, 235, 0.08)",
    text: "#2563EB",
    border: "rgba(37, 99, 235, 0.2)",
    dot: "#2563EB",
  },
  expired: {
    bg: "rgba(148, 163, 184, 0.12)",
    text: "#64748B",
    border: "rgba(148, 163, 184, 0.3)",
    dot: "#94A3B8",
  },
};

export default function StatusBadge({ status }: { status: TenderStatus }) {
  const s = styles[status] ?? styles.expired;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
