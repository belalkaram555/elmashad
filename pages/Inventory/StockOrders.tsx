// المخزون - أذونات المخزن
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { ClipboardList, Plus, Search, XCircle, CheckCircle } from 'lucide-react';

interface StockOrder { id: string; date: string; type: 'add' | 'issue' | 'transfer'; items: { itemId: string; itemName: string; qty: number }[]; status: 'pending' | 'approved'; notes?: string; }

const StockOrders: React.FC = () => {
    const { inventory } = useData();
    const { language } = useLanguage();

    const [orders, setOrders] = useState<StockOrder[]>(() => JSON.parse(localStorage.getItem('stock_orders') || '[]'));
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ type: 'add' as const, itemId: '', qty: 0, notes: '' });

    const save = (data: StockOrder[]) => { localStorage.setItem('stock_orders', JSON.stringify(data)); setOrders(data); };

    const handleAdd = () => {
        const item = inventory.find(i => i.id === formData.itemId);
        if (!item || formData.qty <= 0) return;
        const itemName = language === 'ar' ? item.nameAr : item.nameEn;
        save([...orders, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], type: formData.type, items: [{ itemId: item.id, itemName, qty: formData.qty }], status: 'pending', notes: formData.notes }]);
        setShowModal(false); setFormData({ type: 'add', itemId: '', qty: 0, notes: '' });
    };

    const approve = (id: string) => save(orders.map(o => o.id === id ? { ...o, status: 'approved' } : o));

    const stats = useMemo(() => ({ total: orders.length, pending: orders.filter(o => o.status === 'pending').length }), [orders]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'أذونات المخزن' : 'Stock Orders'}</h2>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl glow-primary font-black text-sm"><Plus size={20} />{language === 'ar' ? 'إذن جديد' : 'New Order'}</button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الأذونات' : 'Total Orders'}</p><p className="text-2xl font-black text-textPrimary">{stats.total}</p></div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'في الانتظار' : 'Pending'}</p><p className="text-2xl font-black text-primary">{stats.pending}</p></div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'النوع' : 'Type'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الصنف' : 'Item'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'اعتماد' : 'Approve'}</th>
                    </tr></thead>
                    <tbody>
                        {orders.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا توجد أذونات' : 'No orders'}</td></tr> :
                            orders.map(o => (
                                <tr key={o.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 text-secondary">{new Date(o.date).toLocaleDateString('ar-EG')}</td>
                                    <td className="p-5 text-center"><span className={`px-3 py-1 rounded-full text-xs font-black ${o.type === 'add' ? 'bg-accentGreen/10 text-accentGreen' : o.type === 'issue' ? 'bg-red-500/10 text-red-500' : 'bg-accentBlue/10 text-accentBlue'}`}>{o.type === 'add' ? (language === 'ar' ? 'إضافة' : 'Add') : o.type === 'issue' ? (language === 'ar' ? 'صرف' : 'Issue') : (language === 'ar' ? 'تحويل' : 'Transfer')}</span></td>
                                    <td className="p-5 text-textPrimary">{o.items[0]?.itemName}</td>
                                    <td className="p-5 font-black">{o.items[0]?.qty}</td>
                                    <td className="p-5 text-center"><span className={`px-3 py-1 rounded-full text-xs font-black ${o.status === 'approved' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-primary/10 text-primary'}`}>{o.status === 'approved' ? (language === 'ar' ? 'معتمد' : 'Approved') : (language === 'ar' ? 'معلق' : 'Pending')}</span></td>
                                    <td className="p-5 text-center">{o.status === 'pending' && <button onClick={() => approve(o.id)} className="p-2 bg-accentGreen/10 text-accentGreen rounded-lg"><CheckCircle size={16} /></button>}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10">
                    <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-textPrimary">{language === 'ar' ? 'إذن جديد' : 'New Order'}</h3><button onClick={() => setShowModal(false)} className="text-secondary"><XCircle size={32} /></button></div>
                    <div className="space-y-4">
                        <select className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}><option value="add">{language === 'ar' ? 'إذن إضافة' : 'Add'}</option><option value="issue">{language === 'ar' ? 'إذن صرف' : 'Issue'}</option><option value="transfer">{language === 'ar' ? 'إذن تحويل' : 'Transfer'}</option></select>
                        <select className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.itemId} onChange={e => setFormData({ ...formData, itemId: e.target.value })}><option value="">{language === 'ar' ? 'اختر الصنف' : 'Select Item'}</option>{inventory.map(i => <option key={i.id} value={i.id}>{language === 'ar' ? i.nameAr : i.nameEn}</option>)}</select>
                        <input type="number" placeholder={language === 'ar' ? 'الكمية' : 'Quantity'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.qty || ''} onChange={e => setFormData({ ...formData, qty: Number(e.target.value) })} />
                        <button onClick={handleAdd} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary">{language === 'ar' ? 'إضافة' : 'Add'}</button>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default StockOrders;
