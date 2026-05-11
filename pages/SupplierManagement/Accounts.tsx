// إدارة الموردين - حسابات الموردين
// كشف حساب تفصيلي للموردين

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    FileText, Search, Calendar, User,
    TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';

const SupplierAccountsPage: React.FC = () => {
    const { suppliers, purchases, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // بناء حركات الحسابات
    const transactions = useMemo(() => {
        let allTransactions: any[] = [];

        // أوامر الشراء
        purchases.forEach(po => {
            allTransactions.push({
                id: po.id,
                date: po.date,
                type: 'purchase',
                supplierId: po.supplierId,
                supplierName: po.supplierName || suppliers.find(s => s.id === po.supplierId)?.name || '',
                description: language === 'ar' ? `فاتورة شراء #${po.id.slice(-6)}` : `Purchase #${po.id.slice(-6)}`,
                debit: po.totalAmount,
                credit: 0
            });
        });

        // المدفوعات من localStorage
        const payments = JSON.parse(localStorage.getItem('supplier_payments') || '[]');
        payments.forEach((p: any) => {
            allTransactions.push({
                id: p.id,
                date: p.date,
                type: 'payment',
                supplierId: p.supplierId,
                supplierName: p.supplierName,
                description: language === 'ar' ? `سند صرف #${p.receiptNumber}` : `Payment #${p.receiptNumber}`,
                debit: 0,
                credit: p.amount
            });
        });

        // فلترة
        return allTransactions
            .filter(t => {
                const matchesSupplier = selectedSupplier === 'all' || t.supplierId === selectedSupplier;
                const matchesDateFrom = !dateFrom || t.date >= dateFrom;
                const matchesDateTo = !dateTo || t.date <= dateTo;
                return matchesSupplier && matchesDateFrom && matchesDateTo;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [purchases, suppliers, selectedSupplier, dateFrom, dateTo, language]);

    // حساب الأرصدة
    const withBalance = useMemo(() => {
        let runningBalance = 0;
        return transactions.map(t => {
            runningBalance += t.debit - t.credit;
            return { ...t, balance: runningBalance };
        });
    }, [transactions]);

    // إحصائيات
    const stats = useMemo(() => {
        const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
        const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
        return {
            totalDebit,
            totalCredit,
            balance: totalDebit - totalCredit,
            suppliersCount: new Set(transactions.map(t => t.supplierId)).size,
            totalPayables: suppliers.reduce((sum, s) => sum + (s.balance || 0), 0)
        };
    }, [transactions, suppliers]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'حسابات الموردين' : 'Supplier Accounts'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'كشف حساب تفصيلي للموردين' : 'Detailed supplier account statements'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <select
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'جميع الموردين' : 'All Suppliers'}</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                        placeholder={language === 'ar' ? 'من' : 'From'}
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                        placeholder={language === 'ar' ? 'إلى' : 'To'}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <User className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'الموردين' : 'Suppliers'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.suppliersCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المشتريات' : 'Total Purchases'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.totalDebit.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المدفوعات' : 'Total Payments'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.totalCredit.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المستحق' : 'Total Payable'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.totalPayables.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المورد' : 'Supplier'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'البيان' : 'Description'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'مدين' : 'Debit'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'دائن' : 'Credit'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الرصيد' : 'Balance'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {withBalance.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <FileText size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد حركات' : 'No transactions found'}</p>
                                </td>
                            </tr>
                        ) : (
                            withBalance.map(t => (
                                <tr key={t.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5"><span className="text-secondary font-bold">{new Date(t.date).toLocaleDateString('ar-EG')}</span></td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                                                {t.supplierName?.charAt(0)}
                                            </div>
                                            <span className="font-bold text-textPrimary">{t.supplierName}</span>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="font-bold text-textPrimary">{t.description}</span></td>
                                    <td className="p-5">
                                        {t.debit > 0 && <span className="font-black text-red-500">{t.debit.toLocaleString()}</span>}
                                    </td>
                                    <td className="p-5">
                                        {t.credit > 0 && <span className="font-black text-accentGreen">{t.credit.toLocaleString()}</span>}
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
    );
};

export default SupplierAccountsPage;
