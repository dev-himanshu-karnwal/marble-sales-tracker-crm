import { useMemo, useState } from 'react';
import { useData } from '../../context/AppContext';
import { formatDate, getSalesperson } from '../../data/helpers';
import { salespeople } from '../../data/mockData';

/** Project lat/lng roughly onto a stylized North India map canvas */
function project(lat: number, lng: number): { x: number; y: number } {
  const minLat = 18.5;
  const maxLat = 29.5;
  const minLng = 72;
  const maxLng = 78.5;
  const x = ((lng - minLng) / (maxLng - minLng)) * 86 + 7;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 82 + 8;
  return { x, y };
}

type ActivePin =
  | {
      type: 'architect';
      id: string;
      name: string;
      site: string;
      lastVisit?: string;
      salesperson: string;
      x: number;
      y: number;
    }
  | {
      type: 'checkin';
      id: string;
      name: string;
      label: string;
      lastVisit: string;
      salesperson: string;
      x: number;
      y: number;
    };

export default function MapViewPage() {
  const { architects, visits } = useData();
  const [active, setActive] = useState<ActivePin | null>(null);

  const architectPins = useMemo(() => {
    return architects.map((a) => {
      const { x, y } = project(a.lat, a.lng);
      const last = visits
        .filter((v) => v.architectId === a.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      return {
        type: 'architect' as const,
        id: a.id,
        name: a.name,
        site: a.siteName,
        lastVisit: last?.date,
        salesperson: getSalesperson(a.salespersonId)?.name ?? '—',
        x,
        y,
      };
    });
  }, [architects, visits]);

  const checkinPins = useMemo(() => {
    return salespeople
      .filter((s) => s.lastCheckIn)
      .map((s) => {
        const c = s.lastCheckIn!;
        const { x, y } = project(c.lat, c.lng);
        return {
          type: 'checkin' as const,
          id: s.id,
          name: s.name,
          label: c.label,
          lastVisit: c.date,
          salesperson: s.name,
          x,
          y,
        };
      });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1>Static Map View</h1>
          <p>
            Illustrative territory map with architect sites and salesperson last
            check-ins. Click a pin for details — no live GPS or Maps API.
          </p>
        </div>
      </div>

      <div className="map-stage">
        <div className="map-bg">
          <svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern
                id="grain"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="0.6" fill="#8a7a62" opacity="0.25" />
              </pattern>
            </defs>
            <rect width="800" height="560" fill="url(#grain)" />
            {/* stylized region blobs */}
            <ellipse cx="520" cy="160" rx="140" ry="90" fill="#a89878" opacity="0.45" />
            <text x="480" y="155" fill="#5c564e" fontSize="14" fontFamily="DM Sans">
              Delhi NCR
            </text>
            <ellipse cx="420" cy="280" rx="110" ry="70" fill="#9e8d72" opacity="0.5" />
            <text x="380" y="275" fill="#5c564e" fontSize="14" fontFamily="DM Sans">
              Jaipur
            </text>
            <ellipse cx="380" cy="340" rx="90" ry="55" fill="#94856c" opacity="0.5" />
            <text x="340" y="345" fill="#5c564e" fontSize="13" fontFamily="DM Sans">
              Kishangarh
            </text>
            <ellipse cx="180" cy="420" rx="120" ry="75" fill="#a09078" opacity="0.45" />
            <text x="140" y="420" fill="#5c564e" fontSize="14" fontFamily="DM Sans">
              Mumbai
            </text>
            <ellipse cx="220" cy="340" rx="95" ry="60" fill="#9a8a70" opacity="0.4" />
            <text x="175" y="340" fill="#5c564e" fontSize="13" fontFamily="DM Sans">
              Ahmedabad
            </text>
            <path
              d="M80 80 Q200 120 280 90 T480 100 T700 80"
              fill="none"
              stroke="#7a6e5c"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.4"
            />
          </svg>
        </div>

        {architectPins.map((pin) => (
          <button
            key={pin.id}
            type="button"
            className={`map-pin architect ${active?.id === pin.id ? 'active' : ''}`}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            onClick={() => setActive(pin)}
            title={pin.name}
          >
            <div className="pin-dot" />
          </button>
        ))}

        {checkinPins.map((pin) => (
          <button
            key={`c-${pin.id}`}
            type="button"
            className={`map-pin checkin ${active?.id === pin.id && active.type === 'checkin' ? 'active' : ''}`}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            onClick={() => setActive(pin)}
            title={`${pin.name} check-in`}
          >
            <div className="pin-dot" />
          </button>
        ))}

        {active && (
          <div
            className="map-popup"
            style={{
              left: `min(${active.x}%, calc(100% - 260px))`,
              top: `min(${Math.max(active.y + 2, 8)}%, calc(100% - 160px))`,
            }}
          >
            <h4>{active.name}</h4>
            {active.type === 'architect' ? (
              <>
                <p>{active.site}</p>
                <p>
                  Last visit:{' '}
                  {active.lastVisit ? formatDate(active.lastVisit) : 'None yet'}
                </p>
                <p>Assigned: {active.salesperson}</p>
              </>
            ) : (
              <>
                <p>Check-in: {active.label}</p>
                <p>Last check-in: {formatDate(active.lastVisit)}</p>
                <p>Salesperson: {active.salesperson}</p>
              </>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '0.65rem' }}
              onClick={() => setActive(null)}
            >
              Close
            </button>
          </div>
        )}
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-swatch arch" />
          Architect / project site
        </div>
        <div className="legend-item">
          <span className="legend-swatch check" />
          Salesperson last check-in
        </div>
      </div>
    </div>
  );
}
