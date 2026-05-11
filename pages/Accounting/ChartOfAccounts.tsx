// الحسابات العامة - شجرة الحسابات
// إدارة الحسابات المحاسبية وتصنيفها

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
    ClipboardList, Search, Plus, XCircle, Trash2, Edit3,
    ChevronDown, ChevronRight, Folder, FileText, LayoutGrid, List
} from 'lucide-react';

// Types للحسابات
interface Account {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    parentId: string | null;
    level: number;
    isActive: boolean;
    balance: number;
}

// الحسابات الافتراضية
const DEFAULT_ACCOUNTS: Account[] = [
    // الأصول
    { id: '1', code: '1', nameAr: 'الأصول', nameEn: 'Assets', type: 'asset', parentId: null, level: 0, isActive: true, balance: 0 },
    { id: '11', code: '11', nameAr: 'الأصول المتداولة', nameEn: 'Current Assets', type: 'asset', parentId: '1', level: 1, isActive: true, balance: 0 },
    { id: '111', code: '111', nameAr: 'النقدية', nameEn: 'Cash', type: 'asset', parentId: '11', level: 2, isActive: true, balance: 0 },
    { id: '112', code: '112', nameAr: 'البنوك', nameEn: 'Banks', type: 'asset', parentId: '11', level: 2, isActive: true, balance: 0 },
    { id: '113', code: '113', nameAr: 'العملاء', nameEn: 'Accounts Receivable', type: 'asset', parentId: '11', level: 2, isActive: true, balance: 0 },
    { id: '114', code: '114', nameAr: 'المخزون', nameEn: 'Inventory', type: 'asset', parentId: '11', level: 2, isActive: true, balance: 0 },
    { id: '12', code: '12', nameAr: 'الأصول الثابتة', nameEn: 'Fixed Assets', type: 'asset', parentId: '1', level: 1, isActive: true, balance: 0 },
    // الخصوم
    { id: '2', code: '2', nameAr: 'الخصوم', nameEn: 'Liabilities', type: 'liability', parentId: null, level: 0, isActive: true, balance: 0 },
    { id: '21', code: '21', nameAr: 'الخصوم المتداولة', nameEn: 'Current Liabilities', type: 'liability', parentId: '2', level: 1, isActive: true, balance: 0 },
    { id: '211', code: '211', nameAr: 'الموردين', nameEn: 'Accounts Payable', type: 'liability', parentId: '21', level: 2, isActive: true, balance: 0 },
    // حقوق الملكية
    { id: '3', code: '3', nameAr: 'حقوق الملكية', nameEn: 'Equity', type: 'equity', parentId: null, level: 0, isActive: true, balance: 0 },
    { id: '31', code: '31', nameAr: 'رأس المال', nameEn: 'Capital', type: 'equity', parentId: '3', level: 1, isActive: true, balance: 0 },
    { id: '32', code: '32', nameAr: 'الأرباح المحتجزة', nameEn: 'Retained Earnings', type: 'equity', parentId: '3', level: 1, isActive: true, balance: 0 },
    // الإيرادات
    { id: '4', code: '4', nameAr: 'الإيرادات', nameEn: 'Revenue', type: 'revenue', parentId: null, level: 0, isActive: true, balance: 0 },
    { id: '41', code: '41', nameAr: 'إيرادات المبيعات', nameEn: 'Sales Revenue', type: 'revenue', parentId: '4', level: 1, isActive: true, balance: 0 },
    // المصروفات
    { id: '5', code: '5', nameAr: 'المصروفات', nameEn: 'Expenses', type: 'expense', parentId: null, level: 0, isActive: true, balance: 0 },
    { id: '51', code: '51', nameAr: 'تكلفة المبيعات', nameEn: 'Cost of Sales', type: 'expense', parentId: '5', level: 1, isActive: true, balance: 0 },
    { id: '52', code: '52', nameAr: 'مصروفات إدارية', nameEn: 'Admin Expenses', type: 'expense', parentId: '5', level: 1, isActive: true, balance: 0 },
    { id: '53', code: '53', nameAr: 'مصروفات تشغيلية', nameEn: 'Operating Expenses', type: 'expense', parentId: '5', level: 1, isActive: true, balance: 0 },
];

