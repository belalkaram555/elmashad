// البيانات الأساسية - تعريف الموردين
// صفحة كاملة مع CRUD operations

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Trash2, Phone, DollarSign, MapPin, XCircle,
    Search, LayoutGrid, List, Edit3, Truck, Building, FileText
} from 'lucide-react';
import { Supplier } from '../../types';

const SuppliersSetup: React.FC = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        companyName: '',
        balance: 0
    });

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        (s.companyName && s.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAdd = () => {
        if (!formData.name) {
            alert(language === 'ar' ? 'يرجى إدخال اسم المورد' : 'Please enter supplier name');
            return;
        }
        addSupplier({
            id: Date.now().toString(),
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            companyName: formData.companyName,
            balance: Number(formData.balance)
        });
        closeModal();
    };

    const handleEdit = () => {
        if (!editingSupplier || !formData.name) return;
        updateSupplier({
            ...editingSupplier,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            companyName: formData.companyName,
            balance: Number(formData.balance)
        });
        closeModal();
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            phone: supplier.phone,
            address: supplier.address || '',
            companyName: supplier.companyName || '',
            balance: supplier.balance
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSupplier(null);
        setFormData({ name: '', phone: '', address: '', companyName: '', balance: 0 });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا المورد؟' : 'Delete this supplier?')) {
            deleteSupplier(id);
        }
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'تعريف الموردين' : 'Suppliers Setup'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة بيانات الموردين ومعلومات التواصل' : 'Manage supplier data and contact information'}
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
                            className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary placeholder:text-secondary/50 w-64"
                        />
                    </div>

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

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm"
                    >
                        <Truck size={20} />
                        {language === 'ar' ? 'إضافة مورد' : 'Add Supplier'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Truck className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الموردين' : 'Total Suppliers'}</p>
                            <p className="text-2xl font-black text-textPrimary">{suppliers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المستحقات' : 'Total Payables'}</p>
                            <p className="text-2xl font-black text-red-500">
                                {suppliers.reduce((sum, s) => sum + (s.balance > 0 ? s.balance : 0), 0).toLocaleString()} {currency}
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
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'موردين نشطين' : 'Active Suppliers'}</p>
                            <p className="text-2xl font-black text-accentGreen">{suppliers.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredSuppliers.map(s => (
                        <div key={s.id} className="bg-surface p-8 rounded-[32px] border border-cardAccent hover:border-primary/40 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[22px] bg-background flex items-center justify-center font-black text-2xl text-primary border border-cardAccent">
                                        {s.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-textPrimary text-lg">{s.name}</h3>
                                        {s.companyName && (
                                            <p className="text-xs text-secondary font-bold flex items-center gap-1">
                                                <Building size={12} /> {s.companyName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(s)}
                                        className="p-2.5 bg-background border border-cardAccent text-primary rounded-xl hover:bg-primary hover:text-background transition-all"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-secondary text-sm">
                                    <Phone size={14} /> <span className="font-bold">{s.phone || '-'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-secondary text-sm">
                                    <MapPin size={14} /> <span className="font-bold">{s.address || '-'}</span>
                                </div>
                                <div className="bg-background rounded-2xl p-4 border border-cardAccent mt-4">
                                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">
                                        {language === 'ar' ? 'الرصيد المستحق' : 'Balance Due'}
                                    </p>
                                    <span className={`text-xl font-black ${s.balance > 0 ? 'text-red-500' : 'text-accentGreen'}`}>
                                        {s.balance.toLocaleString()} <span className="text-xs">{currency}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        </div>
                    ))}

                    {filteredSuppliers.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <Truck size={48} className="mx-auto text-secondary/30 mb-4" />
                            <p className="text-secondary font-bold">
                                {language === 'ar' ? 'لا يوجد موردين' : 'No suppliers found'}
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
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المورد' : 'Supplier'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الشركة' : 'Company'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الهاتف' : 'Phone'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الرصيد' : 'Balance'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map(s => (
                                <tr key={s.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center font-black text-lg text-primary border border-cardAccent">
                                                {s.name.charAt(0)}
                                            </div>
                                            <span className="font-black text-textPrimary">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="text-secondary font-bold">{s.companyName || '-'}</span></td>
                                    <td className="p-5"><span className="text-secondary font-bold">{s.phone || '-'}</span></td>
                                    <td className="p-5">
                                        <span className={`font-black ${s.balance > 0 ? 'text-red-500' : 'text-accentGreen'}`}>
                                            {s.balance.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-secondary mr-1">{currency}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditModal(s)} className="p-2.5 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit3 size={14} /></button>
                                            <button onClick={() => handleDelete(s.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
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
                                {editingSupplier
                                    ? (language === 'ar' ? 'تعديل بيانات المورد' : 'Edit Supplier')
                                    : (language === 'ar' ? 'إضافة مورد جديد' : 'Add New Supplier')
                                }
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم المورد' : 'Supplier Name'} *
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم الشركة' : 'Company Name'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                                />
                            </div>

                            <button
                                onClick={editingSupplier ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingSupplier
                                    ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                                    : (language === 'ar' ? 'حفظ بيانات المورد' : 'Save Supplier')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersSetup;
