// البيانات الأساسية - البنوك
// إدارة الحسابات البنكية

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
    Building2, Search, Plus, XCircle, Trash2, Edit3,
    CreditCard, DollarSign, Grid, List
} from 'lucide-react';

interface Bank {
    id: string;
    name: string;
    accountNumber: string;
    iban?: string;
    balance: number;
    branch?: string;
    isActive: boolean;
}

const Banks: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [banks, setBanks] = useState<Bank[]>(() => {
        const saved = localStorage.getItem('banks_list');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editingBank, setEditingBank] = useState<Bank | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        accountNumber: '',
        iban: '',
        balance: 0,
        branch: ''
    });

    const saveBanks = (data: Bank[]) => {
        localStorage.setItem('banks_list', JSON.stringify(data));
        setBanks(data);
    };

    const filteredBanks = banks.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.accountNumber.includes(searchQuery)
    );

    const handleAdd = () => {
        if (!formData.name || !formData.accountNumber) {
            alert(language === 'ar' ? 'يرجى إدخال اسم البنك ورقم الحساب' : 'Please enter bank name and account number');
            return;
        }

        const newBank: Bank = {
            id: Date.now().toString(),
            name: formData.name,
            accountNumber: formData.accountNumber,
            iban: formData.iban,
            balance: formData.balance,
            branch: formData.branch,
            isActive: true
        };

        saveBanks([...banks, newBank]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingBank) return;

        saveBanks(banks.map(b => b.id === editingBank.id ? {
            ...b,
            name: formData.name,
            accountNumber: formData.accountNumber,
            iban: formData.iban,
            balance: formData.balance,
            branch: formData.branch
        } : b));
        closeModal();
    };

    const openEditModal = (bank: Bank) => {
        setEditingBank(bank);
        setFormData({
            name: bank.name,
            accountNumber: bank.accountNumber,
            iban: bank.iban || '',
            balance: bank.balance,
            branch: bank.branch || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBank(null);
        setFormData({ name: '', accountNumber: '', iban: '', balance: 0, branch: '' });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا البنك؟' : 'Delete this bank?')) {
            saveBanks(banks.filter(b => b.id !== id));
        }
    };

    const stats = useMemo(() => ({
        total: banks.length,
        totalBalance: banks.reduce((sum, b) => sum + b.balance, 0),
        active: banks.filter(b => b.isActive).length
    }), [banks]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'البنوك' : 'Banks'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة الحسابات البنكية' : 'Manage bank accounts'}
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
                        {language === 'ar' ? 'إضافة بنك' : 'Add Bank'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Building2 className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد البنوك' : 'Total Banks'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الأرصدة' : 'Total Balance'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.totalBalance.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <CreditCard className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'بنوك نشطة' : 'Active Banks'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.active}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banks Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBanks.map(bank => (
                        <div key={bank.id} className="bg-surface p-6 rounded-[32px] border border-cardAccent hover:border-primary/40 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Building2 className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-textPrimary">{bank.name}</h3>
                                        <p className="text-xs text-secondary">{bank.branch}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(bank)} className="p-2 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-background transition-all">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(bank.id)} className="p-2 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-background rounded-xl p-4 border border-cardAccent mb-3">
                                <p className="text-[10px] text-secondary font-black uppercase mb-1">{language === 'ar' ? 'رقم الحساب' : 'Account #'}</p>
                                <p className="font-mono text-textPrimary font-bold">{bank.accountNumber}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-secondary text-sm">{language === 'ar' ? 'الرصيد' : 'Balance'}</span>
                                <span className="font-black text-xl text-accentGreen">{bank.balance.toLocaleString()} {currency}</span>
                            </div>
                        </div>
                    ))}
                    {filteredBanks.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <Building2 size={48} className="mx-auto text-secondary/30 mb-4" />
                            <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد بنوك' : 'No banks found'}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cardAccent bg-background/50">
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'البنك' : 'Bank'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'رقم الحساب' : 'Account #'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الفرع' : 'Branch'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الرصيد' : 'Balance'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBanks.map(bank => (
                                <tr key={bank.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5"><span className="font-black text-textPrimary">{bank.name}</span></td>
                                    <td className="p-5"><span className="font-mono text-secondary">{bank.accountNumber}</span></td>
                                    <td className="p-5"><span className="text-secondary">{bank.branch}</span></td>
                                    <td className="p-5"><span className="font-black text-accentGreen">{bank.balance.toLocaleString()} {currency}</span></td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditModal(bank)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit3 size={14} /></button>
                                            <button onClick={() => handleDelete(bank.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
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
                                {editingBank ? (language === 'ar' ? 'تعديل البنك' : 'Edit Bank') : (language === 'ar' ? 'بنك جديد' : 'New Bank')}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم البنك' : 'Bank Name'} *
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
                                        {language === 'ar' ? 'رقم الحساب' : 'Account #'} *
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-mono focus:border-primary outline-none"
                                        value={formData.accountNumber}
                                        onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الفرع' : 'Branch'}
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.branch}
                                        onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        IBAN
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-mono focus:border-primary outline-none"
                                        value={formData.iban}
                                        onChange={e => setFormData({ ...formData, iban: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الرصيد الافتتاحي' : 'Opening Balance'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.balance || ''}
                                        onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={editingBank ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingBank ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة البنك' : 'Add Bank')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banks;
