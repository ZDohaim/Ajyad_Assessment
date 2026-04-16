"use client";

interface TenderSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TenderSearchInput({ value, onChange }: TenderSearchInputProps) {
  return (
    <div className="relative flex-1 min-w-[240px] max-w-sm">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
        style={{ color: "var(--text-tertiary)" }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tenders..."
        className="w-full pl-9 pr-9 py-2 rounded-lg text-sm outline-none"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          x
        </button>
      )}
    </div>
  );
}