const ChartOfAccounts: React.FC = () => {
    const { language } = useLanguage();

    const [accounts, setAccounts] = useState<Account[]>(() => {
        const saved = localStorage.getItem('chart_of_accounts');
        return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    });

    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState<string[]>(['1', '2', '3', '4', '5']);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        nameAr: '',
        nameEn: '',
        type: 'asset' as Account['type'],
        parentId: '' as string | null
    });

    const saveAccounts = (newAccounts: Account[]) => {
        localStorage.setItem('chart_of_accounts', JSON.stringify(newAccounts));
        setAccounts(newAccounts);
    };

    const filteredAccounts = accounts.filter(a =>
        a.nameAr.includes(searchQuery) ||
        a.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.includes(searchQuery)
    );

    // بناء الشجرة
    const buildTree = (parentId: string | null = null): Account[] => {
        return accounts
            .filter(a => a.parentId === parentId)
            .sort((a, b) => a.code.localeCompare(b.code));
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleAdd = () => {
        if (!formData.code || !formData.nameAr) {
            alert(language === 'ar' ? 'يرجى إدخال الكود والاسم' : 'Please enter code and name');
            return;
        }

        // التحقق من عدم تكرار الكود
        if (accounts.some(a => a.code === formData.code)) {
            alert(language === 'ar' ? 'هذا الكود مستخدم مسبقاً' : 'This code is already in use');
            return;
        }

        const parentAccount = accounts.find(a => a.id === formData.parentId);
        const level = parentAccount ? parentAccount.level + 1 : 0;

        const newAccount: Account = {
            id: Date.now().toString(),
            code: formData.code,
            nameAr: formData.nameAr,
            nameEn: formData.nameEn || formData.nameAr,
            type: formData.type,
            parentId: formData.parentId || null,
            level,
            isActive: true,
            balance: 0
        };

        saveAccounts([...accounts, newAccount]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingAccount || !formData.code || !formData.nameAr) return;

        const parentAccount = accounts.find(a => a.id === formData.parentId);
        const level = parentAccount ? parentAccount.level + 1 : 0;

        const updatedAccount: Account = {
            ...editingAccount,
            code: formData.code,
            nameAr: formData.nameAr,
            nameEn: formData.nameEn || formData.nameAr,
            type: formData.type,
            parentId: formData.parentId || null,
            level
        };

        saveAccounts(accounts.map(a => a.id === editingAccount.id ? updatedAccount : a));
        closeModal();
    };

    const openEditModal = (account: Account) => {
        setEditingAccount(account);
        setFormData({
            code: account.code,
            nameAr: account.nameAr,
            nameEn: account.nameEn,
            type: account.type,
            parentId: account.parentId
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAccount(null);
        setFormData({ code: '', nameAr: '', nameEn: '', type: 'asset', parentId: null });
    };

    const handleDelete = (id: string) => {
        const hasChildren = accounts.some(a => a.parentId === id);
        if (hasChildren) {
            alert(language === 'ar' ? 'لا يمكن حذف حساب له حسابات فرعية' : 'Cannot delete account with sub-accounts');
            return;
        }
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا الحساب؟' : 'Delete this account?')) {
            saveAccounts(accounts.filter(a => a.id !== id));
        }
    };

    // الحصول على لون النوع
    const getTypeColor = (type: Account['type']) => {
        switch (type) {
            case 'asset': return 'text-accentBlue bg-accentBlue/10';
            case 'liability': return 'text-red-500 bg-red-500/10';
            case 'equity': return 'text-purple-500 bg-purple-500/10';
            case 'revenue': return 'text-accentGreen bg-accentGreen/10';
            case 'expense': return 'text-primary bg-primary/10';
            default: return 'text-secondary bg-secondary/10';
        }
    };

    const getTypeName = (type: Account['type']) => {
        const names = {
            asset: language === 'ar' ? 'أصول' : 'Asset',
            liability: language === 'ar' ? 'خصوم' : 'Liability',
            equity: language === 'ar' ? 'ملكية' : 'Equity',
            revenue: language === 'ar' ? 'إيرادات' : 'Revenue',
            expense: language === 'ar' ? 'مصروفات' : 'Expense'
        };
        return names[type];
    };

    // رسم عنصر الشجرة
    const renderTreeItem = (account: Account) => {
        const children = buildTree(account.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedIds.includes(account.id);

        return (
            <div key={account.id}>
                <div
                    className={`flex items-center gap-3 py-3 px-4 hover:bg-background/50 transition-colors rounded-xl group`}
                    style={{ paddingRight: `${account.level * 24 + 16}px` }}
                >
                    <button
                        onClick={() => hasChildren && toggleExpand(account.id)}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg ${hasChildren ? 'hover:bg-cardAccent cursor-pointer' : ''}`}
                    >
                        {hasChildren ? (
                            isExpanded ? <ChevronDown size={16} className="text-secondary" /> : <ChevronRight size={16} className="text-secondary" />
                        ) : null}
                    </button>

                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasChildren ? 'bg-primary/10' : 'bg-cardAccent'}`}>
                        {hasChildren ? <Folder size={16} className="text-primary" /> : <FileText size={16} className="text-secondary" />}
                    </div>

                    <span className="text-sm font-bold text-secondary">{account.code}</span>
                    <span className="font-black text-textPrimary flex-1">
                        {language === 'ar' ? account.nameAr : account.nameEn}
                    </span>

                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${getTypeColor(account.type)}`}>
                        {getTypeName(account.type)}
                    </span>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(account)} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(account.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {children.map(child => renderTreeItem(child))}
                    </div>
                )}
            </div>
        );
    };

    // إحصائيات
    const stats = useMemo(() => ({
        total: accounts.length,
        assets: accounts.filter(a => a.type === 'asset').length,
        liabilities: accounts.filter(a => a.type === 'liability').length,
        equity: accounts.filter(a => a.type === 'equity').length,
        revenue: accounts.filter(a => a.type === 'revenue').length,
        expenses: accounts.filter(a => a.type === 'expense').length
    }), [accounts]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'شجرة الحسابات' : 'Chart of Accounts'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة الحسابات المحاسبية وتصنيفها' : 'Manage accounting accounts and classifications'}
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
                        <button onClick={() => setViewMode('tree')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'tree' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}>
                            <Folder size={18} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}>
                            <List size={18} />
                        </button>
                    </div>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'إضافة حساب' : 'Add Account'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-surface p-4 rounded-2xl border border-cardAccent text-center">
                    <p className="text-2xl font-black text-textPrimary">{stats.total}</p>
                    <p className="text-[10px] text-secondary font-bold">{language === 'ar' ? 'إجمالي' : 'Total'}</p>
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-cardAccent text-center">
                    <p className="text-2xl font-black text-accentBlue">{stats.assets}</p>
                    <p className="text-[10px] text-secondary font-bold">{language === 'ar' ? 'أصول' : 'Assets'}</p>
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-cardAccent text-center">
                    <p className="text-2xl font-black text-red-500">{stats.liabilities}</p>
                    <p className="text-[10px] text-secondary font-bold">{language === 'ar' ? 'خصوم' : 'Liabilities'}</p>
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-cardAccent text-center">
                    <p className="text-2xl font-black text-purple-500">{stats.equity}</p>
                    <p className="text-[10px] text-secondary font-bold">{language === 'ar' ? 'ملكية' : 'Equity'}</p>
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-cardAccent text-center">
                    <p className="text-2xl font-black text-accentGreen">{stats.revenue}</p>
                    <p className="text-[10px] text-secondary font-bold">{language === 'ar' ? 'إيرادات' : 'Revenue'}</p>
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-cardAccent text-center">
                    <p className="text-2xl font-black text-primary">{stats.expenses}</p>
                    <p className="text-[10px] text-secondary font-bold">{language === 'ar' ? 'مصروفات' : 'Expenses'}</p>
                </div>
            </div>

            {/* Tree View */}
            {viewMode === 'tree' && (
                <div className="bg-surface rounded-[32px] border border-cardAccent p-6">
                    {buildTree(null).map(account => renderTreeItem(account))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cardAccent bg-background/50">
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الكود' : 'Code'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'اسم الحساب' : 'Account Name'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'النوع' : 'Type'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المستوى' : 'Level'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccounts.sort((a, b) => a.code.localeCompare(b.code)).map(account => (
                                <tr key={account.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5"><span className="font-bold text-secondary">{account.code}</span></td>
                                    <td className="p-5"><span className="font-black text-textPrimary">{language === 'ar' ? account.nameAr : account.nameEn}</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${getTypeColor(account.type)}`}>
                                            {getTypeName(account.type)}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center"><span className="font-bold text-secondary">{account.level}</span></td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditModal(account)} className="p-2.5 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit3 size={14} /></button>
                                            <button onClick={() => handleDelete(account.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
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
                                {editingAccount ? (language === 'ar' ? 'تعديل الحساب' : 'Edit Account') : (language === 'ar' ? 'إضافة حساب جديد' : 'Add New Account')}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'كود الحساب' : 'Account Code'} *
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="111"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'نوع الحساب' : 'Account Type'} *
                                    </label>
                                    <select
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as Account['type'] })}
                                    >
                                        <option value="asset">{language === 'ar' ? 'أصول' : 'Asset'}</option>
                                        <option value="liability">{language === 'ar' ? 'خصوم' : 'Liability'}</option>
                                        <option value="equity">{language === 'ar' ? 'حقوق ملكية' : 'Equity'}</option>
                                        <option value="revenue">{language === 'ar' ? 'إيرادات' : 'Revenue'}</option>
                                        <option value="expense">{language === 'ar' ? 'مصروفات' : 'Expense'}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم الحساب (عربي)' : 'Account Name (Arabic)'} *
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.nameAr}
                                    onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم الحساب (إنجليزي)' : 'Account Name (English)'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.nameEn}
                                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الحساب الأب' : 'Parent Account'}
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.parentId || ''}
                                    onChange={e => setFormData({ ...formData, parentId: e.target.value || null })}
                                >
                                    <option value="">{language === 'ar' ? 'حساب رئيسي (بدون أب)' : 'Main Account (No Parent)'}</option>
                                    {accounts.filter(a => a.id !== editingAccount?.id).map(a => (
                                        <option key={a.id} value={a.id}>{a.code} - {language === 'ar' ? a.nameAr : a.nameEn}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={editingAccount ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingAccount ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة الحساب' : 'Add Account')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartOfAccounts;
