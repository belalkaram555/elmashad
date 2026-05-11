
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole, Employee } from '../types';
import { api } from '../services/api';

const AUTH_AUDIT_KEY = 'elmashad-auth-audit-logs';
const ACTIVE_SESSIONS_KEY = 'elmashad-active-sessions';
const CURRENT_SESSION_KEY = 'elmashad-current-session-id';

type AuthEventType = 'login' | 'logout';
type EffectiveRole = UserRole;

interface AuthAuditEntry {
  id: string;
  event: AuthEventType;
  userName: string;
  role: EffectiveRole;
  timestamp: string;
  sessionId: string;
}

interface ActiveSessionEntry {
  sessionId: string;
  userName: string;
  role: EffectiveRole;
  loginAt: string;
  lastSeen: string;
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const normalizeToEffectiveRole = (role: UserRole | null): EffectiveRole => role || 'admin';

const appendAuthAuditLog = (entry: Omit<AuthAuditEntry, 'id'>) => {
  const logs = readJson<AuthAuditEntry[]>(AUTH_AUDIT_KEY, []);
  logs.unshift({ id: `auth_${Date.now()}`, ...entry });
  writeJson(AUTH_AUDIT_KEY, logs.slice(0, 500));
};

const upsertActiveSession = (session: ActiveSessionEntry) => {
  const sessions = readJson<ActiveSessionEntry[]>(ACTIVE_SESSIONS_KEY, []);
  const next = sessions.filter(s => s.sessionId !== session.sessionId);
  next.unshift(session);
  writeJson(ACTIVE_SESSIONS_KEY, next.slice(0, 200));
};

const removeActiveSession = (sessionId: string) => {
  const sessions = readJson<ActiveSessionEntry[]>(ACTIVE_SESSIONS_KEY, []);
  writeJson(ACTIVE_SESSIONS_KEY, sessions.filter(s => s.sessionId !== sessionId));
};

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  user: string | null;
  currentEmployee: Employee | null;
  isLoading: boolean; // حالة التحميل
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// دالة لقراءة البيانات من localStorage فوراً (قبل الـ render)
const getInitialAuthState = () => {
  try {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedRole = localStorage.getItem('userRole') as UserRole;
    const savedUserName = localStorage.getItem('userName');
    const savedEmp = localStorage.getItem('currentEmployee');

    if (savedAuth === 'true' && savedRole) {
      return {
        isAuthenticated: true,
        user: savedUserName || 'المستخدم',
        userRole: savedRole,
        currentEmployee: savedEmp ? JSON.parse(savedEmp) : null,
        isLoading: false
      };
    }
  } catch (error) {
    console.error('Error reading auth state:', error);
  }

  return {
    isAuthenticated: false,
    user: null,
    userRole: null,
    currentEmployee: null,
    isLoading: false
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // تهيئة الـ state مباشرة من localStorage (ليس في useEffect)
  const initialState = getInitialAuthState();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialState.isAuthenticated);
  const [user, setUser] = useState<string | null>(initialState.user);
  const [userRole, setUserRole] = useState<UserRole | null>(initialState.userRole);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(initialState.currentEmployee);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (u: string, p: string): Promise<boolean> => {
    const usernameInput = u.trim().toLowerCase();
    const passwordInput = p.trim();

    // Try to load settings and employees from DB via IPC if available
    let savedSettings: any = {};
    let savedEmployees: Employee[] = [];

    // Check if in Electron
    if (typeof window !== 'undefined' && (window as any).ipcRenderer) {
      try {
        const dbData = await (window as any).ipcRenderer.invoke('db-read');
        if (dbData) {
          savedSettings = dbData.settings || {};
          savedEmployees = dbData.employees || [];
          // Update localStorage just in case
          localStorage.setItem('settings', JSON.stringify(savedSettings));
          localStorage.setItem('employees', JSON.stringify(savedEmployees));
        } else {
          // Fallback to localStorage
          savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
          savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        }
      } catch (e) {
        console.error("Auth DB Read Failed", e);
        // Fallback
        savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
        savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      }
    } else {
      try {
        const [settingsData, employeesData] = await Promise.all([
          api.settings.get(),
          api.employees.list(),
        ]);
        savedSettings = settingsData || {};
        savedEmployees = employeesData || [];
        localStorage.setItem('settings', JSON.stringify(savedSettings));
        localStorage.setItem('employees', JSON.stringify(savedEmployees));
      } catch (e) {
        console.error("Auth API Read Failed", e);
        savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
        savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      }
    }

    const adminUser = (savedSettings.adminUsername || 'elmashad').toLowerCase();
    const adminPass = savedSettings.adminPassword || 'elmashad@123';

    let role: UserRole | null = null;
    let displayName = '';
    let empRecord: Employee | null = null;

    // 1. Check Admin
    if (usernameInput === adminUser && passwordInput === adminPass) {
      role = 'admin';
      displayName = savedSettings.restaurantNameAr || 'مدير النظام';
    }
    // 2. Check Employees
    else {
      const foundEmp = savedEmployees.find(e =>
        e.username?.toLowerCase() === usernameInput &&
        e.password === passwordInput &&
        e.status !== 'inactive'
      );

      if (foundEmp) {
        empRecord = foundEmp;
        displayName = foundEmp.nameAr;
        // Map roles
        const roleMap: Record<string, UserRole> = {
          'كاشير': 'cashier', 'محاسب': 'accountant', 'مدير': 'manager', 'شيف': 'chef', 'مدير النظام': 'admin',
          'cashier': 'cashier', 'accountant': 'accountant', 'manager': 'manager', 'chef': 'chef', 'admin': 'admin'
        };
        role = roleMap[foundEmp.role] || 'cashier';
      }
    }

    if (role) {
      const effectiveRole = normalizeToEffectiveRole(role);
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const nowIso = new Date().toISOString();

      setIsAuthenticated(true);
      setUser(displayName);
      setUserRole(effectiveRole);
      setCurrentEmployee(empRecord);

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', effectiveRole);
      localStorage.setItem('userName', displayName);
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
      if (empRecord) localStorage.setItem('currentEmployee', JSON.stringify(empRecord));

      appendAuthAuditLog({
        event: 'login',
        userName: displayName,
        role: effectiveRole,
        timestamp: nowIso,
        sessionId,
      });

      upsertActiveSession({
        sessionId,
        userName: displayName,
        role: effectiveRole,
        loginAt: nowIso,
        lastSeen: nowIso,
      });

      return true;
    }

    return false;
  };

  const logout = () => {
    const sessionId = localStorage.getItem(CURRENT_SESSION_KEY);
    const currentUserName = user || localStorage.getItem('userName') || 'مستخدم';
    const currentRole = normalizeToEffectiveRole(userRole);
    const nowIso = new Date().toISOString();

    if (sessionId) {
      appendAuthAuditLog({
        event: 'logout',
        userName: currentUserName,
        role: currentRole,
        timestamp: nowIso,
        sessionId,
      });
      removeActiveSession(sessionId);
    }

    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
    setCurrentEmployee(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('currentEmployee');
    localStorage.removeItem(CURRENT_SESSION_KEY);
  };

  useEffect(() => {
    if (!isAuthenticated || !user || !userRole) return;

    let sessionId = localStorage.getItem(CURRENT_SESSION_KEY);
    const role = normalizeToEffectiveRole(userRole);
    const nowIso = new Date().toISOString();

    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
      appendAuthAuditLog({ event: 'login', userName: user, role, timestamp: nowIso, sessionId });
      upsertActiveSession({ sessionId, userName: user, role, loginAt: nowIso, lastSeen: nowIso });
    }

    const pulse = () => {
      const sessions = readJson<ActiveSessionEntry[]>(ACTIVE_SESSIONS_KEY, []);
      const current = sessions.find(s => s.sessionId === sessionId);
      upsertActiveSession({
        sessionId: sessionId!,
        userName: user,
        role,
        loginAt: current?.loginAt || nowIso,
        lastSeen: new Date().toISOString(),
      });
    };

    pulse();
    const interval = window.setInterval(pulse, 30000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, user, userRole, currentEmployee]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, user, currentEmployee, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
