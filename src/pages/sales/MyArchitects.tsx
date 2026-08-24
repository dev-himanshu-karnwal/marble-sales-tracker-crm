import { Link, useNavigate } from 'react-router-dom';
import { Building2, MapPinned, Plus } from 'lucide-react';
import { useAuth, useData } from '../../context/AppContext';
import EmptyState from '../../components/EmptyState';
import {
  architectLeadStatus,
  getSitesForArchitect,
  leadStatusClass,
} from '../../data/helpers';

export default function MyArchitectsPage() {
  const { user } = useAuth();
  const { architects, sites } = useData();
  const navigate = useNavigate();
  const mine = architects.filter((a) => a.salespersonId === user?.salespersonId);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Field sales</div>
          <h1>My Architects</h1>
          <p>
            Architects and studios you work with. Open a profile to see referred
            project sites and check in at a site or their office.
          </p>
        </div>
        <Link to="/sales/add" className="btn btn-primary">
          <Plus size={16} />
          Add architect
        </Link>
      </div>

      {mine.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No architects yet"
            description="Register an architect and the first site they referred for marble."
            actionLabel="Add architect"
            actionTo="/sales/add"
          />
        </div>
      ) : (
        <div className="arch-grid">
          {mine.map((a) => {
            const referred = getSitesForArchitect(a.id, sites);
            const lead = architectLeadStatus(a.id, sites);
            return (
              <div
                key={a.id}
                className="arch-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/sales/architects/${a.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/sales/architects/${a.id}`);
                  }
                }}
              >
                <div className="top">
                  <div>
                    <h3>{a.name}</h3>
                    <div className="firm">{a.firm}</div>
                  </div>
                  <span className={`badge ${leadStatusClass(lead)}`}>{lead}</span>
                </div>
                <div className="site">
                  <Building2
                    size={13}
                    style={{ verticalAlign: -2, marginRight: 4 }}
                  />
                  {referred.length} referred site
                  {referred.length === 1 ? '' : 's'}
                  {referred[0] ? ` · ${referred[0].name}` : ''}
                  {referred.length > 1 ? ` +${referred.length - 1} more` : ''}
                </div>
                <div className="footer">
                  <span>{a.region}</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/sales/architects/${a.id}`);
                    }}
                  >
                    <MapPinned size={14} />
                    Sites & check-in
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
