// البيانات الأساسية - الفروع والمخازن
// صفحة كاملة مع CRUD operations

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Trash2, XCircle, Search, LayoutGrid, List, Edit3,
    Warehouse, MapPin, Package, Plus
} from 'lucide-react';
import { Warehouse as WarehouseType } from '../../types';

const BranchesWarehouses: React.FC = () => {
    const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse, inventory } = useData();
    const { language } = useLanguage();

    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingWarehouse, setEditingWarehouse] = useState<WarehouseType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        location: ''
    });

    const filteredWarehouses = warehouses.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.location && w.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // حساب عدد الأصناف في كل مخزن
    const getItemCount = (warehouseId: string) => {
        return inventory.filter(item =>
            item.warehouseQuantities && item.warehouseQuantities[warehouseId] > 0
        ).length;
    };

    // حساب إجمالي الكميات في كل مخزن
    const getTotalQuantity = (warehouseId: string) => {
        return inventory.reduce((sum, item) =>
            sum + (item.warehouseQuantities?.[warehouseId] || 0), 0
        );
    };

    const handleAdd = () => {
        if (!formData.name) {
            alert(language === 'ar' ? 'يرجى إدخال اسم المخزن' : 'Please enter warehouse name');
            return;
        }
        addWarehouse({
            id: Date.now().toString(),
            name: formData.name,
            location: formData.location
        });
        closeModal();
    };

    const handleEdit = () => {
        if (!editingWarehouse || !formData.name) return;
        updateWarehouse({
            ...editingWarehouse,
            name: formData.name,
            location: formData.location
        });
        closeModal();
    };

    const openEditModal = (warehouse: WarehouseType) => {
        setEditingWarehouse(warehouse);
        setFormData({
            name: warehouse.name,
            location: warehouse.location || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingWarehouse(null);
        setFormData({ name: '', location: '' });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا المخزن؟' : 'Delete this warehouse?')) {
            deleteWarehouse(id);
        }
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'الفروع والمخازن' : 'Branches & Warehouses'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة الفروع والمواقع والمخازن' : 'Manage branches, locations and warehouses'}
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
                        <Plus size={20} />
                        {language === 'ar' ? 'إضافة مخزن' : 'Add Warehouse'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Warehouse className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد المخازن' : 'Total Warehouses'}</p>
                            <p className="text-2xl font-black text-textPrimary">{warehouses.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Package className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الأصناف' : 'Total Items'}</p>
                            <p className="text-2xl font-black text-accentGreen">{inventory.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <MapPin className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'المواقع' : 'Locations'}</p>
                            <p className="text-2xl font-black text-accentBlue">
                                {new Set(warehouses.map(w => w.location).filter(Boolean)).size}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredWarehouses.map(w => (
                        <div key={w.id} className="bg-surface p-8 rounded-[32px] border border-cardAccent hover:border-primary/40 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Warehouse className="text-primary" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-textPrimary text-lg">{w.name}</h3>
                                        <p className="text-xs text-secondary font-bold flex items-center gap-1">
                                            <MapPin size={12} /> {w.location || '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(w)} className="p-2.5 bg-background border border-cardAccent text-primary rounded-xl hover:bg-primary hover:text-background transition-all">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(w.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-background rounded-2xl p-4 border border-cardAccent text-center">
                                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">
                                        {language === 'ar' ? 'الأصناف' : 'Items'}
                                    </p>
                                    <p className="text-xl font-black text-textPrimary">{getItemCount(w.id)}</p>
                                </div>
                                <div className="bg-background rounded-2xl p-4 border border-cardAccent text-center">
                                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">
                                        {language === 'ar' ? 'الكميات' : 'Qty'}
                                    </p>
                                    <p className="text-xl font-black text-accentGreen">{getTotalQuantity(w.id)}</p>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        </div>
                    ))}

                    {filteredWarehouses.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <Warehouse size={48} className="mx-auto text-secondary/30 mb-4" />
                            <p className="text-secondary font-bold">
                                {language === 'ar' ? 'لا يوجد مخازن' : 'No warehouses found'}
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
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المخزن' : 'Warehouse'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الموقع' : 'Location'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الأصناف' : 'Items'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الكميات' : 'Qty'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWarehouses.map(w => (
                                <tr key={w.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <Warehouse className="text-primary" size={20} />
                                            </div>
                                            <span className="font-black text-textPrimary">{w.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="text-secondary font-bold">{w.location || '-'}</span></td>
                                    <td className="p-5 text-center"><span className="font-black text-textPrimary">{getItemCount(w.id)}</span></td>
                                    <td className="p-5 text-center"><span className="font-black text-accentGreen">{getTotalQuantity(w.id)}</span></td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditModal(w)} className="p-2.5 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit3 size={14} /></button>
                                            <button onClick={() => handleDelete(w.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-md shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingWarehouse
                                    ? (language === 'ar' ? 'تعديل المخزن' : 'Edit Warehouse')
                                    : (language === 'ar' ? 'إضافة مخزن جديد' : 'Add New Warehouse')
                                }
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم المخزن' : 'Warehouse Name'} *
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الموقع' : 'Location'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={editingWarehouse ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingWarehouse
                                    ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                                    : (language === 'ar' ? 'إضافة المخزن' : 'Add Warehouse')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchesWarehouses;
