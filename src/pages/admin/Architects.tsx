import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/AppContext';
import { getSalesperson, leadStatusClass } from '../../data/helpers';
import { REGIONS } from '../../data/mockData';

export default function ArchitectsPage() {
  const { architects } = useData();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return architects.filter((a) => {
      if (region !== 'all' && a.region !== region) return false;
      if (status !== 'all' && a.leadStatus !== status) return false;
      if (!query) return true;
      return (
        a.name.toLowerCase().includes(query) ||
        a.firm.toLowerCase().includes(query) ||
        a.siteName.toLowerCase().includes(query) ||
        a.preferredMarble?.toLowerCase().includes(query)
      );
    });
  }, [architects, q, region, status]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1>All Architects</h1>
          <p>
            Search and filter registered architecture firms and project sites.
          </p>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="search"
          placeholder="Search name, firm, site, marble…"
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
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Architect</th>
              <th>Firm</th>
              <th>Site / Project</th>
              <th>Region</th>
              <th>Salesperson</th>
              <th>Lead</th>
              <th>Marble</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="clickable"
                onClick={() => navigate(`/admin/architects/${a.id}`)}
              >
                <td>
                  <strong>{a.name}</strong>
                </td>
                <td>{a.firm}</td>
                <td>{a.siteName}</td>
                <td>{a.region}</td>
                <td>{getSalesperson(a.salespersonId)?.name ?? '—'}</td>
                <td>
                  <span className={`badge ${leadStatusClass(a.leadStatus)}`}>
                    {a.leadStatus}
                  </span>
                </td>
                <td>{a.preferredMarble ?? '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">No architects match filters.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
