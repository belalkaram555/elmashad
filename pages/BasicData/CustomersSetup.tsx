// البيانات الأساسية - تعريف العملاء
// صفحة كاملة مع CRUD operations

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Plus, Trash2, Phone, DollarSign, MapPin, XCircle,
    UserPlus, Search, LayoutGrid, List, Edit3, User, FileText
} from 'lucide-react';
import { Customer } from '../../types';

const CustomersSetup: React.FC = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    // حالة النموذج والعرض
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        balance: 0
    });

    // تصفية العملاء حسب البحث
    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    // إضافة عميل جديد
    const handleAdd = () => {
        if (!formData.name) {
            alert(language === 'ar' ? 'يرجى إدخال اسم العميل' : 'Please enter customer name');
            return;
        }
        addCustomer({
            id: Date.now().toString(),
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            balance: Number(formData.balance)
        });
        closeModal();
    };

    // تعديل عميل
    const handleEdit = () => {
        if (!editingCustomer || !formData.name) return;
        updateCustomer({
            ...editingCustomer,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            balance: Number(formData.balance)
        });
        closeModal();
    };

    // فتح نموذج التعديل
    const openEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            address: customer.address || '',
            balance: customer.balance
        });
        setShowModal(true);
    };

    // إغلاق النموذج
    const closeModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
        setFormData({ name: '', phone: '', address: '', balance: 0 });
    };

    // حذف عميل
    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا العميل؟' : 'Delete this customer?')) {
            deleteCustomer(id);
        }
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'تعريف العملاء' : 'Customers Setup'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة بيانات العملاء الأساسية' : 'Manage customer basic data'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary placeholder:text-secondary/50 w-64"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-surface rounded-xl border border-cardAccent p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm"
                    >
                        <UserPlus size={20} />
                        {language === 'ar' ? 'إضافة عميل' : 'Add Customer'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <User className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}</p>
                            <p className="text-2xl font-black text-textPrimary">{customers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المديونيات' : 'Total Debt'}</p>
                            <p className="text-2xl font-black text-red-500">
                                {customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0).toLocaleString()} {currency}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <FileText className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عملاء لديهم رصيد' : 'With Balance'}</p>
                            <p className="text-2xl font-black text-accentGreen">
                                {customers.filter(c => c.balance > 0).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCustomers.map(c => (
                        <div key={c.id} className="bg-surface p-8 rounded-[32px] border border-cardAccent hover:border-primary/40 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[22px] bg-background flex items-center justify-center font-black text-2xl text-primary border border-cardAccent">
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-textPrimary text-lg">{c.name}</h3>
                                        <p className="text-xs text-secondary font-bold flex items-center gap-1">
                                            <Phone size={12} /> {c.phone || '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(c)}
                                        className="p-2.5 bg-background border border-cardAccent text-primary rounded-xl hover:bg-primary hover:text-background transition-all"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-background rounded-2xl p-4 border border-cardAccent">
                                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">
                                        {language === 'ar' ? 'العنوان' : 'Address'}
                                    </p>
                                    <p className="text-sm text-textPrimary font-bold flex items-center gap-2">
                                        <MapPin size={14} className="text-secondary" />
                                        {c.address || '-'}
                                    </p>
                                </div>
                                <div className="bg-background rounded-2xl p-4 border border-cardAccent">
                                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">
                                        {language === 'ar' ? 'الرصيد' : 'Balance'}
                                    </p>
                                    <span className={`text-xl font-black ${c.balance > 0 ? 'text-red-500' : 'text-accentGreen'}`}>
                                        {c.balance.toLocaleString()} <span className="text-xs">{currency}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        </div>
                    ))}

                    {filteredCustomers.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <User size={48} className="mx-auto text-secondary/30 mb-4" />
                            <p className="text-secondary font-bold">
                                {language === 'ar' ? 'لا يوجد عملاء' : 'No customers found'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cardAccent bg-background/50">
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">
                                    {language === 'ar' ? 'العميل' : 'Customer'}
                                </th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">
                                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                                </th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">
                                    {language === 'ar' ? 'العنوان' : 'Address'}
                                </th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">
                                    {language === 'ar' ? 'الرصيد' : 'Balance'}
                                </th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">
                                    {language === 'ar' ? 'إجراءات' : 'Actions'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(c => (
                                <tr key={c.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center font-black text-lg text-primary border border-cardAccent">
                                                {c.name.charAt(0)}
                                            </div>
                                            <span className="font-black text-textPrimary">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-secondary font-bold">{c.phone || '-'}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-secondary font-bold">{c.address || '-'}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`font-black ${c.balance > 0 ? 'text-red-500' : 'text-accentGreen'}`}>
                                            {c.balance.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-secondary mr-1">{currency}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openEditModal(c)}
                                                className="p-2.5 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-md shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingCustomer
                                    ? (language === 'ar' ? 'تعديل بيانات العميل' : 'Edit Customer')
                                    : (language === 'ar' ? 'إضافة عميل جديد' : 'Add New Customer')
                                }
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم العميل' : 'Customer Name'} *
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={language === 'ar' ? 'أدخل اسم العميل' : 'Enter customer name'}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'العنوان' : 'Address'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder={language === 'ar' ? 'أدخل العنوان' : 'Enter address'}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الرصيد الافتتاحي' : 'Opening Balance'}
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.balance}
                                    onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>

                            <button
                                onClick={editingCustomer ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingCustomer
                                    ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                                    : (language === 'ar' ? 'حفظ بيانات العميل' : 'Save Customer')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersSetup;
