// المحاسبة - الأصول الثابتة
// إدارة وتتبع الأصول الثابتة والإهلاك

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
    Building2, Search, Plus, XCircle, Trash2, Edit3,
    DollarSign, TrendingDown, Calendar, Package
} from 'lucide-react';

interface FixedAsset {
    id: string;
    code: string;
    name: string;
    category: string;
    purchaseDate: string;
    purchaseValue: number;
    currentValue: number;
    depreciationRate: number;
    location?: string;
    status: 'active' | 'disposed' | 'fully_depreciated';
}

const CATEGORIES = ['مباني', 'سيارات', 'أثاث', 'أجهزة كمبيوتر', 'معدات', 'أخرى'];
const CATEGORIES_EN = ['Buildings', 'Vehicles', 'Furniture', 'Computers', 'Equipment', 'Other'];

const FixedAssets: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [assets, setAssets] = useState<FixedAsset[]>(() => {
        const saved = localStorage.getItem('fixed_assets');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        category: CATEGORIES[0],
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseValue: 0,
        depreciationRate: 10,
        location: ''
    });

    const saveAssets = (data: FixedAsset[]) => {
        localStorage.setItem('fixed_assets', JSON.stringify(data));
        setAssets(data);
    };

    const filteredAssets = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.code.includes(searchQuery);
        const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAdd = () => {
        if (!formData.code || !formData.name || formData.purchaseValue <= 0) {
            alert(language === 'ar' ? 'يرجى إدخال البيانات المطلوبة' : 'Please fill required fields');
            return;
        }

        const newAsset: FixedAsset = {
            id: Date.now().toString(),
            code: formData.code,
            name: formData.name,
            category: formData.category,
            purchaseDate: formData.purchaseDate,
            purchaseValue: formData.purchaseValue,
            currentValue: formData.purchaseValue,
            depreciationRate: formData.depreciationRate,
            location: formData.location,
            status: 'active'
        };

        saveAssets([...assets, newAsset]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingAsset) return;

        saveAssets(assets.map(a => a.id === editingAsset.id ? {
            ...a,
            code: formData.code,
            name: formData.name,
            category: formData.category,
            purchaseDate: formData.purchaseDate,
            purchaseValue: formData.purchaseValue,
            depreciationRate: formData.depreciationRate,
            location: formData.location
        } : a));
        closeModal();
    };

    const openEditModal = (asset: FixedAsset) => {
        setEditingAsset(asset);
        setFormData({
            code: asset.code,
            name: asset.name,
            category: asset.category,
            purchaseDate: asset.purchaseDate,
            purchaseValue: asset.purchaseValue,
            depreciationRate: asset.depreciationRate,
            location: asset.location || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAsset(null);
        setFormData({ code: '', name: '', category: CATEGORIES[0], purchaseDate: new Date().toISOString().split('T')[0], purchaseValue: 0, depreciationRate: 10, location: '' });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا الأصل؟' : 'Delete this asset?')) {
            saveAssets(assets.filter(a => a.id !== id));
        }
    };

    // حساب الإهلاك
    const calculateDepreciation = (asset: FixedAsset) => {
        const years = (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        const totalDepreciation = asset.purchaseValue * (asset.depreciationRate / 100) * years;
        return Math.min(totalDepreciation, asset.purchaseValue);
    };

    const stats = useMemo(() => {
        const totalPurchaseValue = assets.reduce((sum, a) => sum + a.purchaseValue, 0);
        const totalDepreciation = assets.reduce((sum, a) => sum + calculateDepreciation(a), 0);
        return {
            total: assets.length,
            active: assets.filter(a => a.status === 'active').length,
            totalPurchaseValue,
            totalCurrentValue: totalPurchaseValue - totalDepreciation,
            totalDepreciation
        };
    }, [assets]);

    const categories = language === 'ar' ? CATEGORIES : CATEGORIES_EN;

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'الأصول الثابتة' : 'Fixed Assets'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة وتتبع الأصول والإهلاك' : 'Manage assets and depreciation'}
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
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                        {categories.map((cat, i) => (
                            <option key={i} value={CATEGORIES[i]}>{cat}</option>
                        ))}
                    </select>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'أصل جديد' : 'New Asset'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Package className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد الأصول' : 'Total Assets'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'قيمة الشراء' : 'Purchase Value'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.totalPurchaseValue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مجمع الإهلاك' : 'Acc. Depreciation'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.totalDepreciation.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Building2 className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'القيمة الحالية' : 'Current Value'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.totalCurrentValue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assets Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الأصل' : 'Asset'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الفئة' : 'Category'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'تاريخ الشراء' : 'Purchase Date'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'قيمة الشراء' : 'Purchase Value'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الإهلاك' : 'Depreciation'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'القيمة الحالية' : 'Current Value'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center">
                                    <Building2 size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد أصول' : 'No assets found'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredAssets.map(asset => {
                                const depreciation = calculateDepreciation(asset);
                                const currentValue = asset.purchaseValue - depreciation;
                                return (
                                    <tr key={asset.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                                                    {asset.code}
                                                </div>
                                                <div>
                                                    <span className="font-black text-textPrimary block">{asset.name}</span>
                                                    <span className="text-xs text-secondary">{asset.location}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="px-3 py-1 rounded-full text-xs font-black bg-accentBlue/10 text-accentBlue">
                                                {asset.category}
                                            </span>
                                        </td>
                                        <td className="p-5"><span className="text-secondary font-bold">{new Date(asset.purchaseDate).toLocaleDateString('ar-EG')}</span></td>
                                        <td className="p-5"><span className="font-bold text-textPrimary">{asset.purchaseValue.toLocaleString()}</span></td>
                                        <td className="p-5"><span className="font-bold text-red-500">-{depreciation.toLocaleString()}</span></td>
                                        <td className="p-5"><span className="font-black text-accentGreen">{currentValue.toLocaleString()} {currency}</span></td>
                                        <td className="p-5">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => openEditModal(asset)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit3 size={14} /></button>
                                                <button onClick={() => handleDelete(asset.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                            </div>
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
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingAsset ? (language === 'ar' ? 'تعديل الأصل' : 'Edit Asset') : (language === 'ar' ? 'أصل ثابت جديد' : 'New Fixed Asset')}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الكود' : 'Code'} *
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="FA001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الفئة' : 'Category'}
                                    </label>
                                    <select
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map((cat, i) => (
                                            <option key={i} value={cat}>{language === 'ar' ? cat : CATEGORIES_EN[i]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم الأصل' : 'Asset Name'} *
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'تاريخ الشراء' : 'Purchase Date'}
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.purchaseDate}
                                        onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الموقع' : 'Location'}
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'قيمة الشراء' : 'Purchase Value'} *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.purchaseValue || ''}
                                        onChange={e => setFormData({ ...formData, purchaseValue: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'نسبة الإهلاك (%)' : 'Depreciation Rate (%)'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.depreciationRate}
                                        onChange={e => setFormData({ ...formData, depreciationRate: Number(e.target.value) })}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={editingAsset ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingAsset ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة الأصل' : 'Add Asset')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FixedAssets;
