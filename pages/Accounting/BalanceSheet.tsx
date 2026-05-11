// المحاسبة - الميزانية العمومية
import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { PieChart, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const BalanceSheet: React.FC = () => {
    const { customers, suppliers, inventory, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const balanceData = useMemo(() => {
        // الأصول
        const inventoryValue = (inventory || []).reduce((sum, i) => {
            const totalQty = Object.values(i.warehouseQuantities || {}).reduce((a, b) => a + b, 0);
            return sum + (i.costPerUnit * totalQty);
        }, 0);
        const receivables = (customers || []).reduce((sum, c) => sum + Math.max(c.balance || 0, 0), 0);
        const cashBalance = JSON.parse(localStorage.getItem('cash_balance') || '0');
        const bankBalance = JSON.parse(localStorage.getItem('bank_balance') || '0');

        const totalCurrentAssets = inventoryValue + receivables + cashBalance + bankBalance;
        const totalAssets = totalCurrentAssets;

        // الالتزامات
        const payables = (suppliers || []).reduce((sum, s) => sum + Math.max(s.balance || 0, 0), 0);
        const totalCurrentLiabilities = payables;
        const totalLiabilities = totalCurrentLiabilities;

        // حقوق الملكية
        const equity = totalAssets - totalLiabilities;

        return {
            inventoryValue, receivables, cashBalance, bankBalance,
            totalCurrentAssets, totalAssets,
            payables, totalCurrentLiabilities, totalLiabilities,
            equity
        };
    }, [customers, suppliers, inventory]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div>
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet'}</h2>
                <p className="text-secondary text-xs mt-1 font-bold">{language === 'ar' ? 'المركز المالي للمنشأة' : 'Financial position statement'}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* الأصول */}
                <div className="bg-surface rounded-[32px] border border-cardAccent p-8">
                    <h3 className="text-xl font-black text-accentGreen mb-6 flex items-center gap-3"><TrendingUp size={24} />{language === 'ar' ? 'الأصول' : 'Assets'}</h3>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-secondary mb-3">{language === 'ar' ? 'الأصول المتداولة' : 'Current Assets'}</h4>
                            <div className="space-y-3 bg-background rounded-2xl p-4">
                                <div className="flex justify-between"><span className="text-textPrimary">{language === 'ar' ? 'النقدية' : 'Cash'}</span><span className="font-bold">{balanceData.cashBalance.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-textPrimary">{language === 'ar' ? 'البنوك' : 'Banks'}</span><span className="font-bold">{balanceData.bankBalance.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-textPrimary">{language === 'ar' ? 'الذمم المدينة' : 'Receivables'}</span><span className="font-bold">{balanceData.receivables.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-textPrimary">{language === 'ar' ? 'المخزون' : 'Inventory'}</span><span className="font-bold">{balanceData.inventoryValue.toLocaleString()}</span></div>
                                <div className="border-t border-cardAccent pt-3 flex justify-between font-black">
                                    <span>{language === 'ar' ? 'إجمالي الأصول المتداولة' : 'Total Current Assets'}</span>
                                    <span className="text-accentGreen">{balanceData.totalCurrentAssets.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-accentGreen/10 rounded-2xl p-4 border border-accentGreen/20">
                            <div className="flex justify-between font-black text-lg">
                                <span className="text-accentGreen">{language === 'ar' ? 'إجمالي الأصول' : 'Total Assets'}</span>
                                <span className="text-accentGreen">{balanceData.totalAssets.toLocaleString()} {currency}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* الالتزامات وحقوق الملكية */}
                <div className="bg-surface rounded-[32px] border border-cardAccent p-8">
                    <div className="space-y-6">
                        {/* الالتزامات */}
                        <div>
                            <h3 className="text-xl font-black text-red-500 mb-4 flex items-center gap-3"><TrendingDown size={24} />{language === 'ar' ? 'الالتزامات' : 'Liabilities'}</h3>
                            <div className="space-y-3 bg-background rounded-2xl p-4">
                                <h4 className="text-sm font-bold text-secondary">{language === 'ar' ? 'الالتزامات المتداولة' : 'Current Liabilities'}</h4>
                                <div className="flex justify-between"><span className="text-textPrimary">{language === 'ar' ? 'الذمم الدائنة' : 'Payables'}</span><span className="font-bold">{balanceData.payables.toLocaleString()}</span></div>
                                <div className="border-t border-cardAccent pt-3 flex justify-between font-black">
                                    <span>{language === 'ar' ? 'إجمالي الالتزامات' : 'Total Liabilities'}</span>
                                    <span className="text-red-500">{balanceData.totalLiabilities.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* حقوق الملكية */}
                        <div>
                            <h3 className="text-xl font-black text-primary mb-4 flex items-center gap-3"><DollarSign size={24} />{language === 'ar' ? 'حقوق الملكية' : 'Equity'}</h3>
                            <div className="bg-background rounded-2xl p-4">
                                <div className="flex justify-between font-black">
                                    <span>{language === 'ar' ? 'صافي حقوق الملكية' : 'Net Equity'}</span>
                                    <span className="text-primary">{balanceData.equity.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                            <div className="flex justify-between font-black text-lg">
                                <span className="text-primary">{language === 'ar' ? 'إجمالي الالتزامات وحقوق الملكية' : 'Total Liabilities & Equity'}</span>
                                <span className="text-primary">{(balanceData.totalLiabilities + balanceData.equity).toLocaleString()} {currency}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalanceSheet;
