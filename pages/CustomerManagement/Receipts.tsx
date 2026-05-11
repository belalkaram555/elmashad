// إدارة العملاء - مقبوضات العملاء
// صفحة كاملة لتسجيل سندات القبض

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Receipt, Search, DollarSign, User, Calendar,
    XCircle, Plus, FileText, TrendingUp, Printer
} from 'lucide-react';
import { Customer, TreasuryTransaction } from '../../types';
import { printVoucher } from '../../utils/printService';

const CustomerReceipts: React.FC = () => {
    const { customers, updateCustomer, addTransaction, treasury, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // فلترة سندات القبض من العملاء
    const customerReceipts = useMemo(() => {
        return treasury.filter(t =>
            t.type === 'income' && t.category === 'debt_payment'
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [treasury]);

    // فلترة حسب البحث
    const filteredReceipts = customerReceipts.filter(r =>
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // العملاء الذين لديهم رصيد مستحق
    const customersWithBalance = customers.filter(c => c.balance > 0);

    // إجمالي المقبوضات لهذا الشهر
    const thisMonthReceipts = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return customerReceipts
            .filter(r => new Date(r.date) >= startOfMonth)
            .reduce((sum, r) => sum + r.amount, 0);
    }, [customerReceipts]);

    // تسجيل سند قبض
    const handleAddReceipt = () => {
        if (!selectedCustomer || formData.amount <= 0) {
            alert(language === 'ar' ? 'يرجى اختيار العميل وإدخال المبلغ' : 'Please select customer and enter amount');
            return;
        }

        // تحديث رصيد العميل
        updateCustomer({
            ...selectedCustomer,
            balance: selectedCustomer.balance - formData.amount
        });

        // إضافة سند القبض في الخزينة
        addTransaction({
            id: Date.now().toString(),
            type: 'income',
            category: 'debt_payment',
            amount: formData.amount,
            date: formData.date,
            description: formData.description || `سند قبض من ${selectedCustomer.name}`,
            referenceId: selectedCustomer.id
        });

        closeModal();
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCustomer(null);
        setFormData({ amount: 0, description: '', date: new Date().toISOString().split('T')[0] });
    };

    // البحث عن اسم العميل من المعاملة
    const getCustomerName = (transaction: TreasuryTransaction) => {
        if (transaction.referenceId) {
            const customer = customers.find(c => c.id === transaction.referenceId);
            return customer?.name || '-';
        }
        return transaction.description;
    };

    // طباعة سند قبض
    const handlePrintReceipt = (transaction: TreasuryTransaction) => {
        printVoucher({
            type: 'receipt',
            voucherNumber: transaction.id.slice(-8).toUpperCase(),
            date: new Date(transaction.date).toLocaleDateString('ar-EG'),
            partyName: getCustomerName(transaction),
            amount: transaction.amount,
            description: transaction.description,
            currency,
            settings
        });
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'مقبوضات العملاء' : 'Customer Receipts'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'تسجيل المبالغ المستلمة من العملاء' : 'Record amounts received from customers'}
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

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-accentGreen text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all font-black text-sm shadow-lg"
                    >
                        <Plus size={20} />
                        {language === 'ar' ? 'سند قبض جديد' : 'New Receipt'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Receipt className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'سندات القبض' : 'Total Receipts'}</p>
                            <p className="text-2xl font-black text-textPrimary">{customerReceipts.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مقبوضات الشهر' : 'This Month'}</p>
                            <p className="text-2xl font-black text-primary">{thisMonthReceipts.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المستحقات' : 'Total Due'}</p>
                            <p className="text-2xl font-black text-red-500">
                                {customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0).toLocaleString()} {currency}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <User className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عملاء لديهم رصيد' : 'With Balance'}</p>
                            <p className="text-2xl font-black text-accentBlue">{customersWithBalance.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* سندات القبض */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <div className="p-6 border-b border-cardAccent bg-background/30">
                    <h3 className="font-black text-textPrimary text-lg">
                        {language === 'ar' ? 'سجل سندات القبض' : 'Receipt History'}
                    </h3>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'البيان' : 'Description'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'طباعة' : 'Print'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceipts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <Receipt size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">
                                        {language === 'ar' ? 'لا توجد سندات قبض' : 'No receipts found'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filteredReceipts.map(r => (
                                <tr key={r.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={16} className="text-secondary" />
                                            <span className="text-secondary font-bold">
                                                {new Date(r.date).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-black text-textPrimary">{getCustomerName(r)}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-secondary font-bold">{r.description}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-black text-accentGreen text-lg">
                                            {r.amount.toLocaleString()} {currency}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button
                                            onClick={() => handlePrintReceipt(r)}
                                            className="p-2.5 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                                        >
                                            <Printer size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal سند قبض جديد */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {language === 'ar' ? 'سند قبض جديد' : 'New Receipt Voucher'}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* اختيار العميل */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'العميل' : 'Customer'} *
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={selectedCustomer?.id || ''}
                                    onChange={(e) => {
                                        const customer = customers.find(c => c.id === e.target.value);
                                        setSelectedCustomer(customer || null);
                                    }}
                                >
                                    <option value="">{language === 'ar' ? 'اختر العميل...' : 'Select Customer...'}</option>
                                    {customersWithBalance.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} - {language === 'ar' ? 'الرصيد:' : 'Balance:'} {c.balance.toLocaleString()} {currency}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* الرصيد الحالي */}
                            {selectedCustomer && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                    <p className="text-[10px] text-red-400 font-black uppercase mb-1">
                                        {language === 'ar' ? 'الرصيد المستحق' : 'Balance Due'}
                                    </p>
                                    <p className="text-2xl font-black text-red-500">
                                        {selectedCustomer.balance.toLocaleString()} {currency}
                                    </p>
                                </div>
                            )}

                            {/* المبلغ */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'المبلغ المستلم' : 'Amount Received'} *
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold text-2xl focus:border-primary outline-none transition-colors"
                                    value={formData.amount || ''}
                                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>

                            {/* التاريخ */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'التاريخ' : 'Date'}
                                </label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            {/* البيان */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'البيان' : 'Description'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={language === 'ar' ? 'سند قبض...' : 'Receipt voucher...'}
                                />
                            </div>

                            <button
                                onClick={handleAddReceipt}
                                className="w-full bg-accentGreen text-background py-5 rounded-2xl font-black text-lg shadow-xl mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {language === 'ar' ? 'تسجيل سند القبض' : 'Record Receipt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerReceipts;
