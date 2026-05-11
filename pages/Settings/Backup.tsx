// الإعدادات - النسخ الاحتياطي
import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { HardDrive, Download, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Backup: React.FC = () => {
    const { language } = useLanguage();
    const [backing, setBacking] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [lastBackup, setLastBackup] = useState<string | null>(() => localStorage.getItem('last_backup'));

    const handleBackup = () => {
        setBacking(true);
        setTimeout(() => {
            const data = { customers: localStorage.getItem('customers'), inventory: localStorage.getItem('inventory'), sales: localStorage.getItem('sales'), settings: localStorage.getItem('settings'), timestamp: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `backup_${new Date().toISOString().split('T')[0]}.json`; a.click();
            localStorage.setItem('last_backup', new Date().toISOString());
            setLastBackup(new Date().toISOString());
            setBacking(false);
        }, 1500);
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setRestoring(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                Object.keys(data).forEach(key => { if (key !== 'timestamp') localStorage.setItem(key, data[key]); });
                setTimeout(() => { setRestoring(false); alert(language === 'ar' ? 'تم استعادة البيانات بنجاح. سيتم تحديث الصفحة.' : 'Data restored. Page will refresh.'); window.location.reload(); }, 1000);
            } catch { setRestoring(false); alert(language === 'ar' ? 'خطأ في الملف' : 'Invalid file'); }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div><h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'النسخ الاحتياطي' : 'Backup'}</h2><p className="text-secondary text-xs mt-1 font-bold">{language === 'ar' ? 'حماية بياناتك' : 'Protect your data'}</p></div>

            {lastBackup && <div className="bg-accentGreen/10 border border-accentGreen/20 rounded-2xl p-4 flex items-center gap-3"><Clock size={20} className="text-accentGreen" /><span className="text-accentGreen font-bold">{language === 'ar' ? 'آخر نسخة:' : 'Last backup:'} {new Date(lastBackup).toLocaleString('ar-EG')}</span></div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface p-8 rounded-[32px] border border-cardAccent text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><Download size={32} className="text-primary" /></div>
                    <h3 className="font-black text-xl text-textPrimary mb-2">{language === 'ar' ? 'إنشاء نسخة احتياطية' : 'Create Backup'}</h3>
                    <p className="text-secondary text-sm mb-6">{language === 'ar' ? 'تحميل نسخة من جميع البيانات' : 'Download a copy of all data'}</p>
                    <button onClick={handleBackup} disabled={backing} className="w-full bg-primary text-background py-4 rounded-2xl font-black glow-primary disabled:opacity-50 flex items-center justify-center gap-2">
                        {backing ? <><div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />{language === 'ar' ? 'جاري...' : 'Creating...'}</> : <><Download size={20} />{language === 'ar' ? 'تحميل النسخة' : 'Download Backup'}</>}
                    </button>
                </div>

                <div className="bg-surface p-8 rounded-[32px] border border-cardAccent text-center">
                    <div className="w-20 h-20 bg-accentBlue/10 rounded-full flex items-center justify-center mx-auto mb-4"><Upload size={32} className="text-accentBlue" /></div>
                    <h3 className="font-black text-xl text-textPrimary mb-2">{language === 'ar' ? 'استعادة البيانات' : 'Restore Data'}</h3>
                    <p className="text-secondary text-sm mb-6">{language === 'ar' ? 'استعادة من نسخة سابقة' : 'Restore from a previous backup'}</p>
                    <label className={`w-full bg-accentBlue text-white py-4 rounded-2xl font-black cursor-pointer flex items-center justify-center gap-2 ${restoring ? 'opacity-50' : ''}`}>
                        <input type="file" accept=".json" onChange={handleRestore} className="hidden" disabled={restoring} />
                        {restoring ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{language === 'ar' ? 'جاري...' : 'Restoring...'}</> : <><Upload size={20} />{language === 'ar' ? 'اختر ملف النسخة' : 'Select Backup File'}</>}
                    </label>
                </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3"><AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" /><div><p className="text-red-500 font-bold">{language === 'ar' ? 'تحذير' : 'Warning'}</p><p className="text-secondary text-sm">{language === 'ar' ? 'استعادة البيانات ستستبدل جميع البيانات الحالية' : 'Restoring data will replace all current data'}</p></div></div>
        </div>
    );
};

export default Backup;
