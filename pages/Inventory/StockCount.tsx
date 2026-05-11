// المخزون - الجرد المخزني
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Calculator, CheckCircle, AlertCircle, Search } from 'lucide-react';

const StockCount: React.FC = () => {
    const { inventory, warehouses } = useData();
    const { language } = useLanguage();

    const [searchQuery, setSearchQuery] = useState('');
    const [counts, setCounts] = useState<{ [key: string]: number }>({});

    // تحويل inventory لقائمة مع الكميات الإجمالية
    const inventoryWithTotals = useMemo(() => {
        return inventory.map(item => {
            const totalQty = Object.values(item.warehouseQuantities || {}).reduce((sum, qty) => sum + qty, 0);
            return {
                ...item,
                name: language === 'ar' ? item.nameAr : item.nameEn,
                quantity: totalQty
            };
        });
    }, [inventory, language]);

    const filtered = inventoryWithTotals.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCount = (id: string, value: number) => {
        setCounts({ ...counts, [id]: value });
    };

    const getDifference = (item: any) => {
        const counted = counts[item.id];
        if (counted === undefined) return null;
        return counted - item.quantity;
    };

    const hasDiscrepancy = inventoryWithTotals.some(i => {
        const diff = getDifference(i);
        return diff !== null && diff !== 0;
    });

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'الجرد المخزني' : 'Stock Count'}</h2>
                <div className="relative"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} /><input type="text" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary w-64" /></div>
            </div>

            {hasDiscrepancy && <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"><AlertCircle className="text-red-500" size={20} /><span className="text-red-500 font-bold">{language === 'ar' ? 'توجد فروقات في بعض الأصناف' : 'Some items have discrepancies'}</span></div>}

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الصنف' : 'Item'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الرصيد الفعلي' : 'System Qty'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'العد الفعلي' : 'Counted'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الفرق' : 'Difference'}</th>
                    </tr></thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={4} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا توجد أصناف' : 'No items'}</td></tr>
                        ) : (
                            filtered.map(item => {
                                const diff = getDifference(item);
                                return (
                                    <tr key={item.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                        <td className="p-5 font-bold text-textPrimary">{item.name}</td>
                                        <td className="p-5 text-textPrimary">{item.quantity} {item.unit}</td>
                                        <td className="p-5"><input type="number" className="w-24 p-2 bg-background border border-cardAccent rounded-xl text-textPrimary font-bold text-center" value={counts[item.id] ?? ''} onChange={e => handleCount(item.id, Number(e.target.value))} /></td>
                                        <td className="p-5 text-center">{diff !== null && <span className={`px-3 py-1 rounded-full text-xs font-black ${diff === 0 ? 'bg-accentGreen/10 text-accentGreen' : diff > 0 ? 'bg-accentBlue/10 text-accentBlue' : 'bg-red-500/10 text-red-500'}`}>{diff > 0 ? '+' : ''}{diff}</span>}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockCount;
