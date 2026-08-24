import { architects, salespeople, sites, visits } from './mockData';
import type {
  Architect,
  LeadStatus,
  PerformanceBadge,
  Salesperson,
  Site,
  Visit,
  VisitOutcome,
} from './types';

/** Always wall-clock "now" so KPIs stay in sync with newly logged visits. */
export function referenceDate(): Date {
  return new Date();
}

export function todayISODate(): string {
  return referenceDate().toISOString().slice(0, 10);
}

export function getSalesperson(
  id: string,
  list: Salesperson[] = salespeople
): Salesperson | undefined {
  return list.find((s) => s.id === id);
}

export function getArchitect(
  id: string,
  list: Architect[] = architects
): Architect | undefined {
  return list.find((a) => a.id === id);
}

export function getSite(id: string, list: Site[] = sites): Site | undefined {
  return list.find((s) => s.id === id);
}

export function getSitesForArchitect(
  architectId: string,
  list: Site[] = sites
): Site[] {
  return list.filter((s) => s.architectId === architectId);
}

export function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const ref = referenceDate();
  return (
    d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
  );
}

export function isFollowUpDue(followUpDate?: string): boolean {
  if (!followUpDate) return false;
  return followUpDate <= todayISODate();
}

export function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const diff = referenceDate().getTime() - d.getTime();
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

export function getSitesForSalesperson(
  salespersonId: string,
  allArchitects: Architect[] = architects,
  allSites: Site[] = sites
): Site[] {
  const ids = new Set(
    getArchitectsForSalesperson(salespersonId, allArchitects).map((a) => a.id)
  );
  return allSites.filter((s) => ids.has(s.architectId));
}

export function countLeads(visitList: Visit[]): number {
  return visitList.filter((v) => v.outcome === 'Lead Generated').length;
}

const STATUS_RANK: Record<LeadStatus, number> = {
  New: 0,
  Cold: 0,
  Warm: 1,
  Hot: 2,
  Converted: 3,
};

export function leadStatusFromOutcome(outcome: VisitOutcome): LeadStatus {
  switch (outcome) {
    case 'Lead Generated':
      return 'Hot';
    case 'Sample Given':
      return 'Hot';
    case 'Interested':
      return 'Warm';
    case 'Follow-up Needed':
      return 'Warm';
    case 'No Response':
      return 'Cold';
    default:
      return 'Warm';
  }
}

/** Advance (or cool) lead status from a visit outcome without demoting Converted. */
export function nextLeadStatus(
  current: LeadStatus,
  outcome: VisitOutcome
): LeadStatus {
  if (current === 'Converted') return current;
  const next = leadStatusFromOutcome(outcome);
  if (outcome === 'No Response') return 'Cold';
  if (STATUS_RANK[next] >= STATUS_RANK[current]) return next;
  if (current === 'New' || current === 'Cold') return next;
  return current;
}

/** Best (hottest) lead among an architect's referred sites. */
export function architectLeadStatus(
  architectId: string,
  allSites: Site[] = sites
): LeadStatus {
  const mine = getSitesForArchitect(architectId, allSites);
  if (mine.length === 0) return 'New';
  return mine.reduce((best, s) =>
    STATUS_RANK[s.leadStatus] > STATUS_RANK[best] ? s.leadStatus : best,
    mine[0].leadStatus
  );
}

export function visitLocationLabel(
  visit: Visit,
  allSites: Site[] = sites,
  allArchitects: Architect[] = architects
): string {
  if (visit.checkInType === 'office') {
    const arch = getArchitect(visit.architectId, allArchitects);
    return arch ? `${arch.firm} (office)` : 'Architect office';
  }
  const site = visit.siteId ? getSite(visit.siteId, allSites) : undefined;
  return site?.name ?? 'Project site';
}

export interface SalespersonStats {
  salesperson: Salesperson;
  architectsRegistered: number;
  sitesReferred: number;
  visitsThisMonth: number;
  totalVisits: number;
  leadsGenerated: number;
  conversionRate: number;
  badge: PerformanceBadge;
}

export function computeSalespersonStats(
  sp: Salesperson,
  allArchitects: Architect[] = architects,
  allVisits: Visit[] = visits,
  allSites: Site[] = sites
): SalespersonStats {
  const myArchitects = getArchitectsForSalesperson(sp.id, allArchitects);
  const mySites = getSitesForSalesperson(sp.id, allArchitects, allSites);
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
    sitesReferred: mySites.length,
    visitsThisMonth,
    totalVisits: myVisits.length,
    leadsGenerated,
    conversionRate,
    badge,
  };
}

export function getAllLeaderboard(
  allArchitects: Architect[] = architects,
  allVisits: Visit[] = visits,
  allSalespeople: Salesperson[] = salespeople,
  allSites: Site[] = sites
): SalespersonStats[] {
  return allSalespeople
    .map((sp) =>
      computeSalespersonStats(sp, allArchitects, allVisits, allSites)
    )
    .sort((a, b) => {
      if (b.leadsGenerated !== a.leadsGenerated) {
        return b.leadsGenerated - a.leadsGenerated;
      }
      return b.conversionRate - a.conversionRate;
    });
}

export function getVisitsPerSalesperson(
  allVisits: Visit[] = visits,
  allSalespeople: Salesperson[] = salespeople
): { name: string; visits: number }[] {
  return allSalespeople.map((sp) => ({
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
  const ref = referenceDate();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(ref);
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
  allSites: Site[] = sites,
  allVisits: Visit[] = visits
): { name: string; value: number }[] {
  const leadSiteIds = new Set(
    allVisits
      .filter((v) => v.outcome === 'Lead Generated' && v.siteId)
      .map((v) => v.siteId!)
  );
  const byRegion: Record<string, number> = {};
  for (const id of leadSiteIds) {
    const site = allSites.find((s) => s.id === id);
    if (site) {
      byRegion[site.region] = (byRegion[site.region] || 0) + 1;
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

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
