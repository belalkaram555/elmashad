// الخزينة - كشوف حساب البنوك
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { FileText, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const BankStatements: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const banks = useMemo(() => JSON.parse(localStorage.getItem('banks_list') || '[]'), []);
    const [selectedBank, setSelectedBank] = useState<string>('');

    const transactions = useMemo(() => {
        const transfers = JSON.parse(localStorage.getItem('internal_transfers') || '[]');
        return transfers.filter((t: any) => t.fromAccount === selectedBank || t.toAccount === selectedBank);
    }, [selectedBank]);

    const balance = transactions.reduce((sum: number, t: any) => {
        if (t.toAccount === selectedBank) return sum + t.amount;
        if (t.fromAccount === selectedBank) return sum - t.amount;
        return sum;
    }, 0);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div><h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'كشوف حساب البنوك' : 'Bank Statements'}</h2></div>
                <select className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 font-bold text-textPrimary" value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
                    <option value="">{language === 'ar' ? 'اختر البنك' : 'Select Bank'}</option>
                    {banks.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
            </div>

            {selectedBank && <>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'رصيد الحساب' : 'Account Balance'}</p>
                    <p className={`text-2xl font-black ${balance >= 0 ? 'text-accentGreen' : 'text-red-500'}`}>{balance.toLocaleString()} {currency}</p>
                </div>

                <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'البيان' : 'Description'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'وارد' : 'Credit'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'صادر' : 'Debit'}</th>
                        </tr></thead>
                        <tbody>
                            {transactions.length === 0 ? <tr><td colSpan={4} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا توجد حركات' : 'No transactions'}</td></tr> :
                                transactions.map((t: any) => (
                                    <tr key={t.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                        <td className="p-5 text-secondary">{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                                        <td className="p-5 text-textPrimary">{t.notes || (t.toAccount === selectedBank ? `تحويل من ${t.fromAccount}` : `تحويل إلى ${t.toAccount}`)}</td>
                                        <td className="p-5">{t.toAccount === selectedBank && <span className="text-accentGreen font-black">+{t.amount.toLocaleString()}</span>}</td>
                                        <td className="p-5">{t.fromAccount === selectedBank && <span className="text-red-500 font-black">-{t.amount.toLocaleString()}</span>}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </>}

            {!selectedBank && <div className="text-center py-20"><FileText size={64} className="mx-auto text-secondary/30 mb-4" /><p className="text-secondary font-bold">{language === 'ar' ? 'اختر بنك لعرض كشف الحساب' : 'Select a bank to view statement'}</p></div>}
        </div>
    );
};

export default BankStatements;
