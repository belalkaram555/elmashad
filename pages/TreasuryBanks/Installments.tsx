// الخزينة - إدارة التقسيط
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { CreditCard, Search, Plus, XCircle, Trash2, User, Calendar, DollarSign } from 'lucide-react';

interface Installment { id: string; customerId: string; customerName: string; totalAmount: number; paidAmount: number; monthlyAmount: number; startDate: string; months: number; status: 'active' | 'completed'; }

const Installments: React.FC = () => {
    const { customers, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [installments, setInstallments] = useState<Installment[]>(() => JSON.parse(localStorage.getItem('installments') || '[]'));
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ customerId: '', totalAmount: 0, months: 12 });

    const save = (data: Installment[]) => { localStorage.setItem('installments', JSON.stringify(data)); setInstallments(data); };

    const handleAdd = () => {
        const customer = customers.find(c => c.id === formData.customerId);
        if (!customer || formData.totalAmount <= 0) return;
        const newInst: Installment = {
            id: Date.now().toString(), customerId: formData.customerId, customerName: customer.name,
            totalAmount: formData.totalAmount, paidAmount: 0, monthlyAmount: formData.totalAmount / formData.months,
            startDate: new Date().toISOString().split('T')[0], months: formData.months, status: 'active'
        };
        save([...installments, newInst]);
        setShowModal(false); setFormData({ customerId: '', totalAmount: 0, months: 12 });
    };

    const makePayment = (id: string) => {
        save(installments.map(i => {
            if (i.id !== id) return i;
            const newPaid = i.paidAmount + i.monthlyAmount;
            return { ...i, paidAmount: newPaid, status: newPaid >= i.totalAmount ? 'completed' : 'active' };
        }));
    };

    const filtered = installments.filter(i => i.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const stats = useMemo(() => ({ total: installments.length, active: installments.filter(i => i.status === 'active').length, totalDue: installments.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0) }), [installments]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div><h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'إدارة التقسيط' : 'Installments'}</h2></div>
                <div className="flex gap-3">
                    <div className="relative"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} /><input type="text" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary w-48" /></div>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl glow-primary font-black text-sm"><Plus size={20} />{language === 'ar' ? 'تقسيط جديد' : 'New Plan'}</button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الخطط' : 'Total Plans'}</p><p className="text-2xl font-black text-textPrimary">{stats.total}</p></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'خطط نشطة' : 'Active'}</p><p className="text-2xl font-black text-primary">{stats.active}</p></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'المبلغ المتبقي' : 'Total Due'}</p><p className="text-2xl font-black text-red-500">{stats.totalDue.toLocaleString()} {currency}</p></div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'المبلغ' : 'Total'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'المدفوع' : 'Paid'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'القسط' : 'Monthly'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'دفع' : 'Pay'}</th>
                    </tr></thead>
                    <tbody>
                        {filtered.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا توجد خطط' : 'No plans'}</td></tr> :
                            filtered.map(i => (
                                <tr key={i.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 font-black text-textPrimary">{i.customerName}</td>
                                    <td className="p-5 text-textPrimary">{i.totalAmount.toLocaleString()}</td>
                                    <td className="p-5 text-accentGreen">{i.paidAmount.toLocaleString()}</td>
                                    <td className="p-5 text-primary">{i.monthlyAmount.toLocaleString()}</td>
                                    <td className="p-5 text-center"><span className={`px-3 py-1 rounded-full text-xs font-black ${i.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-accentGreen/10 text-accentGreen'}`}>{i.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'مكتمل' : 'Done')}</span></td>
                                    <td className="p-5 text-center">{i.status === 'active' && <button onClick={() => makePayment(i.id)} className="px-4 py-2 bg-accentGreen text-white rounded-lg font-bold text-sm">{language === 'ar' ? 'دفع قسط' : 'Pay'}</button>}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10">
                    <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-textPrimary">{language === 'ar' ? 'خطة تقسيط جديدة' : 'New Plan'}</h3><button onClick={() => setShowModal(false)} className="text-secondary"><XCircle size={32} /></button></div>
                    <div className="space-y-5">
                        <select className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })}><option value="">{language === 'ar' ? 'اختر العميل' : 'Select Customer'}</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        <input type="number" placeholder={language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.totalAmount || ''} onChange={e => setFormData({ ...formData, totalAmount: Number(e.target.value) })} />
                        <input type="number" placeholder={language === 'ar' ? 'عدد الأقساط' : 'Months'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.months} onChange={e => setFormData({ ...formData, months: Number(e.target.value) })} />
                        <button onClick={handleAdd} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary">{language === 'ar' ? 'إضافة' : 'Add'}</button>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default Installments;
