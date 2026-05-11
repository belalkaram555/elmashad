// البيانات الأساسية - قوائم الأسعار
// إدارة قوائم أسعار مختلفة

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Tag, Search, Plus, XCircle, Trash2, Edit3,
    Percent, Package, Grid, List
} from 'lucide-react';

interface PriceList {
    id: string;
    name: string;
    description?: string;
    discountPercent: number;
    items: { itemId: string; itemName: string; customPrice: number }[];
    isActive: boolean;
}

const normalizePriceList = (raw: any): PriceList | null => {
    if (!raw || typeof raw !== 'object') return null;

    const id = String(raw.id ?? Date.now());
    const name = String(raw.name ?? raw.nameAr ?? raw.nameEn ?? '').trim();
    if (!name) return null;

    const discountRaw = raw.discountPercent ?? raw.discount ?? 0;
    const discountPercent = Number.isFinite(Number(discountRaw)) ? Number(discountRaw) : 0;

    const items = Array.isArray(raw.items)
        ? raw.items.map((item: any) => ({
            itemId: String(item?.itemId ?? item?.id ?? ''),
            itemName: String(item?.itemName ?? item?.name ?? item?.nameAr ?? item?.nameEn ?? ''),
            customPrice: Number(item?.customPrice ?? item?.price ?? 0) || 0,
        }))
        : [];

    return {
        id,
        name,
        description: raw.description ? String(raw.description) : '',
        discountPercent: Math.max(0, Math.min(100, discountPercent)),
        items,
        isActive: typeof raw.isActive === 'boolean' ? raw.isActive : true,
    };
};

const PriceLists: React.FC = () => {
    const { menuItems, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [priceLists, setPriceLists] = useState<PriceList[]>(() => {
        const saved = localStorage.getItem('price_lists');
        if (!saved) return [];

        try {
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) return [];
            return parsed
                .map(normalizePriceList)
                .filter((list): list is PriceList => list !== null);
        } catch {
            return [];
        }
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editingList, setEditingList] = useState<PriceList | null>(null);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        discountPercent: 0
    });

    const savePriceLists = (data: PriceList[]) => {
        localStorage.setItem('price_lists', JSON.stringify(data));
        setPriceLists(data);
    };

    const filteredLists = priceLists.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        if (!formData.name) {
            alert(language === 'ar' ? 'يرجى إدخال اسم القائمة' : 'Please enter list name');
            return;
        }

        const newList: PriceList = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            discountPercent: formData.discountPercent,
            items: [],
            isActive: true
        };

        savePriceLists([...priceLists, newList]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingList) return;

        savePriceLists(priceLists.map(p => p.id === editingList.id ? {
            ...p,
            name: formData.name,
            description: formData.description,
            discountPercent: formData.discountPercent
        } : p));
        closeModal();
    };

    const openEditModal = (list: PriceList) => {
        setEditingList(list);
        setFormData({
            name: list.name,
            description: list.description || '',
            discountPercent: list.discountPercent
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingList(null);
        setFormData({ name: '', description: '', discountPercent: 0 });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذه القائمة؟' : 'Delete this price list?')) {
            savePriceLists(priceLists.filter(p => p.id !== id));
        }
    };

    const toggleActive = (id: string) => {
        savePriceLists(priceLists.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    };

    const selectedList = priceLists.find(p => p.id === selectedListId);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'قوائم الأسعار' : 'Price Lists'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة قوائم الأسعار المختلفة' : 'Manage different price lists'}
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

                    <div className="flex bg-surface rounded-xl border border-cardAccent">
                        <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-background' : 'text-secondary'}`}>
                            <Grid size={18} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-background' : 'text-secondary'}`}>
                            <List size={18} />
                        </button>
                    </div>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'قائمة جديدة' : 'New List'}
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
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد القوائم' : 'Total Lists'}</p>
                            <p className="text-2xl font-black text-textPrimary">{priceLists.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Tag className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'قوائم نشطة' : 'Active Lists'}</p>
                            <p className="text-2xl font-black text-accentGreen">{priceLists.filter(p => p.isActive).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Package className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الأصناف' : 'Total Items'}</p>
                            <p className="text-2xl font-black text-accentBlue">{menuItems.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Lists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLists.map(list => (
                    <div
                        key={list.id}
                        className={`bg-surface p-6 rounded-[32px] border transition-all group cursor-pointer ${selectedListId === list.id ? 'border-primary ring-2 ring-primary/20' : 'border-cardAccent hover:border-primary/40'
                            } ${!list.isActive && 'opacity-60'}`}
                        onClick={() => setSelectedListId(list.id === selectedListId ? null : list.id)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Tag className="text-primary" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-textPrimary">{list.name}</h3>
                                    <p className="text-xs text-secondary">{list.description}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); openEditModal(list); }} className="p-2 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-background transition-all">
                                    <Edit3 size={14} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(list.id); }} className="p-2 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Percent size={16} className="text-accentBlue" />
                                <span className="font-black text-accentBlue">{list.discountPercent}%</span>
                                <span className="text-secondary text-sm">{language === 'ar' ? 'خصم' : 'discount'}</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleActive(list.id); }}
                                className={`px-3 py-1 rounded-full text-xs font-black ${list.isActive ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}
                            >
                                {list.isActive ? (language === 'ar' ? 'نشطة' : 'Active') : (language === 'ar' ? 'معطلة' : 'Inactive')}
                            </button>
                        </div>
                    </div>
                ))}
                {filteredLists.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <Tag size={48} className="mx-auto text-secondary/30 mb-4" />
                        <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد قوائم أسعار' : 'No price lists found'}</p>
                    </div>
                )}
            </div>

            {/* Selected List Items Preview */}
            {selectedList && (
                <div className="bg-surface rounded-[32px] border border-cardAccent p-6">
                    <h3 className="font-black text-textPrimary text-lg mb-4">
                        {language === 'ar' ? 'أصناف القائمة:' : 'List Items:'} {selectedList.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {menuItems.slice(0, 8).map(item => {
                            const basePrice = Number((item as any).basePrice ?? (item as any).price ?? 0);
                            const discountedPrice = basePrice * (1 - selectedList.discountPercent / 100);
                            return (
                                <div key={item.id} className="bg-background rounded-xl p-4 border border-cardAccent">
                                    <p className="font-bold text-textPrimary text-sm truncate">{language === 'ar' ? item.nameAr : item.nameEn}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-secondary line-through text-xs">{basePrice.toLocaleString()}</span>
                                        <span className="font-black text-accentGreen">{discountedPrice.toLocaleString()} {currency}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingList ? (language === 'ar' ? 'تعديل القائمة' : 'Edit List') : (language === 'ar' ? 'قائمة أسعار جديدة' : 'New Price List')}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم القائمة' : 'List Name'} *
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={language === 'ar' ? 'مثال: أسعار الجملة' : 'e.g., Wholesale Prices'}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الوصف' : 'Description'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'نسبة الخصم (%)' : 'Discount Rate (%)'}
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold text-xl focus:border-primary outline-none"
                                    value={formData.discountPercent}
                                    onChange={e => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                                    min={0}
                                    max={100}
                                />
                            </div>

                            <button
                                onClick={editingList ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingList ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إنشاء القائمة' : 'Create List')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PriceLists;
