import React, { useEffect, useMemo, useState } from 'react';
import { Activity, LogIn, LogOut, Users, Wifi } from 'lucide-react';
import { UserRole } from '../../types';

const AUTH_AUDIT_KEY = 'elmashad-auth-audit-logs';
const ACTIVE_SESSIONS_KEY = 'elmashad-active-sessions';

interface AuthAuditEntry {
  id: string;
  event: 'login' | 'logout';
  userName: string;
  role: UserRole;
  timestamp: string;
  sessionId: string;
}

interface ActiveSessionEntry {
  sessionId: string;
  userName: string;
  role: UserRole;
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

const isLiveNow = (lastSeenIso: string) => {
  const diff = Date.now() - new Date(lastSeenIso).getTime();
  return diff <= 70 * 1000;
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'مدير النظام';
    case 'manager': return 'مدير';
    case 'cashier': return 'كاشير';
    case 'accountant': return 'محاسب';
    case 'chef': return 'شيف';
    default: return role;
  }
};

const AuditLogs: React.FC = () => {
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<AuthAuditEntry[]>([]);
  const [sessions, setSessions] = useState<ActiveSessionEntry[]>([]);

  useEffect(() => {
    const load = () => {
      setLogs(readJson<AuthAuditEntry[]>(AUTH_AUDIT_KEY, []));
      setSessions(readJson<ActiveSessionEntry[]>(ACTIVE_SESSIONS_KEY, []));
    };

    load();
    const interval = window.setInterval(load, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const liveSessions = useMemo(
    () => sessions.filter(s => isLiveNow(s.lastSeen)).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)),
    [sessions]
  );

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(log =>
      log.userName.toLowerCase().includes(q) ||
      log.event.toLowerCase().includes(q) ||
      log.role.toLowerCase().includes(q)
    );
  }, [logs, query]);

  return (
    <div className="space-y-6 font-cairo">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-textPrimary">سجل المراقبة</h2>
          <p className="text-secondary text-xs font-bold mt-1">تتبع من دخل وخرج ومن هو لايف الآن داخل النظام</p>
        </div>
        <input
          className="px-4 py-2.5 bg-surface border border-cardAccent rounded-xl text-sm font-bold text-textPrimary outline-none"
          placeholder="بحث باسم المستخدم..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-cardAccent rounded-2xl p-4">
          <p className="text-[11px] text-secondary font-black">عدد المستخدمين لايف</p>
          <p className="text-3xl font-black text-accentGreen mt-1">{liveSessions.length}</p>
        </div>
        <div className="bg-surface border border-cardAccent rounded-2xl p-4">
          <p className="text-[11px] text-secondary font-black">إجمالي مرات الدخول</p>
          <p className="text-3xl font-black text-accentBlue mt-1">{logs.filter(l => l.event === 'login').length}</p>
        </div>
        <div className="bg-surface border border-cardAccent rounded-2xl p-4">
          <p className="text-[11px] text-secondary font-black">إجمالي مرات الخروج</p>
          <p className="text-3xl font-black text-orange-400 mt-1">{logs.filter(l => l.event === 'logout').length}</p>
        </div>
      </div>

      <div className="bg-surface border border-cardAccent rounded-2xl p-4">
        <h3 className="font-black text-textPrimary mb-3 flex items-center gap-2"><Wifi size={16} className="text-accentGreen" />المستخدمون اللايف حالياً</h3>
        {liveSessions.length === 0 ? (
          <p className="text-secondary text-sm font-bold">لا يوجد مستخدمون لايف حالياً</p>
        ) : (
          <div className="space-y-2">
            {liveSessions.map(s => (
              <div key={s.sessionId} className="flex items-center justify-between bg-background border border-cardAccent rounded-xl px-3 py-2">
                <div>
                  <p className="font-black text-textPrimary text-sm">{s.userName}</p>
                  <p className="text-secondary text-[11px] font-bold">{getRoleLabel(s.role)}</p>
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-secondary font-bold">دخول: {new Date(s.loginAt).toLocaleString('ar-EG')}</p>
                  <p className="text-[11px] text-accentGreen font-black">آخر نبضة: {new Date(s.lastSeen).toLocaleTimeString('ar-EG')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface border border-cardAccent rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-cardAccent flex items-center gap-2">
          <Activity size={16} className="text-primary" />
          <h3 className="font-black text-textPrimary">سجل الدخول والخروج</h3>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="p-4 text-secondary text-sm font-bold">لا توجد سجلات حالياً</p>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="px-4 py-3 border-b border-cardAccent/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {log.event === 'login' ? <LogIn size={14} className="text-accentGreen" /> : <LogOut size={14} className="text-orange-400" />}
                  <div>
                    <p className="font-black text-textPrimary text-sm">{log.userName}</p>
                    <p className="text-secondary text-[11px] font-bold">{log.event === 'login' ? 'دخول للنظام' : 'خروج من النظام'} • {getRoleLabel(log.role)}</p>
                  </div>
                </div>
                <p className="text-[11px] text-secondary font-bold">{new Date(log.timestamp).toLocaleString('ar-EG')}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
