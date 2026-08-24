import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail } from 'lucide-react';
import { useData } from '../../context/AppContext';
import {
  formatDate,
  formatDateTime,
  getSalesperson,
  leadStatusClass,
  outcomeClass,
} from '../../data/helpers';

export default function ArchitectDetailPage() {
  const { id } = useParams();
  const { architects, visits } = useData();
  const arch = architects.find((a) => a.id === id);
  const history = visits
    .filter((v) => v.architectId === id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const sp = arch ? getSalesperson(arch.salespersonId) : undefined;

  if (!arch) {
    return (
      <div className="empty-state">
        <p>Architect not found.</p>
        <Link to="/admin/architects" className="btn btn-secondary">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link
            to="/admin/architects"
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={14} />
            All architects
          </Link>
          <div className="eyebrow">Architect profile</div>
          <h1>{arch.name}</h1>
          <p>
            {arch.firm} ·{' '}
            <span className={`badge ${leadStatusClass(arch.leadStatus)}`}>
              {arch.leadStatus}
            </span>
          </p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card card-pad profile-block">
          <h3 style={{ marginBottom: '0.75rem' }}>Profile</h3>
          <div className="row">
            <span className="k">Firm</span>
            <span className="v">{arch.firm}</span>
          </div>
          <div className="row">
            <span className="k">
              <Phone size={12} style={{ verticalAlign: -1 }} /> Phone
            </span>
            <span className="v">{arch.phone}</span>
          </div>
          <div className="row">
            <span className="k">
              <Mail size={12} style={{ verticalAlign: -1 }} /> Email
            </span>
            <span className="v">{arch.email}</span>
          </div>
          <div className="row">
            <span className="k">
              <MapPin size={12} style={{ verticalAlign: -1 }} /> Address
            </span>
            <span className="v">{arch.address}</span>
          </div>
          <div className="row">
            <span className="k">Project site</span>
            <span className="v">{arch.siteName}</span>
          </div>
          <div className="row">
            <span className="k">Region</span>
            <span className="v">{arch.region}</span>
          </div>
          <div className="row">
            <span className="k">Preferred marble</span>
            <span className="v">{arch.preferredMarble ?? '—'}</span>
          </div>
          <div className="row">
            <span className="k">Assigned salesperson</span>
            <span className="v">{sp?.name ?? '—'}</span>
          </div>
          <div className="row">
            <span className="k">GPS</span>
            <span className="v">
              {arch.lat.toFixed(4)}, {arch.lng.toFixed(4)}
            </span>
          </div>
          <div className="row">
            <span className="k">Registered</span>
            <span className="v">{formatDate(arch.registeredAt)}</span>
          </div>
        </div>

        <div className="card card-pad">
          <h3 style={{ marginBottom: '1rem' }}>Visit history</h3>
          {history.length === 0 ? (
            <div className="empty-state">No visits logged yet.</div>
          ) : (
            <div className="timeline">
              {history.map((v) => (
                <div key={v.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong>{formatDateTime(v.date)}</strong>
                      <span className={`badge ${outcomeClass(v.outcome)}`}>
                        {v.outcome}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: '0.35rem 0 0',
                        fontSize: '0.875rem',
                        color: 'var(--ink-soft)',
                      }}
                    >
                      {v.notes}
                    </p>
                    {v.marbleDiscussed && (
                      <p
                        style={{
                          margin: '0.25rem 0 0',
                          fontSize: '0.8rem',
                          color: 'var(--gold-deep)',
                        }}
                      >
                        Marble: {v.marbleDiscussed}
                      </p>
                    )}
                    {v.nextFollowUp && (
                      <p
                        style={{
                          margin: '0.25rem 0 0',
                          fontSize: '0.78rem',
                          color: 'var(--ink-muted)',
                        }}
                      >
                        Next follow-up: {formatDate(v.nextFollowUp)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
