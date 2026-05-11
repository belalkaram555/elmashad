
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Trash2, Phone, Truck, DollarSign, MapPin, 
  UserPlus, XCircle, Search, Edit3, CreditCard, 
  ArrowUpRight, Landmark, Building, Filter, FileText,
  RotateCcw, Download, ChevronLeft, Calendar, User, TrendingUp, TrendingDown
} from 'lucide-react';
import { Supplier } from '../types';
import { Button, Input } from '../components/ui/Atoms';

type SupplierTab = 'directory' | 'ledger';

const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, addTransaction, settings, purchases, treasury } = useData();
  const { t, language } = useLanguage();
  const { user, userRole } = useAuth();
  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;
  
  const [activeTab, setActiveTab] = useState<SupplierTab>('directory');
  
  // States for Directory Tab
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formSupplier, setFormSupplier] = useState<Partial<Supplier>>({ name: '', phone: '', address: '', companyName: '', balance: 0 });
  const [payModal, setPayModal] = useState<{show: boolean, supplier?: Supplier}>({show: false});
  const [payAmount, setPayAmount] = useState<number>(0);

  // States for Ledger Tab
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'payment'>('all');
  const [showFilters, setShowFilters] = useState(true);

  // --- Directory Logic ---
  const totalDebts = useMemo(() => suppliers.reduce((sum, s) => sum + s.balance, 0), [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.phone.includes(searchQuery) ||
      (s.companyName && s.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [suppliers, searchQuery]);

  const handleOpenAdd = () => {
    setFormSupplier({ name: '', phone: '', address: '', companyName: '', balance: 0 });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setFormSupplier(s);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSave = () => {
      if(!formSupplier.name) {
          alert(language === 'ar' ? 'يرجى إدخال اسم المورد' : 'Please enter supplier name');
          return;
      }
      if (isEdit && formSupplier.id) {
        updateSupplier(formSupplier as Supplier);
      } else {
        addSupplier({ 
            ...formSupplier,
            id: Date.now().toString(),
            balance: Number(formSupplier.balance || 0)
        } as Supplier);
      }
      setShowModal(false);
  };

  const handlePayDebt = () => {
      if(!payModal.supplier || payAmount <= 0) return;
      const updatedBalance = payModal.supplier.balance - payAmount;
      updateSupplier({ ...payModal.supplier, balance: updatedBalance });
      addTransaction({ 
          id: Date.now().toString(), 
          type: 'expense', 
          category: 'debt_payment', 
          amount: payAmount, 
          date: new Date().toISOString(), 
          description: `سداد مديونية للمورد: ${payModal.supplier.name}`, 
          referenceId: payModal.supplier.id,
          performedBy: { name: user || 'Sys', role: userRole || 'Admin' }
      });
      setPayModal({show: false});
      setPayAmount(0);
  };

  // --- Ledger Logic ---
  const ledgerEntries = useMemo(() => {
    const entries: any[] = [];
    purchases.forEach(p => {
      entries.push({
        id: p.id,
        date: p.date,
        supplierId: p.supplierId,
        supplierName: p.supplierName,
        type: 'invoice',
        description: `فاتورة شراء #${p.invoiceNumber}`,
        debit: p.totalAmount,
        credit: 0,
        performedBy: p.performedBy
      });
    });
    treasury.filter(t => t.category === 'debt_payment').forEach(trx => {
      entries.push({
        id: trx.id,
        date: trx.date,
        supplierId: trx.referenceId,
        supplierName: suppliers.find(s => s.id === trx.referenceId)?.name || 'مورد مجهول',
        type: 'payment',
        description: trx.description,
        debit: 0,
        credit: trx.amount,
        performedBy: trx.performedBy
      });
    });
    return entries.filter(e => {
      const matchesSupplier = selectedSupplierId === 'all' || e.supplierId === selectedSupplierId;
      const matchesType = typeFilter === 'all' || e.type === typeFilter;
      const entryDate = e.date.split('T')[0];
      const matchesDateFrom = !dateFrom || entryDate >= dateFrom;
      const matchesDateTo = !dateTo || entryDate <= dateTo;
      return matchesSupplier && matchesType && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases, treasury, suppliers, selectedSupplierId, typeFilter, dateFrom, dateTo]);

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
      {/* Header & Tabs */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
            <h2 className="text-3xl font-black text-textPrimary">{t('suppliers')}</h2>
            <p className="text-secondary text-xs mt-1 font-bold">إدارة الموردين والعمليات الحسابية المرتبطة بهم</p>
        </div>
        
        <div className="flex gap-2 bg-surface p-1.5 rounded-[22px] border border-cardAccent shadow-sm">
           <button 
             onClick={() => setActiveTab('directory')}
             className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'directory' ? 'bg-primary text-background shadow-lg' : 'text-secondary hover:text-textPrimary'}`}
           >
              دليل الموردين
           </button>
           <button 
             onClick={() => setActiveTab('ledger')}
             className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'ledger' ? 'bg-primary text-background shadow-lg' : 'text-secondary hover:text-textPrimary'}`}
           >
              كشوف الحسابات
           </button>
        </div>

        {activeTab === 'directory' && (
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary text-background px-8 py-4 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm shadow-xl">
              <UserPlus size={20} /> {t('add')}
          </button>
        )}
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Summary Stat Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-surface p-8 rounded-[32px] border border-cardAccent relative overflow-hidden group">
                  <div className="relative z-10">
                      <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">إجمالي المستحقات للموردين</p>
                      <h3 className="text-3xl font-black text-red-500">{totalDebts.toLocaleString()} <span className="text-sm font-bold opacity-50">{currency}</span></h3>
                  </div>
                  <Landmark size={80} className="absolute -bottom-4 -left-4 text-textPrimary opacity-[0.03] rotate-12" />
              </div>
              
              <div className="md:col-span-2 bg-surface p-6 rounded-[32px] border border-cardAccent flex items-center px-8">
                  <div className="relative flex-1">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                      <input 
                        type="text" 
                        placeholder="البحث عن مورد بالاسم، الشركة أو رقم الهاتف..." 
                        className="w-full pr-12 pl-4 py-4 bg-background border border-cardAccent rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-bold text-textPrimary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
              </div>
          </div>

          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSuppliers.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-surface rounded-[32px] border border-dashed border-cardAccent">
                <Truck size={48} className="mx-auto text-secondary opacity-20 mb-4" />
                <p className="text-secondary font-bold italic">لا يوجد موردين مطابقين للبحث</p>
              </div>
            ) : filteredSuppliers.map(s => (
                <div key={s.id} className="bg-surface p-8 rounded-[32px] border border-cardAccent hover:border-primary/40 transition-all group relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-start justify-between relative z-10 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-[22px] bg-background flex items-center justify-center text-primary border border-cardAccent shadow-inner">
                                <Truck size={28} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-black text-textPrimary text-lg truncate max-w-[150px]">{s.name}</h3>
                                <p className="text-[10px] text-secondary font-black uppercase tracking-tighter flex items-center gap-1">
                                    <Building size={10}/> {s.companyName || 'مورد مستقل'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setPayModal({show: true, supplier: s})} title="سداد مديونية" className="p-2.5 bg-background border border-cardAccent text-accentGreen rounded-xl hover:bg-accentGreen hover:text-white transition-all"><CreditCard size={16}/></button>
                            <button onClick={() => handleOpenEdit(s)} title="تعديل" className="p-2.5 bg-background border border-cardAccent text-accentBlue rounded-xl hover:bg-accentBlue hover:text-white transition-all"><Edit3 size={16}/></button>
                            <button onClick={() => deleteSupplier(s.id)} title="حذف" className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3 text-secondary text-xs font-bold">
                            <div className="p-2 bg-background rounded-lg border border-cardAccent"><Phone size={14}/></div>
                            <span>{s.phone || 'بدون هاتف'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-secondary text-xs font-bold">
                            <div className="p-2 bg-background rounded-lg border border-cardAccent"><MapPin size={14}/></div>
                            <span className="truncate">{s.address || 'بدون عنوان'}</span>
                        </div>

                        <div className="bg-background rounded-2xl p-4 border border-cardAccent mt-4 group-hover:border-primary/20 transition-all">
                            <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">إجمالي المديونية</p>
                            <div className="flex items-center justify-between">
                                <span className={`text-xl font-black ${s.balance > 0 ? 'text-red-500' : 'text-accentGreen'}`}>
                                    {s.balance.toLocaleString()} <span className="text-xs">{currency}</span>
                                </span>
                                {s.balance > 0 && <ArrowUpRight size={16} className="text-red-500 opacity-50 animate-pulse" />}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-left duration-500">
           {/* Ledger View Content */}
           <div className="bg-surface p-6 md:p-8 rounded-[32px] border border-cardAccent shadow-xl space-y-6">
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
                      <Button variant="outline" fullWidth onClick={resetFilters} className="h-[56px] gap-2 border-dashed border-cardAccent hover:text-red-500">
                          <RotateCcw size={16} /> إعادة ضبط
                      </Button>
                  </div>
              </div>
           </div>

           {/* Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-8 rounded-[32px] border border-cardAccent relative overflow-hidden">
                    <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">إجمالي فواتير الفترة</p>
                    <h3 className="text-3xl font-black text-red-500">{stats.totalPurchases.toLocaleString()} <span className="text-sm opacity-50">{currency}</span></h3>
                    <TrendingDown size={80} className="absolute -bottom-4 -left-4 text-red-500 opacity-[0.03]" />
                </div>
                <div className="bg-surface p-8 rounded-[32px] border border-cardAccent relative overflow-hidden">
                    <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">إجمالي المدفوعات</p>
                    <h3 className="text-3xl font-black text-accentGreen">{stats.totalPayments.toLocaleString()} <span className="text-sm opacity-50">{currency}</span></h3>
                    <TrendingUp size={80} className="absolute -bottom-4 -left-4 text-accentGreen opacity-[0.03]" />
                </div>
                <div className="bg-surface p-8 rounded-[32px] border border-cardAccent relative overflow-hidden">
                    <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">صافي التغير</p>
                    <h3 className={`text-3xl font-black ${stats.netBalance >= 0 ? 'text-primary' : 'text-accentGreen'}`}>{Math.abs(stats.netBalance).toLocaleString()} <span className="text-sm opacity-50">{currency}</span></h3>
                    <Landmark size={80} className="absolute -bottom-4 -left-4 text-primary opacity-[0.03]" />
                </div>
           </div>

           {/* Ledger Table */}
           <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                      <thead className="text-[10px] text-secondary uppercase bg-background/50 border-b border-cardAccent">
                          <tr>
                              <th className="px-8 py-6 font-black tracking-widest">التاريخ / المسؤول</th>
                              <th className="px-8 py-6 font-black tracking-widest">المورد / البيان</th>
                              <th className="px-8 py-6 font-black tracking-widest text-center">النوع</th>
                              <th className="px-8 py-6 font-black tracking-widest text-left">مدين (+)</th>
                              <th className="px-8 py-6 font-black tracking-widest text-left">دائن (-)</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-cardAccent">
                          {ledgerEntries.length === 0 ? (
                              <tr><td colSpan={5} className="py-20 text-center text-secondary font-bold opacity-30 italic">لا توجد عمليات مسجلة</td></tr>
                          ) : ledgerEntries.map(entry => (
                              <tr key={entry.id} className="hover:bg-background/40 transition-colors">
                                  <td className="px-8 py-6">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-secondary border border-cardAccent"><Calendar size={18} /></div>
                                          <div>
                                              <p className="font-black text-textPrimary">{entry.date}</p>
                                              <p className="text-[10px] text-secondary flex items-center gap-1"><User size={10} className="text-primary"/> {entry.performedBy?.name || 'Sys'}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-8 py-6">
                                      <p className="font-black text-textPrimary">{entry.supplierName}</p>
                                      <p className="text-[10px] text-secondary italic opacity-70">{entry.description}</p>
                                  </td>
                                  <td className="px-8 py-6 text-center">
                                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-2 ${entry.type === 'invoice' ? 'bg-red-500/10 text-red-500' : 'bg-accentGreen/10 text-accentGreen'}`}>
                                          {entry.type === 'invoice' ? 'فاتورة' : 'سند سداد'}
                                      </span>
                                  </td>
                                  <td className="px-8 py-6 text-left font-black text-red-500">{entry.debit > 0 ? `+${entry.debit.toLocaleString()}` : '-'}</td>
                                  <td className="px-8 py-6 text-left font-black text-accentGreen">{entry.credit > 0 ? `-${entry.credit.toLocaleString()}` : '-'}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
           </div>
        </div>
      )}

      {/* --- Common Modals --- */}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
            <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-xl shadow-2xl p-10 animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-textPrimary">{isEdit ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</h3>
                    <button onClick={() => setShowModal(false)} className="text-secondary hover:text-textPrimary transition-colors"><XCircle size={32}/></button>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('name')}</label>
                            <input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formSupplier.name} onChange={e => setFormSupplier({...formSupplier, name: e.target.value})} placeholder="اسم المورد" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">اسم الشركة</label>
                            <input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formSupplier.companyName} onChange={e => setFormSupplier({...formSupplier, companyName: e.target.value})} placeholder="اختياري" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('phone')}</label>
                            <input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formSupplier.phone} onChange={e => setFormSupplier({...formSupplier, phone: e.target.value})} placeholder="01XXXXXXXXX" />
                        </div>
                        {!isEdit && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">رصيد افتتاحي</label>
                                <input type="number" className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-black" value={formSupplier.balance} onChange={e => setFormSupplier({...formSupplier, balance: Number(e.target.value)})} />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('address')}</label>
                        <input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formSupplier.address} onChange={e => setFormSupplier({...formSupplier, address: e.target.value})} />
                    </div>
                    <button onClick={handleSave} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform">
                        {isEdit ? 'تحديث البيانات' : 'حفظ بيانات المورد'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {payModal.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
            <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-md shadow-2xl p-10 animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black text-textPrimary">{t('payDebt')}</h3>
                    <button onClick={() => setPayModal({show: false})} className="text-secondary hover:text-textPrimary transition-colors"><XCircle size={24}/></button>
                </div>
                <div className="mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                    <p className="text-lg font-black text-textPrimary">{payModal.supplier?.name}</p>
                    <div className="mt-2 text-xs font-black text-red-500">الرصيد المستحق: {payModal.supplier?.balance.toLocaleString()} {currency}</div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">المبلغ المسدد</label>
                        <div className="relative">
                            <input type="number" autoFocus className="w-full p-6 bg-background border border-cardAccent rounded-2xl text-textPrimary font-black text-3xl text-center" value={payAmount || ''} onChange={e => setPayAmount(Number(e.target.value))} />
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary font-black">{currency}</span>
                        </div>
                    </div>
                    <button onClick={handlePayDebt} className="w-full bg-accentGreen text-white py-6 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all">تأكيد السداد</button>
                    <button onClick={() => setPayModal({show: false})} className="w-full text-secondary text-sm font-bold py-2">إلغاء</button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default Suppliers;
