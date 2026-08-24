import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../../context/AppContext';
import EmptyState from '../../components/EmptyState';
import {
  formatDateTime,
  getArchitect,
  getSalesperson,
  outcomeClass,
} from '../../data/helpers';
import { VISIT_OUTCOMES } from '../../data/mockData';

export default function VisitsPage() {
  const { visits, architects, salespeople } = useData();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [outcome, setOutcome] = useState('all');
  const spId = params.get('salesperson') ?? 'all';

  const setSalespersonFilter = (id: string) => {
    const next = new URLSearchParams(params);
    if (id === 'all') next.delete('salesperson');
    else next.set('salesperson', id);
    setParams(next, { replace: true });
  };

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return [...visits]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((v) => {
        if (outcome !== 'all' && v.outcome !== outcome) return false;
        if (spId !== 'all' && v.salespersonId !== spId) return false;
        if (!query) return true;
        const arch = architects.find((a) => a.id === v.architectId);
        const sp = getSalesperson(v.salespersonId, salespeople);
        return (
          arch?.name.toLowerCase().includes(query) ||
          arch?.firm.toLowerCase().includes(query) ||
          sp?.name.toLowerCase().includes(query) ||
          v.notes.toLowerCase().includes(query) ||
          v.marbleDiscussed?.toLowerCase().includes(query)
        );
      });
  }, [visits, architects, salespeople, q, outcome, spId]);

  const filterSp = spId !== 'all' ? getSalesperson(spId, salespeople) : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1>All Visits Log</h1>
          <p>
            Complete visit history across the sales team — outcomes, notes, and
            marble discussed.
            {filterSp && (
              <>
                {' '}
                Showing <strong>{filterSp.name}</strong>.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="search"
          placeholder="Search architect, salesperson, notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          <option value="all">All outcomes</option>
          {VISIT_OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <select
          value={spId}
          onChange={(e) => setSalespersonFilter(e.target.value)}
        >
          <option value="all">All salespeople</option>
          {salespeople.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Architect</th>
              <th>Salesperson</th>
              <th>Outcome</th>
              <th>Marble</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const arch =
                getArchitect(v.architectId, architects) ??
                architects.find((a) => a.id === v.architectId);
              const sp = getSalesperson(v.salespersonId, salespeople);
              return (
                <tr key={v.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(v.date)}
                  </td>
                  <td>
                    {arch ? (
                      <Link to={`/admin/architects/${arch.id}`}>
                        <strong>{arch.name}</strong>
                      </Link>
                    ) : (
                      <strong>—</strong>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                      {arch?.firm}
                    </div>
                  </td>
                  <td>{sp?.name ?? '—'}</td>
                  <td>
                    <span className={`badge ${outcomeClass(v.outcome)}`}>
                      {v.outcome}
                    </span>
                  </td>
                  <td>{v.marbleDiscussed ?? '—'}</td>
                  <td style={{ maxWidth: 320 }}>{v.notes}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No visits match filters"
                    description="Try clearing the salesperson or outcome filter."
                    actionLabel={spId !== 'all' ? 'Clear salesperson filter' : undefined}
                    onAction={
                      spId !== 'all' ? () => setSalespersonFilter('all') : undefined
                    }
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
