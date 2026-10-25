import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat halaman">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>

      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

