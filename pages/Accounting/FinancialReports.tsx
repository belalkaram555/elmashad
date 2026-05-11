// المحاسبة - التقارير المالية
// عرض التقارير المالية الرئيسية

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    FileText, TrendingUp, TrendingDown, DollarSign,
    PieChart, BarChart3, Calendar, Download
} from 'lucide-react';

const FinancialReports: React.FC = () => {
    const { customers, suppliers, orders, purchases, inventory, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [selectedReport, setSelectedReport] = useState<string>('income');
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    // حساب البيانات المالية
    const financialData = useMemo(() => {
        // استخدام orders من Context أو localStorage
        const allOrders = orders || [];
        const allPurchases = purchases || [];

        // المبيعات
        const totalSales = allOrders
            .filter(o => {
                const orderDate = o.createdAt?.split('T')[0] || '';
                return orderDate >= dateRange.from && orderDate <= dateRange.to;
            })
            .reduce((sum, o) => sum + (o.total || 0), 0);

        // تكلفة المبيعات
        const totalCOGS = allOrders
            .filter(o => {
                const orderDate = o.createdAt?.split('T')[0] || '';
                return orderDate >= dateRange.from && orderDate <= dateRange.to;
            })
            .reduce((sum, o) => {
                return sum + (o.items || []).reduce((itemSum, item) => {
                    const inventoryItem = inventory.find(i => i.id === item.id);
                    return itemSum + ((inventoryItem?.costPerUnit || 0) * (item.quantity || 0));
                }, 0);
            }, 0);

        // المشتريات
        const totalPurchases = allPurchases
            .filter(p => {
                const purchaseDate = p.date || '';
                return purchaseDate >= dateRange.from && purchaseDate <= dateRange.to;
            })
            .reduce((sum, p) => sum + ((p as any).total || 0), 0);

        // إجمالي الربح
        const grossProfit = totalSales - totalCOGS;
        const grossProfitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

        // المصروفات من localStorage
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]')
            .filter((e: any) => e.date >= dateRange.from && e.date <= dateRange.to)
            .reduce((sum: number, e: any) => sum + e.amount, 0);

        // صافي الربح
        const netProfit = grossProfit - expenses;
        const netProfitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

        // أرصدة العملاء والموردين
        const totalReceivables = (customers || []).reduce((sum, c) => sum + (c.balance || 0), 0);
        const totalPayables = (suppliers || []).reduce((sum, s) => sum + (s.balance || 0), 0);

        // قيمة المخزون
        const inventoryValue = (inventory || []).reduce((sum, i) => {
            const totalQty = Object.values(i.warehouseQuantities || {}).reduce((a, b) => a + b, 0);
            return sum + (i.costPerUnit * totalQty);
        }, 0);

        return {
            totalSales,
            totalCOGS,
            totalPurchases,
            grossProfit,
            grossProfitMargin,
            expenses,
            netProfit,
            netProfitMargin,
            totalReceivables,
            totalPayables,
            inventoryValue
        };
    }, [orders, purchases, inventory, customers, suppliers, dateRange]);

    const reports = [
        { id: 'income', name: language === 'ar' ? 'قائمة الدخل' : 'Income Statement', icon: TrendingUp },
        { id: 'balance', name: language === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet', icon: PieChart },
        { id: 'cashflow', name: language === 'ar' ? 'التدفقات النقدية' : 'Cash Flow', icon: BarChart3 }
    ];

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'التقارير المالية' : 'Financial Reports'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'عرض وتحليل البيانات المالية' : 'View and analyze financial data'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />
                    <span className="text-secondary">{language === 'ar' ? 'إلى' : 'to'}</span>
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />
                </div>
            </div>

            {/* Report Tabs */}
            <div className="flex gap-4 flex-wrap">
                {reports.map(report => (
                    <button
                        key={report.id}
                        onClick={() => setSelectedReport(report.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${selectedReport === report.id
                            ? 'bg-primary text-background glow-primary'
                            : 'bg-surface border border-cardAccent text-secondary hover:border-primary/40'
                            }`}
                    >
                        <report.icon size={18} />
                        {report.name}
                    </button>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</p>
                            <p className="text-2xl font-black text-accentGreen">{financialData.totalSales.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الربح' : 'Gross Profit'}</p>
                            <p className="text-2xl font-black text-accentBlue">{financialData.grossProfit.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'المصروفات' : 'Expenses'}</p>
                            <p className="text-2xl font-black text-red-500">{financialData.expenses.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${financialData.netProfit >= 0 ? 'bg-accentGreen/10' : 'bg-red-500/10'}`}>
                            <DollarSign className={financialData.netProfit >= 0 ? 'text-accentGreen' : 'text-red-500'} size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'صافي الربح' : 'Net Profit'}</p>
                            <p className={`text-2xl font-black ${financialData.netProfit >= 0 ? 'text-accentGreen' : 'text-red-500'}`}>
                                {financialData.netProfit.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                {/* Income Statement */}
                {selectedReport === 'income' && (
                    <div className="p-8">
                        <h3 className="text-xl font-black text-textPrimary mb-6 text-center">
                            {language === 'ar' ? 'قائمة الدخل' : 'Income Statement'}
                        </h3>
                        <div className="max-w-2xl mx-auto space-y-4">
                            {/* Revenue Section */}
                            <div className="bg-background rounded-2xl p-6 border border-cardAccent">
                                <h4 className="font-black text-primary mb-4">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-textPrimary">{language === 'ar' ? 'إيرادات المبيعات' : 'Sales Revenue'}</span>
                                        <span className="font-black text-accentGreen">{financialData.totalSales.toLocaleString()} {currency}</span>
                                    </div>
                                </div>
                                <div className="border-t border-cardAccent mt-4 pt-4 flex justify-between font-black">
                                    <span className="text-textPrimary">{language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</span>
                                    <span className="text-accentGreen">{financialData.totalSales.toLocaleString()} {currency}</span>
                                </div>
                            </div>

                            {/* COGS Section */}
                            <div className="bg-background rounded-2xl p-6 border border-cardAccent">
                                <h4 className="font-black text-red-500 mb-4">{language === 'ar' ? 'تكلفة المبيعات' : 'Cost of Goods Sold'}</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-textPrimary">{language === 'ar' ? 'تكلفة البضاعة المباعة' : 'COGS'}</span>
                                        <span className="font-black text-red-500">({financialData.totalCOGS.toLocaleString()}) {currency}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Gross Profit */}
                            <div className="bg-accentBlue/10 rounded-2xl p-6 border border-accentBlue/20">
                                <div className="flex justify-between font-black text-lg">
                                    <span className="text-accentBlue">{language === 'ar' ? 'إجمالي الربح' : 'Gross Profit'}</span>
                                    <span className="text-accentBlue">{financialData.grossProfit.toLocaleString()} {currency}</span>
                                </div>
                                <p className="text-secondary text-sm mt-2">{language === 'ar' ? 'هامش الربح:' : 'Margin:'} {financialData.grossProfitMargin.toFixed(1)}%</p>
                            </div>

                            {/* Expenses */}
                            <div className="bg-background rounded-2xl p-6 border border-cardAccent">
                                <h4 className="font-black text-red-500 mb-4">{language === 'ar' ? 'المصروفات التشغيلية' : 'Operating Expenses'}</h4>
                                <div className="flex justify-between">
                                    <span className="text-textPrimary">{language === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}</span>
                                    <span className="font-black text-red-500">({financialData.expenses.toLocaleString()}) {currency}</span>
                                </div>
                            </div>

                            {/* Net Profit */}
                            <div className={`rounded-2xl p-6 border ${financialData.netProfit >= 0 ? 'bg-accentGreen/10 border-accentGreen/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <div className="flex justify-between font-black text-xl">
                                    <span className={financialData.netProfit >= 0 ? 'text-accentGreen' : 'text-red-500'}>
                                        {language === 'ar' ? 'صافي الربح' : 'Net Profit'}
                                    </span>
                                    <span className={financialData.netProfit >= 0 ? 'text-accentGreen' : 'text-red-500'}>
                                        {financialData.netProfit.toLocaleString()} {currency}
                                    </span>
                                </div>
                                <p className="text-secondary text-sm mt-2">
                                    {language === 'ar' ? 'هامش صافي الربح:' : 'Net Margin:'} {financialData.netProfitMargin.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Balance Sheet */}
                {selectedReport === 'balance' && (
                    <div className="p-8">
                        <h3 className="text-xl font-black text-textPrimary mb-6 text-center">
                            {language === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {/* Assets */}
                            <div className="bg-background rounded-2xl p-6 border border-cardAccent">
                                <h4 className="font-black text-accentGreen mb-4 text-lg">{language === 'ar' ? 'الأصول' : 'Assets'}</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-secondary text-xs font-bold mb-2">{language === 'ar' ? 'الأصول المتداولة' : 'Current Assets'}</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-textPrimary">{language === 'ar' ? 'المخزون' : 'Inventory'}</span>
                                                <span className="font-bold">{financialData.inventoryValue.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-textPrimary">{language === 'ar' ? 'الذمم المدينة' : 'Receivables'}</span>
                                                <span className="font-bold">{financialData.totalReceivables.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-cardAccent pt-4 flex justify-between font-black">
                                        <span className="text-accentGreen">{language === 'ar' ? 'إجمالي الأصول' : 'Total Assets'}</span>
                                        <span className="text-accentGreen">
                                            {(financialData.inventoryValue + financialData.totalReceivables).toLocaleString()} {currency}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Liabilities */}
                            <div className="bg-background rounded-2xl p-6 border border-cardAccent">
                                <h4 className="font-black text-red-500 mb-4 text-lg">{language === 'ar' ? 'الالتزامات' : 'Liabilities'}</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-secondary text-xs font-bold mb-2">{language === 'ar' ? 'الالتزامات المتداولة' : 'Current Liabilities'}</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-textPrimary">{language === 'ar' ? 'الذمم الدائنة' : 'Payables'}</span>
                                                <span className="font-bold">{financialData.totalPayables.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-cardAccent pt-4 flex justify-between font-black">
                                        <span className="text-red-500">{language === 'ar' ? 'إجمالي الالتزامات' : 'Total Liabilities'}</span>
                                        <span className="text-red-500">{financialData.totalPayables.toLocaleString()} {currency}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cash Flow */}
                {selectedReport === 'cashflow' && (
                    <div className="p-8">
                        <h3 className="text-xl font-black text-textPrimary mb-6 text-center">
                            {language === 'ar' ? 'التدفقات النقدية' : 'Cash Flow Statement'}
                        </h3>
                        <div className="max-w-2xl mx-auto space-y-4">
                            <div className="bg-background rounded-2xl p-6 border border-cardAccent">
                                <h4 className="font-black text-primary mb-4">{language === 'ar' ? 'التدفقات من الأنشطة التشغيلية' : 'Operating Activities'}</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-textPrimary">{language === 'ar' ? 'المقبوضات من العملاء' : 'Cash from Customers'}</span>
                                        <span className="font-bold text-accentGreen">+{(financialData.totalSales - financialData.totalReceivables).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-textPrimary">{language === 'ar' ? 'المدفوعات للموردين' : 'Cash to Suppliers'}</span>
                                        <span className="font-bold text-red-500">-{(financialData.totalPurchases - financialData.totalPayables).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-textPrimary">{language === 'ar' ? 'المصروفات المدفوعة' : 'Expenses Paid'}</span>
                                        <span className="font-bold text-red-500">-{financialData.expenses.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="border-t border-cardAccent mt-4 pt-4 flex justify-between font-black">
                                    <span className="text-textPrimary">{language === 'ar' ? 'صافي التدفق التشغيلي' : 'Net Operating Cash'}</span>
                                    <span className={financialData.netProfit >= 0 ? 'text-accentGreen' : 'text-red-500'}>
                                        {financialData.netProfit.toLocaleString()} {currency}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialReports;
