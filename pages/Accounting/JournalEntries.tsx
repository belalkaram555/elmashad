// الحسابات - قيود اليومية
// تسجيل القيود المحاسبية

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import {
    FileText, Search, Plus, XCircle, Trash2, Edit3,
    Calendar, DollarSign, CheckCircle, Eye
} from 'lucide-react';

interface JournalEntry {
    id: string;
    entryNumber: string;
    date: string;
    description: string;
    lines: {
        accountCode: string;
        accountName: string;
        debit: number;
        credit: number;
    }[];
    status: 'draft' | 'posted';
    createdAt: string;
}

const JournalEntries: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [entries, setEntries] = useState<JournalEntry[]>(() => {
        const saved = localStorage.getItem('journal_entries');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        lines: [
            { accountCode: '', accountName: '', debit: 0, credit: 0 },
            { accountCode: '', accountName: '', debit: 0, credit: 0 }
        ]
    });

    // الحسابات من localStorage
    const accounts = useMemo(() => {
        const saved = localStorage.getItem('chart_of_accounts');
        return saved ? JSON.parse(saved) : [];
    }, []);

    const saveEntries = (data: JournalEntry[]) => {
        localStorage.setItem('journal_entries', JSON.stringify(data));
        setEntries(data);
    };

    const filteredEntries = entries.filter(e => {
        const matchesSearch = e.entryNumber.includes(searchQuery) || e.description.includes(searchQuery);
        const matchesFilter = filterStatus === 'all' || e.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleAdd = () => {
        const validLines = formData.lines.filter(l => l.accountName && (l.debit > 0 || l.credit > 0));
        if (validLines.length < 2) {
            alert(language === 'ar' ? 'يجب إضافة سطرين على الأقل' : 'At least 2 lines required');
            return;
        }

        const totalDebit = validLines.reduce((sum, l) => sum + l.debit, 0);
        const totalCredit = validLines.reduce((sum, l) => sum + l.credit, 0);

        if (totalDebit !== totalCredit) {
            alert(language === 'ar' ? 'القيد غير متوازن! المدين يجب أن يساوي الدائن' : 'Entry not balanced! Debit must equal Credit');
            return;
        }

        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            entryNumber: `JE-${Date.now().toString().slice(-6)}`,
            date: formData.date,
            description: formData.description,
            lines: validLines,
            status: 'draft',
            createdAt: new Date().toISOString()
        };

        saveEntries([...entries, newEntry]);
        closeModal();
    };

    const postEntry = (id: string) => {
        saveEntries(entries.map(e => e.id === id ? { ...e, status: 'posted' as const } : e));
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            description: '',
            lines: [
                { accountCode: '', accountName: '', debit: 0, credit: 0 },
                { accountCode: '', accountName: '', debit: 0, credit: 0 }
            ]
        });
    };

    const handleDelete = (id: string) => {
        const entry = entries.find(e => e.id === id);
        if (entry?.status === 'posted') {
            alert(language === 'ar' ? 'لا يمكن حذف قيد مرحّل' : 'Cannot delete posted entry');
            return;
        }
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا القيد؟' : 'Delete this entry?')) {
            saveEntries(entries.filter(e => e.id !== id));
        }
    };

    const addLine = () => {
        setFormData({
            ...formData,
            lines: [...formData.lines, { accountCode: '', accountName: '', debit: 0, credit: 0 }]
        });
    };

    const updateLine = (index: number, field: string, value: any) => {
        const newLines = [...formData.lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setFormData({ ...formData, lines: newLines });
    };

    const removeLine = (index: number) => {
        if (formData.lines.length <= 2) return;
        setFormData({
            ...formData,
            lines: formData.lines.filter((_, i) => i !== index)
        });
    };

    const totals = useMemo(() => {
        const debit = formData.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
        const credit = formData.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
        return { debit, credit, balanced: debit === credit && debit > 0 };
    }, [formData.lines]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'قيود اليومية' : 'Journal Entries'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'تسجيل ومراجعة القيود المحاسبية' : 'Record and review accounting entries'}
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
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                        <option value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</option>
                        <option value="posted">{language === 'ar' ? 'مرحّل' : 'Posted'}</option>
                    </select>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'قيد جديد' : 'New Entry'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <FileText className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي القيود' : 'Total Entries'}</p>
                            <p className="text-2xl font-black text-textPrimary">{entries.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                            <FileText className="text-secondary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مسودات' : 'Drafts'}</p>
                            <p className="text-2xl font-black text-secondary">{entries.filter(e => e.status === 'draft').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مرحّلة' : 'Posted'}</p>
                            <p className="text-2xl font-black text-accentGreen">{entries.filter(e => e.status === 'posted').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Entries Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'رقم القيد' : 'Entry #'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'البيان' : 'Description'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المدين' : 'Debit'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الدائن' : 'Credit'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEntries.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center">
                                    <FileText size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد قيود' : 'No entries found'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredEntries.map(entry => {
                                const totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
                                const totalCredit = entry.lines.reduce((sum, l) => sum + l.credit, 0);
                                return (
                                    <tr key={entry.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                        <td className="p-5"><span className="font-black text-primary">{entry.entryNumber}</span></td>
                                        <td className="p-5"><span className="text-secondary font-bold">{new Date(entry.date).toLocaleDateString('ar-EG')}</span></td>
                                        <td className="p-5"><span className="font-bold text-textPrimary">{entry.description}</span></td>
                                        <td className="p-5"><span className="font-black text-red-500">{totalDebit.toLocaleString()} {currency}</span></td>
                                        <td className="p-5"><span className="font-black text-accentGreen">{totalCredit.toLocaleString()} {currency}</span></td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${entry.status === 'posted' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-secondary/10 text-secondary'}`}>
                                                {entry.status === 'posted' ? (language === 'ar' ? 'مرحّل' : 'Posted') : (language === 'ar' ? 'مسودة' : 'Draft')}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center gap-2">
                                                {entry.status === 'draft' && (
                                                    <button onClick={() => postEntry(entry.id)} className="p-2 bg-accentGreen/10 text-accentGreen rounded-lg hover:bg-accentGreen hover:text-white transition-all" title={language === 'ar' ? 'ترحيل' : 'Post'}>
                                                        <CheckCircle size={14} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(entry.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                                    <Trash2 size={14} />
                                                </button>
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
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-3xl shadow-2xl p-10 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {language === 'ar' ? 'قيد يومية جديد' : 'New Journal Entry'}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Header Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'التاريخ' : 'Date'}
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'البيان' : 'Description'}
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder={language === 'ar' ? 'وصف القيد...' : 'Entry description...'}
                                    />
                                </div>
                            </div>

                            {/* Lines */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest">
                                        {language === 'ar' ? 'بنود القيد' : 'Entry Lines'}
                                    </label>
                                    <button onClick={addLine} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                                        <Plus size={16} /> {language === 'ar' ? 'إضافة سطر' : 'Add Line'}
                                    </button>
                                </div>

                                <div className="bg-background rounded-2xl border border-cardAccent overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-cardAccent">
                                                <th className="text-right p-3 text-[10px] font-black text-secondary">{language === 'ar' ? 'الحساب' : 'Account'}</th>
                                                <th className="text-center p-3 text-[10px] font-black text-secondary">{language === 'ar' ? 'مدين' : 'Debit'}</th>
                                                <th className="text-center p-3 text-[10px] font-black text-secondary">{language === 'ar' ? 'دائن' : 'Credit'}</th>
                                                <th className="w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.lines.map((line, index) => (
                                                <tr key={index} className="border-b border-cardAccent/50">
                                                    <td className="p-2">
                                                        <select
                                                            className="w-full p-2 bg-surface border border-cardAccent rounded-xl text-textPrimary font-bold text-sm"
                                                            value={line.accountName}
                                                            onChange={e => updateLine(index, 'accountName', e.target.value)}
                                                        >
                                                            <option value="">{language === 'ar' ? 'اختر الحساب...' : 'Select...'}</option>
                                                            {accounts.filter((a: any) => a.level > 0).map((a: any) => (
                                                                <option key={a.id} value={language === 'ar' ? a.nameAr : a.nameEn}>
                                                                    {a.code} - {language === 'ar' ? a.nameAr : a.nameEn}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            className="w-full p-2 bg-surface border border-cardAccent rounded-xl text-red-500 font-bold text-sm text-center"
                                                            value={line.debit || ''}
                                                            onChange={e => updateLine(index, 'debit', Number(e.target.value))}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            className="w-full p-2 bg-surface border border-cardAccent rounded-xl text-accentGreen font-bold text-sm text-center"
                                                            value={line.credit || ''}
                                                            onChange={e => updateLine(index, 'credit', Number(e.target.value))}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        {formData.lines.length > 2 && (
                                                            <button onClick={() => removeLine(index)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-background/50">
                                                <td className="p-3 text-left font-black text-textPrimary">{language === 'ar' ? 'الإجمالي' : 'Total'}</td>
                                                <td className="p-3 text-center font-black text-red-500">{totals.debit.toLocaleString()}</td>
                                                <td className="p-3 text-center font-black text-accentGreen">{totals.credit.toLocaleString()}</td>
                                                <td className="p-3 text-center">
                                                    {totals.balanced ? (
                                                        <CheckCircle size={18} className="text-accentGreen mx-auto" />
                                                    ) : (
                                                        <span className="text-red-500 text-xs font-bold">{language === 'ar' ? 'غير متوازن' : 'Unbalanced'}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <button
                                onClick={handleAdd}
                                disabled={!totals.balanced}
                                className={`w-full py-5 rounded-2xl font-black text-lg mt-4 hover:scale-[1.02] transition-transform ${totals.balanced
                                        ? 'bg-primary text-background glow-primary'
                                        : 'bg-cardAccent text-secondary cursor-not-allowed'
                                    }`}
                            >
                                {language === 'ar' ? 'حفظ القيد' : 'Save Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalEntries;
