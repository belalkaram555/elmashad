// @ts-nocheck
// إدارة العملاء - أسعار العملاء
// تخصيص أسعار خاصة لكل عميل

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Tag, Search, Plus, XCircle, Trash2,
    User, Package, DollarSign
} from 'lucide-react';

interface CustomerPrice {
    id: string;
    customerId: string;
    customerName: string;
    itemId: string;
    itemName: string;
    standardPrice: number;
    customPrice: number;
}

const CustomerPricing: React.FC = () => {
    const { customers, inventory, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [prices, setPrices] = useState<CustomerPrice[]>(() => {
        const saved = localStorage.getItem('customer_prices');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
    const [formData, setFormData] = useState({
        customerId: '',
        itemId: '',
        customPrice: 0
    });

    const savePrices = (data: CustomerPrice[]) => {
        localStorage.setItem('customer_prices', JSON.stringify(data));
        setPrices(data);
    };

    const filteredPrices = prices.filter(p => {
        const matchesSearch = p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.itemName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCustomer = selectedCustomer === 'all' || p.customerId === selectedCustomer;
        return matchesSearch && matchesCustomer;
    });

    const handleAdd = () => {
        if (!formData.customerId || !formData.itemId || formData.customPrice <= 0) {
            alert(language === 'ar' ? 'يرجى اختيار العميل والصنف وإدخال السعر' : 'Please select customer, item and enter price');
            return;
        }

        const customer = customers.find(c => c.id === formData.customerId);
        const item = inventory.find(i => i.id === formData.itemId);
        if (!customer || !item) return;

        // Check if already exists
        const exists = prices.find(p => p.customerId === formData.customerId && p.itemId === formData.itemId);
        if (exists) {
            savePrices(prices.map(p =>
                p.customerId === formData.customerId && p.itemId === formData.itemId
                    ? { ...p, customPrice: formData.customPrice }
                    : p
            ));
        } else {
            const newPrice: CustomerPrice = {
                id: Date.now().toString(),
                customerId: formData.customerId,
                customerName: customer.name,
                itemId: formData.itemId,
                itemName: item.name,
                standardPrice: item.price,
                customPrice: formData.customPrice
            };
            savePrices([...prices, newPrice]);
        }
        closeModal();
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ customerId: '', itemId: '', customPrice: 0 });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا السعر؟' : 'Delete this price?')) {
            savePrices(prices.filter(p => p.id !== id));
        }
    };

    const stats = useMemo(() => ({
        totalPrices: prices.length,
        customersWithPrices: new Set(prices.map(p => p.customerId)).size,
        itemsWithPrices: new Set(prices.map(p => p.itemId)).size
    }), [prices]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'أسعار العملاء' : 'Customer Pricing'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'تخصيص أسعار خاصة لكل عميل' : 'Customize prices for each customer'}
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

                    <select
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'جميع العملاء' : 'All Customers'}</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'سعر خاص' : 'Custom Price'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Tag className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الأسعار' : 'Total Prices'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.totalPrices}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <User className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عملاء بأسعار خاصة' : 'Customers w/ Prices'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.customersWithPrices}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Package className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'أصناف بأسعار خاصة' : 'Items w/ Prices'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.itemsWithPrices}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prices Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الصنف' : 'Item'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'السعر الأساسي' : 'Standard'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'السعر الخاص' : 'Custom'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الفرق' : 'Diff'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'حذف' : 'Delete'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPrices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <Tag size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد أسعار خاصة' : 'No custom prices found'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredPrices.map(price => {
                                const diff = price.customPrice - price.standardPrice;
                                const diffPercent = ((diff / price.standardPrice) * 100).toFixed(1);
                                return (
                                    <tr key={price.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-accentBlue/10 flex items-center justify-center font-black text-accentBlue">
                                                    {price.customerName.charAt(0)}
                                                </div>
                                                <span className="font-black text-textPrimary">{price.customerName}</span>
                                            </div>
                                        </td>
                                        <td className="p-5"><span className="font-bold text-textPrimary">{price.itemName}</span></td>
                                        <td className="p-5"><span className="text-secondary line-through">{price.standardPrice.toLocaleString()} {currency}</span></td>
                                        <td className="p-5"><span className="font-black text-primary">{price.customPrice.toLocaleString()} {currency}</span></td>
                                        <td className="p-5 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-black ${diff < 0 ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>
                                                {diff > 0 ? '+' : ''}{diffPercent}%
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <button onClick={() => handleDelete(price.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
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
                                {language === 'ar' ? 'سعر خاص جديد' : 'New Custom Price'}
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

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الصنف' : 'Item'} *
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.itemId}
                                    onChange={e => {
                                        const item = inventory.find(i => i.id === e.target.value);
                                        setFormData({ ...formData, itemId: e.target.value, customPrice: item?.price || 0 });
                                    }}
                                >
                                    <option value="">{language === 'ar' ? 'اختر الصنف...' : 'Select Item...'}</option>
                                    {inventory.map(item => (
                                        <option key={item.id} value={item.id}>{item.name} ({item.price} {currency})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'السعر الخاص' : 'Custom Price'} *
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold text-xl focus:border-primary outline-none"
                                    value={formData.customPrice || ''}
                                    onChange={e => setFormData({ ...formData, customPrice: Number(e.target.value) })}
                                />
                            </div>

                            <button
                                onClick={handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {language === 'ar' ? 'حفظ السعر' : 'Save Price'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPricing;
