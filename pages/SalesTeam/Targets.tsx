// فريق المبيعات - أهداف المندوبين
// تعريف وإدارة الأهداف الشهرية للمندوبين

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
    Target, Search, Plus, XCircle, Trash2, Edit3,
    Calendar, TrendingUp, User
} from 'lucide-react';

interface SalesTarget {
    id: string;
    agentId: string;
    agentName: string;
    month: string;
    targetAmount: number;
    achievedAmount: number;
    notes?: string;
}

const SalesTargets: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [targets, setTargets] = useState<SalesTarget[]>(() => {
        const saved = localStorage.getItem('sales_targets');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [editingTarget, setEditingTarget] = useState<SalesTarget | null>(null);
    const [formData, setFormData] = useState({
        agentName: '',
        month: new Date().toISOString().slice(0, 7),
        targetAmount: 0,
        notes: ''
    });

    const saveTargets = (data: SalesTarget[]) => {
        localStorage.setItem('sales_targets', JSON.stringify(data));
        setTargets(data);
    };

    const filteredTargets = targets.filter(t => {
        const matchesSearch = t.agentName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMonth = !selectedMonth || t.month === selectedMonth;
        return matchesSearch && matchesMonth;
    });

    const handleAdd = () => {
        if (!formData.agentName || formData.targetAmount <= 0) {
            alert(language === 'ar' ? 'يرجى إدخال اسم المندوب والهدف' : 'Please enter agent name and target');
            return;
        }

        const newTarget: SalesTarget = {
            id: Date.now().toString(),
            agentId: '',
            agentName: formData.agentName,
            month: formData.month,
            targetAmount: formData.targetAmount,
            achievedAmount: 0,
            notes: formData.notes
        };

        saveTargets([...targets, newTarget]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingTarget) return;

        saveTargets(targets.map(t => t.id === editingTarget.id ? {
            ...t,
            agentName: formData.agentName,
            month: formData.month,
            targetAmount: formData.targetAmount,
            notes: formData.notes
        } : t));
        closeModal();
    };

    const openEditModal = (target: SalesTarget) => {
        setEditingTarget(target);
        setFormData({
            agentName: target.agentName,
            month: target.month,
            targetAmount: target.targetAmount,
            notes: target.notes || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTarget(null);
        setFormData({ agentName: '', month: new Date().toISOString().slice(0, 7), targetAmount: 0, notes: '' });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا الهدف؟' : 'Delete this target?')) {
            saveTargets(targets.filter(t => t.id !== id));
        }
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'أهداف المندوبين' : 'Agent Targets'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'تعريف وإدارة الأهداف الشهرية' : 'Define and manage monthly targets'}
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
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'هدف جديد' : 'New Target'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Target className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد الأهداف' : 'Total Targets'}</p>
                            <p className="text-2xl font-black text-textPrimary">{filteredTargets.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الأهداف' : 'Total Amount'}</p>
                            <p className="text-2xl font-black text-accentBlue">
                                {filteredTargets.reduce((sum, t) => sum + t.targetAmount, 0).toLocaleString()} {currency}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <User className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'المندوبين' : 'Agents'}</p>
                            <p className="text-2xl font-black text-accentGreen">
                                {new Set(filteredTargets.map(t => t.agentName)).size}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Targets Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المندوب' : 'Agent'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الشهر' : 'Month'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الهدف' : 'Target'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المحقق' : 'Achieved'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'النسبة' : 'Rate'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTargets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <Target size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد أهداف' : 'No targets found'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredTargets.map(target => {
                                const rate = target.targetAmount > 0 ? (target.achievedAmount / target.targetAmount) * 100 : 0;
                                return (
                                    <tr key={target.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                                    {target.agentName.charAt(0)}
                                                </div>
                                                <span className="font-black text-textPrimary">{target.agentName}</span>
                                            </div>
                                        </td>
                                        <td className="p-5"><span className="text-secondary font-bold">{target.month}</span></td>
                                        <td className="p-5"><span className="font-black text-textPrimary">{target.targetAmount.toLocaleString()} {currency}</span></td>
                                        <td className="p-5"><span className="font-black text-accentGreen">{target.achievedAmount.toLocaleString()} {currency}</span></td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${rate >= 100 ? 'bg-accentGreen/10 text-accentGreen' : rate >= 70 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                                                {rate.toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => openEditModal(target)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit3 size={14} /></button>
                                                <button onClick={() => handleDelete(target.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
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
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingTarget ? (language === 'ar' ? 'تعديل الهدف' : 'Edit Target') : (language === 'ar' ? 'هدف جديد' : 'New Target')}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم المندوب' : 'Agent Name'} *
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.agentName}
                                    onChange={e => setFormData({ ...formData, agentName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الشهر' : 'Month'}
                                    </label>
                                    <input
                                        type="month"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.month}
                                        onChange={e => setFormData({ ...formData, month: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'قيمة الهدف' : 'Target Amount'} *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.targetAmount || ''}
                                        onChange={e => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={editingTarget ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingTarget ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة الهدف' : 'Add Target')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesTargets;
