import { Link, useNavigate } from 'react-router-dom';
import { MapPinned, Plus } from 'lucide-react';
import { useAuth, useData } from '../../context/AppContext';
import EmptyState from '../../components/EmptyState';
import { leadStatusClass } from '../../data/helpers';

export default function MyArchitectsPage() {
  const { user } = useAuth();
  const { architects } = useData();
  const navigate = useNavigate();
  const mine = architects.filter((a) => a.salespersonId === user?.salespersonId);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Field sales</div>
          <h1>My Architects</h1>
          <p>
            Architects you registered or were assigned. Open a profile or check
            in at a site to log a visit.
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
            description="Register your first architect or studio to start logging site visits."
            actionLabel="Add architect"
            actionTo="/sales/add"
          />
        </div>
      ) : (
        <div className="arch-grid">
          {mine.map((a) => (
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
                <span className={`badge ${leadStatusClass(a.leadStatus)}`}>
                  {a.leadStatus}
                </span>
              </div>
              <div className="site">{a.siteName}</div>
              <div className="footer">
                <span>
                  {a.region}
                  {a.preferredMarble ? ` · ${a.preferredMarble}` : ''}
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/sales/checkin/${a.id}`);
                  }}
                >
                  <MapPinned size={14} />
                  Check In
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
