// @ts-nocheck
// المخزون - أرباح الأصناف
import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { DollarSign, TrendingUp, Package, Search } from 'lucide-react';

const ItemProfits: React.FC = () => {
    const { inventory, orders, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const itemProfits = useMemo(() => {
        const allOrders = orders || [];

        return inventory.map(item => {
            const itemName = language === 'ar' ? item.nameAr : item.nameEn;
            // البحث في الطلبات عن هذا الصنف
            const soldItems = allOrders.flatMap(o => o.items || []).filter(i => i.id === item.id || i.itemId === item.id);
            const totalSold = soldItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
            const totalRevenue = soldItems.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 0)), 0);
            const totalCost = totalSold * (item.costPerUnit || 0);
            const profit = totalRevenue - totalCost;
            const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

            return {
                id: item.id,
                name: itemName,
                totalSold,
                totalRevenue,
                totalCost,
                profit,
                margin
            };
        }).sort((a, b) => b.profit - a.profit);
    }, [inventory, orders, language]);

    const stats = useMemo(() => ({
        totalProfit: itemProfits.reduce((s, i) => s + i.profit, 0),
        totalRevenue: itemProfits.reduce((s, i) => s + i.totalRevenue, 0),
        avgMargin: itemProfits.length > 0 ? itemProfits.reduce((s, i) => s + i.margin, 0) / itemProfits.length : 0
    }), [itemProfits]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div><h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'أرباح الأصناف' : 'Item Profits'}</h2></div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center"><DollarSign className="text-primary" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p><p className="text-2xl font-black text-primary">{stats.totalRevenue.toLocaleString()}</p></div></div></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center"><TrendingUp className="text-accentGreen" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الربح' : 'Total Profit'}</p><p className="text-2xl font-black text-accentGreen">{stats.totalProfit.toLocaleString()}</p></div></div></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center"><Package className="text-accentBlue" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'متوسط الهامش' : 'Avg Margin'}</p><p className="text-2xl font-black text-accentBlue">{stats.avgMargin.toFixed(1)}%</p></div></div></div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الصنف' : 'Item'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'المبيعات' : 'Sold'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'التكلفة' : 'Cost'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الربح' : 'Profit'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الهامش' : 'Margin'}</th>
                    </tr></thead>
                    <tbody>
                        {itemProfits.length === 0 ? (
                            <tr><td colSpan={6} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا توجد بيانات' : 'No data'}</td></tr>
                        ) : (
                            itemProfits.slice(0, 50).map(item => (
                                <tr key={item.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 font-bold text-textPrimary">{item.name}</td>
                                    <td className="p-5 text-textPrimary">{item.totalSold}</td>
                                    <td className="p-5 text-primary font-bold">{item.totalRevenue.toLocaleString()}</td>
                                    <td className="p-5 text-red-500">{item.totalCost.toLocaleString()}</td>
                                    <td className="p-5 font-black text-accentGreen">{item.profit.toLocaleString()} {currency}</td>
                                    <td className="p-5 text-center"><span className={`px-3 py-1 rounded-full text-xs font-black ${item.margin > 30 ? 'bg-accentGreen/10 text-accentGreen' : item.margin > 15 ? 'bg-accentBlue/10 text-accentBlue' : 'bg-red-500/10 text-red-500'}`}>{item.margin.toFixed(1)}%</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ItemProfits;
