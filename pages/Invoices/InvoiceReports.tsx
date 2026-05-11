// الفواتير - تقارير الفواتير
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { FileText, Calendar, TrendingUp, TrendingDown, DollarSign, BarChart } from 'lucide-react';

const InvoiceReports: React.FC = () => {
    const { settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [dateRange, setDateRange] = useState({ from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] });

    const data = useMemo(() => {
        // استخدام localStorage للحصول على البيانات
        const allSales = JSON.parse(localStorage.getItem('sales') || '[]');
        const allPurchases = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');

        const filteredSales = allSales.filter((s: any) => s.date >= dateRange.from && s.date <= dateRange.to);
        const filteredPurchases = allPurchases.filter((p: any) => p.date >= dateRange.from && p.date <= dateRange.to);
        const salesReturns = JSON.parse(localStorage.getItem('sales_returns') || '[]').filter((r: any) => r.date >= dateRange.from && r.date <= dateRange.to);
        const purchaseReturns = JSON.parse(localStorage.getItem('purchase_returns') || '[]').filter((r: any) => r.date >= dateRange.from && r.date <= dateRange.to);

        return {
            salesCount: filteredSales.length, salesTotal: filteredSales.reduce((s: number, v: any) => s + (v.total || 0), 0),
            purchasesCount: filteredPurchases.length, purchasesTotal: filteredPurchases.reduce((s: number, v: any) => s + (v.total || 0), 0),
            salesReturnsCount: salesReturns.length, salesReturnsTotal: salesReturns.reduce((s: number, v: any) => s + v.total, 0),
            purchaseReturnsCount: purchaseReturns.length, purchaseReturnsTotal: purchaseReturns.reduce((s: number, v: any) => s + v.total, 0),
            netSales: filteredSales.reduce((s: number, v: any) => s + (v.total || 0), 0) - salesReturns.reduce((s: number, v: any) => s + v.total, 0),
            netPurchases: filteredPurchases.reduce((s: number, v: any) => s + (v.total || 0), 0) - purchaseReturns.reduce((s: number, v: any) => s + v.total, 0)
        };
    }, [dateRange]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'تقارير الفواتير' : 'Invoice Reports'}</h2>
                <div className="flex items-center gap-3">
                    <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 font-bold text-textPrimary" />
                    <span className="text-secondary">{language === 'ar' ? 'إلى' : 'to'}</span>
                    <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 font-bold text-textPrimary" />
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center"><TrendingUp className="text-accentGreen" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'فواتير البيع' : 'Sales'}</p><p className="text-xl font-black text-accentGreen">{data.salesTotal.toLocaleString()}</p><p className="text-secondary text-xs">{data.salesCount} {language === 'ar' ? 'فاتورة' : 'invoices'}</p></div></div></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center"><TrendingDown className="text-red-500" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'فواتير الشراء' : 'Purchases'}</p><p className="text-xl font-black text-red-500">{data.purchasesTotal.toLocaleString()}</p><p className="text-secondary text-xs">{data.purchasesCount} {language === 'ar' ? 'فاتورة' : 'invoices'}</p></div></div></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center"><TrendingDown className="text-yellow-500" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مرتجعات البيع' : 'Sales Returns'}</p><p className="text-xl font-black text-yellow-500">{data.salesReturnsTotal.toLocaleString()}</p><p className="text-secondary text-xs">{data.salesReturnsCount} {language === 'ar' ? 'مرتجع' : 'returns'}</p></div></div></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center"><TrendingUp className="text-accentBlue" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مرتجعات الشراء' : 'Purchase Returns'}</p><p className="text-xl font-black text-accentBlue">{data.purchaseReturnsTotal.toLocaleString()}</p><p className="text-secondary text-xs">{data.purchaseReturnsCount} {language === 'ar' ? 'مرتجع' : 'returns'}</p></div></div></div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-accentGreen/5 p-8 rounded-[32px] border border-accentGreen/20 text-center"><p className="text-secondary text-sm mb-2">{language === 'ar' ? 'صافي المبيعات' : 'Net Sales'}</p><p className="text-4xl font-black text-accentGreen">{data.netSales.toLocaleString()} {currency}</p></div>
                <div className="bg-red-500/5 p-8 rounded-[32px] border border-red-500/20 text-center"><p className="text-secondary text-sm mb-2">{language === 'ar' ? 'صافي المشتريات' : 'Net Purchases'}</p><p className="text-4xl font-black text-red-500">{data.netPurchases.toLocaleString()} {currency}</p></div>
            </div>
        </div>
    );
};

export default InvoiceReports;
