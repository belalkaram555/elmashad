
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Trash2, Phone, DollarSign, MapPin, XCircle, UserPlus, Search, LayoutGrid, List, FileDown } from 'lucide-react';
import { Customer } from '../types';
import * as XLSX from 'xlsx';

const Customers: React.FC = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer, addTransaction, settings } = useData();
    const { t, language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [formCustomer, setFormCustomer] = useState({ name: '', phone: '', address: '', balance: 0 });
    const [payModal, setPayModal] = useState<{ show: boolean, customer?: Customer }>({ show: false });
    const [payAmount, setPayAmount] = useState(0);

    const handleAdd = () => {
        if (!formCustomer.name) {
            alert(language === 'ar' ? 'يرجى إدخال اسم العميل' : 'Please enter customer name');
            return;
        }
        addCustomer({
            id: Date.now().toString(),
            name: formCustomer.name,
            phone: formCustomer.phone,
            address: formCustomer.address,
            balance: Number(formCustomer.balance),
            createdAt: new Date().toISOString(),
        });
        setShowModal(false);
        setFormCustomer({ name: '', phone: '', address: '', balance: 0 });
    };

    const filteredCustomers = customers.filter((c) => {
        const customerDate = (c.createdAt || '').split('T')[0];
        const matchesSearch =
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.address || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFrom = !dateFrom || (!!customerDate && customerDate >= dateFrom);
        const matchesTo = !dateTo || (!!customerDate && customerDate <= dateTo);
        return matchesSearch && matchesFrom && matchesTo;
    });

    const exportCustomersExcel = () => {
        const rows = filteredCustomers.map((c) => ({
            'الاسم': c.name,
            'الهاتف': c.phone || '-',
            'العنوان': c.address || '-',
            'الرصيد': c.balance,
            'تاريخ الإنشاء': c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-EG') : '-',
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 30 }, { wch: 14 }, { wch: 16 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'العملاء');
        XLSX.writeFile(wb, `customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handlePayDebt = () => {
        if (!payModal.customer || payAmount <= 0) return;
        updateCustomer({ ...payModal.customer, balance: payModal.customer.balance - payAmount });
        addTransaction({ id: Date.now().toString(), type: 'income', category: 'debt_payment', amount: payAmount, date: new Date().toISOString(), description: `سداد دين من العميل ${payModal.customer.name}`, referenceId: payModal.customer.id });
        setPayModal({ show: false });
        setPayAmount(0);
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-white">{t('customers')}</h2>
                    <p className="text-secondary text-xs mt-1 font-bold">إدارة قاعدة العملاء وتتبع المديونيات</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={exportCustomersExcel} className="flex items-center gap-2 bg-surface text-secondary border border-cardAccent px-4 py-3 rounded-2xl hover:text-accentGreen transition-all font-black text-sm">
                        <FileDown size={16} className="text-accentGreen" /> تصدير إكسيل
                    </button>
                    {/* View Mode Toggle */}
                    <div className="flex bg-surface rounded-xl border border-cardAccent p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
                            title="عرض شبكي"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
                            title="عرض قائمة"
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-8 py-3.5 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <UserPlus size={20} /> {t('add')}
                    </button>
                </div>
            </div>

            <div className="bg-surface p-4 rounded-3xl border border-cardAccent grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <div className="relative md:col-span-2">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        className="w-full pr-10 pl-3 py-3 bg-background border border-cardAccent rounded-xl text-sm font-bold text-textPrimary outline-none"
                        placeholder="بحث باسم العميل أو الهاتف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <input type="date" className="px-3 py-3 bg-background border border-cardAccent rounded-xl text-sm font-bold text-textPrimary outline-none" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <input type="date" className="px-3 py-3 bg-background border border-cardAccent rounded-xl text-sm font-bold text-textPrimary outline-none" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCustomers.map(c => (
                        <div key={c.id} className="bg-surface p-8 rounded-[32px] border border-white/5 hover:border-primary/40 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[22px] bg-background flex items-center justify-center font-black text-2xl text-primary border border-white/5">
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-lg">{c.name}</h3>
                                        <p className="text-xs text-secondary font-bold flex items-center gap-1"><Phone size={12} /> {c.phone || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setPayModal({ show: true, customer: c })} className="p-2.5 bg-background border border-white/5 text-accentGreen rounded-xl hover:bg-accentGreen hover:text-background transition-all"><DollarSign size={16} /></button>
                                    <button onClick={() => deleteCustomer(c.id)} className="p-2.5 bg-background border border-white/5 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="bg-background rounded-2xl p-4 border border-white/5 relative z-10">
                                <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">{t('balance')}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`text-xl font-black ${c.balance > 0 ? 'text-red-500' : 'text-accentGreen'}`}>
                                        {c.balance.toLocaleString()} <span className="text-xs">{currency}</span>
                                    </span>
                                    <MapPin size={16} className="text-secondary opacity-30" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden animate-in fade-in duration-500">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cardAccent bg-background/50">
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">العميل</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">الهاتف</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">العنوان</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">الرصيد</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(c => (
                                <tr key={c.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center font-black text-lg text-primary border border-cardAccent">
                                                {c.name.charAt(0)}
                                            </div>
                                            <span className="font-black text-textPrimary">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-secondary font-bold">{c.phone || '-'}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-secondary font-bold">{c.address || '-'}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`font-black ${c.balance > 0 ? 'text-red-500' : 'text-accentGreen'}`}>
                                            {c.balance.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-secondary mr-1">{currency}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => setPayModal({ show: true, customer: c })} className="p-2.5 bg-background border border-cardAccent text-accentGreen rounded-lg hover:bg-accentGreen hover:text-white transition-all"><DollarSign size={14} /></button>
                                            <button onClick={() => deleteCustomer(c.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Customer Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-md shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-white">{language === 'ar' ? 'إضافة عميل جديد' : 'Add New Customer'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-secondary hover:text-white transition-colors"><XCircle size={32} /></button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('name')}</label>
                                <input
                                    className="w-full p-4 bg-background border border-white/5 rounded-2xl text-white font-bold"
                                    value={formCustomer.name}
                                    onChange={e => setFormCustomer({ ...formCustomer, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('phone')}</label>
                                <input
                                    className="w-full p-4 bg-background border border-white/5 rounded-2xl text-white font-bold"
                                    value={formCustomer.phone}
                                    onChange={e => setFormCustomer({ ...formCustomer, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('address')}</label>
                                <input
                                    className="w-full p-4 bg-background border border-white/5 rounded-2xl text-white font-bold"
                                    value={formCustomer.address}
                                    onChange={e => setFormCustomer({ ...formCustomer, address: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                حفظ بيانات العميل
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pay Modal */}
            {payModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-md shadow-2xl p-10">
                        <h3 className="text-2xl font-black text-white mb-2">{t('payDebt')}</h3>
                        <p className="text-secondary text-xs mb-8">{payModal.customer?.name}</p>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">{t('amount')}</label>
                                <input type="number" className="w-full p-5 bg-background border border-white/5 rounded-2xl text-white font-black text-2xl" value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} />
                            </div>
                            <button onClick={handlePayDebt} className="w-full bg-accentGreen text-background py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all">تأكيد السداد</button>
                            <button onClick={() => setPayModal({ show: false })} className="w-full text-secondary text-sm font-bold">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
