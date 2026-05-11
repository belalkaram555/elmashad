// المبيعات المتنقلة - العمليات
// متابعة عمليات البيع والتوصيل

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    ShoppingCart, Search, Calendar, Car, User,
    CheckCircle, Clock, XCircle, MapPin, DollarSign
} from 'lucide-react';

interface SalesOperation {
    id: string;
    vehicleId: string;
    vehiclePlate: string;
    driverName: string;
    customerId: string;
    customerName: string;
    items: { name: string; qty: number; price: number }[];
    total: number;
    status: 'pending' | 'delivered' | 'cancelled';
    date: string;
    notes?: string;
}

const Operations: React.FC = () => {
    const { customers, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [operations, setOperations] = useState<SalesOperation[]>(() => {
        const saved = localStorage.getItem('mobile_sales_operations');
        return saved ? JSON.parse(saved) : [];
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const saveOperations = (data: SalesOperation[]) => {
        localStorage.setItem('mobile_sales_operations', JSON.stringify(data));
        setOperations(data);
    };

    const filteredOperations = operations.filter(o => {
        const matchesSearch = o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.vehiclePlate.includes(searchQuery);
        const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
        const matchesDate = o.date === selectedDate;
        return matchesSearch && matchesStatus && matchesDate;
    });

    const updateStatus = (id: string, status: SalesOperation['status']) => {
        saveOperations(operations.map(o => o.id === id ? { ...o, status } : o));
    };

    const getStatusColor = (status: SalesOperation['status']) => {
        switch (status) {
            case 'pending': return 'bg-primary/10 text-primary';
            case 'delivered': return 'bg-accentGreen/10 text-accentGreen';
            case 'cancelled': return 'bg-red-500/10 text-red-500';
            default: return 'bg-secondary/10 text-secondary';
        }
    };

    const getStatusName = (status: SalesOperation['status']) => {
        const names = {
            pending: language === 'ar' ? 'قيد التوصيل' : 'Pending',
            delivered: language === 'ar' ? 'تم التسليم' : 'Delivered',
            cancelled: language === 'ar' ? 'ملغي' : 'Cancelled'
        };
        return names[status];
    };

    const stats = useMemo(() => ({
        total: filteredOperations.length,
        pending: filteredOperations.filter(o => o.status === 'pending').length,
        delivered: filteredOperations.filter(o => o.status === 'delivered').length,
        totalSales: filteredOperations.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
    }), [filteredOperations]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'العمليات' : 'Operations'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'متابعة عمليات البيع والتوصيل' : 'Track sales and delivery operations'}
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
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                        <option value="pending">{language === 'ar' ? 'قيد التوصيل' : 'Pending'}</option>
                        <option value="delivered">{language === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                        <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <ShoppingCart className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي العمليات' : 'Total'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Clock className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'قيد التوصيل' : 'Pending'}</p>
                            <p className="text-2xl font-black text-primary">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'تم التسليم' : 'Delivered'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.delivered}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.totalSales.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Operations Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'السيارة' : 'Vehicle'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الأصناف' : 'Items'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOperations.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <ShoppingCart size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد عمليات لهذا اليوم' : 'No operations for this day'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredOperations.map(op => (
                                <tr key={op.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Car className="text-primary" size={18} />
                                            </div>
                                            <div>
                                                <span className="font-black text-textPrimary block">{op.vehiclePlate}</span>
                                                <span className="text-xs text-secondary">{op.driverName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-secondary" />
                                            <span className="font-bold text-textPrimary">{op.customerName}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center"><span className="font-black text-textPrimary">{op.items.length}</span></td>
                                    <td className="p-5"><span className="font-black text-primary">{op.total.toLocaleString()} {currency}</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(op.status)}`}>
                                            {getStatusName(op.status)}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            {op.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(op.id, 'delivered')}
                                                        className="p-2 bg-accentGreen/10 text-accentGreen rounded-lg hover:bg-accentGreen hover:text-white transition-all"
                                                        title={language === 'ar' ? 'تم التسليم' : 'Delivered'}
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(op.id, 'cancelled')}
                                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                        title={language === 'ar' ? 'إلغاء' : 'Cancel'}
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Operations;
