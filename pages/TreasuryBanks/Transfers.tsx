// الخزينة - التحويلات الداخلية
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { ArrowLeftRight, Plus, Search, XCircle } from 'lucide-react';

interface Transfer { id: string; date: string; fromAccount: string; toAccount: string; amount: number; notes?: string; }

const Transfers: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [transfers, setTransfers] = useState<Transfer[]>(() => JSON.parse(localStorage.getItem('internal_transfers') || '[]'));
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ fromAccount: '', toAccount: '', amount: 0, notes: '' });

    const accounts = ['الصندوق', 'البنك الأهلي', 'بنك مصر', 'البنك التجاري'];

    const save = (data: Transfer[]) => { localStorage.setItem('internal_transfers', JSON.stringify(data)); setTransfers(data); };

    const handleAdd = () => {
        if (!formData.fromAccount || !formData.toAccount || formData.amount <= 0) return;
        save([...transfers, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], ...formData }]);
        setShowModal(false); setFormData({ fromAccount: '', toAccount: '', amount: 0, notes: '' });
    };

    const total = transfers.reduce((s, t) => s + t.amount, 0);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div><h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'التحويلات الداخلية' : 'Internal Transfers'}</h2></div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl glow-primary font-black text-sm"><Plus size={20} />{language === 'ar' ? 'تحويل جديد' : 'New Transfer'}</button>
            </div>

            <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي التحويلات' : 'Total Transfers'}</p>
                <p className="text-2xl font-black text-primary">{total.toLocaleString()} {currency}</p>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'من' : 'From'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'إلى' : 'To'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                    </tr></thead>
                    <tbody>
                        {transfers.length === 0 ? <tr><td colSpan={5} className="p-12 text-center"><ArrowLeftRight size={48} className="mx-auto text-secondary/30 mb-4" /><p className="text-secondary">{language === 'ar' ? 'لا توجد تحويلات' : 'No transfers'}</p></td></tr> :
                            transfers.map(t => (
                                <tr key={t.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 text-secondary">{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                                    <td className="p-5 text-red-500 font-bold">{t.fromAccount}</td>
                                    <td className="p-5 text-accentGreen font-bold">{t.toAccount}</td>
                                    <td className="p-5 text-primary font-black">{t.amount.toLocaleString()} {currency}</td>
                                    <td className="p-5 text-secondary">{t.notes || '-'}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10">
                    <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-textPrimary">{language === 'ar' ? 'تحويل جديد' : 'New Transfer'}</h3><button onClick={() => setShowModal(false)} className="text-secondary"><XCircle size={32} /></button></div>
                    <div className="space-y-5">
                        <select className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.fromAccount} onChange={e => setFormData({ ...formData, fromAccount: e.target.value })}><option value="">{language === 'ar' ? 'من حساب...' : 'From...'}</option>{accounts.map(a => <option key={a} value={a}>{a}</option>)}</select>
                        <select className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.toAccount} onChange={e => setFormData({ ...formData, toAccount: e.target.value })}><option value="">{language === 'ar' ? 'إلى حساب...' : 'To...'}</option>{accounts.map(a => <option key={a} value={a}>{a}</option>)}</select>
                        <input type="number" placeholder={language === 'ar' ? 'المبلغ' : 'Amount'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                        <input placeholder={language === 'ar' ? 'ملاحظات' : 'Notes'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                        <button onClick={handleAdd} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary">{language === 'ar' ? 'تحويل' : 'Transfer'}</button>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default Transfers;
