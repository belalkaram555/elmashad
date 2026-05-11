
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { MenuItem, ProductVariant, ProductAddon, RecipeItem, Category } from '../types';
import {
    Plus, Edit3, Trash2, XCircle, ChefHat, Coffee, Cake,
    UtensilsCrossed, Settings2, Trash, Archive, Download,
    UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2,
    Sparkles, ExternalLink, Image as ImageIcon, FileJson, ArrowLeftRight,
    LayoutGrid, List
} from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import * as XLSX from 'xlsx';

const Menu: React.FC = () => {
    const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, categories, addCategory, settings, inventory } = useData();
    const { t, language } = useLanguage();
    const { addToast } = useToastStore();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'recipe'>('info');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [formData, setFormData] = useState<MenuItem>({
        id: '',
        nameEn: '',
        nameAr: '',
        basePrice: 0,
        cost: 0,
        categoryId: '',
        image: '',
        available: true,
        variants: [],
        addons: [],
        recipe: []
    });

    const handleOpenAdd = () => {
        setFormData({ id: Date.now().toString(), nameEn: '', nameAr: '', basePrice: 0, cost: 0, categoryId: categories[0]?.id || '', image: '', available: true, variants: [], addons: [], recipe: [] });
        setIsEdit(false);
        setActiveTab('info');
        setShowModal(true);
    };

    const handleOpenEdit = (item: MenuItem) => {
        setFormData({ ...item, recipe: item.recipe || [] });
        setIsEdit(true);
        setActiveTab('info');
        setShowModal(true);
    };

    const addVariantField = () => {
        const newVariant: ProductVariant = { id: Date.now().toString() + Math.random(), nameAr: '', nameEn: '', price: 0 };
        setFormData({ ...formData, variants: [...formData.variants, newVariant] });
    };

    const removeVariantField = (id: string) => {
        setFormData({ ...formData, variants: formData.variants.filter(v => v.id !== id) });
    };

    const addAddonField = () => {
        const newAddon: ProductAddon = { id: Date.now().toString() + Math.random(), nameAr: '', nameEn: '', price: 0 };
        setFormData({ ...formData, addons: [...formData.addons, newAddon] });
    };

    const removeAddonField = (id: string) => {
        setFormData({ ...formData, addons: formData.addons.filter(a => a.id !== id) });
    };

    const addRecipeItem = () => {
        setFormData({
            ...formData,
            recipe: [...(formData.recipe || []), { inventoryItemId: '', quantity: 0 }]
        });
    };

    const updateRecipeItem = (index: number, field: keyof RecipeItem, value: any) => {
        const newRecipe = [...(formData.recipe || [])];
        newRecipe[index] = { ...newRecipe[index], [field]: value };
        setFormData({ ...formData, recipe: newRecipe });
    };

    const removeRecipeItem = (index: number) => {
        const newRecipe = [...(formData.recipe || [])];
        newRecipe.splice(index, 1);
        setFormData({ ...formData, recipe: newRecipe });
    };

    const calculateCost = () => {
        if (!formData.recipe) return 0;
        return formData.recipe.reduce((total, item) => {
            const invItem = inventory.find(i => i.id === item.inventoryItemId);
            return total + (invItem ? invItem.costPerUnit * item.quantity : 0);
        }, 0);
    };

    const handleDownloadTemplate = () => {
        const headers = ["الاسم بالعربي", "الاسم بالإنجليزي", "القسم بالعربي", "القسم بالإنجليزي", "السعر", "اسم الخيار (اختياري)"];
        const rows = [
            ["بيتزا مشكل", "Mixed Pizza", "بيتزا", "Pizza", "100", "صغير"],
            ["بيتزا مشكل", "Mixed Pizza", "بيتزا", "Pizza", "150", "كبير"],
            ["عصير مانجو", "Mango Juice", "مشروبات", "Drinks", "40", ""],
            ["عصير مانجو", "Mango Juice", "مشروبات", "Drinks", "80", "لتر عائلي"]
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Menu Template");
        XLSX.writeFile(wb, "smart_menu_template.xlsx");
        addToast('تم تحميل قالب الدمج التلقائي', 'success');
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                const rows = jsonData.slice(1);
                const mergedItemsMap = new Map<string, MenuItem>();
                const tempCategoriesMap = new Map<string, Category>();

                categories.forEach(c => {
                    tempCategoriesMap.set(c.nameAr.trim().toLowerCase(), c);
                    tempCategoriesMap.set(c.nameEn.trim().toLowerCase(), c);
                });

                rows.forEach(columns => {
                    if (columns.length >= 5) {
                        const nameAr = String(columns[0] || '').trim();
                        const nameEn = String(columns[1] || '').trim();
                        const catAr = String(columns[2] || '').trim();
                        const catEn = String(columns[3] || '').trim();
                        const price = parseFloat(columns[4]) || 0;
                        const optionName = String(columns[5] || "").trim();

                        if (!nameAr || !catAr) return;
                        const normalizedCatAr = catAr.trim().toLowerCase();
                        const normalizedCatEn = catEn.trim().toLowerCase();

                        let targetCat = tempCategoriesMap.get(normalizedCatAr) || tempCategoriesMap.get(normalizedCatEn);

                        if (!targetCat) {
                            targetCat = {
                                id: `CAT-${Date.now()}-${Math.random()}`,
                                nameAr: catAr.trim(),
                                nameEn: (catEn || catAr).trim()
                            };
                            addCategory(targetCat);
                            tempCategoriesMap.set(normalizedCatAr, targetCat);
                            if (normalizedCatEn) tempCategoriesMap.set(normalizedCatEn, targetCat);
                        }

                        const existingItem = mergedItemsMap.get(nameAr);
                        if (existingItem) {
                            existingItem.variants.push({
                                id: `VAR-${Date.now()}-${Math.random()}`,
                                nameAr: optionName || `خيار ${existingItem.variants.length + 1}`,
                                nameEn: optionName || `Option ${existingItem.variants.length + 1}`,
                                price: price
                            });
                        } else {
                            const newItem: MenuItem = {
                                id: `PROD-${Date.now()}-${Math.random()}`,
                                nameAr,
                                nameEn: nameEn || nameAr,
                                categoryId: targetCat.id,
                                basePrice: price,
                                cost: 0,
                                available: true,
                                image: '',
                                variants: optionName ? [{
                                    id: `VAR-${Date.now()}-${Math.random()}`,
                                    nameAr: optionName,
                                    nameEn: optionName,
                                    price: price
                                }] : [],
                                addons: [],
                                recipe: []
                            };
                            mergedItemsMap.set(nameAr, newItem);
                        }
                    }
                });

                let importedCount = 0;
                mergedItemsMap.forEach(item => {
                    addMenuItem(item);
                    importedCount++;
                });

                addToast(`تم دمج واستيراد ${importedCount} صنف بنجاح`, 'success');
                setShowImportModal(false);
            } catch (error) {
                addToast("حدث خطأ، تأكد من سلامة ملف الإكسيل", "error");
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'إدارة المنيو' : 'Menu Management'}</h2>
                    <p className="text-secondary text-xs mt-1 font-bold">تحكم في الأصناف، الأحجام، والإضافات</p>
                </div>
                <div className="flex items-center gap-3">
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
                    <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-surface text-secondary border border-cardAccent px-6 py-3.5 rounded-2xl hover:text-textPrimary transition-all font-black text-sm">
                        <FileSpreadsheet size={20} className="text-accentGreen" /> استيراد ودمج ذكي
                    </button>
                    <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary text-background px-8 py-3.5 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm shadow-xl">
                        <Plus size={20} /> {t('addItem')}
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {menuItems.map((item) => {
                        const category = categories.find(c => c.id === item.categoryId);
                        return (
                            <div key={item.id} className="bg-surface rounded-[32px] border border-cardAccent p-6 hover:border-primary/50 transition-all group relative overflow-hidden shadow-sm">
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-primary/20 shadow-lg">
                                        <UtensilsCrossed size={20} className="text-primary" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-background border border-cardAccent text-secondary hover:text-primary rounded-xl transition-all"><Edit3 size={16} /></button>
                                        <button onClick={() => deleteMenuItem(item.id)} className="p-2.5 bg-background border border-cardAccent text-secondary hover:text-red-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-black text-textPrimary text-lg mb-1 truncate">{language === 'ar' ? item.nameAr : item.nameEn}</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[10px] font-black text-secondary uppercase tracking-widest bg-background px-2 py-1 rounded-md border border-cardAccent">
                                            {category ? (language === 'ar' ? category.nameAr : category.nameEn) : 'بدون قسم'}
                                        </span>
                                    </div>
                                    <p className="text-2xl font-black text-primary">{item.basePrice} <span className="text-xs text-secondary font-bold">{currency}</span></p>
                                    <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
                                        {item.variants.length > 0 && <span className="px-2 py-1 bg-accentBlue/10 text-accentBlue text-[8px] font-black rounded-lg border border-accentBlue/20">+{item.variants.length} أحجام</span>}
                                        {item.addons.length > 0 && <span className="px-2 py-1 bg-accentGreen/10 text-accentGreen text-[8px] font-black rounded-lg border border-accentGreen/20">+{item.addons.length} إضافات</span>}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden animate-in fade-in duration-500">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cardAccent bg-background/50">
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">الصنف</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">القسم</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">السعر</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">الأحجام</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">الإضافات</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.map((item) => {
                                const category = categories.find(c => c.id === item.categoryId);
                                return (
                                    <tr key={item.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                                    <UtensilsCrossed size={16} className="text-primary" />
                                                </div>
                                                <span className="font-black text-textPrimary">{language === 'ar' ? item.nameAr : item.nameEn}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-xs font-bold text-secondary">{category ? (language === 'ar' ? category.nameAr : category.nameEn) : '-'}</span>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-black text-primary">{item.basePrice}</span>
                                            <span className="text-xs text-secondary mr-1">{currency}</span>
                                        </td>
                                        <td className="p-5">
                                            {item.variants.length > 0 ? (
                                                <span className="px-2 py-1 bg-accentBlue/10 text-accentBlue text-xs font-black rounded-lg">{item.variants.length}</span>
                                            ) : <span className="text-secondary">-</span>}
                                        </td>
                                        <td className="p-5">
                                            {item.addons.length > 0 ? (
                                                <span className="px-2 py-1 bg-accentGreen/10 text-accentGreen text-xs font-black rounded-lg">{item.addons.length}</span>
                                            ) : <span className="text-secondary">-</span>}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-background border border-cardAccent text-accentBlue rounded-lg hover:bg-accentBlue hover:text-white transition-all"><Edit3 size={14} /></button>
                                                <button onClick={() => deleteMenuItem(item.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-5xl shadow-2xl p-6 md:p-10 my-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary flex items-center gap-3"><UploadCloud className="text-primary" /> الاستيراد والدمج الذكي</h3>
                            <button onClick={() => setShowImportModal(false)} className="text-secondary hover:text-textPrimary transition-colors" disabled={isProcessing}><XCircle size={32} /></button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Side: AI Converter Guide */}
                            <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/20 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Sparkles className="text-primary animate-pulse" size={28} />
                                    <h4 className="text-xl font-black text-textPrimary">محول المنيو بالذكاء الاصطناعي</h4>
                                </div>
                                <p className="text-sm text-secondary font-bold leading-relaxed">حوّل صورة منيو مطعمك الورقية إلى ملف إكسيل جاهز للاستيراد في ثوانٍ معدودة باتباع هذه الخطوات:</p>

                                <div className="space-y-4 pt-4">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-black shrink-0">1</div>
                                        <div>
                                            <p className="font-black text-textPrimary text-sm">تحميل قالب الدمج</p>
                                            <button onClick={handleDownloadTemplate} className="mt-2 flex items-center gap-2 text-primary hover:underline font-bold text-xs"><Download size={14} /> اضغط هنا لتحميل القالب الفارغ</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-black shrink-0">2</div>
                                        <div>
                                            <p className="font-black text-textPrimary text-sm">رفع المنيو للقالب المثالي</p>
                                            <p className="text-[10px] text-secondary mt-1">ادخل للرابط، ارفع (صورة المنيو) و (قالب الدمج) معاً</p>
                                            <a href="https://ai.studio/apps/drive/1kJDFfJQCG0NuUFHyZ-k1d23KB9LjMm1m?fullscreenApplet=true" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 bg-primary text-background px-4 py-2 rounded-xl font-black text-[10px] hover:opacity-90 transition-all shadow-lg glow-primary">
                                                فتح محول الذكاء الاصطناعي <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-black shrink-0">3</div>
                                        <div>
                                            <p className="font-black text-textPrimary text-sm">توليد وتحميل الملف</p>
                                            <p className="text-[10px] text-secondary mt-1">اضغط على زرار (توليد الملف) في الموقع الخارجي وحمّل النتيجة</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-black shrink-0">4</div>
                                        <div>
                                            <p className="font-black text-textPrimary text-sm">الرفع النهائي هنا</p>
                                            <p className="text-[10px] text-secondary mt-1">استخدم زر الرفع على اليسار لرفع الملف الذي تم توليده</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: File Upload Area */}
                            <div className="flex flex-col justify-center space-y-6">
                                <div className={`relative group ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls, .csv"
                                        onChange={handleImportFile}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="border-2 border-dashed border-cardAccent rounded-[40px] p-16 flex flex-col items-center justify-center group-hover:border-primary/50 transition-all bg-background/40">
                                        {isProcessing ? (
                                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                                        ) : (
                                            <FileSpreadsheet size={64} className="text-secondary opacity-30 mb-6 group-hover:scale-110 group-hover:text-primary transition-all" />
                                        )}
                                        <p className="font-black text-textPrimary text-lg">{isProcessing ? 'جاري التحليل والدمج...' : 'ارفع ملف الإكسيل المولد هنا'}</p>
                                        <p className="text-xs text-secondary mt-3">سيتم دمج الأصناف والأقسام المتكررة آلياً</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-5 bg-accentGreen/5 rounded-[24px] border border-accentGreen/20">
                                    <CheckCircle2 size={24} className="text-accentGreen shrink-0" />
                                    <p className="text-xs text-accentGreen font-bold leading-relaxed">نظام الدمج الذكي يقوم بتوحيد الأقسام المتكررة وتحويل الأسعار المختلفة لنفس المنتج إلى (أحجام/خيارات) تلقائياً.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-3xl shadow-2xl p-6 md:p-10 my-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">{isEdit ? 'تعديل صنف' : t('addItem')}</h3>
                            <button onClick={() => setShowModal(false)} className="text-secondary hover:text-textPrimary transition-colors"><XCircle size={32} /></button>
                        </div>

                        <div className="flex gap-4 border-b border-cardAccent mb-6">
                            <button onClick={() => setActiveTab('info')} className={`pb-4 px-4 text-sm font-black transition-all ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-textPrimary'}`}>البيانات الأساسية</button>
                            <button onClick={() => setActiveTab('recipe')} className={`pb-4 px-4 text-sm font-black transition-all ${activeTab === 'recipe' ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-textPrimary'}`}>مكونات الوصفة (Recipe)</button>
                        </div>

                        {activeTab === 'info' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">{t('nameAr')}</label>
                                        <input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.nameAr} onChange={e => setFormData({ ...formData, nameAr: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">{t('nameEn')}</label>
                                        <input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.nameEn} onChange={e => setFormData({ ...formData, nameEn: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">{t('price')} (الأساسي)</label>
                                        <input type="number" className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-black" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">{t('category')}</label>
                                        <select className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                                            {categories.map(c => <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.nameEn}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-background/50 rounded-3xl p-6 border border-cardAccent">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-xs font-black text-primary uppercase">{t('variants')}</h4>
                                        <button onClick={addVariantField} className="p-2 bg-primary text-background rounded-lg hover:scale-110 transition-transform"><Plus size={16} /></button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.variants.map((v, idx) => (
                                            <div key={v.id} className="flex gap-2 items-center">
                                                <input placeholder="الاسم (عربي)" className="flex-1 p-2 bg-surface rounded-xl text-xs text-textPrimary" value={v.nameAr} onChange={e => {
                                                    const newV = [...formData.variants]; newV[idx].nameAr = e.target.value; setFormData({ ...formData, variants: newV });
                                                }} />
                                                <input type="number" placeholder="السعر" className="w-20 p-2 bg-surface rounded-xl text-xs text-textPrimary" value={v.price} onChange={e => {
                                                    const newV = [...formData.variants]; newV[idx].price = Number(e.target.value); setFormData({ ...formData, variants: newV });
                                                }} />
                                                <button onClick={() => removeVariantField(v.id)} className="p-2 text-red-500"><Trash size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 text-purple-600 text-xs font-bold leading-relaxed mb-4">
                                    ربط الصنف بالمخزون يساعد في حساب التكلفة الفعلية وخصم الكميات تلقائياً عند البيع.
                                </div>

                                <div className="flex justify-between items-center bg-background/50 p-4 rounded-2xl border border-cardAccent">
                                    <h4 className="font-black text-textPrimary text-sm">التكلفة التقديرية:</h4>
                                    <span className="text-xl font-black text-accentGreen">{calculateCost().toFixed(2)} {currency}</span>
                                </div>

                                <div className="space-y-3">
                                    {(formData.recipe || []).map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-center bg-surface p-3 rounded-xl border border-cardAccent">
                                            <select
                                                className="flex-1 p-3 bg-background border border-cardAccent rounded-xl text-xs font-bold text-textPrimary"
                                                value={item.inventoryItemId}
                                                onChange={(e) => updateRecipeItem(idx, 'inventoryItemId', e.target.value)}
                                            >
                                                <option value="">اختر المادة الخام</option>
                                                {inventory.map(inv => (
                                                    <option key={inv.id} value={inv.id}>{inv.nameAr} ({inv.unit})</option>
                                                ))}
                                            </select>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="الكمية"
                                                    className="w-24 p-3 bg-background border border-cardAccent rounded-xl text-xs font-bold text-textPrimary"
                                                    value={item.quantity}
                                                    onChange={(e) => updateRecipeItem(idx, 'quantity', Number(e.target.value))}
                                                />
                                                <span className="text-[10px] text-secondary w-8">
                                                    {inventory.find(i => i.id === item.inventoryItemId)?.unit || '-'}
                                                </span>
                                            </div>
                                            <button onClick={() => removeRecipeItem(idx)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    <button onClick={addRecipeItem} className="w-full py-3 border border-dashed border-cardAccent rounded-xl text-secondary hover:text-textPrimary hover:border-primary/50 text-xs font-black transition-all flex items-center justify-center gap-2">
                                        <Plus size={16} /> إضافة مكون
                                    </button>
                                </div>
                            </div>
                        )}

                        <button onClick={() => { if (isEdit) updateMenuItem(formData); else addMenuItem(formData); setShowModal(false); }} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-6 hover:scale-[1.02] transition-all">
                            {t('save')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;
