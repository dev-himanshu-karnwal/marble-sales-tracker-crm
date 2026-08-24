import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, MapPin, Loader2 } from 'lucide-react';
import { useAuth, useData } from '../../context/AppContext';

export default function CheckInPage() {
  const { id } = useParams();
  const { architects, recordCheckIn } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const arch = architects.find(
    (a) => a.id === id && a.salespersonId === user?.salespersonId
  );

  const [phase, setPhase] = useState<'locating' | 'success'>('locating');

  useEffect(() => {
    if (!arch || !user?.salespersonId) return;
    const t = setTimeout(() => {
      recordCheckIn(user.salespersonId!, {
        lat: arch.lat,
        lng: arch.lng,
        label: arch.siteName,
        date: new Date().toISOString(),
      });
      setPhase('success');
    }, 1600);
    return () => clearTimeout(t);
  }, [arch, user?.salespersonId, recordCheckIn]);

  if (!arch) {
    return (
      <div className="empty-state empty-state-rich">
        <h3>Site not found</h3>
        <p>This architect is not assigned to you, or the link is invalid.</p>
        <Link to="/sales" className="btn btn-secondary btn-sm">
          Back to my architects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Check-in</div>
          <h1>{arch.siteName}</h1>
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
              Confirming proximity to site coordinates ({arch.lat.toFixed(4)},{' '}
              {arch.lng.toFixed(4)}).
            </p>
          </>
        ) : (
          <>
            <div className="success-banner" style={{ textAlign: 'left' }}>
              <CheckCircle2 size={22} />
              <div>
                <strong>Check-in successful</strong>
                <div style={{ fontSize: '0.85rem' }}>
                  You are marked present at this site. Your map pin is updated.
                </div>
              </div>
            </div>
            <h2>Ready to log the visit</h2>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '1.25rem' }}>
              <MapPin
                size={14}
                style={{ verticalAlign: -2, marginRight: 4 }}
              />
              {arch.address}
            </p>
            <div className="actions-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/sales/visit/${arch.id}`)}
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
