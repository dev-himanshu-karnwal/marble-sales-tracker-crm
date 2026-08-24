import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  GitBranch,
} from 'lucide-react';
import { useAuth, useData } from '../context/AppContext';
import EmptyState from './EmptyState';
import {
  formatDate,
  formatDateTime,
  getArchitect,
  getSalesperson,
  outcomeClass,
  referenceDate,
  todayISODate,
} from '../data/helpers';
import { VISIT_OUTCOMES } from '../data/mockData';
import type { Architect, Salesperson, Visit, VisitOutcome } from '../data/types';

type ViewMode = 'timeline' | 'list' | 'calendar';

interface ActivityItem {
  id: string;
  kind: 'visit' | 'followup';
  /** YYYY-MM-DD for grouping / calendar cells */
  day: string;
  sortKey: string;
  visit: Visit;
  architect?: Architect;
  salesperson?: Salesperson;
}

function toDay(iso: string): string {
  return iso.slice(0, 10);
}

function buildActivities(
  visits: Visit[],
  architects: Architect[],
  salespeople: Salesperson[]
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const visit of visits) {
    const architect = getArchitect(visit.architectId, architects);
    const salesperson = getSalesperson(visit.salespersonId, salespeople);
    items.push({
      id: `visit-${visit.id}`,
      kind: 'visit',
      day: toDay(visit.date),
      sortKey: visit.date,
      visit,
      architect,
      salesperson,
    });
    if (visit.nextFollowUp) {
      items.push({
        id: `followup-${visit.id}`,
        kind: 'followup',
        day: visit.nextFollowUp,
        sortKey: `${visit.nextFollowUp}T23:59:00`,
        visit,
        architect,
        salesperson,
      });
    }
  }

  return items.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function startWeekday(year: number, month: number): number {
  // Monday-first: Sun=6 … Mon=0
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function ActivityTimeline() {
  const { user } = useAuth();
  const { visits, architects, salespeople } = useData();
  const isSales = user?.role === 'salesperson';

  const [view, setView] = useState<ViewMode>('timeline');
  const [q, setQ] = useState('');
  const [outcome, setOutcome] = useState('all');
  const [spId, setSpId] = useState('all');
  const [kindFilter, setKindFilter] = useState<'all' | 'visit' | 'followup'>(
    'all'
  );

  const now = referenceDate();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(todayISODate());

  const scopedVisits = useMemo(() => {
    if (isSales && user?.salespersonId) {
      return visits.filter((v) => v.salespersonId === user.salespersonId);
    }
    return visits;
  }, [visits, isSales, user?.salespersonId]);

  const allItems = useMemo(
    () => buildActivities(scopedVisits, architects, salespeople),
    [scopedVisits, architects, salespeople]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return allItems.filter((item) => {
      if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
      if (outcome !== 'all' && item.visit.outcome !== outcome) return false;
      if (!isSales && spId !== 'all' && item.visit.salespersonId !== spId) {
        return false;
      }
      if (!query) return true;
      return (
        item.architect?.name.toLowerCase().includes(query) ||
        item.architect?.firm.toLowerCase().includes(query) ||
        item.architect?.siteName.toLowerCase().includes(query) ||
        item.salesperson?.name.toLowerCase().includes(query) ||
        item.visit.notes.toLowerCase().includes(query) ||
        item.visit.marbleDiscussed?.toLowerCase().includes(query) ||
        item.visit.outcome.toLowerCase().includes(query)
      );
    });
  }, [allItems, q, outcome, spId, kindFilter, isSales]);

  const timelineGroups = useMemo(() => {
    const map = new Map<string, ActivityItem[]>();
    for (const item of filtered) {
      const list = map.get(item.day) ?? [];
      list.push(item);
      map.set(item.day, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const byDay = useMemo(() => {
    const map = new Map<string, ActivityItem[]>();
    for (const item of filtered) {
      const list = map.get(item.day) ?? [];
      list.push(item);
      map.set(item.day, list);
    }
    return map;
  }, [filtered]);

  const dayDetail = selectedDay ? (byDay.get(selectedDay) ?? []) : [];

  const archHref = (archId: string) =>
    isSales ? `/sales/architects/${archId}` : `/admin/architects/${archId}`;

  const shiftMonth = (delta: number) => {
    const d = new Date(calYear, calMonth + delta, 1);
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
  };

  const totalCells = (() => {
    const days = daysInMonth(calYear, calMonth);
    const start = startWeekday(calYear, calMonth);
    const cells = Math.ceil((start + days) / 7) * 7;
    return cells;
  })();

  const views: { id: ViewMode; label: string; icon: typeof GitBranch }[] = [
    { id: 'timeline', label: 'Timeline', icon: GitBranch },
    { id: 'list', label: 'List', icon: List },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">{isSales ? 'Field sales' : 'Admin'}</div>
          <h1>Activity Timeline</h1>
          <p>
            Visits and follow-ups in one place — switch between timeline, list,
            or calendar.
          </p>
        </div>
        <div className="view-toggle" role="tablist" aria-label="Activity views">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              className={`view-toggle-btn ${view === id ? 'active' : ''}`}
              onClick={() => setView(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="search-bar">
        <input
          type="search"
          placeholder="Search architect, site, notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          value={kindFilter}
          onChange={(e) =>
            setKindFilter(e.target.value as 'all' | 'visit' | 'followup')
          }
        >
          <option value="all">Visits & follow-ups</option>
          <option value="visit">Visits only</option>
          <option value="followup">Follow-ups only</option>
        </select>
        <select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        >
          <option value="all">All outcomes</option>
          {VISIT_OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {!isSales && (
          <select value={spId} onChange={(e) => setSpId(e.target.value)}>
            <option value="all">All salespeople</option>
            {salespeople.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No activity matches"
            description="Try clearing filters or log a new site visit."
            actionLabel={isSales ? 'My architects' : undefined}
            actionTo={isSales ? '/sales' : undefined}
          />
        </div>
      ) : (
        <>
          {view === 'timeline' && (
            <div className="activity-timeline">
              {timelineGroups.map(([day, items]) => (
                <section key={day} className="activity-day-group">
                  <div className="activity-day-label">
                    <strong>{formatDate(day)}</strong>
                    <span>
                      {items.length} item{items.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="timeline">
                    {items.map((item) => (
                      <ActivityTimelineRow
                        key={item.id}
                        item={item}
                        showSalesperson={!isSales}
                        archHref={archHref}
                        showTime={item.kind === 'visit'}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {view === 'list' && (
            <div className="card table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Type</th>
                    <th>Architect / Site</th>
                    {!isSales && <th>Salesperson</th>}
                    <th>Outcome</th>
                    <th>Marble</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {item.kind === 'visit'
                          ? formatDateTime(item.visit.date)
                          : formatDate(item.day)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.kind === 'visit' ? 'badge-info' : 'badge-warn'
                          }`}
                        >
                          {item.kind === 'visit' ? 'Visit' : 'Follow-up'}
                        </span>
                      </td>
                      <td>
                        {item.architect ? (
                          <Link to={archHref(item.architect.id)}>
                            <strong>{item.architect.name}</strong>
                          </Link>
                        ) : (
                          <strong>—</strong>
                        )}
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--ink-muted)',
                          }}
                        >
                          {item.architect?.siteName}
                        </div>
                      </td>
                      {!isSales && <td>{item.salesperson?.name ?? '—'}</td>}
                      <td>
                        <span
                          className={`badge ${outcomeClass(item.visit.outcome)}`}
                        >
                          {item.visit.outcome}
                        </span>
                      </td>
                      <td>{item.visit.marbleDiscussed ?? '—'}</td>
                      <td style={{ maxWidth: 280 }}>{item.visit.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'calendar' && (
            <div className="activity-calendar-layout">
              <div className="card card-pad activity-calendar">
                <div className="cal-toolbar">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => shiftMonth(-1)}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h2>{monthLabel(calYear, calMonth)}</h2>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => shiftMonth(1)}
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm cal-today-btn"
                    onClick={() => {
                      const t = referenceDate();
                      setCalYear(t.getFullYear());
                      setCalMonth(t.getMonth());
                      setSelectedDay(todayISODate());
                    }}
                  >
                    Today
                  </button>
                </div>

                <div className="cal-weekdays">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="cal-grid">
                  {Array.from({ length: totalCells }, (_, i) => {
                    const start = startWeekday(calYear, calMonth);
                    const dayNum = i - start + 1;
                    const inMonth =
                      dayNum >= 1 && dayNum <= daysInMonth(calYear, calMonth);
                    if (!inMonth) {
                      return <div key={i} className="cal-cell is-outside" />;
                    }
                    const dayStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const dayItems = byDay.get(dayStr) ?? [];
                    const visitsCount = dayItems.filter(
                      (x) => x.kind === 'visit'
                    ).length;
                    const followCount = dayItems.filter(
                      (x) => x.kind === 'followup'
                    ).length;
                    const isToday = dayStr === todayISODate();
                    const isSelected = dayStr === selectedDay;

                    return (
                      <button
                        key={i}
                        type="button"
                        className={`cal-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${dayItems.length ? 'has-events' : ''}`}
                        onClick={() => setSelectedDay(dayStr)}
                      >
                        <span className="cal-day-num">{dayNum}</span>
                        <div className="cal-dots">
                          {visitsCount > 0 && (
                            <span className="cal-dot visit" title={`${visitsCount} visit(s)`} />
                          )}
                          {followCount > 0 && (
                            <span
                              className="cal-dot followup"
                              title={`${followCount} follow-up(s)`}
                            />
                          )}
                        </div>
                        {dayItems.length > 0 && (
                          <span className="cal-count">{dayItems.length}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="cal-legend">
                  <span>
                    <i className="cal-dot visit" /> Visit
                  </span>
                  <span>
                    <i className="cal-dot followup" /> Follow-up
                  </span>
                </div>
              </div>

              <div className="card card-pad activity-day-panel">
                <h3>
                  {selectedDay ? formatDate(selectedDay) : 'Select a day'}
                </h3>
                {selectedDay && dayDetail.length === 0 && (
                  <p className="activity-day-empty">
                    No visits or follow-ups on this day.
                  </p>
                )}
                {dayDetail.length > 0 && (
                  <div className="timeline" style={{ marginTop: '1rem' }}>
                    {dayDetail.map((item) => (
                      <ActivityTimelineRow
                        key={item.id}
                        item={item}
                        showSalesperson={!isSales}
                        archHref={archHref}
                        showTime={item.kind === 'visit'}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ActivityTimelineRow({
  item,
  showSalesperson,
  archHref,
  showTime,
}: {
  item: ActivityItem;
  showSalesperson: boolean;
  archHref: (id: string) => string;
  showTime: boolean;
}) {
  return (
    <div className="timeline-item">
      <div
        className={`timeline-dot ${item.kind === 'followup' ? 'is-followup' : ''}`}
      />
      <div className="activity-item-body">
        <div className="activity-item-top">
          <span
            className={`badge ${item.kind === 'visit' ? 'badge-info' : 'badge-warn'}`}
          >
            {item.kind === 'visit' ? 'Visit' : 'Follow-up'}
          </span>
          <span className={`badge ${outcomeClass(item.visit.outcome as VisitOutcome)}`}>
            {item.visit.outcome}
          </span>
          {showTime && (
            <span className="activity-item-time">
              {new Date(item.visit.date).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
        <div className="activity-item-title">
          {item.architect ? (
            <Link to={archHref(item.architect.id)}>{item.architect.name}</Link>
          ) : (
            'Unknown architect'
          )}
          {item.architect?.siteName && (
            <span className="activity-item-site"> · {item.architect.siteName}</span>
          )}
        </div>
        {showSalesperson && item.salesperson && (
          <div className="activity-item-meta">{item.salesperson.name}</div>
        )}
        {item.visit.marbleDiscussed && (
          <div className="activity-item-marble">
            Marble: {item.visit.marbleDiscussed}
          </div>
        )}
        <p className="activity-item-notes">{item.visit.notes}</p>
      </div>
    </div>
  );
}
