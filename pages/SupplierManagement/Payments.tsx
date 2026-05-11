// إدارة الموردين - مدفوعات الموردين
// صفحة كاملة لتسجيل سندات الصرف للموردين

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Receipt, Search, DollarSign, Truck, Calendar,
    XCircle, Plus, TrendingDown, Printer, CreditCard
} from 'lucide-react';
import { Supplier, TreasuryTransaction } from '../../types';
import { printVoucher } from '../../utils/printService';

const SupplierPayments: React.FC = () => {
    const { suppliers, updateSupplier, addTransaction, treasury, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash'
    });

    // فلترة سندات الصرف للموردين
    const supplierPayments = useMemo(() => {
        return treasury.filter(t =>
            t.type === 'expense' && (t.category === 'purchases' || t.description?.includes('سند صرف'))
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [treasury]);

    // فلترة حسب البحث
    const filteredPayments = supplierPayments.filter(p =>
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // الموردين الذين لديهم رصيد مستحق
    const suppliersWithBalance = suppliers.filter(s => s.balance > 0);

    // إجمالي المدفوعات لهذا الشهر
    const thisMonthPayments = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return supplierPayments
            .filter(p => new Date(p.date) >= startOfMonth)
            .reduce((sum, p) => sum + p.amount, 0);
    }, [supplierPayments]);

    // تسجيل سند صرف
    const handleAddPayment = () => {
        if (!selectedSupplier || formData.amount <= 0) {
            alert(language === 'ar' ? 'يرجى اختيار المورد وإدخال المبلغ' : 'Please select supplier and enter amount');
            return;
        }

        // تحديث رصيد المورد
        updateSupplier({
            ...selectedSupplier,
            balance: selectedSupplier.balance - formData.amount
        });

        // إضافة سند الصرف في الخزينة
        addTransaction({
            id: Date.now().toString(),
            type: 'expense',
            category: 'purchases',
            amount: formData.amount,
            date: formData.date,
            description: formData.description || `سند صرف إلى ${selectedSupplier.name}`,
            referenceId: selectedSupplier.id
        });

        closeModal();
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSupplier(null);
        setFormData({ amount: 0, description: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'cash' });
    };

    // البحث عن اسم المورد من المعاملة
    const getSupplierName = (transaction: TreasuryTransaction) => {
        if (transaction.referenceId) {
            const supplier = suppliers.find(s => s.id === transaction.referenceId);
            return supplier?.name || '-';
        }
        return transaction.description;
    };

    // طباعة سند صرف
    const handlePrintPayment = (transaction: TreasuryTransaction) => {
        printVoucher({
            type: 'payment',
            voucherNumber: transaction.id.slice(-8).toUpperCase(),
            date: new Date(transaction.date).toLocaleDateString('ar-EG'),
            partyName: getSupplierName(transaction),
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
                        {language === 'ar' ? 'مدفوعات الموردين' : 'Supplier Payments'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'تسجيل المبالغ المدفوعة للموردين' : 'Record amounts paid to suppliers'}
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
                        className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all font-black text-sm shadow-lg"
                    >
                        <Plus size={20} />
                        {language === 'ar' ? 'سند صرف جديد' : 'New Payment'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <CreditCard className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'سندات الصرف' : 'Total Payments'}</p>
                            <p className="text-2xl font-black text-textPrimary">{supplierPayments.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <TrendingDown className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مدفوعات الشهر' : 'This Month'}</p>
                            <p className="text-2xl font-black text-primary">{thisMonthPayments.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المستحقات' : 'Total Payables'}</p>
                            <p className="text-2xl font-black text-red-500">
                                {suppliers.reduce((sum, s) => sum + (s.balance > 0 ? s.balance : 0), 0).toLocaleString()} {currency}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Truck className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'موردين لديهم رصيد' : 'With Balance'}</p>
                            <p className="text-2xl font-black text-accentBlue">{suppliersWithBalance.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* سندات الصرف */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <div className="p-6 border-b border-cardAccent bg-background/30">
                    <h3 className="font-black text-textPrimary text-lg">
                        {language === 'ar' ? 'سجل سندات الصرف' : 'Payment History'}
                    </h3>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المورد' : 'Supplier'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'البيان' : 'Description'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'طباعة' : 'Print'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <CreditCard size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">
                                        {language === 'ar' ? 'لا توجد سندات صرف' : 'No payments found'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map(p => (
                                <tr key={p.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={16} className="text-secondary" />
                                            <span className="text-secondary font-bold">
                                                {new Date(p.date).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-black text-textPrimary">{getSupplierName(p)}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-secondary font-bold">{p.description}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-black text-red-500 text-lg">
                                            -{p.amount.toLocaleString()} {currency}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button
                                            onClick={() => handlePrintPayment(p)}
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

            {/* Modal سند صرف جديد */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {language === 'ar' ? 'سند صرف جديد' : 'New Payment Voucher'}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* اختيار المورد */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'المورد' : 'Supplier'} *
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={selectedSupplier?.id || ''}
                                    onChange={(e) => {
                                        const supplier = suppliers.find(s => s.id === e.target.value);
                                        setSelectedSupplier(supplier || null);
                                    }}
                                >
                                    <option value="">{language === 'ar' ? 'اختر المورد...' : 'Select Supplier...'}</option>
                                    {suppliersWithBalance.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} - {language === 'ar' ? 'المستحق:' : 'Due:'} {s.balance.toLocaleString()} {currency}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* الرصيد الحالي */}
                            {selectedSupplier && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                    <p className="text-[10px] text-red-400 font-black uppercase mb-1">
                                        {language === 'ar' ? 'المبلغ المستحق للمورد' : 'Amount Due'}
                                    </p>
                                    <p className="text-2xl font-black text-red-500">
                                        {selectedSupplier.balance.toLocaleString()} {currency}
                                    </p>
                                </div>
                            )}

                            {/* المبلغ */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid'} *
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold text-2xl focus:border-primary outline-none transition-colors"
                                    value={formData.amount || ''}
                                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>

                            {/* طريقة الدفع */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.paymentMethod}
                                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                >
                                    <option value="cash">{language === 'ar' ? 'نقداً' : 'Cash'}</option>
                                    <option value="bank">{language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                                    <option value="check">{language === 'ar' ? 'شيك' : 'Check'}</option>
                                </select>
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
                                    placeholder={language === 'ar' ? 'سند صرف...' : 'Payment voucher...'}
                                />
                            </div>

                            <button
                                onClick={handleAddPayment}
                                className="w-full bg-red-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {language === 'ar' ? 'تسجيل سند الصرف' : 'Record Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierPayments;
