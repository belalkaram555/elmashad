// المخزون - طباعة الباركود
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Printer, Search, CheckSquare, Square } from 'lucide-react';

const PrintBarcode: React.FC = () => {
    const { inventory, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [copies, setCopies] = useState(1);

    // تحويل inventory لقائمة مع الأسماء المناسبة
    const inventoryItems = useMemo(() => {
        return inventory.map(item => ({
            ...item,
            name: language === 'ar' ? item.nameAr : item.nameEn,
            price: item.costPerUnit,
            barcode: item.id.slice(-8)
        }));
    }, [inventory, language]);

    const filtered = inventoryItems.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.barcode?.includes(searchQuery)
    );

    const toggleSelect = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selected.length === filtered.length) setSelected([]);
        else setSelected(filtered.map(i => i.id));
    };

    const handlePrint = () => {
        const printItems = inventoryItems.filter(i => selected.includes(i.id));
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        let html = '<html><head><style>body{font-family:Arial;}.label{display:inline-block;width:150px;padding:10px;border:1px solid #ccc;margin:5px;text-align:center;}.barcode{font-family:monospace;font-size:20px;letter-spacing:2px;}</style></head><body>';
        printItems.forEach(item => {
            for (let i = 0; i < copies; i++) {
                html += `<div class="label"><div class="barcode">${item.barcode}</div><div>${item.name}</div><div><strong>${item.price} ${currency}</strong></div></div>`;
            }
        });
        html += '</body></html>';
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'طباعة الباركود' : 'Print Barcode'}</h2>
                <div className="flex gap-3 items-center">
                    <div className="relative"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} /><input type="text" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary w-48" /></div>
                    <input type="number" min={1} value={copies} onChange={e => setCopies(Number(e.target.value))} className="w-20 p-3 bg-surface border border-cardAccent rounded-2xl text-textPrimary font-bold text-center" />
                    <span className="text-secondary text-sm">{language === 'ar' ? 'نسخة' : 'copies'}</span>
                    <button onClick={handlePrint} disabled={selected.length === 0} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl glow-primary font-black text-sm disabled:opacity-50"><Printer size={20} />{language === 'ar' ? 'طباعة' : 'Print'} ({selected.length})</button>
                </div>
            </div>

            <div className="bg-surface p-4 rounded-2xl border border-cardAccent flex justify-between items-center">
                <button onClick={selectAll} className="flex items-center gap-2 text-primary font-bold">{selected.length === filtered.length ? <CheckSquare size={20} /> : <Square size={20} />}{language === 'ar' ? 'تحديد الكل' : 'Select All'}</button>
                <span className="text-secondary">{language === 'ar' ? `تم تحديد ${selected.length} صنف` : `${selected.length} items selected`}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filtered.map(item => (
                    <div key={item.id} onClick={() => toggleSelect(item.id)} className={`bg-surface p-4 rounded-2xl border cursor-pointer transition-all ${selected.includes(item.id) ? 'border-primary bg-primary/5' : 'border-cardAccent hover:border-primary/40'}`}>
                        <div className="flex justify-between items-start mb-2">{selected.includes(item.id) ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-secondary/50" />}</div>
                        <p className="font-black text-textPrimary text-sm truncate">{item.name}</p>
                        <p className="text-secondary text-xs font-mono">{item.barcode}</p>
                        <p className="text-primary font-bold mt-1">{item.price} {currency}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrintBarcode;
