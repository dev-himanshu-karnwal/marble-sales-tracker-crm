import { useAuth, useData } from '../../context/AppContext';
import {
  formatDate,
  formatDateTime,
  outcomeClass,
} from '../../data/helpers';

export default function VisitHistoryPage() {
  const { user } = useAuth();
  const { visits, architects } = useData();

  const mine = [...visits]
    .filter((v) => v.salespersonId === user?.salespersonId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Field sales</div>
          <h1>My Visit History</h1>
          <p>Past visits with outcomes, notes, and follow-up dates.</p>
        </div>
      </div>

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
                <tr key={v.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(v.date)}
                  </td>
                  <td>
                    <strong>{arch?.name ?? '—'}</strong>
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
                  <div className="empty-state">
                    No visits yet. Check in at an architect site to log one.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
