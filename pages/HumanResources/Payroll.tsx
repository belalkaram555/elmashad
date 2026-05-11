// @ts-nocheck
// الموارد البشرية - المرتبات
// إعداد وإدارة مرتبات الموظفين

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Wallet, Search, Calculator, User, Calendar,
    DollarSign, TrendingUp, CheckCircle, Clock
} from 'lucide-react';

interface PayrollRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    month: string;
    baseSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    status: 'pending' | 'paid';
    paidDate?: string;
}

const Payroll: React.FC = () => {
    const { employees, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
        const saved = localStorage.getItem('payroll_records');
        return saved ? JSON.parse(saved) : [];
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const savePayroll = (data: PayrollRecord[]) => {
        localStorage.setItem('payroll_records', JSON.stringify(data));
        setPayroll(data);
    };

    const filteredPayroll = payroll.filter(p => {
        const matchesSearch = p.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMonth = p.month === selectedMonth;
        return matchesSearch && matchesMonth;
    });

    // إنشاء مرتبات الشهر لجميع الموظفين
    const generatePayroll = () => {
        const existingIds = payroll.filter(p => p.month === selectedMonth).map(p => p.employeeId);
        const newRecords: PayrollRecord[] = employees
            .filter(e => !existingIds.includes(e.id))
            .map(e => ({
                id: `${e.id}-${selectedMonth}`,
                employeeId: e.id,
                employeeName: e.name,
                month: selectedMonth,
                baseSalary: e.salary || 3000,
                allowances: 500,
                deductions: 0,
                netSalary: (e.salary || 3000) + 500,
                status: 'pending' as const
            }));

        if (newRecords.length === 0) {
            alert(language === 'ar' ? 'تم إعداد مرتبات جميع الموظفين لهذا الشهر' : 'Payroll already generated for all employees');
            return;
        }

        savePayroll([...payroll, ...newRecords]);
    };

    const markAsPaid = (id: string) => {
        savePayroll(payroll.map(p => p.id === id ? {
            ...p,
            status: 'paid' as const,
            paidDate: new Date().toISOString().split('T')[0]
        } : p));
    };

    const payAll = () => {
        const date = new Date().toISOString().split('T')[0];
        savePayroll(payroll.map(p =>
            p.month === selectedMonth && p.status === 'pending'
                ? { ...p, status: 'paid' as const, paidDate: date }
                : p
        ));
    };

    const stats = useMemo(() => ({
        totalEmployees: filteredPayroll.length,
        totalSalaries: filteredPayroll.reduce((sum, p) => sum + p.netSalary, 0),
        pending: filteredPayroll.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netSalary, 0),
        paid: filteredPayroll.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.netSalary, 0)
    }), [filteredPayroll]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'المرتبات' : 'Payroll'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إعداد وصرف مرتبات الموظفين' : 'Prepare and pay employee salaries'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />

                    <button onClick={generatePayroll} className="flex items-center gap-2 bg-accentBlue text-white px-5 py-3 rounded-2xl hover:scale-105 transition-all font-black text-sm">
                        <Calculator size={18} />
                        {language === 'ar' ? 'إعداد المرتبات' : 'Generate'}
                    </button>

                    <button onClick={payAll} className="flex items-center gap-2 bg-accentGreen text-white px-5 py-3 rounded-2xl hover:scale-105 transition-all font-black text-sm">
                        <Wallet size={18} />
                        {language === 'ar' ? 'صرف الكل' : 'Pay All'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <User className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد الموظفين' : 'Employees'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.totalEmployees}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المرتبات' : 'Total Salaries'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.totalSalaries.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <Clock className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.pending.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'تم الصرف' : 'Paid'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.paid.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <div className="p-6 border-b border-cardAccent bg-background/30 flex justify-between items-center">
                    <h3 className="font-black text-textPrimary text-lg">
                        {language === 'ar' ? 'كشف المرتبات' : 'Payroll Sheet'} - {selectedMonth}
                    </h3>
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-background border border-cardAccent rounded-xl py-2 px-10 text-sm font-bold text-textPrimary placeholder:text-secondary/50 w-48"
                        />
                    </div>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الموظف' : 'Employee'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الراتب الأساسي' : 'Base'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'البدلات' : 'Allowances'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الخصومات' : 'Deductions'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الصافي' : 'Net'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'صرف' : 'Pay'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayroll.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center">
                                    <Wallet size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد مرتبات لهذا الشهر' : 'No payroll for this month'}</p>
                                    <p className="text-secondary/60 text-sm mt-2">{language === 'ar' ? 'اضغط "إعداد المرتبات" لإنشاء كشف المرتبات' : 'Click "Generate" to create payroll'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredPayroll.map(record => (
                                <tr key={record.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                                {record.employeeName.charAt(0)}
                                            </div>
                                            <span className="font-black text-textPrimary">{record.employeeName}</span>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="font-bold text-textPrimary">{record.baseSalary.toLocaleString()}</span></td>
                                    <td className="p-5"><span className="font-bold text-accentGreen">+{record.allowances.toLocaleString()}</span></td>
                                    <td className="p-5"><span className="font-bold text-red-500">-{record.deductions.toLocaleString()}</span></td>
                                    <td className="p-5"><span className="font-black text-primary text-lg">{record.netSalary.toLocaleString()} {currency}</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${record.status === 'paid' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>
                                            {record.status === 'paid' ? (language === 'ar' ? 'مصروف' : 'Paid') : (language === 'ar' ? 'معلق' : 'Pending')}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        {record.status === 'pending' ? (
                                            <button
                                                onClick={() => markAsPaid(record.id)}
                                                className="px-4 py-2 bg-accentGreen/10 text-accentGreen rounded-xl text-sm font-bold hover:bg-accentGreen hover:text-white transition-all"
                                            >
                                                {language === 'ar' ? 'صرف' : 'Pay'}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-secondary">{record.paidDate}</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payroll;
