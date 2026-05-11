// التصنيع - حركة التصنيع
// متابعة حركة المواد الخام والمنتجات النهائية

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    ArrowRightLeft, Search, Calendar, Package,
    TrendingUp, TrendingDown, Factory
} from 'lucide-react';

interface ManufacturingMovement {
    id: string;
    date: string;
    orderId: string;
    orderNumber: string;
    type: 'consumption' | 'production';
    itemName: string;
    quantity: number;
    unit: string;
}

const ManufacturingMovement: React.FC = () => {
    const { language } = useLanguage();

    // أوامر التصنيع
    const orders = useMemo(() => {
        const saved = localStorage.getItem('manufacturing_orders');
        return saved ? JSON.parse(saved) : [];
    }, []);

    // الوصفات
    const recipes = useMemo(() => {
        const saved = localStorage.getItem('bom_recipes');
        return saved ? JSON.parse(saved) : [];
    }, []);

    // توليد حركة التصنيع من الأوامر المكتملة
    const movements = useMemo(() => {
        const allMovements: ManufacturingMovement[] = [];

        orders.filter((o: any) => o.status === 'completed').forEach((order: any) => {
            const recipe = recipes.find((r: any) => r.name === order.recipeName);

            // استهلاك المواد الخام
            if (recipe) {
                recipe.ingredients?.forEach((ing: any) => {
                    allMovements.push({
                        id: `${order.id}-cons-${ing.itemId}`,
                        date: order.endDate || order.createdAt,
                        orderId: order.id,
                        orderNumber: order.orderNumber,
                        type: 'consumption',
                        itemName: ing.itemName,
                        quantity: ing.quantity * order.quantity,
                        unit: ing.unit
                    });
                });
            }

            // إنتاج المنتج النهائي
            allMovements.push({
                id: `${order.id}-prod`,
                date: order.endDate || order.createdAt,
                orderId: order.id,
                orderNumber: order.orderNumber,
                type: 'production',
                itemName: order.recipeName,
                quantity: order.quantity,
                unit: 'وحدة'
            });
        });

        return allMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, recipes]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState('');

    const filteredMovements = movements.filter(m => {
        const matchesSearch = m.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.orderNumber.includes(searchQuery);
        const matchesType = filterType === 'all' || m.type === filterType;
        const matchesDate = !selectedDate || m.date.startsWith(selectedDate);
        return matchesSearch && matchesType && matchesDate;
    });

    const stats = useMemo(() => ({
        totalMovements: movements.length,
        consumptions: movements.filter(m => m.type === 'consumption').length,
        productions: movements.filter(m => m.type === 'production').length,
        completedOrders: orders.filter((o: any) => o.status === 'completed').length
    }), [movements, orders]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'حركة التصنيع' : 'Manufacturing Movement'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'متابعة حركة المواد الخام والمنتجات' : 'Track raw materials and products movement'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary placeholder:text-secondary/50 w-48"
                        />
                    </div>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />

                    <select
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                        <option value="consumption">{language === 'ar' ? 'استهلاك' : 'Consumption'}</option>
                        <option value="production">{language === 'ar' ? 'إنتاج' : 'Production'}</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <ArrowRightLeft className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الحركات' : 'Total Movements'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.totalMovements}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'استهلاك' : 'Consumption'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.consumptions}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إنتاج' : 'Production'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.productions}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Factory className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'أوامر مكتملة' : 'Completed Orders'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.completedOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movements Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'رقم الأمر' : 'Order #'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'النوع' : 'Type'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الصنف' : 'Item'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الوحدة' : 'Unit'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMovements.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <ArrowRightLeft size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد حركات تصنيع' : 'No manufacturing movements'}</p>
                                    <p className="text-secondary/60 text-sm mt-2">{language === 'ar' ? 'أكمل أوامر التصنيع لعرض الحركات' : 'Complete manufacturing orders to see movements'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredMovements.map(m => (
                                <tr key={m.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5"><span className="text-secondary font-bold">{new Date(m.date).toLocaleDateString('ar-EG')}</span></td>
                                    <td className="p-5"><span className="font-black text-primary">{m.orderNumber}</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${m.type === 'production' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>
                                            {m.type === 'production' ? (language === 'ar' ? 'إنتاج' : 'Production') : (language === 'ar' ? 'استهلاك' : 'Consumption')}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.type === 'production' ? 'bg-accentGreen/10' : 'bg-red-500/10'}`}>
                                                <Package className={m.type === 'production' ? 'text-accentGreen' : 'text-red-500'} size={18} />
                                            </div>
                                            <span className="font-bold text-textPrimary">{m.itemName}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`font-black text-lg ${m.type === 'production' ? 'text-accentGreen' : 'text-red-500'}`}>
                                            {m.type === 'production' ? '+' : '-'}{m.quantity}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center"><span className="text-secondary font-bold">{m.unit}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManufacturingMovement;
