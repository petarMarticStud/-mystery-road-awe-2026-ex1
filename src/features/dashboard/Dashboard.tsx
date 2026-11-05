import type { CaseInfo, DashboardData } from "../../dashboardData";
import type { Evidence, TimelineEvent } from "../../../modules/domain";
import { formatDate, statusBadgeClass } from "../../../modules/helpers";
import {Badge} from "../../components/Badge";
import { DashboardStatistics } from "./DashboardStatistics";
import { useBookmarks } from "../evidence/BookmarksContext";


interface CaseSummaryProps {
  caseInfo: CaseInfo;
}

interface RecentEvidenceProps {
  evidence: Evidence[];
}

interface RecentTimelineProps {
  timeline: TimelineEvent[];
}

interface DashboardProps {
  data: Omit<DashboardData, "bookmarks">;
}

function CaseSummary({ caseInfo }: CaseSummaryProps) {
  return (
    <div className="case-summary-card">
      <h3>{caseInfo.title}</h3>

      <Badge
        label={caseInfo.status.toUpperCase()}
        className="badge-flagged"
        />

      <p>{caseInfo.summary}</p>
    </div>
  );
}

function RecentEvidence({ evidence }: RecentEvidenceProps) {
  const recent = evidence.slice(-5).reverse();

  return (
    <div className="dashboard-panel">
      <h3>Recent evidence</h3>

      {recent.length === 0 && <p>No evidence loaded yet.</p>}

      {recent.map((item) => (
        <div className="mini-list-item" key={item.id}>
          <strong>{item.id}</strong> — {item.title}{" "}

          <Badge
            label={item.status}
            className={statusBadgeClass(item.status)}
          />

        </div>
      ))}
    </div>
  );
}

function RecentTimeline({ timeline }: RecentTimelineProps) {
  const recent = timeline.slice(-5).reverse();

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

export default function Dashboard({ data }: DashboardProps) {
  const { bookmarks } = useBookmarks();
  return (
    <section>
      <h2>Dashboard</h2>

      <CaseSummary caseInfo={data.caseInfo} />

      <DashboardStatistics
        evidence={data.evidence}
        peopleCount={data.people.length}
        locationsCount={data.locations.length}
        bookmarksCount={bookmarks.length}
      />

      <div className="dashboard-columns">
        <RecentEvidence evidence={data.evidence} />
        <RecentTimeline timeline={data.timeline} />
      </div>
    </section>
  );
}
