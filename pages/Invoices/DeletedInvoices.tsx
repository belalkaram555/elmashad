// الفواتير - الفواتير المحذوفة
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Trash2, Search, RotateCcw, AlertCircle } from 'lucide-react';

interface DeletedInvoice { id: string; type: 'sale' | 'purchase'; number: string; date: string; total: number; deletedAt: string; deletedBy: string; }

const DeletedInvoices: React.FC = () => {
    const { language } = useLanguage();
    const { settings } = useData();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [deleted, setDeleted] = useState<DeletedInvoice[]>(() => JSON.parse(localStorage.getItem('deleted_invoices') || '[]'));
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = deleted.filter(d => d.number.includes(searchQuery));

    const restore = (id: string) => {
        if (confirm(language === 'ar' ? 'استعادة هذه الفاتورة؟' : 'Restore this invoice?')) {
            const remaining = deleted.filter(d => d.id !== id);
            localStorage.setItem('deleted_invoices', JSON.stringify(remaining));
            setDeleted(remaining);
        }
    };

    const permanentDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'حذف نهائي؟ لا يمكن التراجع!' : 'Permanently delete? Cannot undo!')) {
            const remaining = deleted.filter(d => d.id !== id);
            localStorage.setItem('deleted_invoices', JSON.stringify(remaining));
            setDeleted(remaining);
        }
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'الفواتير المحذوفة' : 'Deleted Invoices'}</h2>
                <div className="relative"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} /><input placeholder={language === 'ar' ? 'بحث برقم الفاتورة...' : 'Search by invoice #...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary w-64" /></div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3"><AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" /><div><p className="text-red-500 font-bold">{language === 'ar' ? 'تنبيه' : 'Warning'}</p><p className="text-secondary text-sm">{language === 'ar' ? 'الفواتير المحذوفة ستُحذف نهائياً بعد 30 يوم' : 'Deleted invoices will be permanently removed after 30 days'}</p></div></div>

            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-cardAccent bg-background/50">
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الرقم' : 'Number'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'النوع' : 'Type'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                        <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'تاريخ الحذف' : 'Deleted'}</th>
                        <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr></thead>
                    <tbody>
                        {filtered.length === 0 ? <tr><td colSpan={6} className="p-12 text-center"><Trash2 size={48} className="mx-auto text-secondary/30 mb-4" /><p className="text-secondary">{language === 'ar' ? 'لا توجد فواتير محذوفة' : 'No deleted invoices'}</p></td></tr> :
                            filtered.map(d => (
                                <tr key={d.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                                    <td className="p-5 font-black text-primary">{d.number}</td>
                                    <td className="p-5 text-center"><span className={`px-3 py-1 rounded-full text-xs font-black ${d.type === 'sale' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>{d.type === 'sale' ? (language === 'ar' ? 'بيع' : 'Sale') : (language === 'ar' ? 'شراء' : 'Purchase')}</span></td>
                                    <td className="p-5 text-secondary">{new Date(d.date).toLocaleDateString('ar-EG')}</td>
                                    <td className="p-5 font-bold text-textPrimary">{d.total.toLocaleString()} {currency}</td>
                                    <td className="p-5 text-secondary text-sm">{new Date(d.deletedAt).toLocaleDateString('ar-EG')}</td>
                                    <td className="p-5 text-center flex gap-2 justify-center"><button onClick={() => restore(d.id)} className="p-2 bg-accentGreen/10 text-accentGreen rounded-lg" title={language === 'ar' ? 'استعادة' : 'Restore'}><RotateCcw size={14} /></button><button onClick={() => permanentDelete(d.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg" title={language === 'ar' ? 'حذف نهائي' : 'Delete'}><Trash2 size={14} /></button></td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DeletedInvoices;
