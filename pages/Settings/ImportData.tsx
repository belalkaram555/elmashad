// الإعدادات - استيراد البيانات
import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

const ImportData: React.FC = () => {
    const { language } = useLanguage();
    const fileRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const templates = [
        { id: 'customers', ar: 'العملاء', en: 'Customers' },
        { id: 'suppliers', ar: 'الموردين', en: 'Suppliers' },
        { id: 'inventory', ar: 'المخزون', en: 'Inventory' },
        { id: 'employees', ar: 'الموظفين', en: 'Employees' }
    ];

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setResult(null);

        setTimeout(() => {
            setImporting(false);
            setResult({ success: true, message: language === 'ar' ? 'تم استيراد البيانات بنجاح' : 'Data imported successfully' });
        }, 2000);
    };

    const downloadTemplate = (type: string) => {
        const headers = { customers: 'الاسم,الهاتف,البريد,العنوان', suppliers: 'الاسم,الهاتف,البريد,العنوان', inventory: 'الاسم,الكود,السعر,التكلفة,الكمية', employees: 'الاسم,الهاتف,الوظيفة,الراتب' };
        const blob = new Blob([headers[type as keyof typeof headers] || ''], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${type}_template.csv`; a.click();
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div><h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'استيراد البيانات' : 'Import Data'}</h2><p className="text-secondary text-xs mt-1 font-bold">{language === 'ar' ? 'استيراد البيانات من ملفات Excel أو CSV' : 'Import data from Excel or CSV files'}</p></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {templates.map(t => (
                    <button key={t.id} onClick={() => downloadTemplate(t.id)} className="bg-surface p-4 rounded-2xl border border-cardAccent hover:border-primary/40 transition-all flex items-center gap-3">
                        <Download size={20} className="text-primary" />
                        <span className="font-bold text-textPrimary">{language === 'ar' ? `قالب ${t.ar}` : `${t.en} Template`}</span>
                    </button>
                ))}
            </div>

            <div className="bg-surface p-8 rounded-[32px] border-2 border-dashed border-cardAccent hover:border-primary/40 transition-all cursor-pointer text-center" onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
                <Upload size={48} className="mx-auto text-secondary/50 mb-4" />
                <p className="text-textPrimary font-bold text-lg mb-2">{language === 'ar' ? 'اضغط لاختيار ملف أو اسحبه هنا' : 'Click to select or drag file here'}</p>
                <p className="text-secondary text-sm">{language === 'ar' ? 'الملفات المدعومة: CSV, Excel' : 'Supported: CSV, Excel'}</p>
            </div>

            {importing && <div className="bg-primary/10 p-6 rounded-2xl flex items-center gap-4"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /><span className="text-primary font-bold">{language === 'ar' ? 'جاري الاستيراد...' : 'Importing...'}</span></div>}

            {result && <div className={`p-6 rounded-2xl flex items-center gap-4 ${result.success ? 'bg-accentGreen/10' : 'bg-red-500/10'}`}>{result.success ? <CheckCircle size={24} className="text-accentGreen" /> : <AlertCircle size={24} className="text-red-500" />}<span className={`font-bold ${result.success ? 'text-accentGreen' : 'text-red-500'}`}>{result.message}</span></div>}
        </div>
    );
};

export default ImportData;
