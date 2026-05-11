// الإعدادات - سجل المراقبة
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { FileText, Search, Calendar, User, Activity } from 'lucide-react';

interface AuditLog { id: string; timestamp: string; user: string; action: string; entity: string; details?: string; }

const AuditLog: React.FC = () => {
    const { language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('all');

    const logs = useMemo<AuditLog[]>(() => {
        const stored = JSON.parse(localStorage.getItem('audit_logs') || '[]');
        if (stored.length === 0) {
            return [
                { id: '1', timestamp: new Date().toISOString(), user: 'Admin', action: 'login', entity: 'System', details: 'تسجيل دخول ناجح' },
                { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Admin', action: 'create', entity: 'فاتورة بيع #001', details: 'إنشاء فاتورة جديدة' },
                { id: '3', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'Admin', action: 'update', entity: 'إعدادات النظام', details: 'تحديث الإعدادات' }
            ];
        }
        return stored;
    }, []);

    const actions = [
        { id: 'all', ar: 'الكل', en: 'All' },
        { id: 'login', ar: 'تسجيل دخول', en: 'Login' },
        { id: 'create', ar: 'إنشاء', en: 'Create' },
        { id: 'update', ar: 'تحديث', en: 'Update' },
        { id: 'delete', ar: 'حذف', en: 'Delete' }
    ];

    const filtered = logs.filter(l => {
        const matchesSearch = l.user.toLowerCase().includes(searchQuery.toLowerCase()) || l.entity.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAction = filterAction === 'all' || l.action === filterAction;
        return matchesSearch && matchesAction;
    });

    const getActionColor = (action: string) => {
        switch (action) { case 'login': return 'bg-accentBlue/10 text-accentBlue'; case 'create': return 'bg-accentGreen/10 text-accentGreen'; case 'update': return 'bg-primary/10 text-primary'; case 'delete': return 'bg-red-500/10 text-red-500'; default: return 'bg-secondary/10 text-secondary'; }
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'سجل المراقبة' : 'Audit Log'}</h2>
                <div className="flex gap-3">
                    <div className="relative"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} /><input type="text" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary w-48" /></div>
                    <select className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 font-bold text-textPrimary" value={filterAction} onChange={e => setFilterAction(e.target.value)}>{actions.map(a => <option key={a.id} value={a.id}>{language === 'ar' ? a.ar : a.en}</option>)}</select>
                </div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الوقت' : 'Time'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'العنصر' : 'Entity'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'التفاصيل' : 'Details'}</th>
                    </tr></thead>
                    <tbody>
                        {filtered.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا توجد سجلات' : 'No logs'}</td></tr> :
                            filtered.map(l => (
                                <tr key={l.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 text-secondary text-sm">{new Date(l.timestamp).toLocaleString('ar-EG')}</td>
                                    <td className="p-5"><div className="flex items-center gap-2"><User size={14} className="text-secondary" /><span className="font-bold text-textPrimary">{l.user}</span></div></td>
                                    <td className="p-5 text-center"><span className={`px-3 py-1 rounded-full text-xs font-black ${getActionColor(l.action)}`}>{actions.find(a => a.id === l.action)?.[language === 'ar' ? 'ar' : 'en'] || l.action}</span></td>
                                    <td className="p-5 text-textPrimary">{l.entity}</td>
                                    <td className="p-5 text-secondary text-sm">{l.details || '-'}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLog;
