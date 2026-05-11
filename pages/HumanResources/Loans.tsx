// @ts-nocheck
// الموارد البشرية - السلف
// إدارة سلف الموظفين والأقساط

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Banknote, Search, Plus, XCircle, Trash2,
    User, Calendar, DollarSign, CheckCircle
} from 'lucide-react';

interface Loan {
    id: string;
    employeeId: string;
    employeeName: string;
    amount: number;
    remainingAmount: number;
    monthlyInstallment: number;
    startDate: string;
    status: 'active' | 'completed';
    payments: { date: string; amount: number }[];
}

const Loans: React.FC = () => {
    const { employees, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [loans, setLoans] = useState<Loan[]>(() => {
        const saved = localStorage.getItem('employee_loans');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [formData, setFormData] = useState({
        employeeId: '',
        amount: 0,
        monthlyInstallment: 0
    });

    const saveLoans = (data: Loan[]) => {
        localStorage.setItem('employee_loans', JSON.stringify(data));
        setLoans(data);
    };

    const filteredLoans = loans.filter(l => {
        const matchesSearch = l.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || l.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleAdd = () => {
        if (!formData.employeeId || formData.amount <= 0 || formData.monthlyInstallment <= 0) {
            alert(language === 'ar' ? 'يرجى إدخال جميع البيانات' : 'Please fill all fields');
            return;
        }

        const employee = employees.find(e => e.id === formData.employeeId);
        if (!employee) return;

        const newLoan: Loan = {
            id: Date.now().toString(),
            employeeId: formData.employeeId,
            employeeName: employee.name,
            amount: formData.amount,
            remainingAmount: formData.amount,
            monthlyInstallment: formData.monthlyInstallment,
            startDate: new Date().toISOString().split('T')[0],
            status: 'active',
            payments: []
        };

        saveLoans([...loans, newLoan]);
        closeModal();
    };

    const makePayment = (loanId: string) => {
        saveLoans(loans.map(l => {
            if (l.id === loanId && l.status === 'active') {
                const paymentAmount = Math.min(l.monthlyInstallment, l.remainingAmount);
                const newRemaining = l.remainingAmount - paymentAmount;
                return {
                    ...l,
                    remainingAmount: newRemaining,
                    status: newRemaining <= 0 ? 'completed' as const : 'active' as const,
                    payments: [...l.payments, { date: new Date().toISOString().split('T')[0], amount: paymentAmount }]
                };
            }
            return l;
        }));
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ employeeId: '', amount: 0, monthlyInstallment: 0 });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذه السلفة؟' : 'Delete this loan?')) {
            saveLoans(loans.filter(l => l.id !== id));
        }
    };

    const stats = useMemo(() => ({
        totalLoans: loans.length,
        activeLoans: loans.filter(l => l.status === 'active').length,
        totalAmount: loans.reduce((sum, l) => sum + l.amount, 0),
        remainingAmount: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.remainingAmount, 0)
    }), [loans]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'سلف الموظفين' : 'Employee Loans'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة السلف والأقساط الشهرية' : 'Manage loans and monthly installments'}
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
                        <option value="active">{language === 'ar' ? 'نشطة' : 'Active'}</option>
                        <option value="completed">{language === 'ar' ? 'مكتملة' : 'Completed'}</option>
                    </select>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'سلفة جديدة' : 'New Loan'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Banknote className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي السلف' : 'Total Loans'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.totalLoans}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Banknote className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'سلف نشطة' : 'Active'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.activeLoans}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'المتبقي' : 'Remaining'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.remainingAmount.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المبالغ' : 'Total Amount'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.totalAmount.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loans Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الموظف' : 'Employee'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'القسط' : 'Installment'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المتبقي' : 'Remaining'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoans.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <Banknote size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد سلف' : 'No loans found'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredLoans.map(loan => (
                                <tr key={loan.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                                {loan.employeeName.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="font-black text-textPrimary block">{loan.employeeName}</span>
                                                <span className="text-xs text-secondary">{loan.startDate}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="font-bold text-textPrimary">{loan.amount.toLocaleString()} {currency}</span></td>
                                    <td className="p-5"><span className="font-bold text-accentBlue">{loan.monthlyInstallment.toLocaleString()} {currency}</span></td>
                                    <td className="p-5"><span className="font-black text-red-500">{loan.remainingAmount.toLocaleString()} {currency}</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${loan.status === 'completed' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-accentBlue/10 text-accentBlue'}`}>
                                            {loan.status === 'completed' ? (language === 'ar' ? 'مكتملة' : 'Completed') : (language === 'ar' ? 'نشطة' : 'Active')}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            {loan.status === 'active' && (
                                                <button
                                                    onClick={() => makePayment(loan.id)}
                                                    className="px-3 py-2 bg-accentGreen/10 text-accentGreen rounded-xl text-xs font-bold hover:bg-accentGreen hover:text-white transition-all"
                                                >
                                                    {language === 'ar' ? 'خصم قسط' : 'Pay'}
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(loan.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
                                {language === 'ar' ? 'سلفة جديدة' : 'New Loan'}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الموظف' : 'Employee'} *
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.employeeId}
                                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                >
                                    <option value="">{language === 'ar' ? 'اختر الموظف...' : 'Select Employee...'}</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'مبلغ السلفة' : 'Loan Amount'} *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.amount || ''}
                                        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'القسط الشهري' : 'Monthly Installment'} *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.monthlyInstallment || ''}
                                        onChange={e => setFormData({ ...formData, monthlyInstallment: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {language === 'ar' ? 'إضافة السلفة' : 'Add Loan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Loans;
