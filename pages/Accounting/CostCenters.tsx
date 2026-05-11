// المحاسبة - مراكز التكلفة
// إدارة وتتبع مراكز التكلفة

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
    Target, Search, Plus, XCircle, Trash2, Edit3,
    Building, DollarSign, TrendingUp
} from 'lucide-react';

interface CostCenter {
    id: string;
    code: string;
    name: string;
    description?: string;
    budget: number;
    spent: number;
    isActive: boolean;
}

const CostCenters: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [costCenters, setCostCenters] = useState<CostCenter[]>(() => {
        const saved = localStorage.getItem('cost_centers');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingCenter, setEditingCenter] = useState<CostCenter | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        budget: 0
    });

    const saveCostCenters = (data: CostCenter[]) => {
        localStorage.setItem('cost_centers', JSON.stringify(data));
        setCostCenters(data);
    };

    const filteredCenters = costCenters.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.includes(searchQuery)
    );

    const handleAdd = () => {
        if (!formData.code || !formData.name) {
            alert(language === 'ar' ? 'يرجى إدخال الكود والاسم' : 'Please enter code and name');
            return;
        }

        const newCenter: CostCenter = {
            id: Date.now().toString(),
            code: formData.code,
            name: formData.name,
            description: formData.description,
            budget: formData.budget,
            spent: 0,
            isActive: true
        };

        saveCostCenters([...costCenters, newCenter]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingCenter) return;

        saveCostCenters(costCenters.map(c => c.id === editingCenter.id ? {
            ...c,
            code: formData.code,
            name: formData.name,
            description: formData.description,
            budget: formData.budget
        } : c));
        closeModal();
    };

    const openEditModal = (center: CostCenter) => {
        setEditingCenter(center);
        setFormData({
            code: center.code,
            name: center.name,
            description: center.description || '',
            budget: center.budget
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCenter(null);
        setFormData({ code: '', name: '', description: '', budget: 0 });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف مركز التكلفة؟' : 'Delete this cost center?')) {
            saveCostCenters(costCenters.filter(c => c.id !== id));
        }
    };

    const stats = useMemo(() => ({
        total: costCenters.length,
        active: costCenters.filter(c => c.isActive).length,
        totalBudget: costCenters.reduce((sum, c) => sum + c.budget, 0),
        totalSpent: costCenters.reduce((sum, c) => sum + c.spent, 0)
    }), [costCenters]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'مراكز التكلفة' : 'Cost Centers'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة وتتبع مراكز التكلفة' : 'Manage and track cost centers'}
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
                        {language === 'ar' ? 'مركز جديد' : 'New Center'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Target className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد المراكز' : 'Total Centers'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Building className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مراكز نشطة' : 'Active'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الميزانية' : 'Total Budget'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.totalBudget.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المصروف' : 'Total Spent'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.totalSpent.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost Centers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCenters.map(center => {
                    const usagePercent = center.budget > 0 ? (center.spent / center.budget) * 100 : 0;
                    return (
                        <div key={center.id} className="bg-surface p-6 rounded-[32px] border border-cardAccent hover:border-primary/40 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                        {center.code}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-textPrimary">{center.name}</h3>
                                        <p className="text-xs text-secondary">{center.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(center)} className="p-2 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-background transition-all">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(center.id)} className="p-2 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-background rounded-xl p-4 border border-cardAccent mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-secondary text-sm">{language === 'ar' ? 'الميزانية' : 'Budget'}</span>
                                    <span className="font-black text-accentBlue">{center.budget.toLocaleString()} {currency}</span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-secondary text-sm">{language === 'ar' ? 'المصروف' : 'Spent'}</span>
                                    <span className="font-black text-red-500">{center.spent.toLocaleString()} {currency}</span>
                                </div>
                                <div className="w-full bg-cardAccent rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-accentGreen'}`}
                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-secondary mt-2 text-center">{usagePercent.toFixed(1)}% {language === 'ar' ? 'مستخدم' : 'used'}</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-secondary text-sm">{language === 'ar' ? 'المتبقي' : 'Remaining'}</span>
                                <span className="font-black text-accentGreen">{(center.budget - center.spent).toLocaleString()} {currency}</span>
                            </div>
                        </div>
                    );
                })}
                {filteredCenters.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <Target size={48} className="mx-auto text-secondary/30 mb-4" />
                        <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد مراكز تكلفة' : 'No cost centers found'}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingCenter ? (language === 'ar' ? 'تعديل المركز' : 'Edit Center') : (language === 'ar' ? 'مركز تكلفة جديد' : 'New Cost Center')}
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
                                        placeholder="CC001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الاسم' : 'Name'} *
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
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
                                    {language === 'ar' ? 'الميزانية' : 'Budget'}
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold text-xl focus:border-primary outline-none"
                                    value={formData.budget || ''}
                                    onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                                />
                            </div>

                            <button
                                onClick={editingCenter ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingCenter ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة المركز' : 'Add Center')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CostCenters;
