export type UserRole = 'admin' | 'salesperson';

export type VisitOutcome =
  | 'Interested'
  | 'Sample Given'
  | 'Lead Generated'
  | 'No Response'
  | 'Follow-up Needed';

export type LeadStatus = 'New' | 'Warm' | 'Hot' | 'Converted' | 'Cold';

export type PerformanceBadge =
  | 'Top Performer'
  | 'Rising Star'
  | 'Solid'
  | 'Needs Improvement';

/** Where the salesperson physically checked in. */
export type CheckInType = 'site' | 'office';

export interface Salesperson {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  avatarInitials: string;
  lastCheckIn?: {
    lat: number;
    lng: number;
    label: string;
    date: string;
    checkInType: CheckInType;
    architectId?: string;
    siteId?: string;
  };
}

/** Contact / studio — not a project location. */
export interface Architect {
  id: string;
  name: string;
  firm: string;
  phone: string;
  email: string;
  /** Studio / office address */
  address: string;
  region: string;
  officeLat?: number;
  officeLng?: number;
  salespersonId: string;
  preferredMarble?: string;
  registeredAt: string;
}

/**
 * A project site the architect referred to us for marble.
 * Architects may work on many sites; we only track referred ones.
 */
export interface Site {
  id: string;
  architectId: string;
  name: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  leadStatus: LeadStatus;
  preferredMarble?: string;
  referredAt: string;
}

export interface Visit {
  id: string;
  architectId: string;
  /** Set when check-in was at a referred project site */
  siteId?: string;
  checkInType: CheckInType;
  salespersonId: string;
  date: string;
  outcome: VisitOutcome;
  notes: string;
  nextFollowUp?: string;
  marbleDiscussed?: string;
}

export interface SessionUser {
  role: UserRole;
  salespersonId?: string;
}
