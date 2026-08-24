import { Link, useSearchParams } from 'react-router-dom';
import { useAuth, useData } from '../../context/AppContext';
import EmptyState from '../../components/EmptyState';
import VisitSummaryCard from '../../components/VisitSummaryCard';
import {
  formatDate,
  formatDateTime,
  getSalesperson,
  outcomeClass,
} from '../../data/helpers';

export default function VisitHistoryPage() {
  const { user } = useAuth();
  const { visits, architects, salespeople } = useData();
  const [params, setParams] = useSearchParams();
  const savedId = params.get('saved');

  const mine = [...visits]
    .filter((v) => v.salespersonId === user?.salespersonId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const savedVisit = savedId ? mine.find((v) => v.id === savedId) : undefined;
  const savedArch = savedVisit
    ? architects.find((a) => a.id === savedVisit.architectId)
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
          <p>Past visits with outcomes, notes, and follow-up dates.</p>
        </div>
      </div>

      {savedVisit && (
        <div style={{ marginBottom: '1.25rem' }}>
          <VisitSummaryCard
            visit={savedVisit}
            architect={savedArch}
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
              <th>Architect / Site</th>
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
                <tr key={v.id} className={v.id === savedId ? 'row-highlight' : ''}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(v.date)}
                  </td>
                  <td>
                    {arch ? (
                      <Link to={`/sales/architects/${arch.id}`}>
                        <strong>{arch.name}</strong>
                      </Link>
                    ) : (
                      <strong>—</strong>
                    )}
                    <div
                      style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}
                    >
                      {arch?.siteName}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${outcomeClass(v.outcome)}`}>
                      {v.outcome}
                    </span>
                  </td>
                  <td>{v.marbleDiscussed ?? '—'}</td>
                  <td style={{ maxWidth: 280 }}>{v.notes}</td>
                  <td>
                    {v.nextFollowUp ? formatDate(v.nextFollowUp) : '—'}
                  </td>
                </tr>
              );
            })}
            {mine.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No visits yet"
                    description="Check in at an architect site to log your first visit."
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
