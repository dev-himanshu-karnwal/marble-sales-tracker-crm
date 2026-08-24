import { Link, useSearchParams } from 'react-router-dom';
import { useAuth, useData } from '../../context/AppContext';
import EmptyState from '../../components/EmptyState';
import VisitSummaryCard from '../../components/VisitSummaryCard';
import {
  formatDate,
  formatDateTime,
  getSalesperson,
  outcomeClass,
  visitLocationLabel,
} from '../../data/helpers';

export default function VisitHistoryPage() {
  const { user } = useAuth();
  const { visits, architects, sites, salespeople } = useData();
  const [params, setParams] = useSearchParams();
  const savedId = params.get('saved');

  const mine = [...visits]
    .filter((v) => v.salespersonId === user?.salespersonId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const savedVisit = savedId ? mine.find((v) => v.id === savedId) : undefined;
  const savedArch = savedVisit
    ? architects.find((a) => a.id === savedVisit.architectId)
    : undefined;
  const savedSite =
    savedVisit?.siteId != null
      ? sites.find((s) => s.id === savedVisit.siteId)
      : undefined;
  const me = user?.salespersonId
    ? getSalesperson(user.salespersonId, salespeople)
    : undefined;

  const dismissSummary = () => {
    params.delete('saved');
    setParams(params, { replace: true });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Field sales</div>
          <h1>My Visit History</h1>
          <p>Visits at referred sites and architect offices.</p>
        </div>
      </div>

      {savedVisit && (
        <div style={{ marginBottom: '1.25rem' }}>
          <VisitSummaryCard
            visit={savedVisit}
            architect={savedArch}
            site={savedSite}
            salespersonName={me?.name}
            onDismiss={dismissSummary}
          />
        </div>
      )}

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Where</th>
              <th>Architect</th>
              <th>Outcome</th>
              <th>Marble</th>
              <th>Notes</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((v) => {
              const arch = architects.find((a) => a.id === v.architectId);
              return (
                <tr
                  key={v.id}
                  className={v.id === savedId ? 'row-highlight' : ''}
                >
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(v.date)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        v.checkInType === 'office' ? 'badge-muted' : 'badge-info'
                      }`}
                    >
                      {v.checkInType === 'office' ? 'Office' : 'Site'}
                    </span>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--ink-muted)',
                        marginTop: 4,
                      }}
                    >
                      {visitLocationLabel(v, sites, architects)}
                    </div>
                  </td>
                  <td>
                    {arch ? (
                      <Link to={`/sales/architects/${arch.id}`}>
                        <strong>{arch.name}</strong>
                      </Link>
                    ) : (
                      <strong>—</strong>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${outcomeClass(v.outcome)}`}>
                      {v.outcome}
                    </span>
                  </td>
                  <td>{v.marbleDiscussed ?? '—'}</td>
                  <td style={{ maxWidth: 240 }}>{v.notes}</td>
                  <td>{v.nextFollowUp ? formatDate(v.nextFollowUp) : '—'}</td>
                </tr>
              );
            })}
            {mine.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    title="No visits yet"
                    description="Open an architect, pick a referred site, and check in."
                    actionLabel="My architects"
                    actionTo="/sales"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
