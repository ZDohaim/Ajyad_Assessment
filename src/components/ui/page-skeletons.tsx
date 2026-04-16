import type { ReactNode } from "react";

import {
  CardSkeleton,
  ChartSkeleton,
  FilterBarSkeleton,
  PageHeaderSkeleton,
  Skeleton,
  StatsGridSkeleton,
  TableSkeleton,
  TextBlockSkeleton,
} from "@/components/ui/skeleton";

export function DashboardShellSkeleton({
  children,
  maxWidthClass = "",
}: {
  children: ReactNode;
  maxWidthClass?: string;
}) {
  return <div className={`p-8 ${maxWidthClass}`.trim()}>{children}</div>;
}

export function TendersPageSkeleton() {
  return (
    <DashboardShellSkeleton>
      <PageHeaderSkeleton compact />
      <FilterBarSkeleton filters={4} includeButton />
      <TableSkeleton columns={7} rows={6} />
    </DashboardShellSkeleton>
  );
}

export function CompaniesPageSkeleton() {
  return (
    <DashboardShellSkeleton>
      <PageHeaderSkeleton compact />
      <FilterBarSkeleton filters={1} includeSearch />
      <TableSkeleton columns={5} rows={6} />
    </DashboardShellSkeleton>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <DashboardShellSkeleton maxWidthClass="max-w-6xl">
      <PageHeaderSkeleton compact />
      <FilterBarSkeleton filters={2} includeButton />
      <div className="space-y-8">
        <CardSkeleton className="overflow-hidden p-0">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <Skeleton className="h-5 w-44 mb-2" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="p-5 space-y-6">
            <ChartSkeleton height={180} />
            <TableSkeleton columns={5} rows={4} />
          </div>
        </CardSkeleton>
        <CardSkeleton className="overflow-hidden p-0">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-3 w-52" />
          </div>
          <div className="p-5">
            <ChartSkeleton height={160} />
          </div>
        </CardSkeleton>
        <CardSkeleton className="overflow-hidden p-0">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="p-5">
            <TableSkeleton columns={6} rows={4} />
          </div>
        </CardSkeleton>
      </div>
    </DashboardShellSkeleton>
  );
}

export function InsightsPageSkeleton() {
  return (
    <DashboardShellSkeleton maxWidthClass="max-w-4xl">
      <PageHeaderSkeleton />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} className="overflow-hidden p-0">
            <div className="px-5 py-4 flex items-start justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <Skeleton className="h-5 w-52 mb-2" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
            <div className="p-5 space-y-5">
              <TableSkeleton columns={5} rows={3} />
              <CardSkeleton className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <TextBlockSkeleton lines={3} />
              </CardSkeleton>
            </div>
          </CardSkeleton>
        ))}
      </div>
    </DashboardShellSkeleton>
  );
}

export function AccountPageSkeleton() {
  return (
    <DashboardShellSkeleton maxWidthClass="max-w-lg">
      <PageHeaderSkeleton />
      <CardSkeleton className="p-6">
        <div className="space-y-5">
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-3 w-28 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </CardSkeleton>
    </DashboardShellSkeleton>
  );
}

export function TenderDetailSkeleton() {
  return (
    <DashboardShellSkeleton maxWidthClass="max-w-5xl">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <CardSkeleton className="p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
          <Skeleton className="h-3 w-24 mb-3" />
          <TextBlockSkeleton lines={3} />
        </div>
      </CardSkeleton>
      <TableSkeleton columns={4} rows={5} />
    </DashboardShellSkeleton>
  );
}

export function CompanyDetailSkeleton() {
  return (
    <DashboardShellSkeleton maxWidthClass="max-w-5xl">
      <Skeleton className="h-4 w-36 mb-6" />
      <div className="mb-6">
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
      <StatsGridSkeleton items={5} />
      <ChartSkeleton height={180} />
      <div className="mt-6">
        <TableSkeleton columns={5} rows={5} />
      </div>
    </DashboardShellSkeleton>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        <CardSkeleton className="p-8">
          <Skeleton className="h-7 w-44 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <Skeleton className="h-4 w-36 mx-auto mt-6" />
        </CardSkeleton>
      </div>
    </div>
  );
}
