import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, MapPinned, Phone, Mail } from 'lucide-react';
import { useAuth, useData } from '../../context/AppContext';
import EmptyState from '../../components/EmptyState';
import {
  formatDate,
  formatDateTime,
  getSalesperson,
  leadStatusClass,
  outcomeClass,
  phoneHref,
} from '../../data/helpers';

export default function ArchitectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { architects, visits, salespeople } = useData();
  const isSales = user?.role === 'salesperson';
  const arch = architects.find((a) => {
    if (a.id !== id) return false;
    if (isSales) return a.salespersonId === user?.salespersonId;
    return true;
  });
  const history = visits
    .filter((v) => v.architectId === id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const sp = arch
    ? getSalesperson(arch.salespersonId, salespeople)
    : undefined;

  const listPath = isSales ? '/sales' : '/admin/architects';
  const listLabel = isSales ? 'My architects' : 'All architects';

  if (!arch) {
    return (
      <EmptyState
        title="Architect not found"
        description="This profile is missing or not assigned to you."
        actionLabel={listLabel}
        actionTo={listPath}
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link
            to={listPath}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={14} />
            {listLabel}
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
        {isSales && (
          <Link to={`/sales/checkin/${arch.id}`} className="btn btn-primary">
            <MapPinned size={16} />
            Check In
          </Link>
        )}
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
            <span className="v">
              <a className="contact-link" href={phoneHref(arch.phone)}>
                {arch.phone}
              </a>
            </span>
          </div>
          <div className="row">
            <span className="k">
              <Mail size={12} style={{ verticalAlign: -1 }} /> Email
            </span>
            <span className="v">
              <a className="contact-link" href={`mailto:${arch.email}`}>
                {arch.email}
              </a>
            </span>
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
          {!isSales && (
            <div className="row">
              <span className="k">Assigned salesperson</span>
              <span className="v">{sp?.name ?? '—'}</span>
            </div>
          )}
          <div className="row">
            <span className="k">Coordinates</span>
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
            <EmptyState
              title="No visits yet"
              description={
                isSales
                  ? 'Check in at this site to log your first visit.'
                  : 'No field visits have been logged for this architect.'
              }
              actionLabel={isSales ? 'Check In' : undefined}
              actionTo={isSales ? `/sales/checkin/${arch.id}` : undefined}
            />
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
