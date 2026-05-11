
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToastStore } from '../store/toastStore';
import { createBackup, restoreBackup } from '../utils/backup';
import { Save, Printer, Database, Building2, Download, Upload, ShieldCheck, Lock, UserCog, MapPin, Phone, Hash, Store, Calculator, Loader2 } from 'lucide-react';

const Settings: React.FC = () => {
    const { settings, updateSettings } = useData();
    const { t } = useLanguage();
    const { addToast } = useToastStore();

    const [formData, setFormData] = useState(settings);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [securityForm, setSecurityForm] = useState({
        newUsername: settings.adminUsername || 'elmashad',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // @ts-ignore
        const val = type === 'number' ? parseFloat(value) : (type === 'checkbox' ? e.target.checked : value);
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSecurityForm({ ...securityForm, [e.target.name]: e.target.value });
    };

    const handleSaveSecurity = () => {
        if (securityForm.newPassword !== securityForm.confirmPassword) {
            addToast('كلمات المرور غير متطابقة', 'error');
            return;
        }

        const updatedSettings = {
            ...formData,
            adminUsername: securityForm.newUsername,
            adminPassword: securityForm.newPassword || formData.adminPassword
        };

        updateSettings(updatedSettings);
        setFormData(updatedSettings);
        addToast('تم تحديث بيانات الأمان بنجاح', 'success');
        setSecurityForm({ ...securityForm, newPassword: '', confirmPassword: '' });
    };

    const handleSaveGeneral = () => {
        updateSettings(formData);
        addToast(t('success'), 'success');
    };

    const handleExportBackup = async () => {
        setIsBackingUp(true);
        try {
            const result = await createBackup();
            if (result) {
                addToast('تم تصدير النسخة الاحتياطية بنجاح', 'success');
            } else {
                addToast('تم إلغاء التصدير', 'info');
            }
        } catch (error) {
            addToast('فشل في تصدير النسخة الاحتياطية', 'error');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestoreBackup = async () => {
        if (!confirm('هل أنت متأكد؟ سيتم استبدال البيانات الحالية بالنسخة الاحتياطية.')) {
            return;
        }
        setIsRestoring(true);
        try {
            const result = await restoreBackup();
            if (result) {
                addToast('تم استعادة النسخة الاحتياطية بنجاح. يرجى إعادة تشغيل التطبيق.', 'success');
                setTimeout(() => window.location.reload(), 2000);
            } else {
                addToast('تم إلغاء الاستعادة', 'info');
            }
        } catch (error) {
            addToast('فشل في استعادة النسخة الاحتياطية', 'error');
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <div className="space-y-8 pb-12 font-cairo max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">{t('settings')}</h2>
                    <p className="text-secondary text-xs mt-1 font-bold">تخصيص النظام وتعديل بيانات المنشأة والأمان</p>
                </div>
                <button onClick={handleSaveGeneral} className="bg-primary text-background px-10 py-4 rounded-2xl font-black text-sm shadow-xl glow-primary active:scale-95 transition-all">
                    {t('save')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Details */}
                <div className="bg-surface p-8 rounded-[32px] border border-cardAccent space-y-6 shadow-sm">
                    <h3 className="text-lg font-black text-textPrimary flex items-center gap-3">
                        <Building2 className="text-primary" /> هوية المنشأة (تظهر بالفاتورة)
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2 flex items-center gap-1"><Store size={12} /> اسم المطعم (عربي)</label>
                                <input name="restaurantNameAr" value={formData.restaurantNameAr} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2 flex items-center gap-1"><Store size={12} /> اسم المطعم (إنجليزي)</label>
                                <input name="restaurantNameEn" value={formData.restaurantNameEn} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2 flex items-center gap-1"><Hash size={12} /> الرقم الضريبي</label>
                                <input name="taxId" value={formData.taxId} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" placeholder="000-000-000" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2 flex items-center gap-1"><Store size={12} /> نوع/اسم الفرع</label>
                                <input name="branchNameAr" value={formData.branchNameAr} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" placeholder="مثلاً: الفرع الرئيسي" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2 flex items-center gap-1"><MapPin size={12} /> العنوان التفصيلي</label>
                            <input name="addressAr" value={formData.addressAr} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" placeholder="المدينة، الحي، الشارع" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2 flex items-center gap-1"><Phone size={12} /> رقم التواصل</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" placeholder="01XXXXXXXXX" />
                        </div>
                    </div>
                </div>

                {/* Tax & Services Settings */}
                <div className="bg-surface p-8 rounded-[32px] border border-cardAccent space-y-6 shadow-sm">
                    <h3 className="text-lg font-black text-textPrimary flex items-center gap-3">
                        <Calculator className="text-primary" /> إعدادات الضرائب والخدمة
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">{t('tax')} (%)</label>
                                <input type="number" step="0.01" name="taxRate" value={formData.taxRate} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">رسوم الخدمة (%)</label>
                                <input type="number" step="0.01" name="serviceRate" value={formData.serviceRate} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">العملة (عربي)</label>
                                <input name="currencyAr" value={formData.currencyAr} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">العملة (EN)</label>
                                <input name="currencyEn" value={formData.currencyEn} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-surface p-8 rounded-[32px] border border-primary/20 space-y-6 shadow-2xl shadow-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <h3 className="text-lg font-black text-primary flex items-center gap-3 relative z-10">
                        <ShieldCheck /> إعدادات الأمان والدخول
                    </h3>
                    <div className="space-y-4 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2 flex items-center gap-1">
                                <UserCog size={12} /> اسم مستخدم المدير الجديد
                            </label>
                            <input
                                name="newUsername"
                                value={securityForm.newUsername}
                                onChange={handleSecurityChange}
                                className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-black"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2 flex items-center gap-1">
                                <Lock size={12} /> كلمة مرور المدير الجديدة
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="اتركه فارغاً للحفاظ على القديمة"
                                value={securityForm.newPassword}
                                onChange={handleSecurityChange}
                                className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2 flex items-center gap-1">
                                تأكيد كلمة المرور
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={securityForm.confirmPassword}
                                onChange={handleSecurityChange}
                                className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold"
                            />
                        </div>
                        <button
                            onClick={handleSaveSecurity}
                            className="w-full py-4 bg-primary/10 text-primary border border-primary/30 rounded-2xl font-black text-xs hover:bg-primary hover:text-background transition-all"
                        >
                            تحديث بيانات الدخول
                        </button>
                    </div>
                </div>

                {/* Backup & Printers */}
                <div className="space-y-8">
                    <div className="bg-surface p-8 rounded-[32px] border border-cardAccent space-y-6">
                        <h3 className="text-lg font-black text-textPrimary flex items-center gap-3">
                            <Database className="text-primary" /> {t('backup')}
                        </h3>
                        <div className="flex gap-4">
                            <button
                                onClick={handleExportBackup}
                                disabled={isBackingUp}
                                className="flex-1 flex items-center justify-center gap-2 bg-background p-4 rounded-2xl text-xs font-black text-textPrimary border border-cardAccent hover:border-primary/50 transition-all disabled:opacity-50"
                            >
                                {isBackingUp ? <Loader2 size={16} className="text-primary animate-spin" /> : <Download size={16} className="text-primary" />}
                                {isBackingUp ? 'جاري التصدير...' : 'تصدير نسخة'}
                            </button>
                            <button
                                onClick={handleRestoreBackup}
                                disabled={isRestoring}
                                className="flex-1 flex items-center justify-center gap-2 bg-background p-4 rounded-2xl text-xs font-black text-textPrimary border border-cardAccent hover:border-accentBlue/50 transition-all disabled:opacity-50"
                            >
                                {isRestoring ? <Loader2 size={16} className="text-accentBlue animate-spin" /> : <Upload size={16} className="text-accentBlue" />}
                                {isRestoring ? 'جاري الاستعادة...' : 'استعادة نسخة'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-surface p-8 rounded-[32px] border border-cardAccent space-y-6">
                        <h3 className="text-lg font-black text-textPrimary flex items-center gap-3">
                            <Printer className="text-primary" /> خيارات الطباعة
                        </h3>
                        <div className="space-y-4">
                            <select name="printFormat" value={formData.printFormat} onChange={handleChange} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold">
                                <option value="thermal">{t('thermal')}</option>
                                <option value="a4">{t('a4')}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Factory Reset Zone */}
            <div className="md:col-span-2 bg-red-500/5 p-8 rounded-[32px] border border-red-500/20 space-y-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-black text-red-500 flex items-center gap-3 mb-2">
                        منطقة الخطر (Factory Reset)
                    </h3>
                    <p className="text-xs text-secondary font-bold max-w-xl leading-relaxed">
                        هذا الإجراء سيقوم بمسح جميع البيانات المحفوظة (المبيعات، المنتجات، الإعدادات، الموظفين) وإعادة التطبيق لحالته الأصلية. لا يمكن التراجع عن هذا الإجراء!
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (confirm('تحذير هام جداً!\n\nهل أنت متأكد تماماً أنك تريد مسح جميع البيانات؟\nلن تتمكن من استرجاع البيانات بعد هذا الإجراء.')) {
                            if (confirm('تأكيد نهائي: هل تريد حقاً تصفير النظام بالكامل؟')) {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-red-500/20 transition-all active:scale-95 whitespace-nowrap"
                >
                    مسح كافة البيانات (Reset)
                </button>
            </div>
        </div>
    );
};

export default Settings;
