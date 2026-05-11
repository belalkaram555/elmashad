// المحاسبة - قائمة الدخل
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

const IncomeStatement: React.FC = () => {
    const { orders, purchases, inventory, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    const incomeData = useMemo(() => {
        const allOrders = orders || [];
        const allPurchases = purchases || [];

        // الإيرادات
        const salesRevenue = allOrders
            .filter(o => {
                const date = o.createdAt?.split('T')[0] || '';
                return date >= dateRange.from && date <= dateRange.to;
            })
            .reduce((sum, o) => sum + (o.total || 0), 0);

        // تكلفة المبيعات
        const costOfSales = allOrders
            .filter(o => {
                const date = o.createdAt?.split('T')[0] || '';
                return date >= dateRange.from && date <= dateRange.to;
            })
            .reduce((sum, o) => {
                return sum + (o.items || []).reduce((itemSum, item) => {
                    const inv = inventory.find(i => i.id === item.id);
                    return itemSum + ((inv?.costPerUnit || 0) * (item.quantity || 0));
                }, 0);
            }, 0);

        // إجمالي الربح
        const grossProfit = salesRevenue - costOfSales;
        const grossMargin = salesRevenue > 0 ? (grossProfit / salesRevenue) * 100 : 0;

        // المصروفات
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]')
            .filter((e: any) => e.date >= dateRange.from && e.date <= dateRange.to);

        const operatingExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

        // صافي الربح
        const netProfit = grossProfit - operatingExpenses;
        const netMargin = salesRevenue > 0 ? (netProfit / salesRevenue) * 100 : 0;

        return {
            salesRevenue, costOfSales, grossProfit, grossMargin,
            operatingExpenses, netProfit, netMargin
        };
    }, [orders, purchases, inventory, dateRange]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'قائمة الدخل' : 'Income Statement'}</h2>
                    <p className="text-secondary text-xs mt-1 font-bold">{language === 'ar' ? 'الإيرادات والمصروفات' : 'Revenue and expenses'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-secondary" />
                    <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 font-bold text-textPrimary" />
                    <span className="text-secondary">{language === 'ar' ? 'إلى' : 'to'}</span>
                    <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 font-bold text-textPrimary" />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</p><p className="text-2xl font-black text-accentGreen">{incomeData.salesRevenue.toLocaleString()}</p></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'تكلفة المبيعات' : 'COGS'}</p><p className="text-2xl font-black text-red-500">{incomeData.costOfSales.toLocaleString()}</p></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الربح' : 'Gross Profit'}</p><p className="text-2xl font-black text-accentBlue">{incomeData.grossProfit.toLocaleString()}</p></div>
                <div className={`p-6 rounded-3xl border ${incomeData.netProfit >= 0 ? 'bg-accentGreen/5 border-accentGreen/20' : 'bg-red-500/5 border-red-500/20'}`}><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'صافي الربح' : 'Net Profit'}</p><p className={`text-2xl font-black ${incomeData.netProfit >= 0 ? 'text-accentGreen' : 'text-red-500'}`}>{incomeData.netProfit.toLocaleString()}</p></div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent p-8 max-w-3xl mx-auto">
                <h3 className="text-xl font-black text-center text-textPrimary mb-8">{language === 'ar' ? 'قائمة الدخل' : 'Income Statement'}</h3>

                <div className="space-y-4">
                    {/* الإيرادات */}
                    <div className="bg-background rounded-2xl p-6 border border-cardAccent">
                        <h4 className="font-black text-accentGreen mb-4 flex items-center gap-2"><TrendingUp size={18} />{language === 'ar' ? 'الإيرادات' : 'Revenue'}</h4>
                        <div className="flex justify-between mb-2"><span className="text-textPrimary">{language === 'ar' ? 'إيرادات المبيعات' : 'Sales Revenue'}</span><span className="font-bold text-accentGreen">{incomeData.salesRevenue.toLocaleString()}</span></div>
                        <div className="border-t border-cardAccent pt-3 flex justify-between font-black"><span>{language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</span><span className="text-accentGreen">{incomeData.salesRevenue.toLocaleString()} {currency}</span></div>
                    </div>

                    {/* تكلفة المبيعات */}
                    <div className="bg-background rounded-2xl p-6 border border-cardAccent">
                        <h4 className="font-black text-red-500 mb-4 flex items-center gap-2"><TrendingDown size={18} />{language === 'ar' ? 'تكلفة المبيعات' : 'Cost of Sales'}</h4>
                        <div className="flex justify-between"><span className="text-textPrimary">{language === 'ar' ? 'تكلفة البضاعة المباعة' : 'COGS'}</span><span className="font-bold text-red-500">({incomeData.costOfSales.toLocaleString()})</span></div>
                    </div>

                    {/* إجمالي الربح */}
                    <div className="bg-accentBlue/10 rounded-2xl p-6 border border-accentBlue/20">
                        <div className="flex justify-between font-black text-lg"><span className="text-accentBlue">{language === 'ar' ? 'إجمالي الربح' : 'Gross Profit'}</span><span className="text-accentBlue">{incomeData.grossProfit.toLocaleString()} {currency}</span></div>
                        <p className="text-secondary text-sm mt-1">{language === 'ar' ? 'هامش الربح:' : 'Margin:'} {incomeData.grossMargin.toFixed(1)}%</p>
                    </div>

                    {/* المصروفات */}
                    <div className="bg-background rounded-2xl p-6 border border-cardAccent">
                        <h4 className="font-black text-red-500 mb-4">{language === 'ar' ? 'المصروفات التشغيلية' : 'Operating Expenses'}</h4>
                        <div className="flex justify-between"><span className="text-textPrimary">{language === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}</span><span className="font-bold text-red-500">({incomeData.operatingExpenses.toLocaleString()})</span></div>
                    </div>

                    {/* صافي الربح */}
                    <div className={`rounded-2xl p-6 border ${incomeData.netProfit >= 0 ? 'bg-accentGreen/10 border-accentGreen/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex justify-between font-black text-xl">
                            <span className={incomeData.netProfit >= 0 ? 'text-accentGreen' : 'text-red-500'}>{language === 'ar' ? 'صافي الربح' : 'Net Profit'}</span>
                            <span className={incomeData.netProfit >= 0 ? 'text-accentGreen' : 'text-red-500'}>{incomeData.netProfit.toLocaleString()} {currency}</span>
                        </div>
                        <p className="text-secondary text-sm mt-1">{language === 'ar' ? 'هامش صافي الربح:' : 'Net Margin:'} {incomeData.netMargin.toFixed(1)}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomeStatement;
