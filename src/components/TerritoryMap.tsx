import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
  ZoomControl,
  ScaleControl,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Building2,
  Crosshair,
  Eye,
  EyeOff,
  Flame,
  LocateFixed,
  MapPin,
  MapPinned,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { useData } from '../context/AppContext';
import {
  computeSalespersonStats,
  formatDate,
  formatDateTime,
  getSalesperson,
  isThisMonth,
} from '../data/helpers';
import { REGIONS, salespeople } from '../data/mockData';
import type { LeadStatus } from '../data/types';
import 'leaflet/dist/leaflet.css';

const INDIA_CENTER: [number, number] = [24.5, 75.2];
const DEFAULT_ZOOM = 5.4;

const REGION_FOCUS: Record<
  string,
  { center: [number, number]; zoom: number }
> = {
  'Delhi NCR': { center: [28.5, 77.15], zoom: 10 },
  Jaipur: { center: [26.9, 75.8], zoom: 11 },
  Kishangarh: { center: [26.58, 74.86], zoom: 12 },
  Mumbai: { center: [19.08, 72.88], zoom: 11 },
  Ahmedabad: { center: [23.03, 72.57], zoom: 11 },
};

type LayerFilter = 'all' | 'architects' | 'checkins';

type MapPinItem =
  | {
      kind: 'architect';
      id: string;
      lat: number;
      lng: number;
      name: string;
      subtitle: string;
      site: string;
      region: string;
      lastVisit?: string;
      salesperson: string;
      leadStatus: LeadStatus;
      needsFollowUp: boolean;
    }
  | {
      kind: 'checkin';
      id: string;
      lat: number;
      lng: number;
      name: string;
      subtitle: string;
      label: string;
      region: string;
      lastVisit: string;
      salesperson: string;
    };

export type TerritoryMapMode = 'admin' | 'salesperson';

interface TerritoryMapProps {
  mode: TerritoryMapMode;
  salespersonId?: string;
}

function createPinIcon(kind: 'architect' | 'checkin', active: boolean) {
  const color = kind === 'architect' ? '#b08d57' : '#3d5a73';
  const size = active ? 36 : 28;
  return L.divIcon({
    className: 'crm-map-marker',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 4],
    popupAnchor: [0, -(size + 2)],
    html: `
      <div class="crm-pin ${kind} ${active ? 'is-active' : ''}" style="--pin:${color}">
        <span class="crm-pin-head"></span>
        <span class="crm-pin-shadow"></span>
      </div>
    `,
  });
}

function MapController({
  focus,
  fitPoints,
  fitKey,
  onCoords,
}: {
  focus: { lat: number; lng: number; zoom?: number } | null;
  fitPoints: [number, number][];
  fitKey: number;
  onCoords: (c: { lat: number; lng: number } | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(t);
  }, [map]);

  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.lat, focus.lng], focus.zoom ?? Math.max(map.getZoom(), 12), {
      duration: 0.85,
    });
  }, [focus, map]);

  useEffect(() => {
    if (fitKey === 0 || fitPoints.length === 0) return;
    const bounds = L.latLngBounds(fitPoints.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds.pad(0.18), { animate: true, duration: 0.7, maxZoom: 13 });
  }, [fitKey, fitPoints, map]);

  useEffect(() => {
    const onMove = (e: L.LeafletMouseEvent) => {
      onCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    const onOut = () => onCoords(null);
    map.on('mousemove', onMove);
    map.on('mouseout', onOut);
    return () => {
      map.off('mousemove', onMove);
      map.off('mouseout', onOut);
    };
  }, [map, onCoords]);

  return null;
}

