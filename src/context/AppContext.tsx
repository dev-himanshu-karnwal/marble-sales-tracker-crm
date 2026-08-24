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
  visits as seedVisits,
} from '../data/mockData';
import { nextLeadStatus, todayISODate } from '../data/helpers';
import type {
  Architect,
  Salesperson,
  SessionUser,
  Visit,
  VisitOutcome,
} from '../data/types';

const KEYS = {
  user: 'dct-crm-user',
  architects: 'dct-crm-architects',
  visits: 'dct-crm-visits',
  salespeople: 'dct-crm-salespeople',
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
  visits: Visit[];
  salespeople: Salesperson[];
  addArchitect: (arch: Omit<Architect, 'id' | 'registeredAt'>) => Architect;
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
  const [visits, setVisits] = useState<Visit[]>(() =>
    loadJson(KEYS.visits, seedVisits)
  );
  const [salespeople, setSalespeople] = useState<Salesperson[]>(() =>
    loadJson(KEYS.salespeople, seedSalespeople)
  );

  useEffect(() => saveJson(KEYS.architects, architects), [architects]);
  useEffect(() => saveJson(KEYS.visits, visits), [visits]);
  useEffect(() => saveJson(KEYS.salespeople, salespeople), [salespeople]);

  const addArchitect = useCallback(
    (arch: Omit<Architect, 'id' | 'registeredAt'>) => {
      const created: Architect = {
        ...arch,
        id: `arch-${Date.now()}`,
        registeredAt: todayISODate(),
      };
      setArchitects((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const addVisit = useCallback((visit: Omit<Visit, 'id'>) => {
    const created: Visit = {
      ...visit,
      id: `v-${Date.now()}`,
    };
    setVisits((prev) => [created, ...prev]);
    setArchitects((prev) =>
      prev.map((a) => {
        if (a.id !== visit.architectId) return a;
        const leadStatus = nextLeadStatus(a.leadStatus, visit.outcome);
        const preferredMarble = visit.marbleDiscussed ?? a.preferredMarble;
        return { ...a, leadStatus, preferredMarble };
      })
    );
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
      visits,
      salespeople,
      addArchitect,
      addVisit,
      recordCheckIn,
    }),
    [architects, visits, salespeople, addArchitect, addVisit, recordCheckIn]
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
      const legacy = sessionStorage.getItem('dct-crm-user');
      if (legacy) {
        const parsed = JSON.parse(legacy) as SessionUser;
        saveJson(KEYS.user, parsed);
        sessionStorage.removeItem('dct-crm-user');
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
    sessionStorage.removeItem('dct-crm-user');
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
