// الخزينة - الأرباح الشهرية
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { BarChart, TrendingUp, DollarSign, Calendar } from 'lucide-react';

const MonthlyProfits: React.FC = () => {
    const { orders, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = language === 'ar'
        ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthlyData = useMemo(() => {
        const allOrders = orders || [];
        return months.map((month, index) => {
            const monthStr = String(index + 1).padStart(2, '0');
            const monthOrders = allOrders.filter(o => o.createdAt?.startsWith(`${selectedYear}-${monthStr}`));
            const revenue = monthOrders.reduce((sum, s) => sum + (s.total || 0), 0);
            return { month, revenue, profit: revenue * 0.3 };
        });
    }, [orders, selectedYear, months]);

    const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
    const totalProfit = monthlyData.reduce((sum, m) => sum + m.profit, 0);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'الأرباح الشهرية' : 'Monthly Profits'}</h2>
                    <p className="text-secondary text-xs mt-1 font-bold">{language === 'ar' ? 'تقرير الأرباح' : 'Profit report'}</p>
                </div>
                <select className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 font-bold text-textPrimary" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
                    <p className="text-2xl font-black text-primary">{totalRevenue.toLocaleString()} {currency}</p>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'صافي الربح' : 'Net Profit'}</p>
                    <p className="text-2xl font-black text-accentGreen">{totalProfit.toLocaleString()} {currency}</p>
                </div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الشهر' : 'Month'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الربح' : 'Profit'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.map((m, i) => (
                            <tr key={i} className="border-b border-cardAccent/50 hover:bg-background/30">
                                <td className="p-5 font-black text-textPrimary">{m.month}</td>
                                <td className="p-5 text-primary font-bold">{m.revenue.toLocaleString()}</td>
                                <td className="p-5 text-accentGreen font-black">{m.profit.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonthlyProfits;
