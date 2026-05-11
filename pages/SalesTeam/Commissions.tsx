// فريق المبيعات - العمولات
// حساب وإدارة عمولات المندوبين

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
    DollarSign, Search, Calculator, User, Calendar,
    TrendingUp, Percent, FileText
} from 'lucide-react';

interface Commission {
    id: string;
    agentName: string;
    month: string;
    salesAmount: number;
    commissionRate: number;
    commissionAmount: number;
    status: 'pending' | 'paid';
    paidDate?: string;
}

const Commissions: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [commissions, setCommissions] = useState<Commission[]>(() => {
        const saved = localStorage.getItem('sales_commissions');
        return saved ? JSON.parse(saved) : [
            { id: '1', agentName: 'أحمد محمد', month: '2026-01', salesAmount: 35000, commissionRate: 5, commissionAmount: 1750, status: 'pending' },
            { id: '2', agentName: 'سعيد علي', month: '2026-01', salesAmount: 42000, commissionRate: 5, commissionAmount: 2100, status: 'paid', paidDate: '2026-01-10' },
            { id: '3', agentName: 'خالد عبدالله', month: '2026-01', salesAmount: 28000, commissionRate: 5, commissionAmount: 1400, status: 'pending' }
        ];
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const saveCommissions = (data: Commission[]) => {
        localStorage.setItem('sales_commissions', JSON.stringify(data));
        setCommissions(data);
    };

    const filteredCommissions = commissions.filter(c => {
        const matchesSearch = c.agentName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMonth = !selectedMonth || c.month === selectedMonth;
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesMonth && matchesStatus;
    });

    const markAsPaid = (id: string) => {
        saveCommissions(commissions.map(c => c.id === id ? {
            ...c,
            status: 'paid' as const,
            paidDate: new Date().toISOString().split('T')[0]
        } : c));
    };

    const stats = useMemo(() => ({
        totalCommissions: filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0),
        pendingAmount: filteredCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0),
        paidAmount: filteredCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0),
        totalSales: filteredCommissions.reduce((sum, c) => sum + c.salesAmount, 0)
    }), [filteredCommissions]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'العمولات' : 'Commissions'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'حساب ومتابعة عمولات المندوبين' : 'Calculate and track agent commissions'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary placeholder:text-secondary/50 w-48"
                        />
                    </div>

                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />

                    <select
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                        <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                        <option value="paid">{language === 'ar' ? 'مدفوع' : 'Paid'}</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</p>
                            <p className="text-2xl font-black text-primary">{stats.totalSales.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Calculator className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي العمولات' : 'Total Commissions'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.totalCommissions.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.pendingAmount.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مدفوع' : 'Paid'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.paidAmount.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Commissions Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المندوب' : 'Agent'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الشهر' : 'Month'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المبيعات' : 'Sales'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'النسبة' : 'Rate'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'العمولة' : 'Commission'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCommissions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center">
                                    <Calculator size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد عمولات' : 'No commissions found'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredCommissions.map(commission => (
                                <tr key={commission.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                                {commission.agentName.charAt(0)}
                                            </div>
                                            <span className="font-black text-textPrimary">{commission.agentName}</span>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="text-secondary font-bold">{commission.month}</span></td>
                                    <td className="p-5"><span className="font-bold text-textPrimary">{commission.salesAmount.toLocaleString()} {currency}</span></td>
                                    <td className="p-5 text-center">
                                        <span className="px-3 py-1 rounded-full text-xs font-black bg-accentBlue/10 text-accentBlue">
                                            {commission.commissionRate}%
                                        </span>
                                    </td>
                                    <td className="p-5"><span className="font-black text-primary">{commission.commissionAmount.toLocaleString()} {currency}</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${commission.status === 'paid' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>
                                            {commission.status === 'paid' ? (language === 'ar' ? 'مدفوع' : 'Paid') : (language === 'ar' ? 'معلق' : 'Pending')}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        {commission.status === 'pending' && (
                                            <button
                                                onClick={() => markAsPaid(commission.id)}
                                                className="px-4 py-2 bg-accentGreen/10 text-accentGreen rounded-xl text-sm font-bold hover:bg-accentGreen hover:text-white transition-all"
                                            >
                                                {language === 'ar' ? 'صرف' : 'Pay'}
                                            </button>
                                        )}
                                        {commission.status === 'paid' && commission.paidDate && (
                                            <span className="text-xs text-secondary">{commission.paidDate}</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Commissions;
