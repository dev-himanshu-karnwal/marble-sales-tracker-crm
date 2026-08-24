import { architects, salespeople, visits } from './mockData';
import type {
  Architect,
  PerformanceBadge,
  Salesperson,
  Visit,
  VisitOutcome,
} from './types';

const REFERENCE_DATE = new Date('2026-08-24T23:59:59');

export function getSalesperson(id: string): Salesperson | undefined {
  return salespeople.find((s) => s.id === id);
}

export function getArchitect(id: string): Architect | undefined {
  return architects.find((a) => a.id === id);
}

export function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  return (
    d.getMonth() === REFERENCE_DATE.getMonth() &&
    d.getFullYear() === REFERENCE_DATE.getFullYear()
  );
}

export function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const diff = REFERENCE_DATE.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getVisitsForSalesperson(
  salespersonId: string,
  allVisits: Visit[] = visits
): Visit[] {
  return allVisits.filter((v) => v.salespersonId === salespersonId);
}

export function getArchitectsForSalesperson(
  salespersonId: string,
  allArchitects: Architect[] = architects
): Architect[] {
  return allArchitects.filter((a) => a.salespersonId === salespersonId);
}

export function countLeads(visitList: Visit[]): number {
  return visitList.filter((v) => v.outcome === 'Lead Generated').length;
}

export interface SalespersonStats {
  salesperson: Salesperson;
  architectsRegistered: number;
  visitsThisMonth: number;
  totalVisits: number;
  leadsGenerated: number;
  conversionRate: number;
  badge: PerformanceBadge;
}

export function computeSalespersonStats(
  sp: Salesperson,
  allArchitects: Architect[] = architects,
  allVisits: Visit[] = visits
): SalespersonStats {
  const myArchitects = getArchitectsForSalesperson(sp.id, allArchitects);
  const myVisits = getVisitsForSalesperson(sp.id, allVisits);
  const visitsThisMonth = myVisits.filter((v) => isThisMonth(v.date)).length;
  const leadsGenerated = countLeads(myVisits);
  const conversionRate =
    myVisits.length === 0
      ? 0
      : Math.round((leadsGenerated / myVisits.length) * 100);

  let badge: PerformanceBadge = 'Solid';
  if (leadsGenerated >= 3 && conversionRate >= 25 && visitsThisMonth >= 4) {
    badge = 'Top Performer';
  } else if (leadsGenerated >= 2 && conversionRate >= 20) {
    badge = 'Rising Star';
  } else if (visitsThisMonth <= 2 || conversionRate < 10) {
    badge = 'Needs Improvement';
  }

  return {
    salesperson: sp,
    architectsRegistered: myArchitects.length,
    visitsThisMonth,
    totalVisits: myVisits.length,
    leadsGenerated,
    conversionRate,
    badge,
  };
}

export function getAllLeaderboard(
  allArchitects: Architect[] = architects,
  allVisits: Visit[] = visits
): SalespersonStats[] {
  return salespeople
    .map((sp) => computeSalespersonStats(sp, allArchitects, allVisits))
    .sort((a, b) => {
      if (b.leadsGenerated !== a.leadsGenerated) {
        return b.leadsGenerated - a.leadsGenerated;
      }
      return b.conversionRate - a.conversionRate;
    });
}

export function getVisitsPerSalesperson(
  allVisits: Visit[] = visits
): { name: string; visits: number }[] {
  return salespeople.map((sp) => ({
    name: sp.name.split(' ')[0],
    visits: getVisitsForSalesperson(sp.id, allVisits).filter((v) =>
      isThisMonth(v.date)
    ).length,
  }));
}

export function getVisitsTrend(
  allVisits: Visit[] = visits,
  days = 30
): { date: string; visits: number }[] {
  const result: { date: string; visits: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(REFERENCE_DATE);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = allVisits.filter((v) => v.date.startsWith(key)).length;
    result.push({
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      visits: count,
    });
  }
  return result;
}

export function getLeadsByRegion(
  allArchitects: Architect[] = architects,
  allVisits: Visit[] = visits
): { name: string; value: number }[] {
  const leadArchIds = new Set(
    allVisits
      .filter((v) => v.outcome === 'Lead Generated')
      .map((v) => v.architectId)
  );
  const byRegion: Record<string, number> = {};
  for (const id of leadArchIds) {
    const arch = allArchitects.find((a) => a.id === id);
    if (arch) {
      byRegion[arch.region] = (byRegion[arch.region] || 0) + 1;
    }
  }
  return Object.entries(byRegion).map(([name, value]) => ({ name, value }));
}

export function getLeadsByMarble(
  allVisits: Visit[] = visits
): { name: string; value: number }[] {
  const byMarble: Record<string, number> = {};
  for (const v of allVisits) {
    if (v.outcome === 'Lead Generated' && v.marbleDiscussed) {
      byMarble[v.marbleDiscussed] = (byMarble[v.marbleDiscussed] || 0) + 1;
    }
  }
  return Object.entries(byMarble).map(([name, value]) => ({ name, value }));
}

export function outcomeClass(outcome: VisitOutcome): string {
  switch (outcome) {
    case 'Lead Generated':
      return 'badge-success';
    case 'Sample Given':
      return 'badge-info';
    case 'Interested':
      return 'badge-gold';
    case 'Follow-up Needed':
      return 'badge-warn';
    case 'No Response':
      return 'badge-muted';
    default:
      return 'badge-muted';
  }
}

export function leadStatusClass(status: string): string {
  switch (status) {
    case 'Hot':
      return 'badge-danger';
    case 'Warm':
      return 'badge-gold';
    case 'Converted':
      return 'badge-success';
    case 'New':
      return 'badge-info';
    case 'Cold':
      return 'badge-muted';
    default:
      return 'badge-muted';
  }
}

export function badgeClass(badge: PerformanceBadge): string {
  switch (badge) {
    case 'Top Performer':
      return 'badge-success';
    case 'Rising Star':
      return 'badge-info';
    case 'Needs Improvement':
      return 'badge-danger';
    default:
      return 'badge-muted';
  }
}
