
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToastStore } from '../store/toastStore';
import { TrendingUp, TrendingDown, Plus, XCircle, Receipt, HandCoins, Landmark, Calculator, CheckCircle2, Lock, Unlock, Banknote, User } from 'lucide-react';
import { Button, Input } from '../components/ui/Atoms';
import { Modal } from '../components/ui/Modal';

/* 
 * Treasury management view for monitoring cash flow, shift closures, and financial transactions
 */
const Treasury: React.FC = () => {
    const { treasury, settings, addTransaction, orders, activeShift, closeShift, shiftHistory } = useData();
    const { t, language } = useLanguage();
    const { user, userRole } = useAuth();
    const { addToast } = useToastStore();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const totalIncome = treasury.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = treasury.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Closure States
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [actualBalance, setActualBalance] = useState<number>(0);

    const [showModal, setShowModal] = useState(false);
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('general');

    const categories = [
        { id: 'general', label: language === 'ar' ? 'عام' : 'General' },
        { id: 'sales', label: language === 'ar' ? 'مبيعات' : 'Sales' },
        { id: 'purchases', label: language === 'ar' ? 'مشتريات' : 'Purchases' },
        { id: 'salaries', label: language === 'ar' ? 'رواتب' : 'Salaries' },
        { id: 'rent', label: language === 'ar' ? 'إيجار' : 'Rent' },
        { id: 'maintenance', label: language === 'ar' ? 'صيانة' : 'Maintenance' },
        { id: 'utilities', label: language === 'ar' ? 'كهرباء ومياه' : 'Utilities' },
        { id: 'other', label: language === 'ar' ? 'أخرى' : 'Other' }
    ];

    const openAddModal = (type: 'income' | 'expense') => {
        setTransactionType(type);
        setAmount(0);
        setDescription('');
        setCategory('general');
        setShowModal(true);
    };

    const handleSaveTransaction = () => {
        if (amount <= 0) {
            addToast('المبلغ يجب أن يكون أكبر من صفر', 'error');
            return;
        }
        if (!description.trim()) {
            addToast('يرجى إدخال الوصف أو البيان', 'error');
            return;
        }

        addTransaction({
            id: Date.now().toString(),
            type: transactionType,
            category: category as any,
            amount: Number(amount),
            date: new Date().toISOString(),
            description: description,
            performedBy: { name: user || 'Anonymous', role: userRole || 'Unknown' }
        });
        setShowModal(false);
        addToast('تم تسجيل العملية بنجاح', 'success');
    };

    const handleCloseShiftAction = () => {
        if (actualBalance < 0) {
            addToast('المبلغ الفعلي لا يمكن أن يكون سالباً', 'error');
            return;
        }
        closeShift(actualBalance);
        setShowCloseModal(false);
        addToast('تم إغلاق الوردية وترحيل التقرير للإدارة', 'success');
    };

    // واجهة الكاشير (إغلاق الوردية)
    if (userRole === 'cashier') {
        return (
            <div className="max-w-2xl mx-auto space-y-8 font-cairo animate-in fade-in duration-500 pb-20">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-textPrimary mb-2">محاسبة الوردية اليومية</h2>
                    <p className="text-secondary text-sm">مراجعة النقدية وإغلاق الصندوق للمستخدم: {user}</p>
                </div>

                {!activeShift ? (
                    <div className="bg-surface p-12 rounded-[40px] border border-cardAccent text-center shadow-2xl">
                        <div className="w-20 h-20 bg-accentGreen/10 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-accentGreen border border-accentGreen/20">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-textPrimary mb-2">الوردية مغلقة حالياً</h3>
                        <p className="text-secondary font-bold text-sm">يمكنك فتح وردية جديدة من شاشة نقطة البيع (POS)</p>
                    </div>
                ) : (
                    <div className="bg-surface p-10 rounded-[40px] border border-cardAccent space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">إجمالي مبيعاتك في هذه الوردية</p>
                                <h3 className="text-4xl font-black text-primary">{activeShift.totalSales.toLocaleString()} <span className="text-sm font-bold opacity-50">{currency}</span></h3>
                            </div>
                            <Calculator size={48} className="text-primary opacity-20" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background/40 p-6 rounded-3xl border border-cardAccent">
                                <p className="text-[9px] font-black text-secondary mb-1">رصيد البداية</p>
                                <p className="text-lg font-black text-textPrimary">{activeShift.startBalance.toLocaleString()}</p>
                            </div>
                            <div className="bg-background/40 p-6 rounded-3xl border border-cardAccent">
                                <p className="text-[9px] font-black text-secondary mb-1">المتوقع في الصندوق</p>
                                <p className="text-lg font-black text-accentGreen">{(activeShift.startBalance + activeShift.totalSales).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-cardAccent">
                            <button
                                onClick={() => setShowCloseModal(true)}
                                className="w-full flex items-center justify-center gap-3 py-6 bg-red-500 text-white rounded-[28px] font-black text-xl hover:bg-red-600 transition-all shadow-xl active:scale-95"
                            >
                                <Lock size={20} /> إغلاق الوردية (التقفيل)
                            </button>
                            <p className="text-center text-[10px] text-secondary mt-4 italic">بمجرد التأكيد، سيتم تصفير درج النقدية وترحيل المبلغ للخزينة الرئيسية</p>
                        </div>
                    </div>
                )}

                {/* Close Shift Modal */}
                {showCloseModal && activeShift && (
                    <Modal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)}>
                        <Modal.Header title="تأكيد إغلاق الوردية" subtitle="أدخل المبلغ الفعلي الموجود في الدرج" />
                        <Modal.Body>
                            <div className="space-y-4">
                                <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-xs text-yellow-600 font-bold leading-relaxed">
                                    تنبيه: سيتم تسجيل الفرق (عجز أو زيادة) بشكل آلي بناءً على المبلغ الذي ستدخله الآن.
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">إجمالي النقدية الفعلية (الدرج)</label>
                                    <div className="relative">
                                        <Banknote className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={24} />
                                        <input
                                            type="number"
                                            className="w-full pr-14 p-5 bg-background border border-cardAccent rounded-2xl text-textPrimary font-black text-3xl outline-none"
                                            value={actualBalance || ''}
                                            onChange={e => setActualBalance(Number(e.target.value))}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button fullWidth size="lg" variant="danger" onClick={handleCloseShiftAction}>تأكيد الإغلاق النهائي</Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 font-cairo pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">{t('treasury')}</h2>
                    <p className="text-secondary text-xs mt-1 font-bold">إدارة التدفقات النقدية والعهدة المالية</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => openAddModal('income')} className="flex items-center gap-2 bg-accentGreen text-white px-6 py-3.5 rounded-2xl hover:opacity-90 transition-all font-black text-sm shadow-lg shadow-emerald-900/20"><HandCoins size={20} /> {t('receiptVoucher')}</button>
                    <button onClick={() => openAddModal('expense')} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3.5 rounded-2xl hover:opacity-90 transition-all font-black text-sm shadow-lg shadow-red-900/20"><Receipt size={20} /> {t('paymentVoucher')}</button>
                </div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-[10px] text-secondary uppercase bg-background/30 border-b border-cardAccent">
                            <tr>
                                <th className="px-8 py-6 font-black">التاريخ</th>
                                <th className="px-8 py-6 font-black text-center">تم بواسطة</th>
                                <th className="px-8 py-6 font-black text-center">{t('type')}</th>
                                <th className="px-8 py-6 font-black">التصنيف</th>
                                <th className="px-8 py-6 font-black">{t('description')}</th>
                                <th className="px-8 py-6 font-black text-left">{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cardAccent">
                            {treasury.map(trx => (
                                <tr key={trx.id} className="hover:bg-background/40 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap text-secondary font-bold">{new Date(trx.date).toLocaleDateString()}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-cardAccent text-[10px] text-textPrimary">
                                            <User size={12} className="text-primary" />
                                            <span className="font-black">{trx.performedBy?.name || 'Sys'}</span>
                                            <span className="opacity-40">({trx.performedBy?.role || 'Admin'})</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${trx.type === 'income' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>
                                            {trx.type === 'income' ? t('receiptVoucher') : t('paymentVoucher')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-textPrimary font-bold">
                                        {categories.find(c => c.id === trx.category)?.label || trx.category}
                                    </td>
                                    <td className="px-8 py-6 text-textPrimary font-bold">{trx.description}</td>
                                    <td className={`px-8 py-6 font-black text-lg text-left ${trx.type === 'income' ? 'text-accentGreen' : 'text-red-500'}`}>
                                        {trx.type === 'income' ? '+' : '-'}{trx.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                    <Modal.Header title={transactionType === 'income' ? t('receiptVoucher') : t('paymentVoucher')} subtitle="تسجيل حركة مالية جديدة في الخزينة" />
                    <Modal.Body>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('amount')}</label>
                                <Input type="number" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} placeholder="0.00" className="text-2xl font-black h-16" autoFocus />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">التصنيف</label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold appearance-none"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('description')}</label>
                                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="مثلاً: دفعة إيجار، توريد نقدي..." />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button fullWidth size="lg" variant={transactionType === 'income' ? 'success' : 'danger'} onClick={handleSaveTransaction}>حفظ العملية</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default Treasury;
