export type UserRole = 'admin' | 'salesperson';

export type VisitOutcome =
  | 'Interested'
  | 'Sample Given'
  | 'Lead Generated'
  | 'No Response'
  | 'Follow-up Needed';

export type LeadStatus = 'New' | 'Warm' | 'Hot' | 'Converted' | 'Cold';

export type PerformanceBadge = 'Top Performer' | 'Rising Star' | 'Solid' | 'Needs Improvement';

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
  };
}

export interface Architect {
  id: string;
  name: string;
  firm: string;
  phone: string;
  email: string;
  address: string;
  siteName: string;
  region: string;
  lat: number;
  lng: number;
  salespersonId: string;
  leadStatus: LeadStatus;
  preferredMarble?: string;
  registeredAt: string;
}

export interface Visit {
  id: string;
  architectId: string;
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
