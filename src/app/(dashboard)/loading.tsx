import {
  DashboardShellSkeleton,
} from "@/components/ui/page-skeletons";
import { FilterBarSkeleton, PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <DashboardShellSkeleton>
      <PageHeaderSkeleton compact />
      <FilterBarSkeleton filters={3} includeButton />
      <TableSkeleton columns={5} rows={6} />
    </DashboardShellSkeleton>
  );
}
