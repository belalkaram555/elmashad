// @ts-nocheck
// الخزينة والبنوك - إدارة النقدية
// Cash Management

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Banknote, Search, Plus, XCircle, Wallet,
    TrendingUp, TrendingDown, ArrowUpDown, Calendar
} from 'lucide-react';

interface CashTransaction {
    id: string;
    date: string;
    type: 'in' | 'out';
    amount: number;
    description: string;
    category: string;
    reference?: string;
}

const CashManagement: React.FC = () => {
    const { settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [transactions, setTransactions] = useState<CashTransaction[]>(() => {
        const saved = localStorage.getItem('cash_transactions');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [formData, setFormData] = useState({
        type: 'in' as const,
        amount: 0,
        description: '',
        category: '',
        reference: ''
    });

    const saveTransactions = (data: CashTransaction[]) => {
        localStorage.setItem('cash_transactions', JSON.stringify(data));
        setTransactions(data);
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleAdd = () => {
        if (formData.amount <= 0 || !formData.description) {
            alert(language === 'ar' ? 'يرجى إدخال المبلغ والوصف' : 'Please enter amount and description');
            return;
        }

        const newTransaction: CashTransaction = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            type: formData.type,
            amount: formData.amount,
            description: formData.description,
            category: formData.category,
            reference: formData.reference
        };

        saveTransactions([...transactions, newTransaction]);
        closeModal();
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ type: 'in', amount: 0, description: '', category: '', reference: '' });
    };

    const stats = useMemo(() => {
        const totalIn = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
        const totalOut = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
        const todayTransactions = transactions.filter(t => t.date === new Date().toISOString().split('T')[0]);
        return {
            balance: totalIn - totalOut,
            totalIn,
            totalOut,
            todayIn: todayTransactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0),
            todayOut: todayTransactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0)
        };
    }, [transactions]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'إدارة النقدية' : 'Cash Management'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'متابعة حركة الصندوق' : 'Track cash flow'}
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
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                        <option value="in">{language === 'ar' ? 'وارد' : 'In'}</option>
                        <option value="out">{language === 'ar' ? 'صادر' : 'Out'}</option>
                    </select>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'حركة جديدة' : 'New Transaction'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Wallet className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'رصيد الصندوق' : 'Cash Balance'}</p>
                            <p className="text-2xl font-black text-primary">{stats.balance.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الوارد' : 'Total In'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.totalIn.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الصادر' : 'Total Out'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.totalOut.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Calendar className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'حركة اليوم' : 'Today'}</p>
                            <p className="text-lg font-black">
                                <span className="text-accentGreen">+{stats.todayIn.toLocaleString()}</span>
                                <span className="text-secondary mx-1">/</span>
                                <span className="text-red-500">-{stats.todayOut.toLocaleString()}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'النوع' : 'Type'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الوصف' : 'Description'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المرجع' : 'Reference'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <Banknote size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد حركات' : 'No transactions'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map(t => (
                                <tr key={t.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5"><span className="text-secondary font-bold">{new Date(t.date).toLocaleDateString('ar-EG')}</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${t.type === 'in' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>
                                            {t.type === 'in' ? (language === 'ar' ? 'وارد' : 'In') : (language === 'ar' ? 'صادر' : 'Out')}
                                        </span>
                                    </td>
                                    <td className="p-5"><span className="font-bold text-textPrimary">{t.description}</span></td>
                                    <td className="p-5"><span className="text-secondary">{t.reference || '-'}</span></td>
                                    <td className="p-5">
                                        <span className={`font-black text-lg ${t.type === 'in' ? 'text-accentGreen' : 'text-red-500'}`}>
                                            {t.type === 'in' ? '+' : '-'}{t.amount.toLocaleString()} {currency}
                                        </span>
                                    </td>
                                </tr>
                            ))
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
                                {language === 'ar' ? 'حركة نقدية جديدة' : 'New Cash Transaction'}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setFormData({ ...formData, type: 'in' })}
                                    className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all ${formData.type === 'in' ? 'bg-accentGreen text-white' : 'bg-background border border-cardAccent text-secondary'}`}
                                >
                                    {language === 'ar' ? 'وارد' : 'Cash In'}
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, type: 'out' })}
                                    className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all ${formData.type === 'out' ? 'bg-red-500 text-white' : 'bg-background border border-cardAccent text-secondary'}`}
                                >
                                    {language === 'ar' ? 'صادر' : 'Cash Out'}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'المبلغ' : 'Amount'} *
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold text-xl focus:border-primary outline-none"
                                    value={formData.amount || ''}
                                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الوصف' : 'Description'} *
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'المرجع' : 'Reference'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.reference}
                                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                                    placeholder={language === 'ar' ? 'رقم الفاتورة أو السند...' : 'Invoice or receipt number...'}
                                />
                            </div>

                            <button
                                onClick={handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {language === 'ar' ? 'إضافة الحركة' : 'Add Transaction'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashManagement;
