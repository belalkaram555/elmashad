// @ts-nocheck
// إدارة العملاء - خصومات العملاء
// تحديد الخصومات المسموحة لكل عميل

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Percent, Search, Plus, XCircle, Trash2, Edit3,
    User, Package, DollarSign
} from 'lucide-react';

interface CustomerDiscount {
    id: string;
    customerId: string;
    customerName: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    isActive: boolean;
}

const CustomerDiscounts: React.FC = () => {
    const { customers, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [discounts, setDiscounts] = useState<CustomerDiscount[]>(() => {
        const saved = localStorage.getItem('customer_discounts');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingDiscount, setEditingDiscount] = useState<CustomerDiscount | null>(null);
    const [formData, setFormData] = useState({
        customerId: '',
        discountType: 'percentage' as const,
        discountValue: 0,
        minPurchase: 0,
        maxDiscount: 0
    });

    const saveDiscounts = (data: CustomerDiscount[]) => {
        localStorage.setItem('customer_discounts', JSON.stringify(data));
        setDiscounts(data);
    };

    const filteredDiscounts = discounts.filter(d =>
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        if (!formData.customerId || formData.discountValue <= 0) {
            alert(language === 'ar' ? 'يرجى اختيار العميل وإدخال قيمة الخصم' : 'Please select customer and enter discount value');
            return;
        }

        const customer = customers.find(c => c.id === formData.customerId);
        if (!customer) return;

        const newDiscount: CustomerDiscount = {
            id: Date.now().toString(),
            customerId: formData.customerId,
            customerName: customer.name,
            discountType: formData.discountType,
            discountValue: formData.discountValue,
            minPurchase: formData.minPurchase || undefined,
            maxDiscount: formData.maxDiscount || undefined,
            isActive: true
        };

        saveDiscounts([...discounts, newDiscount]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingDiscount) return;

        const customer = customers.find(c => c.id === formData.customerId);

        saveDiscounts(discounts.map(d => d.id === editingDiscount.id ? {
            ...d,
            customerId: formData.customerId,
            customerName: customer?.name || d.customerName,
            discountType: formData.discountType,
            discountValue: formData.discountValue,
            minPurchase: formData.minPurchase || undefined,
            maxDiscount: formData.maxDiscount || undefined
        } : d));
        closeModal();
    };

    const openEditModal = (discount: CustomerDiscount) => {
        setEditingDiscount(discount);
        setFormData({
            customerId: discount.customerId,
            discountType: discount.discountType,
            discountValue: discount.discountValue,
            minPurchase: discount.minPurchase || 0,
            maxDiscount: discount.maxDiscount || 0
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingDiscount(null);
        setFormData({ customerId: '', discountType: 'percentage', discountValue: 0, minPurchase: 0, maxDiscount: 0 });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا الخصم؟' : 'Delete this discount?')) {
            saveDiscounts(discounts.filter(d => d.id !== id));
        }
    };

    const toggleActive = (id: string) => {
        saveDiscounts(discounts.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
    };

    const stats = useMemo(() => ({
        total: discounts.length,
        active: discounts.filter(d => d.isActive).length,
        customersWithDiscount: new Set(discounts.map(d => d.customerId)).size
    }), [discounts]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'خصومات العملاء' : 'Customer Discounts'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'تحديد الخصومات المسموحة لكل عميل' : 'Define allowed discounts per customer'}
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
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الخصومات' : 'Total Discounts'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Percent className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'خصومات نشطة' : 'Active Discounts'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <User className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عملاء بخصومات' : 'Customers w/ Discounts'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.customersWithDiscount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDiscounts.map(discount => (
                    <div key={discount.id} className={`bg-surface p-6 rounded-[32px] border transition-all group ${discount.isActive ? 'border-cardAccent hover:border-primary/40' : 'border-red-500/20 opacity-60'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-accentGreen/10 flex items-center justify-center">
                                    <Percent className="text-accentGreen" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-textPrimary">{discount.customerName}</h3>
                                    <p className="text-xs text-secondary">
                                        {discount.discountType === 'percentage' ? (language === 'ar' ? 'نسبة مئوية' : 'Percentage') : (language === 'ar' ? 'مبلغ ثابت' : 'Fixed')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(discount)} className="p-2 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-background transition-all">
                                    <Edit3 size={14} />
                                </button>
                                <button onClick={() => handleDelete(discount.id)} className="p-2 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-background rounded-xl p-4 border border-cardAccent mb-3">
                            <div className="text-center">
                                <span className="text-4xl font-black text-accentGreen">
                                    {discount.discountValue}{discount.discountType === 'percentage' ? '%' : ` ${currency}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            {discount.minPurchase && (
                                <span className="text-secondary">
                                    {language === 'ar' ? 'الحد الأدنى:' : 'Min:'} {discount.minPurchase.toLocaleString()}
                                </span>
                            )}
                            <button
                                onClick={() => toggleActive(discount.id)}
                                className={`px-3 py-1 rounded-full text-xs font-black ${discount.isActive ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}
                            >
                                {discount.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                            </button>
                        </div>
                    </div>
                ))}
                {filteredDiscounts.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <Percent size={48} className="mx-auto text-secondary/30 mb-4" />
                        <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد خصومات' : 'No discounts found'}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingDiscount ? (language === 'ar' ? 'تعديل الخصم' : 'Edit Discount') : (language === 'ar' ? 'خصم جديد' : 'New Discount')}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'العميل' : 'Customer'} *
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.customerId}
                                    onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                >
                                    <option value="">{language === 'ar' ? 'اختر العميل...' : 'Select Customer...'}</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
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
                                        value={formData.discountType}
                                        onChange={e => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                                    >
                                        <option value="percentage">{language === 'ar' ? 'نسبة مئوية' : 'Percentage'}</option>
                                        <option value="fixed">{language === 'ar' ? 'مبلغ ثابت' : 'Fixed Amount'}</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'القيمة' : 'Value'} *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.discountValue || ''}
                                        onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الحد الأدنى للشراء' : 'Min Purchase'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.minPurchase || ''}
                                        onChange={e => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الحد الأقصى للخصم' : 'Max Discount'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.maxDiscount || ''}
                                        onChange={e => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={editingDiscount ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingDiscount ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة الخصم' : 'Add Discount')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDiscounts;
