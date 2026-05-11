// المخزون - نواقص المخزون
import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { AlertTriangle, Package, Search } from 'lucide-react';

const StockShortage: React.FC = () => {
    const { inventory } = useData();
    const { language } = useLanguage();

    // تحويل inventory مع حساب الكميات الإجمالية
    const inventoryWithTotals = useMemo(() => {
        return inventory.map(item => {
            const totalQty = Object.values(item.warehouseQuantities || {}).reduce((sum, qty) => sum + qty, 0);
            return {
                ...item,
                name: language === 'ar' ? item.nameAr : item.nameEn,
                quantity: totalQty,
                minStock: item.minLevel || 10
            };
        });
    }, [inventory, language]);

    const lowStockItems = useMemo(() => {
        return inventoryWithTotals.filter(i => i.quantity <= i.minStock).sort((a, b) => a.quantity - b.quantity);
    }, [inventoryWithTotals]);

    const outOfStock = lowStockItems.filter(i => i.quantity === 0);
    const lowStock = lowStockItems.filter(i => i.quantity > 0);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div><h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'نواقص المخزون' : 'Stock Shortage'}</h2><p className="text-secondary text-xs mt-1 font-bold">{language === 'ar' ? 'الأصناف التي تحتاج إعادة طلب' : 'Items that need reordering'}</p></div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center"><Package className="text-primary" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الأصناف' : 'Total Items'}</p><p className="text-2xl font-black text-textPrimary">{inventory.length}</p></div></div></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center"><AlertTriangle className="text-yellow-500" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مخزون منخفض' : 'Low Stock'}</p><p className="text-2xl font-black text-yellow-500">{lowStock.length}</p></div></div></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center"><AlertTriangle className="text-red-500" size={24} /></div><div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'نفذ من المخزون' : 'Out of Stock'}</p><p className="text-2xl font-black text-red-500">{outOfStock.length}</p></div></div></div>
            </div>

            {outOfStock.length > 0 && <div className="bg-red-500/5 border border-red-500/20 rounded-[32px] p-6">
                <h3 className="font-black text-red-500 mb-4 flex items-center gap-2"><AlertTriangle size={20} />{language === 'ar' ? 'نفذ من المخزون' : 'Out of Stock'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {outOfStock.map(item => (
                        <div key={item.id} className="bg-surface p-4 rounded-2xl border border-red-500/20">
                            <p className="font-black text-textPrimary">{item.name}</p>
                            <p className="text-red-500 text-sm font-bold">{language === 'ar' ? 'نفذ' : 'Out of stock'}</p>
                        </div>
                    ))}
                </div>
            </div>}

            {lowStock.length > 0 && <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-[32px] p-6">
                <h3 className="font-black text-yellow-500 mb-4 flex items-center gap-2"><AlertTriangle size={20} />{language === 'ar' ? 'مخزون منخفض' : 'Low Stock'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {lowStock.map(item => (
                        <div key={item.id} className="bg-surface p-4 rounded-2xl border border-yellow-500/20">
                            <p className="font-black text-textPrimary">{item.name}</p>
                            <p className="text-yellow-500 text-sm font-bold">{language === 'ar' ? 'المتبقي:' : 'Remaining:'} {item.quantity} {item.unit}</p>
                        </div>
                    ))}
                </div>
            </div>}

            {lowStockItems.length === 0 && <div className="text-center py-20"><Package size={64} className="mx-auto text-accentGreen/30 mb-4" /><p className="text-accentGreen font-bold text-xl">{language === 'ar' ? 'جميع الأصناف متوفرة ✓' : 'All items in stock ✓'}</p></div>}
        </div>
    );
};

export default StockShortage;
