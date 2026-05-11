// إدارة الموردين - الخصم المكتسب
// تسجيل الخصومات المكتسبة من الموردين

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Percent, Search, Plus, XCircle, Trash2,
    User, DollarSign, Calendar
} from 'lucide-react';

interface EarnedDiscount {
    id: string;
    supplierId: string;
    supplierName: string;
    date: string;
    amount: number;
    reason: string;
    type: 'volume' | 'early_payment' | 'promotional' | 'other';
}

const SupplierDiscounts: React.FC = () => {
    const { suppliers, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [discounts, setDiscounts] = useState<EarnedDiscount[]>(() => {
        const saved = localStorage.getItem('supplier_earned_discounts');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        supplierId: '',
        amount: 0,
        reason: '',
        type: 'volume' as const
    });

    const saveDiscounts = (data: EarnedDiscount[]) => {
        localStorage.setItem('supplier_earned_discounts', JSON.stringify(data));
        setDiscounts(data);
    };

    const filteredDiscounts = discounts.filter(d =>
        d.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        if (!formData.supplierId || formData.amount <= 0) {
            alert(language === 'ar' ? 'يرجى اختيار المورد وإدخال قيمة الخصم' : 'Please select supplier and enter discount amount');
            return;
        }

        const supplier = suppliers.find(s => s.id === formData.supplierId);
        if (!supplier) return;

        const newDiscount: EarnedDiscount = {
            id: Date.now().toString(),
            supplierId: formData.supplierId,
            supplierName: supplier.name,
            date: new Date().toISOString().split('T')[0],
            amount: formData.amount,
            reason: formData.reason,
            type: formData.type
        };

        saveDiscounts([...discounts, newDiscount]);
        closeModal();
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ supplierId: '', amount: 0, reason: '', type: 'volume' });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا الخصم؟' : 'Delete this discount?')) {
            saveDiscounts(discounts.filter(d => d.id !== id));
        }
    };

    const getTypeName = (type: EarnedDiscount['type']) => {
        const names = {
            volume: language === 'ar' ? 'خصم كمية' : 'Volume',
            early_payment: language === 'ar' ? 'سداد مبكر' : 'Early Payment',
            promotional: language === 'ar' ? 'ترويجي' : 'Promotional',
            other: language === 'ar' ? 'أخرى' : 'Other'
        };
        return names[type];
    };

    const stats = useMemo(() => ({
        total: discounts.length,
        totalAmount: discounts.reduce((sum, d) => sum + d.amount, 0),
        thisMonth: discounts.filter(d => d.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((sum, d) => sum + d.amount, 0)
    }), [discounts]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'الخصم المكتسب' : 'Earned Discounts'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'الخصومات المكتسبة من الموردين' : 'Discounts earned from suppliers'}
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

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'خصم جديد' : 'New Discount'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Percent className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد الخصومات' : 'Total Discounts'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المكتسب' : 'Total Earned'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.totalAmount.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Calendar className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'هذا الشهر' : 'This Month'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.thisMonth.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discounts Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المورد' : 'Supplier'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'النوع' : 'Type'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'السبب' : 'Reason'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'حذف' : 'Delete'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDiscounts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <Percent size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد خصومات مكتسبة' : 'No earned discounts'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredDiscounts.map(d => (
                                <tr key={d.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5"><span className="text-secondary font-bold">{new Date(d.date).toLocaleDateString('ar-EG')}</span></td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                                {d.supplierName.charAt(0)}
                                            </div>
                                            <span className="font-black text-textPrimary">{d.supplierName}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="px-3 py-1 rounded-full text-xs font-black bg-accentBlue/10 text-accentBlue">
                                            {getTypeName(d.type)}
                                        </span>
                                    </td>
                                    <td className="p-5"><span className="text-secondary">{d.reason}</span></td>
                                    <td className="p-5"><span className="font-black text-accentGreen text-lg">{d.amount.toLocaleString()} {currency}</span></td>
                                    <td className="p-5 text-center">
                                        <button onClick={() => handleDelete(d.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {language === 'ar' ? 'خصم مكتسب جديد' : 'New Earned Discount'}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'المورد' : 'Supplier'} *
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.supplierId}
                                    onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                                >
                                    <option value="">{language === 'ar' ? 'اختر المورد...' : 'Select Supplier...'}</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'نوع الخصم' : 'Type'}
                                    </label>
                                    <select
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="volume">{language === 'ar' ? 'خصم كمية' : 'Volume'}</option>
                                        <option value="early_payment">{language === 'ar' ? 'سداد مبكر' : 'Early Payment'}</option>
                                        <option value="promotional">{language === 'ar' ? 'ترويجي' : 'Promotional'}</option>
                                        <option value="other">{language === 'ar' ? 'أخرى' : 'Other'}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'المبلغ' : 'Amount'} *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.amount || ''}
                                        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'السبب / الملاحظات' : 'Reason / Notes'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {language === 'ar' ? 'إضافة الخصم' : 'Add Discount'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierDiscounts;
