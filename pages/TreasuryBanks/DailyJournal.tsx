// الخزينة والبنوك - اليومية
// Daily Journal

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    FileText, Search, Calendar, Wallet,
    TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';

const DailyJournal: React.FC = () => {
    const { orders, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // جمع كل العمليات لليوم المحدد
    const dailyData = useMemo(() => {
        const cashTransactions = JSON.parse(localStorage.getItem('cash_transactions') || '[]');
        const customerReceipts = JSON.parse(localStorage.getItem('customer_receipts') || '[]');
        const supplierPayments = JSON.parse(localStorage.getItem('supplier_payments') || '[]');

        // استخدام orders من Context
        const todayOrders = (orders || []).filter(o => o.createdAt?.split('T')[0] === selectedDate);
        const todayCash = cashTransactions.filter((t: any) => t.date === selectedDate);
        const todayReceipts = customerReceipts.filter((r: any) => r.date === selectedDate);
        const todayPayments = supplierPayments.filter((p: any) => p.date === selectedDate);

        return {
            sales: todayOrders,
            cashIn: todayCash.filter((t: any) => t.type === 'in'),
            cashOut: todayCash.filter((t: any) => t.type === 'out'),
            receipts: todayReceipts,
            payments: todayPayments,
            totalSales: todayOrders.reduce((sum, s) => sum + (s.total || 0), 0),
            totalCashIn: todayCash.filter((t: any) => t.type === 'in').reduce((sum: number, t: any) => sum + t.amount, 0),
            totalCashOut: todayCash.filter((t: any) => t.type === 'out').reduce((sum: number, t: any) => sum + t.amount, 0),
            totalReceipts: todayReceipts.reduce((sum: number, r: any) => sum + r.amount, 0),
            totalPayments: todayPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
        };
    }, [orders, selectedDate]);

    const netFlow = dailyData.totalSales + dailyData.totalCashIn + dailyData.totalReceipts - dailyData.totalCashOut - dailyData.totalPayments;

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'اليومية' : 'Daily Journal'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'ملخص العمليات اليومية' : 'Daily operations summary'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Calendar className="text-secondary" size={20} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'المبيعات' : 'Sales'}</p>
                            <p className="text-2xl font-black text-primary">{dailyData.totalSales.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'وارد نقدي' : 'Cash In'}</p>
                            <p className="text-2xl font-black text-accentGreen">{dailyData.totalCashIn.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Wallet className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'تحصيلات' : 'Receipts'}</p>
                            <p className="text-2xl font-black text-accentBlue">{dailyData.totalReceipts.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مصروفات' : 'Payments'}</p>
                            <p className="text-2xl font-black text-red-500">{(dailyData.totalCashOut + dailyData.totalPayments).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-3xl border ${netFlow >= 0 ? 'bg-accentGreen/5 border-accentGreen/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="text-center">
                        <p className="text-secondary text-xs font-bold mb-2">{language === 'ar' ? 'صافي اليوم' : 'Net Flow'}</p>
                        <p className={`text-3xl font-black ${netFlow >= 0 ? 'text-accentGreen' : 'text-red-500'}`}>
                            {netFlow >= 0 ? '+' : ''}{netFlow.toLocaleString()} {currency}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales */}
                <div className="bg-surface rounded-[32px] border border-cardAccent p-6">
                    <h3 className="font-black text-textPrimary text-lg mb-4 flex items-center gap-2">
                        <DollarSign size={20} className="text-primary" />
                        {language === 'ar' ? 'المبيعات' : 'Sales'} ({dailyData.sales.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {dailyData.sales.length === 0 ? (
                            <p className="text-secondary text-center py-8">{language === 'ar' ? 'لا توجد مبيعات' : 'No sales'}</p>
                        ) : (
                            dailyData.sales.map(s => (
                                <div key={s.id} className="flex justify-between items-center p-3 bg-background rounded-xl">
                                    <span className="text-textPrimary font-bold">{s.customerName || (language === 'ar' ? 'نقدي' : 'Cash')}</span>
                                    <span className="font-black text-primary">{(s.total || 0).toLocaleString()} {currency}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Cash Transactions */}
                <div className="bg-surface rounded-[32px] border border-cardAccent p-6">
                    <h3 className="font-black text-textPrimary text-lg mb-4 flex items-center gap-2">
                        <Wallet size={20} className="text-accentGreen" />
                        {language === 'ar' ? 'حركة الصندوق' : 'Cash Flow'} ({dailyData.cashIn.length + dailyData.cashOut.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {dailyData.cashIn.length + dailyData.cashOut.length === 0 ? (
                            <p className="text-secondary text-center py-8">{language === 'ar' ? 'لا توجد حركات' : 'No transactions'}</p>
                        ) : (
                            <>
                                {dailyData.cashIn.map((t: any) => (
                                    <div key={t.id} className="flex justify-between items-center p-3 bg-background rounded-xl">
                                        <span className="text-textPrimary">{t.description}</span>
                                        <span className="font-black text-accentGreen">+{t.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                {dailyData.cashOut.map((t: any) => (
                                    <div key={t.id} className="flex justify-between items-center p-3 bg-background rounded-xl">
                                        <span className="text-textPrimary">{t.description}</span>
                                        <span className="font-black text-red-500">-{t.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Customer Receipts */}
                <div className="bg-surface rounded-[32px] border border-cardAccent p-6">
                    <h3 className="font-black text-textPrimary text-lg mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-accentBlue" />
                        {language === 'ar' ? 'تحصيلات العملاء' : 'Customer Receipts'} ({dailyData.receipts.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {dailyData.receipts.length === 0 ? (
                            <p className="text-secondary text-center py-8">{language === 'ar' ? 'لا توجد تحصيلات' : 'No receipts'}</p>
                        ) : (
                            dailyData.receipts.map((r: any) => (
                                <div key={r.id} className="flex justify-between items-center p-3 bg-background rounded-xl">
                                    <span className="text-textPrimary">{r.customerName}</span>
                                    <span className="font-black text-accentBlue">+{r.amount.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Supplier Payments */}
                <div className="bg-surface rounded-[32px] border border-cardAccent p-6">
                    <h3 className="font-black text-textPrimary text-lg mb-4 flex items-center gap-2">
                        <TrendingDown size={20} className="text-red-500" />
                        {language === 'ar' ? 'مدفوعات الموردين' : 'Supplier Payments'} ({dailyData.payments.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {dailyData.payments.length === 0 ? (
                            <p className="text-secondary text-center py-8">{language === 'ar' ? 'لا توجد مدفوعات' : 'No payments'}</p>
                        ) : (
                            dailyData.payments.map((p: any) => (
                                <div key={p.id} className="flex justify-between items-center p-3 bg-background rounded-xl">
                                    <span className="text-textPrimary">{p.supplierName}</span>
                                    <span className="font-black text-red-500">-{p.amount.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyJournal;
