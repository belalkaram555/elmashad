// المخزون - حركة المخزن
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUp, TrendingDown, Search, Calendar, Package } from 'lucide-react';

const StockMovement: React.FC = () => {
    const { inventory, settings, stockMovements } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    const movements = useMemo(() => {
        // استخدام stockMovements من Context أو localStorage
        const storedMovements = stockMovements || JSON.parse(localStorage.getItem('stock_movements') || '[]');

        const mvts = storedMovements.map((m: any) => {
            const item = inventory.find(i => i.id === m.itemId);
            const itemName = item ? (language === 'ar' ? item.nameAr : item.nameEn) : 'غير معروف';
            const type = ['purchase', 'transfer_in', 'production'].includes(m.type) ? 'in' : 'out';
            return { id: m.id, date: m.date, type, itemName, quantity: m.quantity, ref: m.notes || m.type };
        });

        return mvts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [stockMovements, inventory, language]);

    const filtered = movements.filter((m: any) => {
        const matchesSearch = m.itemName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || m.type === filterType;
        return matchesSearch && matchesType;
    });

    const stats = useMemo(() => ({
        totalIn: movements.filter((m: any) => m.type === 'in').reduce((s: number, m: any) => s + m.quantity, 0),
        totalOut: movements.filter((m: any) => m.type === 'out').reduce((s: number, m: any) => s + m.quantity, 0),
        totalItems: inventory.length
    }), [movements, inventory]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'حركة المخزن' : 'Stock Movement'}</h2>
                <div className="flex gap-3">
                    <div className="relative"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} /><input type="text" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary w-48" /></div>
                    <select className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 font-bold text-textPrimary" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                        <option value="in">{language === 'ar' ? 'وارد' : 'In'}</option>
                        <option value="out">{language === 'ar' ? 'صادر' : 'Out'}</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center"><TrendingUp className="text-accentGreen" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الوارد' : 'Total In'}</p><p className="text-2xl font-black text-accentGreen">{stats.totalIn}</p></div></div></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center"><TrendingDown className="text-red-500" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الصادر' : 'Total Out'}</p><p className="text-2xl font-black text-red-500">{stats.totalOut}</p></div></div></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center"><Package className="text-primary" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد الأصناف' : 'Items'}</p><p className="text-2xl font-black text-primary">{stats.totalItems}</p></div></div></div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'النوع' : 'Type'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الصنف' : 'Item'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'المرجع' : 'Reference'}</th>
                    </tr></thead>
                    <tbody>
                        {filtered.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا توجد حركات' : 'No movements'}</td></tr> :
                            filtered.slice(0, 50).map((m: any) => (
                                <tr key={m.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 text-secondary">{new Date(m.date).toLocaleDateString('ar-EG')}</td>
                                    <td className="p-5 text-center"><span className={`px-3 py-1 rounded-full text-xs font-black ${m.type === 'in' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>{m.type === 'in' ? (language === 'ar' ? 'وارد' : 'In') : (language === 'ar' ? 'صادر' : 'Out')}</span></td>
                                    <td className="p-5 font-bold text-textPrimary">{m.itemName}</td>
                                    <td className="p-5 font-black">{m.type === 'in' ? '+' : '-'}{m.quantity}</td>
                                    <td className="p-5 text-secondary text-sm">{m.ref}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockMovement;
