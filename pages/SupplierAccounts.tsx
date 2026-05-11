
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, FileDown, Search, Filter, ArrowRightLeft, 
  Landmark, User, FileText, TrendingDown, TrendingUp, CreditCard,
  Building, ChevronLeft, Download, RotateCcw
} from 'lucide-react';
import { Button, Input } from '../components/ui/Atoms';

const SupplierAccounts: React.FC = () => {
  const { purchases, treasury, suppliers, settings } = useData();
  const { t, language } = useLanguage();
  const { userRole } = useAuth();
  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

  // Filter States
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'payment'>('all');
  const [showFilters, setShowFilters] = useState(true);

  // دمج العمليات (المشتريات وسندات الصرف الخاصة بالموردين)
  const ledgerEntries = useMemo(() => {
    const entries: any[] = [];

    // إضافة فواتير الشراء
    purchases.forEach(p => {
      entries.push({
        id: p.id,
        date: p.date,
        supplierId: p.supplierId,
        supplierName: p.supplierName,
        type: 'invoice',
        description: `فاتورة شراء #${p.invoiceNumber}`,
        debit: p.totalAmount, // مديونية جديدة
        credit: 0,
        performedBy: p.performedBy
      });
    });

    // إضافة سندات صرف سداد المديونية
    treasury.filter(t => t.category === 'debt_payment').forEach(trx => {
      entries.push({
        id: trx.id,
        date: trx.date,
        supplierId: trx.referenceId,
        supplierName: suppliers.find(s => s.id === trx.referenceId)?.name || 'مورد مجهول',
        type: 'payment',
        description: trx.description,
        debit: 0,
        credit: trx.amount, // سداد مديونية
        performedBy: trx.performedBy
      });
    });

    // تطبيق الفلاتر
    return entries.filter(e => {
      const matchesSupplier = selectedSupplierId === 'all' || e.supplierId === selectedSupplierId;
      const matchesType = typeFilter === 'all' || e.type === typeFilter;
      const entryDate = e.date.split('T')[0];
      const matchesDateFrom = !dateFrom || entryDate >= dateFrom;
      const matchesDateTo = !dateTo || entryDate <= dateTo;

      return matchesSupplier && matchesType && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases, treasury, suppliers, selectedSupplierId, typeFilter, dateFrom, dateTo]);

  // إحصائيات الفترة المفلترة
  const stats = useMemo(() => {
    const totalPurchases = ledgerEntries.reduce((acc, e) => acc + e.debit, 0);
    const totalPayments = ledgerEntries.reduce((acc, e) => acc + e.credit, 0);
    const netBalance = totalPurchases - totalPayments;
    return { totalPurchases, totalPayments, netBalance };
  }, [ledgerEntries]);

  const resetFilters = () => {
    setSelectedSupplierId('all');
    setDateFrom('');
    setDateTo('');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-8 pb-12 font-cairo animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-3xl font-black text-textPrimary">{t('supplierAccounts')}</h2>
            <p className="text-secondary text-xs mt-1 font-bold">متابعة دقيقة لجميع الفواتير والمدفوعات والمستحقات</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all font-black text-sm ${showFilters ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-cardAccent text-secondary hover:text-textPrimary'}`}
          >
             <Filter size={18} /> {showFilters ? 'إخفاء الفلاتر' : 'تفعيل الفلترة'}
          </button>
          <button className="flex items-center gap-2 bg-surface text-secondary border border-cardAccent px-6 py-3 rounded-2xl hover:text-textPrimary transition-all font-black text-sm shadow-sm">
             <Download size={18} /> {t('export')}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-surface p-6 md:p-8 rounded-[32px] border border-cardAccent shadow-2xl space-y-6 no-print animate-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">المورد المستهدف</label>
                    <select 
                      className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold outline-none focus:border-primary/50 transition-all"
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                    >
                        <option value="all">جميع الموردين</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">من تاريخ</label>
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-[56px]" />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">إلى تاريخ</label>
                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-[56px]" />
                </div>

                <div className="flex items-end">
                    <Button variant="outline" fullWidth onClick={resetFilters} className="h-[56px] gap-2 border-dashed border-cardAccent hover:text-red-500 hover:border-red-500/50">
                        <RotateCcw size={16} /> إعادة ضبط
                    </Button>
                </div>
            </div>

            <div className="flex bg-background p-1.5 rounded-2xl border border-cardAccent w-fit">
                {[
                  { id: 'all', label: 'كل العمليات' },
                  { id: 'invoice', label: 'فواتير مشتريات' },
                  { id: 'payment', label: 'سندات صرف' }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setTypeFilter(tab.id as any)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${typeFilter === tab.id ? 'bg-primary text-white shadow-lg shadow-orange-900/10' : 'text-secondary hover:text-textPrimary'}`}
                  >
                    {tab.label}
                  </button>
                ))}
            </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-8 rounded-[32px] border border-cardAccent relative overflow-hidden group shadow-sm">
              <div className="relative z-10">
                  <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">إجمالي فواتير الفترة</p>
                  <h3 className="text-3xl font-black text-red-500">{stats.totalPurchases.toLocaleString()} <span className="text-sm font-bold opacity-50">{currency}</span></h3>
              </div>
              <TrendingDown size={80} className="absolute -bottom-4 -left-4 text-red-500 opacity-[0.03] rotate-12" />
          </div>
          <div className="bg-surface p-8 rounded-[32px] border border-cardAccent relative overflow-hidden group shadow-sm">
              <div className="relative z-10">
                  <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">إجمالي المدفوعات (السداد)</p>
                  <h3 className="text-3xl font-black text-accentGreen">{stats.totalPayments.toLocaleString()} <span className="text-sm font-bold opacity-50">{currency}</span></h3>
              </div>
              <TrendingUp size={80} className="absolute -bottom-4 -left-4 text-accentGreen opacity-[0.03] rotate-12" />
          </div>
          <div className="bg-surface p-8 rounded-[32px] border border-cardAccent relative overflow-hidden group shadow-sm">
              <div className="relative z-10">
                  <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">صافي التغير في المديونية</p>
                  <h3 className={`text-3xl font-black ${stats.netBalance >= 0 ? 'text-primary' : 'text-accentGreen'}`}>{Math.abs(stats.netBalance).toLocaleString()} <span className="text-sm font-bold opacity-50">{currency}</span></h3>
              </div>
              <Landmark size={80} className="absolute -bottom-4 -left-4 text-primary opacity-[0.03] rotate-12" />
          </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                  <thead className="text-[10px] text-secondary uppercase bg-background/50 border-b border-cardAccent">
                      <tr>
                          <th className="px-8 py-6 font-black tracking-widest">التاريخ / الموظف</th>
                          <th className="px-8 py-6 font-black tracking-widest">المورد</th>
                          <th className="px-8 py-6 font-black tracking-widest text-center">نوع العملية</th>
                          <th className="px-8 py-6 font-black tracking-widest text-left">مدين (فاتورة +)</th>
                          <th className="px-8 py-6 font-black tracking-widest text-left">دائن (سداد -)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-cardAccent">
                      {ledgerEntries.length === 0 ? (
                          <tr>
                              <td colSpan={5} className="text-center py-32">
                                  <div className="flex flex-col items-center opacity-30">
                                      <Building size={64} className="mb-4 text-secondary" />
                                      <p className="font-black text-lg italic text-textPrimary">لا توجد عمليات مسجلة مطابقة لهذه الفلاتر</p>
                                  </div>
                              </td>
                          </tr>
                      ) : (
                          ledgerEntries.map(entry => (
                              <tr key={entry.id} className="hover:bg-background/40 transition-colors group">
                                  <td className="px-8 py-6">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-secondary border border-cardAccent group-hover:border-primary/30 transition-all shadow-sm">
                                              <Calendar size={18} />
                                          </div>
                                          <div>
                                              <p className="font-black text-textPrimary">{new Date(entry.date).toLocaleDateString()}</p>
                                              <div className="flex items-center gap-1.5 mt-0.5">
                                                  <User size={10} className="text-primary" />
                                                  <span className="text-[10px] text-secondary font-bold truncate max-w-[100px]">{entry.performedBy?.name || 'النظام'}</span>
                                              </div>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-8 py-6">
                                      <div className="flex flex-col">
                                          <span className="font-black text-textPrimary">{entry.supplierName}</span>
                                          <span className="text-[10px] text-secondary font-bold opacity-70 italic">{entry.description}</span>
                                      </div>
                                  </td>
                                  <td className="px-8 py-6 text-center">
                                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-2 ${entry.type === 'invoice' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-accentGreen/10 text-accentGreen border border-accentGreen/20'}`}>
                                          {entry.type === 'invoice' ? <FileText size={12}/> : <CreditCard size={12}/>}
                                          {entry.type === 'invoice' ? 'فاتورة مشتريات' : 'سند سداد'}
                                      </span>
                                  </td>
                                  <td className="px-8 py-6 text-left">
                                      {entry.debit > 0 ? (
                                          <span className="text-lg font-black text-red-500">+{entry.debit.toLocaleString()}</span>
                                      ) : (
                                          <span className="text-secondary opacity-20">-</span>
                                      )}
                                  </td>
                                  <td className="px-8 py-6 text-left">
                                      {entry.credit > 0 ? (
                                          <span className="text-lg font-black text-accentGreen">-{entry.credit.toLocaleString()}</span>
                                      ) : (
                                          <span className="text-secondary opacity-20">-</span>
                                      )}
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      <div className="p-8 bg-surface rounded-[32px] border-2 border-dashed border-cardAccent flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
          <div className="space-y-1">
              <h4 className="text-xl font-black text-textPrimary">ملخص مديونية الموردين الإجمالية</h4>
              <p className="text-secondary text-sm font-bold">بناءً على جميع الفواتير المسجلة بالسيستم</p>
          </div>
          <div className="flex items-center gap-8">
              <div className="text-center">
                  <p className="text-[10px] text-secondary font-black uppercase mb-1">المستحقات الحالية</p>
                  <p className="text-3xl font-black text-red-500">{(suppliers.reduce((s, sup) => s + sup.balance, 0)).toLocaleString()} <span className="text-sm">{currency}</span></p>
              </div>
              <ChevronLeft size={32} className="text-cardAccent rotate-180 md:rotate-0" />
              <button 
                onClick={() => window.print()}
                className="bg-primary text-background px-10 py-5 rounded-2xl font-black text-lg shadow-xl glow-primary active:scale-95 transition-all flex items-center gap-3"
              >
                  <Download size={24} /> طباعة كشف الحساب
              </button>
          </div>
      </div>
    </div>
  );
};

export default SupplierAccounts;
