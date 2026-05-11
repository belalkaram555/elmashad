// البيانات الأساسية - المندوبين
// إدارة مندوبي المبيعات

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
    Users, Search, Plus, XCircle, Trash2, Edit3,
    Phone, MapPin, Grid, List, Percent
} from 'lucide-react';

interface Agent {
    id: string;
    name: string;
    phone: string;
    area?: string;
    commissionRate: number;
    isActive: boolean;
}

const Agents: React.FC = () => {
    const { language } = useLanguage();

    const [agents, setAgents] = useState<Agent[]>(() => {
        const saved = localStorage.getItem('sales_agents_list');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        area: '',
        commissionRate: 5
    });

    const saveAgents = (data: Agent[]) => {
        localStorage.setItem('sales_agents_list', JSON.stringify(data));
        setAgents(data);
    };

    const filteredAgents = agents.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone.includes(searchQuery)
    );

    const handleAdd = () => {
        if (!formData.name || !formData.phone) {
            alert(language === 'ar' ? 'يرجى إدخال اسم المندوب ورقم الهاتف' : 'Please enter agent name and phone');
            return;
        }

        const newAgent: Agent = {
            id: Date.now().toString(),
            name: formData.name,
            phone: formData.phone,
            area: formData.area,
            commissionRate: formData.commissionRate,
            isActive: true
        };

        saveAgents([...agents, newAgent]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingAgent) return;

        saveAgents(agents.map(a => a.id === editingAgent.id ? {
            ...a,
            name: formData.name,
            phone: formData.phone,
            area: formData.area,
            commissionRate: formData.commissionRate
        } : a));
        closeModal();
    };

    const openEditModal = (agent: Agent) => {
        setEditingAgent(agent);
        setFormData({
            name: agent.name,
            phone: agent.phone,
            area: agent.area || '',
            commissionRate: agent.commissionRate
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAgent(null);
        setFormData({ name: '', phone: '', area: '', commissionRate: 5 });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا المندوب؟' : 'Delete this agent?')) {
            saveAgents(agents.filter(a => a.id !== id));
        }
    };

    const toggleActive = (id: string) => {
        saveAgents(agents.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    };

    const stats = useMemo(() => ({
        total: agents.length,
        active: agents.filter(a => a.isActive).length,
        avgCommission: agents.length > 0 ? (agents.reduce((sum, a) => sum + a.commissionRate, 0) / agents.length).toFixed(1) : 0
    }), [agents]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'المندوبين' : 'Sales Agents'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة مندوبي المبيعات' : 'Manage sales agents'}
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
                        {language === 'ar' ? 'إضافة مندوب' : 'Add Agent'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Users className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المندوبين' : 'Total Agents'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Users className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مندوبين نشطين' : 'Active Agents'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Percent className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'متوسط العمولة' : 'Avg Commission'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.avgCommission}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agents Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAgents.map(agent => (
                        <div key={agent.id} className={`bg-surface p-6 rounded-[32px] border transition-all group ${agent.isActive ? 'border-cardAccent hover:border-primary/40' : 'border-red-500/20 opacity-60'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center font-black text-xl text-background">
                                        {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-textPrimary">{agent.name}</h3>
                                        <p className="text-xs text-secondary flex items-center gap-1">
                                            <Phone size={10} />
                                            {agent.phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(agent)} className="p-2 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-background transition-all">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(agent.id)} className="p-2 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3 text-sm">
                                <MapPin size={14} className="text-secondary" />
                                <span className="text-secondary">{agent.area || (language === 'ar' ? 'غير محدد' : 'Not specified')}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-black bg-accentBlue/10 text-accentBlue">
                                        {agent.commissionRate}% {language === 'ar' ? 'عمولة' : 'commission'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => toggleActive(agent.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-black ${agent.isActive ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}
                                >
                                    {agent.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredAgents.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <Users size={48} className="mx-auto text-secondary/30 mb-4" />
                            <p className="text-secondary font-bold">{language === 'ar' ? 'لا يوجد مندوبين' : 'No agents found'}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cardAccent bg-background/50">
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المندوب' : 'Agent'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الهاتف' : 'Phone'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المنطقة' : 'Area'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'العمولة' : 'Commission'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgents.map(agent => (
                                <tr key={agent.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                                {agent.name.charAt(0)}
                                            </div>
                                            <span className="font-black text-textPrimary">{agent.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="text-secondary font-bold">{agent.phone}</span></td>
                                    <td className="p-5"><span className="text-secondary">{agent.area}</span></td>
                                    <td className="p-5 text-center"><span className="font-black text-accentBlue">{agent.commissionRate}%</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${agent.isActive ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>
                                            {agent.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditModal(agent)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit3 size={14} /></button>
                                            <button onClick={() => handleDelete(agent.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
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
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingAgent ? (language === 'ar' ? 'تعديل المندوب' : 'Edit Agent') : (language === 'ar' ? 'مندوب جديد' : 'New Agent')}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الهاتف' : 'Phone'} *
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'المنطقة' : 'Area'}
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.area}
                                        onChange={e => setFormData({ ...formData, area: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'نسبة العمولة (%)' : 'Commission Rate (%)'}
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.commissionRate}
                                    onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                                    min={0}
                                    max={100}
                                />
                            </div>

                            <button
                                onClick={editingAgent ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingAgent ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة المندوب' : 'Add Agent')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agents;
