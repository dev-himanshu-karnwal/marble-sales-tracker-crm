import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Building2, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useAuth, useData } from '../../context/AppContext';
import EmptyState from '../../components/EmptyState';

export default function CheckInPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const { architects, sites, recordCheckIn } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOffice = type === 'office';
  const isSite = type === 'site';

  const site = isSite ? sites.find((s) => s.id === id) : undefined;
  const arch = isOffice
    ? architects.find((a) => a.id === id)
    : site
      ? architects.find((a) => a.id === site.architectId)
      : undefined;

  const assigned =
    arch && user?.salespersonId && arch.salespersonId === user.salespersonId;

  const lat = isOffice ? arch?.officeLat : site?.lat;
  const lng = isOffice ? arch?.officeLng : site?.lng;
  const label = isOffice
    ? arch
      ? `${arch.firm} (office)`
      : 'Office'
    : site?.name ?? 'Site';
  const address = isOffice ? arch?.address : site?.address;

  const [phase, setPhase] = useState<'locating' | 'success'>('locating');

  useEffect(() => {
    if (!assigned || lat == null || lng == null || !user?.salespersonId) return;
    const t = setTimeout(() => {
      recordCheckIn(user.salespersonId!, {
        lat,
        lng,
        label,
        date: new Date().toISOString(),
        checkInType: isOffice ? 'office' : 'site',
        architectId: arch!.id,
        siteId: site?.id,
      });
      setPhase('success');
    }, 1600);
    return () => clearTimeout(t);
  }, [
    assigned,
    lat,
    lng,
    label,
    user?.salespersonId,
    recordCheckIn,
    isOffice,
    arch,
    site?.id,
  ]);

  if (!isOffice && !isSite) {
    return (
      <EmptyState
        title="Invalid check-in"
        description="Choose a referred project site or an architect office."
        actionLabel="My architects"
        actionTo="/sales"
      />
    );
  }

  if (!assigned || !arch || lat == null || lng == null) {
    return (
      <EmptyState
        title="Location not available"
        description={
          isOffice
            ? 'This architect has no office pin, or is not assigned to you.'
            : 'Site not found or not assigned to you.'
        }
        actionLabel="My architects"
        actionTo="/sales"
      />
    );
  }

  const visitPath = isOffice
    ? `/sales/visit/office/${arch.id}`
    : `/sales/visit/site/${site!.id}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            Check-in · {isOffice ? 'Architect office' : 'Project site'}
          </div>
          <h1>{label}</h1>
          <p>
            {arch.name} · {arch.firm}
          </p>
        </div>
      </div>

      <div className="card card-pad checkin-stage">
        <div className={`checkin-pulse ${phase === 'success' ? 'success' : ''}`}>
          {phase === 'locating' ? (
            <Loader2 size={40} color="#b08d57" className="spin" />
          ) : (
            <CheckCircle2 size={48} color="#3d6b4f" />
          )}
        </div>

        {phase === 'locating' ? (
          <>
            <h2>Verifying location…</h2>
            <p style={{ color: 'var(--ink-soft)' }}>
              Confirming proximity to {isOffice ? 'studio' : 'site'} coordinates
              ({lat.toFixed(4)}, {lng.toFixed(4)}).
            </p>
          </>
        ) : (
          <>
            <div className="success-banner" style={{ textAlign: 'left' }}>
              <CheckCircle2 size={22} />
              <div>
                <strong>Check-in successful</strong>
                <div style={{ fontSize: '0.85rem' }}>
                  Marked present at this {isOffice ? 'office' : 'project site'}.
                  Your map pin is updated.
                </div>
              </div>
            </div>
            <h2>Ready to log the visit</h2>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '1.25rem' }}>
              {isOffice ? (
                <Building2
                  size={14}
                  style={{ verticalAlign: -2, marginRight: 4 }}
                />
              ) : (
                <MapPin
                  size={14}
                  style={{ verticalAlign: -2, marginRight: 4 }}
                />
              )}
              {address}
            </p>
            <div className="actions-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(visitPath)}
              >
                Continue to visit log
              </button>
              <Link to="/sales/map" className="btn btn-secondary">
                View on map
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
