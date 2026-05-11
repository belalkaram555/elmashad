// المحاسبة - الأستاذ العام
// عرض حركة جميع الحسابات

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    BookOpen, Search, Calendar, Filter,
    TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';

interface LedgerEntry {
    id: string;
    date: string;
    accountCode: string;
    accountName: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
}

const GeneralLedger: React.FC = () => {
    const { settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    // الحسابات من localStorage
    const accounts = useMemo(() => {
        const saved = localStorage.getItem('chart_of_accounts');
        return saved ? JSON.parse(saved) : [];
    }, []);

    // القيود اليومية من localStorage
    const journalEntries = useMemo(() => {
        const saved = localStorage.getItem('journal_entries');
        return saved ? JSON.parse(saved) : [];
    }, []);

    // بناء الأستاذ العام
    const ledgerEntries = useMemo(() => {
        const entries: LedgerEntry[] = [];

        journalEntries
            .filter((je: any) => je.status === 'posted')
            .forEach((je: any) => {
                je.lines?.forEach((line: any) => {
                    entries.push({
                        id: `${je.id}-${line.accountId}`,
                        date: je.date,
                        accountCode: line.accountCode || '',
                        accountName: line.accountName,
                        description: je.description,
                        debit: line.debit || 0,
                        credit: line.credit || 0,
                        balance: 0
                    });
                });
            });

        return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [journalEntries]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredEntries = useMemo(() => {
        let filtered = ledgerEntries.filter(e => {
            const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.accountName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesAccount = selectedAccount === 'all' || e.accountName === selectedAccount;
            const matchesDateFrom = !dateFrom || e.date >= dateFrom;
            const matchesDateTo = !dateTo || e.date <= dateTo;
            return matchesSearch && matchesAccount && matchesDateFrom && matchesDateTo;
        });

        // حساب الرصيد التراكمي
        let runningBalance = 0;
        return filtered.map(e => {
            runningBalance += e.debit - e.credit;
            return { ...e, balance: runningBalance };
        });
    }, [ledgerEntries, searchQuery, selectedAccount, dateFrom, dateTo]);

    const stats = useMemo(() => ({
        totalDebit: filteredEntries.reduce((sum, e) => sum + e.debit, 0),
        totalCredit: filteredEntries.reduce((sum, e) => sum + e.credit, 0),
        entriesCount: filteredEntries.length,
        accountsCount: new Set(filteredEntries.map(e => e.accountName)).size
    }), [filteredEntries]);

    const uniqueAccounts = useMemo(() =>
        [...new Set(ledgerEntries.map(e => e.accountName))],
        [ledgerEntries]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'الأستاذ العام' : 'General Ledger'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'عرض حركة جميع الحسابات' : 'View all account movements'}
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

                    <select
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'جميع الحسابات' : 'All Accounts'}</option>
                        {uniqueAccounts.map(acc => (
                            <option key={acc} value={acc}>{acc}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <BookOpen className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد القيود' : 'Entries'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.entriesCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المدين' : 'Total Debit'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.totalDebit.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الدائن' : 'Total Credit'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.totalCredit.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'الحسابات' : 'Accounts'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.accountsCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحساب' : 'Account'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'البيان' : 'Description'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'مدين' : 'Debit'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'دائن' : 'Credit'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الرصيد' : 'Balance'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEntries.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <BookOpen size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد قيود' : 'No entries found'}</p>
                                    <p className="text-secondary/60 text-sm mt-2">{language === 'ar' ? 'أضف قيود يومية وقم بترحيلها' : 'Add and post journal entries'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredEntries.map(entry => (
                                <tr key={entry.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5"><span className="text-secondary font-bold">{new Date(entry.date).toLocaleDateString('ar-EG')}</span></td>
                                    <td className="p-5"><span className="font-black text-primary">{entry.accountName}</span></td>
                                    <td className="p-5"><span className="text-textPrimary">{entry.description}</span></td>
                                    <td className="p-5">
                                        {entry.debit > 0 && <span className="font-black text-red-500">{entry.debit.toLocaleString()}</span>}
                                    </td>
                                    <td className="p-5">
                                        {entry.credit > 0 && <span className="font-black text-accentGreen">{entry.credit.toLocaleString()}</span>}
                                    </td>
                                    <td className="p-5">
                                        <span className={`font-black ${entry.balance >= 0 ? 'text-accentBlue' : 'text-red-500'}`}>
                                            {entry.balance.toLocaleString()} {currency}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {filteredEntries.length > 0 && (
                        <tfoot>
                            <tr className="bg-background/50 border-t-2 border-cardAccent">
                                <td colSpan={3} className="p-5 font-black text-textPrimary text-right">{language === 'ar' ? 'الإجمالي' : 'Total'}</td>
                                <td className="p-5"><span className="font-black text-red-500">{stats.totalDebit.toLocaleString()}</span></td>
                                <td className="p-5"><span className="font-black text-accentGreen">{stats.totalCredit.toLocaleString()}</span></td>
                                <td className="p-5">
                                    <span className={`font-black ${stats.totalDebit - stats.totalCredit >= 0 ? 'text-accentBlue' : 'text-red-500'}`}>
                                        {(stats.totalDebit - stats.totalCredit).toLocaleString()} {currency}
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default GeneralLedger;
