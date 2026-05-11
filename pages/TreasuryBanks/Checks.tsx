// @ts-nocheck
// الخزينة - إدارة الشيكات
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { CreditCard, Plus, Search, XCircle, CheckCircle } from 'lucide-react';

interface Check { id: string; number: string; bank: string; amount: number; date: string; dueDate: string; type: 'received' | 'issued'; status: 'pending' | 'collected' | 'bounced'; party: string; }

const CheckManagement: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [checks, setChecks] = useState<Check[]>(() => JSON.parse(localStorage.getItem('checks') || '[]'));
    const [showModal, setShowModal] = useState(false);
    const [filterType, setFilterType] = useState<string>('all');
    const [formData, setFormData] = useState({ number: '', bank: '', amount: 0, dueDate: '', type: 'received' as const, party: '' });

    const save = (data: Check[]) => { localStorage.setItem('checks', JSON.stringify(data)); setChecks(data); };

    const handleAdd = () => {
        if (!formData.number || formData.amount <= 0) return;
        save([...checks, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], status: 'pending', ...formData }]);
        setShowModal(false); setFormData({ number: '', bank: '', amount: 0, dueDate: '', type: 'received', party: '' });
    };

    const updateStatus = (id: string, status: Check['status']) => {
        save(checks.map(c => c.id === id ? { ...c, status } : c));
    };

    const filtered = checks.filter(c => filterType === 'all' || c.type === filterType);
    const stats = useMemo(() => ({
        received: checks.filter(c => c.type === 'received' && c.status === 'pending').reduce((s, c) => s + c.amount, 0),
        issued: checks.filter(c => c.type === 'issued' && c.status === 'pending').reduce((s, c) => s + c.amount, 0)
    }), [checks]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'إدارة الشيكات' : 'Check Management'}</h2>
                <div className="flex gap-3">
                    <select className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 font-bold text-textPrimary" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                        <option value="received">{language === 'ar' ? 'واردة' : 'Received'}</option>
                        <option value="issued">{language === 'ar' ? 'صادرة' : 'Issued'}</option>
                    </select>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl glow-primary font-black text-sm"><Plus size={20} />{language === 'ar' ? 'شيك جديد' : 'New Check'}</button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'شيكات واردة معلقة' : 'Pending Received'}</p>
                    <p className="text-2xl font-black text-accentGreen">{stats.received.toLocaleString()} {currency}</p>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'شيكات صادرة معلقة' : 'Pending Issued'}</p>
                    <p className="text-2xl font-black text-red-500">{stats.issued.toLocaleString()} {currency}</p>
                </div>
            </div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الرقم' : 'Number'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الطرف' : 'Party'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الاستحقاق' : 'Due'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'النوع' : 'Type'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'إجراء' : 'Action'}</th>
                    </tr></thead>
                    <tbody>
                        {filtered.length === 0 ? <tr><td colSpan={7} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا توجد شيكات' : 'No checks'}</td></tr> :
                            filtered.map(c => (
                                <tr key={c.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 font-black text-primary">{c.number}</td>
                                    <td className="p-5 text-textPrimary">{c.party}</td>
                                    <td className="p-5 font-black">{c.amount.toLocaleString()} {currency}</td>
                                    <td className="p-5 text-secondary">{new Date(c.dueDate).toLocaleDateString('ar-EG')}</td>
                                    <td className="p-5 text-center"><span className={`px-3 py-1 rounded-full text-xs font-black ${c.type === 'received' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>{c.type === 'received' ? (language === 'ar' ? 'وارد' : 'In') : (language === 'ar' ? 'صادر' : 'Out')}</span></td>
                                    <td className="p-5 text-center"><span className={`px-3 py-1 rounded-full text-xs font-black ${c.status === 'collected' ? 'bg-accentGreen/10 text-accentGreen' : c.status === 'bounced' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>{c.status === 'collected' ? (language === 'ar' ? 'محصل' : 'Collected') : c.status === 'bounced' ? (language === 'ar' ? 'مرتد' : 'Bounced') : (language === 'ar' ? 'معلق' : 'Pending')}</span></td>
                                    <td className="p-5 text-center">{c.status === 'pending' && <div className="flex gap-1 justify-center"><button onClick={() => updateStatus(c.id, 'collected')} className="p-2 bg-accentGreen/10 text-accentGreen rounded-lg"><CheckCircle size={14} /></button><button onClick={() => updateStatus(c.id, 'bounced')} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><XCircle size={14} /></button></div>}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10">
                    <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-textPrimary">{language === 'ar' ? 'شيك جديد' : 'New Check'}</h3><button onClick={() => setShowModal(false)} className="text-secondary"><XCircle size={32} /></button></div>
                    <div className="space-y-4">
                        <div className="flex gap-4"><button onClick={() => setFormData({ ...formData, type: 'received' })} className={`flex-1 py-3 rounded-xl font-black ${formData.type === 'received' ? 'bg-accentGreen text-white' : 'bg-background border border-cardAccent text-secondary'}`}>{language === 'ar' ? 'وارد' : 'Received'}</button><button onClick={() => setFormData({ ...formData, type: 'issued' })} className={`flex-1 py-3 rounded-xl font-black ${formData.type === 'issued' ? 'bg-red-500 text-white' : 'bg-background border border-cardAccent text-secondary'}`}>{language === 'ar' ? 'صادر' : 'Issued'}</button></div>
                        <input placeholder={language === 'ar' ? 'رقم الشيك' : 'Check Number'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                        <input placeholder={language === 'ar' ? 'اسم الطرف' : 'Party Name'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.party} onChange={e => setFormData({ ...formData, party: e.target.value })} />
                        <input type="number" placeholder={language === 'ar' ? 'المبلغ' : 'Amount'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
                        <input type="date" className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                        <button onClick={handleAdd} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary">{language === 'ar' ? 'إضافة' : 'Add'}</button>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default CheckManagement;
