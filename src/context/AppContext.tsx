import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { architects as seedArchitects, visits as seedVisits } from '../data/mockData';
import type { Architect, SessionUser, Visit, VisitOutcome } from '../data/types';

interface DataContextValue {
  architects: Architect[];
  visits: Visit[];
  addArchitect: (arch: Omit<Architect, 'id' | 'registeredAt'>) => Architect;
  addVisit: (visit: Omit<Visit, 'id'>) => Visit;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [architects, setArchitects] = useState<Architect[]>(seedArchitects);
  const [visits, setVisits] = useState<Visit[]>(seedVisits);

  const addArchitect = useCallback(
    (arch: Omit<Architect, 'id' | 'registeredAt'>) => {
      const created: Architect = {
        ...arch,
        id: `arch-${Date.now()}`,
        registeredAt: new Date().toISOString().slice(0, 10),
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
    return created;
  }, []);

  const value = useMemo(
    () => ({ architects, visits, addArchitect, addVisit }),
    [architects, visits, addArchitect, addVisit]
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
    const raw = sessionStorage.getItem('dct-crm-user');
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  });

  const persist = (u: SessionUser | null) => {
    setUser(u);
    if (u) sessionStorage.setItem('dct-crm-user', JSON.stringify(u));
    else sessionStorage.removeItem('dct-crm-user');
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
