import type { Evidence } from "../../../modules/domain";

interface DashboardStatisticsProps {
  evidence: Evidence[];
  peopleCount: number;
  locationsCount: number;
  bookmarksCount: number;
}

interface StatCardProps {
  value: number;
  label: string;
}

interface ReviewProgressProps {
  percentage: number;
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ReviewProgress({ percentage }: ReviewProgressProps) {
  return (
    <div className="dashboard-panel">
      <h3>Review progress</h3>

      <div className="progress-bar-outer">
        <div
          className="progress-bar-inner"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p>{percentage}% of evidence reviewed</p>
    </div>
  );
}

export function DashboardStatistics({
  evidence,
  peopleCount,
  locationsCount,
  bookmarksCount,
}: DashboardStatisticsProps) {
  const evidenceCount = evidence.length;

  const reviewedCount = evidence.filter(
    (item) => item.status.toLowerCase() === "reviewed",
  ).length;

  const percentage =
    evidenceCount === 0 ? 0
      : Math.round((reviewedCount / evidenceCount) * 100);

  return (
    <>
      <div className="stat-grid">
        <StatCard value={evidenceCount} label="Evidence items" />
        <StatCard value={peopleCount} label="People" />
        <StatCard value={locationsCount} label="Locations" />
        <StatCard value={bookmarksCount} label="Bookmarked" />
        <StatCard value={reviewedCount} label="Reviewed" />
      </div>

      <ReviewProgress percentage={percentage} />
    </>
  );
}