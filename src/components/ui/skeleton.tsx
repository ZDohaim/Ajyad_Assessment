import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn("skeleton rounded-md", className)} style={style} aria-hidden="true" />;
}

export function PageHeaderSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "mb-6" : "mb-8"}>
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-64 max-w-full" />
    </div>
  );
}

export function FilterBarSkeleton({
  filters = 3,
  includeSearch = false,
  includeButton = false,
}: {
  filters?: number;
  includeSearch?: boolean;
  includeButton?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {includeSearch && <Skeleton className="h-10 flex-1 min-w-[240px] max-w-sm rounded-lg" />}
      {Array.from({ length: filters }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-32 rounded-lg" />
      ))}
      {includeButton && <Skeleton className="h-10 w-28 rounded-lg" />}
    </div>
  );
}

export function TableSkeleton({
  columns,
  rows,
}: {
  columns: number;
  rows: number;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div
        className="grid gap-4 px-4 py-3"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          background: "var(--surface-elevated)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-16" />
        ))}
      </div>
      <div style={{ background: "var(--surface)" }}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 px-4 py-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              borderBottom: rowIndex === rows - 1 ? "none" : "1px solid var(--border)",
            }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <div key={columnIndex} className="space-y-2">
                <Skeleton className={cn("h-4", columnIndex === 0 ? "w-4/5" : "w-3/5")} />
                {columnIndex === 0 && <Skeleton className="h-3 w-1/3" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsGridSkeleton({ items }: { items: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl p-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("rounded-xl p-5", className)} style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {children}
    </div>
  );
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <CardSkeleton>
      <Skeleton className="h-4 w-28 mb-4" />
      <div className="flex items-end gap-3" style={{ height }}>
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton
            key={index}
            className="flex-1 rounded-t-md rounded-b-sm"
            style={{ height: `${35 + ((index * 13) % 55)}%` }}
          />
        ))}
      </div>
    </CardSkeleton>
  );
}

export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-4", index === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}
