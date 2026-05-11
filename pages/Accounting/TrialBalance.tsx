// المحاسبة - ميزان المراجعة
import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Scale, TrendingUp, TrendingDown } from 'lucide-react';

const TrialBalance: React.FC = () => {
    const { settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    // حساب الأرصدة من localStorage إذا لم تكن متوفرة في context
    const trialBalanceData = useMemo(() => {
        const accountsList = JSON.parse(localStorage.getItem('chart_of_accounts') || '[]');

        let totalDebit = 0;
        let totalCredit = 0;

        const items = accountsList.map((acc: any) => {
            const debit = acc.type === 'asset' || acc.type === 'expense' ? Math.abs(acc.balance || 0) : 0;
            const credit = acc.type === 'liability' || acc.type === 'equity' || acc.type === 'revenue' ? Math.abs(acc.balance || 0) : 0;
            totalDebit += debit;
            totalCredit += credit;
            return { ...acc, debit, credit };
        });

        return { items, totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
    }, []);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div>
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'ميزان المراجعة' : 'Trial Balance'}</h2>
                <p className="text-secondary text-xs mt-1 font-bold">{language === 'ar' ? 'ملخص أرصدة الحسابات' : 'Summary of account balances'}</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center"><TrendingUp className="text-accentBlue" size={24} /></div>
                        <div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المدين' : 'Total Debit'}</p><p className="text-2xl font-black text-accentBlue">{trialBalanceData.totalDebit.toLocaleString()}</p></div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center"><TrendingDown className="text-red-500" size={24} /></div>
                        <div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الدائن' : 'Total Credit'}</p><p className="text-2xl font-black text-red-500">{trialBalanceData.totalCredit.toLocaleString()}</p></div>
                    </div>
                </div>
                <div className={`p-6 rounded-3xl border ${trialBalanceData.isBalanced ? 'bg-accentGreen/5 border-accentGreen/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${trialBalanceData.isBalanced ? 'bg-accentGreen/10' : 'bg-red-500/10'}`}><Scale className={trialBalanceData.isBalanced ? 'text-accentGreen' : 'text-red-500'} size={24} /></div>
                        <div><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'الحالة' : 'Status'}</p><p className={`text-xl font-black ${trialBalanceData.isBalanced ? 'text-accentGreen' : 'text-red-500'}`}>{trialBalanceData.isBalanced ? (language === 'ar' ? 'متوازن ✓' : 'Balanced ✓') : (language === 'ar' ? 'غير متوازن' : 'Unbalanced')}</p></div>
                    </div>
                </div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'رقم الحساب' : 'Account No.'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'اسم الحساب' : 'Account Name'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'مدين' : 'Debit'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'دائن' : 'Credit'}</th>
                    </tr></thead>
                    <tbody>
                        {trialBalanceData.items.length === 0 ? (
                            <tr><td colSpan={4} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا توجد حسابات' : 'No accounts'}</td></tr>
                        ) : (
                            trialBalanceData.items.map((acc: any) => (
                                <tr key={acc.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 font-mono text-primary">{acc.code || acc.id?.slice(-4)}</td>
                                    <td className="p-5 font-bold text-textPrimary">{language === 'ar' ? acc.nameAr : acc.nameEn || acc.name}</td>
                                    <td className="p-5 font-black text-accentBlue">{acc.debit > 0 ? acc.debit.toLocaleString() : '-'}</td>
                                    <td className="p-5 font-black text-red-500">{acc.credit > 0 ? acc.credit.toLocaleString() : '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-background/50 border-t-2 border-cardAccent">
                        <tr>
                            <td colSpan={2} className="p-5 font-black text-textPrimary">{language === 'ar' ? 'الإجمالي' : 'Total'}</td>
                            <td className="p-5 font-black text-accentBlue text-lg">{trialBalanceData.totalDebit.toLocaleString()} {currency}</td>
                            <td className="p-5 font-black text-red-500 text-lg">{trialBalanceData.totalCredit.toLocaleString()} {currency}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default TrialBalance;
