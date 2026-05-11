// الفواتير - مرتجعات المبيعات
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { RotateCcw, Search, Plus, XCircle, Calendar } from 'lucide-react';

interface SalesReturn { id: string; date: string; originalInvoice: string; customerId: string; customerName: string; items: { itemId: string; name: string; qty: number; price: number }[]; total: number; reason: string; }

const SalesReturns: React.FC = () => {
    const { customers, inventory, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [returns, setReturns] = useState<SalesReturn[]>(() => JSON.parse(localStorage.getItem('sales_returns') || '[]'));
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ originalInvoice: '', customerId: '', itemId: '', qty: 1, reason: '' });

    const save = (data: SalesReturn[]) => { localStorage.setItem('sales_returns', JSON.stringify(data)); setReturns(data); };

    const handleAdd = () => {
        const customer = customers.find(c => c.id === formData.customerId);
        const item = inventory.find(i => i.id === formData.itemId);
        if (!customer || !item || formData.qty <= 0) return;

        const itemName = language === 'ar' ? item.nameAr : item.nameEn;
        const itemPrice = item.costPerUnit;

        const newReturn: SalesReturn = {
            id: Date.now().toString(), date: new Date().toISOString().split('T')[0],
            originalInvoice: formData.originalInvoice, customerId: customer.id, customerName: customer.name,
            items: [{ itemId: item.id, name: itemName, qty: formData.qty, price: itemPrice }],
            total: itemPrice * formData.qty, reason: formData.reason
        };
        save([...returns, newReturn]);
        setShowModal(false); setFormData({ originalInvoice: '', customerId: '', itemId: '', qty: 1, reason: '' });
    };

    const filtered = returns.filter(r => r.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const stats = useMemo(() => ({ total: returns.length, amount: returns.reduce((s, r) => s + r.total, 0) }), [returns]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'مرتجعات المبيعات' : 'Sales Returns'}</h2>
                <div className="flex gap-3">
                    <div className="relative"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} /><input type="text" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary w-48" /></div>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl glow-primary font-black text-sm"><Plus size={20} />{language === 'ar' ? 'مرتجع جديد' : 'New Return'}</button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد المرتجعات' : 'Total Returns'}</p><p className="text-2xl font-black text-textPrimary">{stats.total}</p></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المبلغ' : 'Total Amount'}</p><p className="text-2xl font-black text-red-500">{stats.amount.toLocaleString()} {currency}</p></div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الصنف' : 'Item'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'السبب' : 'Reason'}</th>
                    </tr></thead>
                    <tbody>
                        {filtered.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا توجد مرتجعات' : 'No returns'}</td></tr> :
                            filtered.map(r => (
                                <tr key={r.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 text-secondary">{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                                    <td className="p-5 font-bold text-textPrimary">{r.customerName}</td>
                                    <td className="p-5 text-textPrimary">{r.items[0]?.name}</td>
                                    <td className="p-5">{r.items[0]?.qty}</td>
                                    <td className="p-5 font-black text-red-500">{r.total.toLocaleString()} {currency}</td>
                                    <td className="p-5 text-secondary text-sm">{r.reason}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10">
                    <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-textPrimary">{language === 'ar' ? 'مرتجع جديد' : 'New Return'}</h3><button onClick={() => setShowModal(false)} className="text-secondary"><XCircle size={32} /></button></div>
                    <div className="space-y-4">
                        <select className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })}><option value="">{language === 'ar' ? 'اختر العميل' : 'Select Customer'}</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        <select className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.itemId} onChange={e => setFormData({ ...formData, itemId: e.target.value })}><option value="">{language === 'ar' ? 'اختر الصنف' : 'Select Item'}</option>{inventory.map(i => <option key={i.id} value={i.id}>{language === 'ar' ? i.nameAr : i.nameEn}</option>)}</select>
                        <input type="number" min={1} placeholder={language === 'ar' ? 'الكمية' : 'Quantity'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.qty} onChange={e => setFormData({ ...formData, qty: Number(e.target.value) })} />
                        <input placeholder={language === 'ar' ? 'سبب الإرجاع' : 'Return Reason'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                        <button onClick={handleAdd} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary">{language === 'ar' ? 'إضافة' : 'Add'}</button>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default SalesReturns;
