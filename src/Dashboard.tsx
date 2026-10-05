import type { CaseInfo, DashboardData } from "./dashboardData";
import type { Evidence, TimelineEvent } from "../modules/domain";
import { formatDate, statusBadgeClass } from "../modules/helpers";

// Props sind die Daten, die eine Komponente von ihrer Elternkomponente bekommt.
interface CaseSummaryProps {
  caseInfo: CaseInfo;
}

interface StatCardProps {
  value: number;
  label: string;
}

interface ReviewProgressProps {
  percentage: number;
}

interface RecentEvidenceProps {
  evidence: Evidence[];
}

interface RecentTimelineProps {
  timeline: TimelineEvent[];
}

interface DashboardProps {
  data: DashboardData;
}

function CaseSummary(props: CaseSummaryProps) {
  const caseInfo = props.caseInfo;
  return (
    <div className="case-summary-card">
      <h3>{caseInfo.title}</h3>
      <p>
        <span className="badge badge-flagged">
          {caseInfo.status.toUpperCase()}
        </span>
      </p>
      <p>{caseInfo.summary}</p>
    </div>
  );
}

function StatCard(props: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-value">{props.value}</div>
      <div className="stat-label">{props.label}</div>
    </div>
  );
}

function ReviewProgress(props: ReviewProgressProps) {
  const percentage = props.percentage;
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

function RecentEvidence(props: RecentEvidenceProps) {
  const recent = props.evidence.slice(-5);
  recent.reverse();

  return (
    <div className="dashboard-panel">
      <h3>Recent evidence</h3>

      {recent.length === 0 && <p>No evidence loaded yet.</p>}
      {recent.map((item) => (
        <div className="mini-list-item" key={item.id}>
          <strong>{item.id}</strong> — {item.title}{" "}
          <span className={`badge ${statusBadgeClass(item.status)}`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function RecentTimeline(props: RecentTimelineProps) {
  const recent = props.timeline.slice(-5);
  recent.reverse();

  return (
    <div className="dashboard-panel">
      <h3>Recent timeline events</h3>

      {recent.length === 0 && <p>No timeline events loaded yet.</p>}
      {recent.map((item) => (
        <div className="mini-list-item" key={item.id}>
          <strong>{formatDate(item.time)}</strong>
          <br />
          {item.title}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard(props: DashboardProps) {
  const data = props.data;
  const evidenceCount = data.evidence.length;

  // Bei jedem Rendern aus den aktuellen Daten berechnen.
  let reviewed = 0;
  for (const item of data.evidence) {
    if (item.status.toLowerCase() === "reviewed") {
      reviewed = reviewed + 1;
    }
  }

  let percentage = 0;
  if (evidenceCount > 0) {
    percentage = Math.round((reviewed / evidenceCount) * 100);
  }

  return (
    <section>
      <h2>Dashboard</h2>

      <CaseSummary caseInfo={data.caseInfo} />

      <div className="stat-grid">
        <StatCard value={evidenceCount} label="Evidence items" />
        <StatCard value={data.people.length} label="People" />
        <StatCard value={data.locations.length} label="Locations" />
        <StatCard value={data.bookmarks.length} label="Bookmarked" />
        <StatCard value={reviewed} label="Reviewed" />
      </div>

      <ReviewProgress percentage={percentage} />

      <div className="dashboard-columns">
        <RecentEvidence evidence={data.evidence} />
        <RecentTimeline timeline={data.timeline} />
      </div>
    </section>
  );
}
