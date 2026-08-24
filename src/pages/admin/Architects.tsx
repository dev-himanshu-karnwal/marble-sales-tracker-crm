import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../../context/AppContext';
import EmptyState from '../../components/EmptyState';
import {
  architectLeadStatus,
  getSalesperson,
  getSitesForArchitect,
  leadStatusClass,
} from '../../data/helpers';
import { REGIONS } from '../../data/mockData';

export default function ArchitectsPage() {
  const { architects, sites, salespeople } = useData();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState('all');
  const spId = params.get('salesperson') ?? 'all';

  const setSalespersonFilter = (id: string) => {
    const next = new URLSearchParams(params);
    if (id === 'all') next.delete('salesperson');
    else next.set('salesperson', id);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return architects.filter((a) => {
      if (spId !== 'all' && a.salespersonId !== spId) return false;
      if (region !== 'all' && a.region !== region) return false;
      const lead = architectLeadStatus(a.id, sites);
      if (status !== 'all' && lead !== status) return false;
      if (!query) return true;
      const siteNames = getSitesForArchitect(a.id, sites)
        .map((s) => s.name)
        .join(' ');
      return (
        a.name.toLowerCase().includes(query) ||
        a.firm.toLowerCase().includes(query) ||
        siteNames.toLowerCase().includes(query) ||
        a.preferredMarble?.toLowerCase().includes(query)
      );
    });
  }, [architects, sites, q, region, status, spId]);

  const filterSp = spId !== 'all' ? getSalesperson(spId, salespeople) : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1>Architects</h1>
          <p>
            Studios and contacts. Each may have multiple referred project sites
            for marble.
            {filterSp && (
              <>
                {' '}
                Filtered to <strong>{filterSp.name}</strong>.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="search"
          placeholder="Search name, firm, referred sites…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="all">All regions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All lead statuses</option>
          {['New', 'Warm', 'Hot', 'Converted', 'Cold'].map((s) => (
            <option key={s} value={s}>
              {s}
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
              <th>Architect</th>
              <th>Firm</th>
              <th>Referred sites</th>
              <th>Region</th>
              <th>Salesperson</th>
              <th>Lead</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const referred = getSitesForArchitect(a.id, sites);
              const lead = architectLeadStatus(a.id, sites);
              return (
                <tr
                  key={a.id}
                  className="clickable"
                  onClick={() => navigate(`/admin/architects/${a.id}`)}
                >
                  <td>
                    <strong>{a.name}</strong>
                  </td>
                  <td>{a.firm}</td>
                  <td>
                    {referred.length === 0
                      ? '—'
                      : referred.length === 1
                        ? referred[0].name
                        : `${referred.length} sites`}
                  </td>
                  <td>{a.region}</td>
                  <td>
                    {getSalesperson(a.salespersonId, salespeople)?.name ?? '—'}
                  </td>
                  <td>
                    <span className={`badge ${leadStatusClass(lead)}`}>
                      {lead}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No architects match filters"
                    description="Try a different region, lead status, or salesperson."
                    actionLabel={
                      spId !== 'all' ? 'Clear salesperson filter' : undefined
                    }
                    onAction={
                      spId !== 'all'
                        ? () => setSalespersonFilter('all')
                        : undefined
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