export default function TerritoryMap({ mode, salespersonId }: TerritoryMapProps) {
  const { architects, visits } = useData();
  const isSales = mode === 'salesperson';
  const me = isSales && salespersonId ? getSalesperson(salespersonId) : undefined;

  const [layer, setLayer] = useState<LayerFilter>('all');
  const [region, setRegion] = useState<string>(
    isSales && me ? me.region : 'all'
  );
  const [leadFilter, setLeadFilter] = useState<'all' | LeadStatus | 'followup'>(
    'all'
  );
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);
  const [fitKey, setFitKey] = useState(1);
  const [showHeat, setShowHeat] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const onCoords = useCallback((c: { lat: number; lng: number } | null) => {
    setCoords(c);
  }, []);

  const scopedArchitects = useMemo(() => {
    if (isSales && salespersonId) {
      return architects.filter((a) => a.salespersonId === salespersonId);
    }
    return architects;
  }, [architects, isSales, salespersonId]);

  const scopedVisits = useMemo(() => {
    if (isSales && salespersonId) {
      return visits.filter((v) => v.salespersonId === salespersonId);
    }
    return visits;
  }, [visits, isSales, salespersonId]);

  const scopedSalespeople = useMemo(() => {
    if (isSales && salespersonId) {
      return salespeople.filter((s) => s.id === salespersonId);
    }
    return salespeople;
  }, [isSales, salespersonId]);

  const insights = useMemo(() => {
    if (!isSales || !salespersonId || !me) return null;
    const stats = computeSalespersonStats(me, scopedArchitects, scopedVisits);
    const hotSites = scopedArchitects.filter((a) => a.leadStatus === 'Hot').length;
    const followUps = scopedVisits.filter(
      (v) =>
        v.outcome === 'Follow-up Needed' &&
        (!v.nextFollowUp || v.nextFollowUp <= '2026-08-24')
    ).length;
    const visitsThisMonth = scopedVisits.filter((v) => isThisMonth(v.date)).length;
    return {
      sites: scopedArchitects.length,
      visitsThisMonth,
      leads: stats.leadsGenerated,
      conversion: stats.conversionRate,
      hotSites,
      followUps,
      lastCheckIn: me.lastCheckIn,
      badge: stats.badge,
      region: me.region,
    };
  }, [isSales, salespersonId, me, scopedArchitects, scopedVisits]);

  const pins = useMemo<MapPinItem[]>(() => {
    const archPins: MapPinItem[] = scopedArchitects.map((a) => {
      const myVisits = scopedVisits
        .filter((v) => v.architectId === a.id)
        .sort((x, y) => y.date.localeCompare(x.date));
      const last = myVisits[0];
      const needsFollowUp =
        last?.outcome === 'Follow-up Needed' ||
        Boolean(last?.nextFollowUp && last.nextFollowUp <= '2026-08-24');
      return {
        kind: 'architect',
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        name: a.name,
        subtitle: a.firm,
        site: a.siteName,
        region: a.region,
        lastVisit: last?.date,
        salesperson: getSalesperson(a.salespersonId)?.name ?? '—',
        leadStatus: a.leadStatus,
        needsFollowUp,
      };
    });

    const checkPins: MapPinItem[] = scopedSalespeople
      .filter((s) => s.lastCheckIn)
      .map((s) => {
        const c = s.lastCheckIn!;
        return {
          kind: 'checkin' as const,
          id: `checkin-${s.id}`,
          lat: c.lat,
          lng: c.lng,
          name: isSales ? 'My last check-in' : s.name,
          subtitle: isSales ? 'Your field position' : 'Last field check-in',
          label: c.label,
          region: s.region,
          lastVisit: c.date,
          salesperson: s.name,
        };
      });

    return [...archPins, ...checkPins];
  }, [scopedArchitects, scopedVisits, scopedSalespeople, isSales]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pins.filter((p) => {
      if (layer === 'architects' && p.kind !== 'architect') return false;
      if (layer === 'checkins' && p.kind !== 'checkin') return false;
      if (!isSales && region !== 'all' && p.region !== region) return false;
      if (isSales && leadFilter !== 'all') {
        if (p.kind === 'checkin') return false;
        if (leadFilter === 'followup' && !p.needsFollowUp) return false;
        if (leadFilter !== 'followup' && p.leadStatus !== leadFilter) return false;
      }
      if (!q) return true;
      const hay = [
        p.name,
        p.subtitle,
        p.region,
        p.kind === 'architect' ? p.site : p.label,
        p.salesperson,
        p.kind === 'architect' ? p.leadStatus : '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [pins, layer, region, query, isSales, leadFilter]);

  const fitPoints = useMemo(
    () => filtered.map((p) => [p.lat, p.lng] as [number, number]),
    [filtered]
  );

  const selected = filtered.find((p) => p.id === selectedId) ?? null;

  const selectPin = (pin: MapPinItem, zoom?: number) => {
    setSelectedId(pin.id);
    setFocus({ lat: pin.lat, lng: pin.lng, zoom });
  };

  const flyToRegion = (value: string) => {
    setRegion(value);
    if (value === 'all') {
      setFitKey((k) => k + 1);
      setFocus(null);
      return;
    }
    const spot = REGION_FOCUS[value];
    if (spot) setFocus({ lat: spot.center[0], lng: spot.center[1], zoom: spot.zoom });
  };

  const resetView = () => {
    setLayer('all');
    setLeadFilter('all');
    setQuery('');
    setSelectedId(null);
    if (isSales && me) {
      setRegion(me.region);
      const spot = REGION_FOCUS[me.region];
      if (spot) {
        setFocus({ lat: spot.center[0], lng: spot.center[1], zoom: spot.zoom });
      }
      setFitKey((k) => k + 1);
    } else {
      setRegion('all');
      setFocus({ lat: INDIA_CENTER[0], lng: INDIA_CENTER[1], zoom: DEFAULT_ZOOM });
      setFitKey((k) => k + 1);
    }
  };

  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-pin="${selectedId}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  const initialCenter: [number, number] =
    isSales && me && REGION_FOCUS[me.region]
      ? REGION_FOCUS[me.region].center
      : INDIA_CENTER;
  const initialZoom =
    isSales && me && REGION_FOCUS[me.region]
      ? REGION_FOCUS[me.region].zoom
      : DEFAULT_ZOOM;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">{isSales ? 'Field sales' : 'Admin'}</div>
          <h1>{isSales ? 'My Territory Map' : 'Territory Map'}</h1>
          <p>
            {isSales
              ? `Your architects, check-ins, and follow-ups across ${me?.region ?? 'your region'}. Pan, zoom, and tap a pin to act.`
              : 'Interactive field map — pan, zoom, search, and filter architect sites vs. salesperson check-ins.'}
          </p>
        </div>
        <div className="actions-row">
          <button type="button" className="btn btn-secondary" onClick={resetView}>
            <LocateFixed size={16} />
            Reset view
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFitKey((k) => k + 1)}
            disabled={filtered.length === 0}
          >
            <Crosshair size={16} />
            Fit markers
          </button>
        </div>
      </div>

      {insights && (
        <div className="map-insights">
          <div className="map-insight">
            <span className="l">My sites</span>
            <span className="v">{insights.sites}</span>
          </div>
          <div className="map-insight">
            <span className="l">Visits this month</span>
            <span className="v">{insights.visitsThisMonth}</span>
          </div>
          <div className="map-insight">
            <span className="l">Leads</span>
            <span className="v">{insights.leads}</span>
          </div>
          <div className="map-insight">
            <span className="l">Conversion</span>
            <span className="v">{insights.conversion}%</span>
          </div>
          <div className="map-insight">
            <span className="l">Hot leads</span>
            <span className="v">
              <Flame size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
              {insights.hotSites}
            </span>
          </div>
          <div className="map-insight">
            <span className="l">Follow-ups due</span>
            <span className="v">{insights.followUps}</span>
          </div>
          {insights.lastCheckIn && (
            <div className="map-insight wide">
              <span className="l">Last check-in</span>
              <span className="v sm">
                {insights.lastCheckIn.label} · {formatDateTime(insights.lastCheckIn.date)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="map-toolbar">
        <div className="map-search">
          <Search size={16} />
          <input
            type="search"
            placeholder={
              isSales
                ? 'Search my architects or sites…'
                : 'Search architect, site, salesperson…'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="map-search-clear" onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="map-chip-group" role="group" aria-label="Layer filter">
          {(
            [
              ['all', 'All layers'],
              ['architects', isSales ? 'My sites' : 'Architects'],
              ['checkins', isSales ? 'My check-in' : 'Check-ins'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`map-chip ${layer === value ? 'active' : ''}`}
              onClick={() => setLayer(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {isSales ? (
          <select
            className="map-region-select"
            value={leadFilter}
            onChange={(e) =>
              setLeadFilter(e.target.value as 'all' | LeadStatus | 'followup')
            }
            aria-label="Lead filter"
          >
            <option value="all">All lead statuses</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="New">New</option>
            <option value="Converted">Converted</option>
            <option value="Cold">Cold</option>
            <option value="followup">Follow-up needed</option>
          </select>
        ) : (
          <select
            className="map-region-select"
            value={region}
            onChange={(e) => flyToRegion(e.target.value)}
            aria-label="Focus region"
          >
            <option value="all">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          className={`map-chip ${showHeat ? 'active' : ''}`}
          onClick={() => setShowHeat((v) => !v)}
          title="Toggle activity rings around check-ins"
        >
          {showHeat ? <Eye size={14} /> : <EyeOff size={14} />}
          Activity rings
        </button>
      </div>

      <div className="map-workspace">
        <aside className="map-sidebar card">
          <div className="map-sidebar-head">
            <strong>{filtered.length}</strong> locations
            <span>
              {filtered.filter((p) => p.kind === 'architect').length} sites ·{' '}
              {filtered.filter((p) => p.kind === 'checkin').length} check-in
              {filtered.filter((p) => p.kind === 'checkin').length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="map-sidebar-list" ref={listRef}>
            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: '1.5rem 0.75rem' }}>
                No pins match filters.
              </div>
            )}
            {filtered.map((pin) => (
              <button
                key={pin.id}
                type="button"
                data-pin={pin.id}
                className={`map-list-item ${selectedId === pin.id ? 'active' : ''}`}
                onClick={() => selectPin(pin, 13)}
              >
                <span className={`map-list-icon ${pin.kind}`}>
                  {pin.kind === 'architect' ? (
                    <Building2 size={14} />
                  ) : (
                    <UserRound size={14} />
                  )}
                </span>
                <span className="map-list-body">
                  <span className="map-list-title">{pin.name}</span>
                  <span className="map-list-sub">
                    {pin.kind === 'architect' ? pin.site : pin.label}
                  </span>
                  <span className="map-list-meta">
                    {pin.kind === 'architect'
                      ? `${pin.leadStatus}${pin.needsFollowUp ? ' · Follow-up' : ''}`
                      : pin.region}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="map-stage map-stage-live" ref={setStageEl}>
          <MapContainer
            center={initialCenter}
            zoom={initialZoom}
            minZoom={4}
            maxZoom={16}
            zoomControl={false}
            className="crm-leaflet"
            scrollWheelZoom
            doubleClickZoom
            dragging
            worldCopyJump={false}
            maxBounds={[
              [6, 66],
              [38, 98],
            ]}
            maxBoundsViscosity={0.85}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
            />
            <ZoomControl position="bottomright" />
            <ScaleControl position="bottomleft" imperial={false} />
            <MapController
              focus={focus}
              fitPoints={fitPoints}
              fitKey={fitKey}
              onCoords={onCoords}
            />

            {showHeat &&
              filtered
                .filter((p) => p.kind === 'checkin')
                .map((p) => (
                  <CircleMarker
                    key={`ring-${p.id}`}
                    center={[p.lat, p.lng]}
                    radius={28}
                    pathOptions={{
                      color: '#3d5a73',
                      fillColor: '#3d5a73',
                      fillOpacity: 0.12,
                      weight: 1,
                      opacity: 0.45,
                    }}
                  />
                ))}

            {filtered.map((pin) => (
              <Marker
                key={pin.id}
                position={[pin.lat, pin.lng]}
                icon={createPinIcon(pin.kind, selectedId === pin.id)}
                eventHandlers={{
                  click: () => setSelectedId(pin.id),
                }}
              >
                <Popup className="crm-map-popup" maxWidth={280}>
                  <div className="map-popup-card">
                    <div className="map-popup-kicker">
                      {pin.kind === 'architect' ? (
                        <>
                          <MapPin size={12} /> Architect site
                        </>
                      ) : (
                        <>
                          <UserRound size={12} />{' '}
                          {isSales ? 'My check-in' : 'Sales check-in'}
                        </>
                      )}
                    </div>
                    <h4>{pin.name}</h4>
                    <p className="map-popup-firm">{pin.subtitle}</p>
                    {pin.kind === 'architect' ? (
                      <>
                        <p>{pin.site}</p>
                        <p>
                          Last visit:{' '}
                          {pin.lastVisit ? formatDate(pin.lastVisit) : 'None yet'}
                        </p>
                        {!isSales && <p>Assigned: {pin.salesperson}</p>}
                        <p>Status: {pin.leadStatus}</p>
                        {isSales ? (
                          <Link
                            to={`/sales/checkin/${pin.id}`}
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: '0.55rem' }}
                          >
                            <MapPinned size={14} style={{ marginRight: 4 }} />
                            Check in here
                          </Link>
                        ) : (
                          <Link
                            to={`/admin/architects/${pin.id}`}
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: '0.55rem' }}
                          >
                            Open profile
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <p>{pin.label}</p>
                        <p>Checked in: {formatDateTime(pin.lastVisit)}</p>
                        <p>Region: {pin.region}</p>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {stageEl &&
            createPortal(
              <>
                <div className="map-overlay-legend">
                  <div className="legend-item">
                    <span className="legend-swatch arch" />
                    {isSales ? 'My architect site' : 'Architect / project site'}
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch check" />
                    {isSales ? 'My last check-in' : 'Salesperson check-in'}
                  </div>
                </div>

                {coords && (
                  <div className="map-coords">
                    {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                  </div>
                )}

                {selected && (
                  <div className="map-floating-card">
                    <button
                      type="button"
                      className="map-floating-close"
                      onClick={() => setSelectedId(null)}
                      aria-label="Close"
                    >
                      <X size={14} />
                    </button>
                    <div className="map-popup-kicker">
                      {selected.kind === 'architect' ? 'Architect site' : 'Check-in'}
                    </div>
                    <h4>{selected.name}</h4>
                    <p>
                      {selected.kind === 'architect' ? selected.site : selected.label}
                    </p>
                    <p className="map-floating-meta">
                      {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                      {selected.kind === 'architect'
                        ? ` · ${selected.leadStatus}`
                        : ` · ${selected.region}`}
                    </p>
                    {isSales && selected.kind === 'architect' && (
                      <Link
                        to={`/sales/checkin/${selected.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '0.65rem' }}
                      >
                        Check in
                      </Link>
                    )}
                  </div>
                )}
              </>,
              stageEl
            )}
        </div>
      </div>
    </div>
  );
}
