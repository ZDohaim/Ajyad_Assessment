export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDiffPct(
  bid: number,
  winningBid: number
): string {
  if (!winningBid || bid === winningBid) return "Winner";
  const diff = ((bid - winningBid) / winningBid) * 100;
  return `+${diff.toFixed(1)}%`;
}

export function competitionLevel(bidderCount: number): {
  label: string;
  color: string;
} {
  if (bidderCount > 8)
    return { label: "High", color: "text-red-400" };
  if (bidderCount >= 4)
    return { label: "Medium", color: "text-yellow-400" };
  return { label: "Low", color: "text-green-400" };
}
