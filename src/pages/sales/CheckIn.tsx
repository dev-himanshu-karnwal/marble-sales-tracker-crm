import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, MapPin, Loader2 } from 'lucide-react';
import { useAuth, useData } from '../../context/AppContext';

export default function CheckInPage() {
  const { id } = useParams();
  const { architects } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const arch = architects.find(
    (a) => a.id === id && a.salespersonId === user?.salespersonId
  );

  const [phase, setPhase] = useState<'locating' | 'success'>('locating');

  useEffect(() => {
    if (!arch) return;
    const t = setTimeout(() => setPhase('success'), 1600);
    return () => clearTimeout(t);
  }, [arch]);

  if (!arch) {
    return (
      <div className="empty-state">
        <p>Architect not found or not assigned to you.</p>
        <Link to="/sales" className="btn btn-secondary">
          Back
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
            <h2>Checking in…</h2>
            <p style={{ color: 'var(--ink-soft)' }}>
              Mocking GPS proximity to site coordinates ({arch.lat.toFixed(4)},{' '}
              {arch.lng.toFixed(4)}). No real location services used.
            </p>
          </>
        ) : (
          <>
            <div className="success-banner" style={{ textAlign: 'left' }}>
              <CheckCircle2 size={22} />
              <div>
                <strong>Check-in successful</strong>
                <div style={{ fontSize: '0.85rem' }}>
                  You are marked present at this site.
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/sales/visit/${arch.id}`)}
            >
              Continue to visit log
            </button>
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
