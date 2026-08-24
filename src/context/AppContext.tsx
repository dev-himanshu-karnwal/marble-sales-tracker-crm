import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  architects as seedArchitects,
  salespeople as seedSalespeople,
  sites as seedSites,
  visits as seedVisits,
} from '../data/mockData';
import { nextLeadStatus, todayISODate } from '../data/helpers';
import type {
  Architect,
  Salesperson,
  SessionUser,
  Site,
  Visit,
  VisitOutcome,
} from '../data/types';

/** v2 keys — architect/site split; ignores legacy flat-architect cache */
const KEYS = {
  user: 'Jindal-crm-user',
  architects: 'Jindal-crm-v2-architects',
  sites: 'Jindal-crm-v2-sites',
  visits: 'Jindal-crm-v2-visits',
  salespeople: 'Jindal-crm-v2-salespeople',
} as const;

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

interface DataContextValue {
  architects: Architect[];
  sites: Site[];
  visits: Visit[];
  salespeople: Salesperson[];
  addArchitect: (
    arch: Omit<Architect, 'id' | 'registeredAt'>,
    firstSite?: Omit<Site, 'id' | 'architectId' | 'referredAt'>
  ) => { architect: Architect; site?: Site };
  addSite: (site: Omit<Site, 'id' | 'referredAt'>) => Site;
  addVisit: (visit: Omit<Visit, 'id'>) => Visit;
  recordCheckIn: (
    salespersonId: string,
    checkIn: NonNullable<Salesperson['lastCheckIn']>
  ) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [architects, setArchitects] = useState<Architect[]>(() =>
    loadJson(KEYS.architects, seedArchitects)
  );
  const [sites, setSites] = useState<Site[]>(() =>
    loadJson(KEYS.sites, seedSites)
  );
  const [visits, setVisits] = useState<Visit[]>(() =>
    loadJson(KEYS.visits, seedVisits)
  );
  const [salespeople, setSalespeople] = useState<Salesperson[]>(() =>
    loadJson(KEYS.salespeople, seedSalespeople)
  );

  useEffect(() => saveJson(KEYS.architects, architects), [architects]);
  useEffect(() => saveJson(KEYS.sites, sites), [sites]);
  useEffect(() => saveJson(KEYS.visits, visits), [visits]);
  useEffect(() => saveJson(KEYS.salespeople, salespeople), [salespeople]);

  const addArchitect = useCallback(
    (
      arch: Omit<Architect, 'id' | 'registeredAt'>,
      firstSite?: Omit<Site, 'id' | 'architectId' | 'referredAt'>
    ) => {
      const architect: Architect = {
        ...arch,
        id: `arch-${Date.now()}`,
        registeredAt: todayISODate(),
      };
      setArchitects((prev) => [architect, ...prev]);
      let site: Site | undefined;
      if (firstSite) {
        site = {
          ...firstSite,
          id: `site-${Date.now()}`,
          architectId: architect.id,
          referredAt: todayISODate(),
        };
        setSites((prev) => [site!, ...prev]);
      }
      return { architect, site };
    },
    []
  );

  const addSite = useCallback((site: Omit<Site, 'id' | 'referredAt'>) => {
    const created: Site = {
      ...site,
      id: `site-${Date.now()}`,
      referredAt: todayISODate(),
    };
    setSites((prev) => [created, ...prev]);
    return created;
  }, []);

  const addVisit = useCallback((visit: Omit<Visit, 'id'>) => {
    const created: Visit = {
      ...visit,
      id: `v-${Date.now()}`,
    };
    setVisits((prev) => [created, ...prev]);
    if (visit.siteId) {
      setSites((prev) =>
        prev.map((s) => {
          if (s.id !== visit.siteId) return s;
          return {
            ...s,
            leadStatus: nextLeadStatus(s.leadStatus, visit.outcome),
            preferredMarble: visit.marbleDiscussed ?? s.preferredMarble,
          };
        })
      );
    }
    return created;
  }, []);

  const recordCheckIn = useCallback(
    (
      salespersonId: string,
      checkIn: NonNullable<Salesperson['lastCheckIn']>
    ) => {
      setSalespeople((prev) =>
        prev.map((s) =>
          s.id === salespersonId ? { ...s, lastCheckIn: checkIn } : s
        )
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      architects,
      sites,
      visits,
      salespeople,
      addArchitect,
      addSite,
      addVisit,
      recordCheckIn,
    }),
    [
      architects,
      sites,
      visits,
      salespeople,
      addArchitect,
      addSite,
      addVisit,
      recordCheckIn,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

interface AuthContextValue {
  user: SessionUser | null;
  loginAdmin: () => void;
  loginSalesperson: (salespersonId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    const fromLocal = loadJson<SessionUser | null>(KEYS.user, null);
    if (fromLocal) return fromLocal;
    try {
      const legacy = sessionStorage.getItem('Jindal-crm-user');
      if (legacy) {
        const parsed = JSON.parse(legacy) as SessionUser;
        saveJson(KEYS.user, parsed);
        sessionStorage.removeItem('Jindal-crm-user');
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  const persist = (u: SessionUser | null) => {
    setUser(u);
    if (u) saveJson(KEYS.user, u);
    else localStorage.removeItem(KEYS.user);
    sessionStorage.removeItem('Jindal-crm-user');
  };

  const loginAdmin = () => persist({ role: 'admin' });
  const loginSalesperson = (salespersonId: string) =>
    persist({ role: 'salesperson', salespersonId });
  const logout = () => persist(null);

  const value = useMemo(
    () => ({ user, loginAdmin, loginSalesperson, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export type { VisitOutcome };
