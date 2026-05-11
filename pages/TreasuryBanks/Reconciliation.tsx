// الخزينة - التسويات البنكية
import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Calculator, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const BankReconciliation: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [bankBalance, setBankBalance] = useState(0);
    const [bookBalance, setBookBalance] = useState(0);
    const [adjustments, setAdjustments] = useState<{ id: string; desc: string; amount: number }[]>([]);

    const difference = bankBalance - bookBalance - adjustments.reduce((s, a) => s + a.amount, 0);
    const isReconciled = Math.abs(difference) < 0.01;

    const addAdjustment = () => {
        setAdjustments([...adjustments, { id: Date.now().toString(), desc: '', amount: 0 }]);
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div><h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'التسويات البنكية' : 'Bank Reconciliation'}</h2></div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <label className="text-secondary text-xs font-bold block mb-2">{language === 'ar' ? 'رصيد البنك' : 'Bank Balance'}</label>
                    <input type="number" className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-black text-xl" value={bankBalance || ''} onChange={e => setBankBalance(Number(e.target.value))} />
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <label className="text-secondary text-xs font-bold block mb-2">{language === 'ar' ? 'رصيد الدفاتر' : 'Book Balance'}</label>
                    <input type="number" className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-black text-xl" value={bookBalance || ''} onChange={e => setBookBalance(Number(e.target.value))} />
                </div>
            </div>

            <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-textPrimary">{language === 'ar' ? 'التسويات' : 'Adjustments'}</h3>
                    <button onClick={addAdjustment} className="px-4 py-2 bg-primary text-background rounded-xl font-bold text-sm">{language === 'ar' ? '+ إضافة' : '+ Add'}</button>
                </div>
                <div className="space-y-3">
                    {adjustments.map((a, i) => (
                        <div key={a.id} className="flex gap-4">
                            <input placeholder={language === 'ar' ? 'الوصف' : 'Description'} className="flex-1 p-3 bg-background border border-cardAccent rounded-xl text-textPrimary" value={a.desc} onChange={e => { const newAdj = [...adjustments]; newAdj[i].desc = e.target.value; setAdjustments(newAdj); }} />
                            <input type="number" placeholder={language === 'ar' ? 'المبلغ' : 'Amount'} className="w-32 p-3 bg-background border border-cardAccent rounded-xl text-textPrimary" value={a.amount || ''} onChange={e => { const newAdj = [...adjustments]; newAdj[i].amount = Number(e.target.value); setAdjustments(newAdj); }} />
                            <button onClick={() => setAdjustments(adjustments.filter((_, idx) => idx !== i))} className="p-3 text-red-500"><XCircle size={20} /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`p-8 rounded-3xl border text-center ${isReconciled ? 'bg-accentGreen/10 border-accentGreen/20' : 'bg-red-500/10 border-red-500/20'}`}>
                {isReconciled ? <CheckCircle size={48} className="mx-auto text-accentGreen mb-4" /> : <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />}
                <p className="text-secondary text-sm mb-2">{language === 'ar' ? 'الفرق' : 'Difference'}</p>
                <p className={`text-3xl font-black ${isReconciled ? 'text-accentGreen' : 'text-red-500'}`}>{difference.toLocaleString()} {currency}</p>
                <p className="text-secondary mt-2">{isReconciled ? (language === 'ar' ? 'متطابق ✓' : 'Reconciled ✓') : (language === 'ar' ? 'غير متطابق' : 'Not Reconciled')}</p>
            </div>
        </div>
    );
};

export default BankReconciliation;
