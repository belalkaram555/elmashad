// @ts-nocheck
// إدارة العملاء - حسابات العملاء
// كشوف حسابات العملاء الفردية والإجمالية

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Search, DollarSign, User, Calendar, FileSpreadsheet,
    TrendingUp, TrendingDown, Filter, ChevronDown, Printer
} from 'lucide-react';

const CustomerAccounts: React.FC = () => {
    const { customers, orders, transactions, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | 'all'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // فلترة العملاء
    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // الحصول على حركات العميل المحدد
    const customerTransactions = useMemo(() => {
        if (selectedCustomerId === 'all') return [];

        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer) return [];

        const customerOrders = orders
            .filter(o => o.customerId === selectedCustomerId)
            .map(o => ({
                id: o.id,
                date: o.date,
                type: 'sale' as const,
                description: `فاتورة بيع #${o.orderNumber}`,
                debit: o.total,
                credit: 0
            }));

        const customerPayments = transactions
            .filter(t => t.referenceId === selectedCustomerId && t.category === 'debt_payment')
            .map(t => ({
                id: t.id,
                date: t.date,
                type: 'payment' as const,
                description: t.description,
                debit: 0,
                credit: t.amount
            }));

        let allTransactions = [...customerOrders, ...customerPayments];

        // فلترة حسب التاريخ
        if (dateFrom) {
            allTransactions = allTransactions.filter(t => new Date(t.date) >= new Date(dateFrom));
        }
        if (dateTo) {
            allTransactions = allTransactions.filter(t => new Date(t.date) <= new Date(dateTo));
        }

        return allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [selectedCustomerId, orders, transactions, dateFrom, dateTo, customers]);

    // حساب الرصيد التراكمي
    const transactionsWithBalance = useMemo(() => {
        let runningBalance = 0;
        return customerTransactions.map(t => {
            runningBalance += t.debit - t.credit;
            return { ...t, balance: runningBalance };
        });
    }, [customerTransactions]);

    // إحصائيات إجمالية
    const stats = useMemo(() => {
        const totalDebt = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
        const totalCredit = customers.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);
        const customersWithDebt = customers.filter(c => c.balance > 0).length;
        return { totalDebt, totalCredit, customersWithDebt };
    }, [customers]);

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'حسابات العملاء' : 'Customer Accounts'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'كشوف حسابات العملاء الفردية والإجمالية' : 'Individual and consolidated customer statements'}
                    </p>
                </div>

                <button className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all font-black text-sm">
                    <Printer size={20} />
                    {language === 'ar' ? 'طباعة كشف الحساب' : 'Print Statement'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <User className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}</p>
                            <p className="text-2xl font-black text-textPrimary">{customers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المديونيات' : 'Total Receivables'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.totalDebt.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'أرصدة دائنة' : 'Credit Balances'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.totalCredit.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <FileSpreadsheet className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'لديهم مديونية' : 'With Balance'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.customersWithDebt}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'بحث عن عميل...' : 'Search customer...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary placeholder:text-secondary/50"
                        />
                    </div>

                    <select
                        className="bg-background border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary min-w-[200px]"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'جميع العملاء' : 'All Customers'}</option>
                        {filteredCustomers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        placeholder={language === 'ar' ? 'من تاريخ' : 'From'}
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-background border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />
                    <input
                        type="date"
                        placeholder={language === 'ar' ? 'إلى تاريخ' : 'To'}
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-background border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />
                </div>
            </div>

            {/* Customer Statement OR All Customers List */}
            {selectedCustomerId === 'all' ? (
                // All Customers Summary
                <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                    <div className="p-6 border-b border-cardAccent bg-background/30">
                        <h3 className="font-black text-textPrimary text-lg">
                            {language === 'ar' ? 'ملخص أرصدة العملاء' : 'Customer Balances Summary'}
                        </h3>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cardAccent bg-background/50">
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الهاتف' : 'Phone'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الرصيد' : 'Balance'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(c => (
                                <tr
                                    key={c.id}
                                    className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors cursor-pointer"
                                    onClick={() => setSelectedCustomerId(c.id)}
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center font-black text-lg text-primary border border-cardAccent">
                                                {c.name.charAt(0)}
                                            </div>
                                            <span className="font-black text-textPrimary">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="text-secondary font-bold">{c.phone || '-'}</span></td>
                                    <td className="p-5">
                                        <span className={`font-black text-lg ${c.balance > 0 ? 'text-red-500' : c.balance < 0 ? 'text-accentGreen' : 'text-secondary'}`}>
                                            {c.balance.toLocaleString()} {currency}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${c.balance > 0 ? 'bg-red-500/10 text-red-500' :
                                                c.balance < 0 ? 'bg-accentGreen/10 text-accentGreen' :
                                                    'bg-secondary/10 text-secondary'
                                            }`}>
                                            {c.balance > 0 ? (language === 'ar' ? 'مدين' : 'Debtor') :
                                                c.balance < 0 ? (language === 'ar' ? 'دائن' : 'Creditor') :
                                                    (language === 'ar' ? 'متوازن' : 'Balanced')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Single Customer Statement
                <div className="space-y-6">
                    {/* Customer Info Card */}
                    {selectedCustomer && (
                        <div className="bg-surface p-6 rounded-3xl border border-cardAccent flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-2xl text-primary border border-primary/20">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-black text-textPrimary text-xl">{selectedCustomer.name}</h3>
                                    <p className="text-secondary text-sm">{selectedCustomer.phone}</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-secondary font-black uppercase">{language === 'ar' ? 'الرصيد الحالي' : 'Current Balance'}</p>
                                <p className={`text-3xl font-black ${selectedCustomer.balance > 0 ? 'text-red-500' : 'text-accentGreen'}`}>
                                    {selectedCustomer.balance.toLocaleString()} {currency}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Statement Table */}
                    <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                        <div className="p-6 border-b border-cardAccent bg-background/30 flex justify-between items-center">
                            <h3 className="font-black text-textPrimary text-lg">
                                {language === 'ar' ? 'كشف الحساب التفصيلي' : 'Detailed Statement'}
                            </h3>
                            <button
                                onClick={() => setSelectedCustomerId('all')}
                                className="text-primary text-sm font-bold hover:underline"
                            >
                                {language === 'ar' ? '← العودة للقائمة' : '← Back to List'}
                            </button>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-cardAccent bg-background/50">
                                    <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                    <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'البيان' : 'Description'}</th>
                                    <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'مدين' : 'Debit'}</th>
                                    <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'دائن' : 'Credit'}</th>
                                    <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الرصيد' : 'Balance'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionsWithBalance.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <FileSpreadsheet size={48} className="mx-auto text-secondary/30 mb-4" />
                                            <p className="text-secondary font-bold">
                                                {language === 'ar' ? 'لا توجد حركات' : 'No transactions found'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactionsWithBalance.map(t => (
                                        <tr key={t.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                            <td className="p-5">
                                                <span className="text-secondary font-bold">
                                                    {new Date(t.date).toLocaleDateString('ar-EG')}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <span className="font-bold text-textPrimary">{t.description}</span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`font-black ${t.debit > 0 ? 'text-red-500' : 'text-secondary/30'}`}>
                                                    {t.debit > 0 ? t.debit.toLocaleString() : '-'}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`font-black ${t.credit > 0 ? 'text-accentGreen' : 'text-secondary/30'}`}>
                                                    {t.credit > 0 ? t.credit.toLocaleString() : '-'}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`font-black ${t.balance > 0 ? 'text-red-500' : 'text-accentGreen'}`}>
                                                    {t.balance.toLocaleString()} {currency}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerAccounts;
