import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  MapPinned,
  Phone,
  Mail,
  Plus,
} from 'lucide-react';
import { useAuth, useData } from '../../context/AppContext';
import EmptyState from '../../components/EmptyState';
import {
  architectLeadStatus,
  formatDate,
  formatDateTime,
  getSalesperson,
  getSitesForArchitect,
  leadStatusClass,
  outcomeClass,
  phoneHref,
  visitLocationLabel,
} from '../../data/helpers';

export default function ArchitectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { architects, sites, visits, salespeople } = useData();
  const isSales = user?.role === 'salesperson';

  const arch = architects.find((a) => {
    if (a.id !== id) return false;
    if (isSales) return a.salespersonId === user?.salespersonId;
    return true;
  });

  const referred = arch ? getSitesForArchitect(arch.id, sites) : [];
  const history = visits
    .filter((v) => v.architectId === id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const sp = arch
    ? getSalesperson(arch.salespersonId, salespeople)
    : undefined;
  const overallLead = arch ? architectLeadStatus(arch.id, sites) : 'New';

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

  const hasOffice =
    arch.officeLat != null &&
    arch.officeLng != null &&
    !Number.isNaN(arch.officeLat) &&
    !Number.isNaN(arch.officeLng);

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
          <div className="eyebrow">Architect / studio</div>
          <h1>{arch.name}</h1>
          <p>
            {arch.firm} ·{' '}
            <span className={`badge ${leadStatusClass(overallLead)}`}>
              {overallLead}
            </span>
            <span style={{ color: 'var(--ink-muted)', marginLeft: 8 }}>
              {referred.length} referred site{referred.length === 1 ? '' : 's'}
            </span>
          </p>
        </div>
        {isSales && (
          <div className="actions-row">
            {hasOffice && (
              <Link
                to={`/sales/checkin/office/${arch.id}`}
                className="btn btn-secondary"
              >
                <Building2 size={16} />
                Check in at office
              </Link>
            )}
            <Link
              to={`/sales/architects/${arch.id}/add-site`}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Add referred site
            </Link>
          </div>
        )}
      </div>

      <div className="detail-grid">
        <div className="card card-pad profile-block">
          <h3 style={{ marginBottom: '0.75rem' }}>Contact</h3>
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
              <Building2 size={12} style={{ verticalAlign: -1 }} /> Office
            </span>
            <span className="v">{arch.address}</span>
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
            <span className="k">Registered</span>
            <span className="v">{formatDate(arch.registeredAt)}</span>
          </div>
        </div>

        <div className="card card-pad">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <h3 style={{ margin: 0 }}>Referred project sites</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              Sites they asked us to quote — not their full workload
            </span>
          </div>

          {referred.length === 0 ? (
            <EmptyState
              title="No referred sites yet"
              description="Add a project site when the architect refers marble work."
              actionLabel={isSales ? 'Add referred site' : undefined}
              actionTo={
                isSales ? `/sales/architects/${arch.id}/add-site` : undefined
              }
            />
          ) : (
            <div className="site-list">
              {referred.map((s) => (
                <div key={s.id} className="site-list-item">
                  <div className="site-list-main">
                    <div className="site-list-title">
                      <MapPin size={14} />
                      {s.name}
                      <span className={`badge ${leadStatusClass(s.leadStatus)}`}>
                        {s.leadStatus}
                      </span>
                    </div>
                    <div className="site-list-meta">
                      {s.address} · {s.region}
                      {s.preferredMarble ? ` · ${s.preferredMarble}` : ''}
                    </div>
                  </div>
                  {isSales && (
                    <Link
                      to={`/sales/checkin/site/${s.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      <MapPinned size={14} />
                      Check in at site
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: '1.25rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Visit history</h3>
        {history.length === 0 ? (
          <EmptyState
            title="No visits yet"
            description={
              isSales
                ? 'Check in at a referred site or the office to log a visit.'
                : 'No field visits logged for this architect.'
            }
          />
        ) : (
          <div className="timeline">
            {history.map((v) => (
              <div key={v.id} className="timeline-item">
                <div
                  className={`timeline-dot ${v.checkInType === 'office' ? 'is-followup' : ''}`}
                />
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
                    <span
                      className={`badge ${
                        v.checkInType === 'office' ? 'badge-muted' : 'badge-info'
                      }`}
                    >
                      {v.checkInType === 'office' ? 'Office' : 'Site'}
                    </span>
                    <span className={`badge ${outcomeClass(v.outcome)}`}>
                      {v.outcome}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: '0.25rem 0 0',
                      fontSize: '0.85rem',
                      color: 'var(--gold-deep)',
                    }}
                  >
                    {visitLocationLabel(v, sites, architects)}
                  </p>
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
  );
}
