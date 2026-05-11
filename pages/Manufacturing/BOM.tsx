// @ts-nocheck
// التصنيع - قوائم المواد (BOM)
// إدارة وصفات التصنيع والمكونات

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    ClipboardList, Search, Plus, XCircle, Trash2, Edit3,
    Package, Calculator, ChefHat, LayoutGrid, List
} from 'lucide-react';

// Type للوصفة
interface BOMItem {
    id: string;
    name: string;
    outputItemId: string; // المنتج النهائي
    outputQuantity: number;
    ingredients: {
        itemId: string;
        quantity: number;
        unit: string;
    }[];
    notes?: string;
    createdAt: string;
}

const BOM: React.FC = () => {
    const { menuItems, inventory, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    // نستخدم localStorage لحفظ الوصفات مؤقتاً حتى إضافتها للـ DataContext
    const [recipes, setRecipes] = useState<BOMItem[]>(() => {
        const saved = localStorage.getItem('bom_recipes');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingRecipe, setEditingRecipe] = useState<BOMItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        outputItemId: '',
        outputQuantity: 1,
        notes: '',
        ingredients: [{ itemId: '', quantity: 0, unit: 'unit' }] as BOMItem['ingredients']
    });

    // حفظ في localStorage
    const saveRecipes = (newRecipes: BOMItem[]) => {
        localStorage.setItem('bom_recipes', JSON.stringify(newRecipes));
        setRecipes(newRecipes);
    };

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // إضافة وصفة جديدة
    const handleAdd = () => {
        if (!formData.name || !formData.outputItemId) {
            alert(language === 'ar' ? 'يرجى إدخال اسم الوصفة والمنتج النهائي' : 'Please enter recipe name and output item');
            return;
        }

        const validIngredients = formData.ingredients.filter(i => i.itemId && i.quantity > 0);
        if (validIngredients.length === 0) {
            alert(language === 'ar' ? 'يرجى إضافة مكون واحد على الأقل' : 'Please add at least one ingredient');
            return;
        }

        const newRecipe: BOMItem = {
            id: Date.now().toString(),
            name: formData.name,
            outputItemId: formData.outputItemId,
            outputQuantity: formData.outputQuantity,
            ingredients: validIngredients,
            notes: formData.notes,
            createdAt: new Date().toISOString()
        };

        saveRecipes([...recipes, newRecipe]);
        closeModal();
    };

    // تعديل وصفة
    const handleEdit = () => {
        if (!editingRecipe || !formData.name) return;

        const validIngredients = formData.ingredients.filter(i => i.itemId && i.quantity > 0);

        const updatedRecipe: BOMItem = {
            ...editingRecipe,
            name: formData.name,
            outputItemId: formData.outputItemId,
            outputQuantity: formData.outputQuantity,
            ingredients: validIngredients,
            notes: formData.notes
        };

        saveRecipes(recipes.map(r => r.id === editingRecipe.id ? updatedRecipe : r));
        closeModal();
    };

    const openEditModal = (recipe: BOMItem) => {
        setEditingRecipe(recipe);
        setFormData({
            name: recipe.name,
            outputItemId: recipe.outputItemId,
            outputQuantity: recipe.outputQuantity,
            notes: recipe.notes || '',
            ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [{ itemId: '', quantity: 0, unit: 'unit' }]
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRecipe(null);
        setFormData({
            name: '',
            outputItemId: '',
            outputQuantity: 1,
            notes: '',
            ingredients: [{ itemId: '', quantity: 0, unit: 'unit' }]
        });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذه الوصفة؟' : 'Delete this recipe?')) {
            saveRecipes(recipes.filter(r => r.id !== id));
        }
    };

    // إضافة مكون جديد
    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { itemId: '', quantity: 0, unit: 'unit' }]
        });
    };

    // حذف مكون
    const removeIngredient = (index: number) => {
        setFormData({
            ...formData,
            ingredients: formData.ingredients.filter((_, i) => i !== index)
        });
    };

    // تحديث مكون
    const updateIngredient = (index: number, field: string, value: any) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setFormData({ ...formData, ingredients: newIngredients });
    };

    // الحصول على اسم الصنف
    const getItemName = (itemId: string) => {
        const menuItem = menuItems.find(m => m.id === itemId);
        if (menuItem) return language === 'ar' ? menuItem.nameAr : menuItem.nameEn;
        const invItem = inventory.find(i => i.id === itemId);
        return invItem?.name || '-';
    };

    // حساب تكلفة الوصفة
    const calculateRecipeCost = (recipe: BOMItem) => {
        return recipe.ingredients.reduce((sum, ing) => {
            const item = inventory.find(i => i.id === ing.itemId);
            return sum + (item ? item.price * ing.quantity : 0);
        }, 0);
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'قوائم المواد (BOM)' : 'Bill of Materials'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'تعريف مكونات كل منتج والمواد الخام المطلوبة' : 'Define product ingredients and required raw materials'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary placeholder:text-secondary/50 w-64"
                        />
                    </div>

                    <div className="flex bg-surface rounded-xl border border-cardAccent p-1">
                        <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}>
                            <LayoutGrid size={18} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}>
                            <List size={18} />
                        </button>
                    </div>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'إضافة وصفة' : 'Add Recipe'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <ClipboardList className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد الوصفات' : 'Total Recipes'}</p>
                            <p className="text-2xl font-black text-textPrimary">{recipes.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Package className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'المواد الخام' : 'Raw Materials'}</p>
                            <p className="text-2xl font-black text-accentGreen">{inventory.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <ChefHat className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'المنتجات النهائية' : 'Final Products'}</p>
                            <p className="text-2xl font-black text-accentBlue">{menuItems.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredRecipes.map(recipe => (
                        <div key={recipe.id} className="bg-surface p-8 rounded-[32px] border border-cardAccent hover:border-primary/40 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <ChefHat className="text-primary" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-textPrimary text-lg">{recipe.name}</h3>
                                        <p className="text-xs text-secondary font-bold">
                                            {language === 'ar' ? 'ينتج:' : 'Output:'} {recipe.outputQuantity} × {getItemName(recipe.outputItemId)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(recipe)} className="p-2.5 bg-background border border-cardAccent text-primary rounded-xl hover:bg-primary hover:text-background transition-all">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(recipe.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* المكونات */}
                            <div className="bg-background rounded-2xl p-4 border border-cardAccent mb-4">
                                <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-3">
                                    {language === 'ar' ? 'المكونات' : 'Ingredients'} ({recipe.ingredients.length})
                                </p>
                                <div className="space-y-2">
                                    {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-textPrimary font-bold">{getItemName(ing.itemId)}</span>
                                            <span className="text-secondary">{ing.quantity} {ing.unit}</span>
                                        </div>
                                    ))}
                                    {recipe.ingredients.length > 3 && (
                                        <p className="text-xs text-primary font-bold">
                                            +{recipe.ingredients.length - 3} {language === 'ar' ? 'مكونات أخرى' : 'more'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* التكلفة */}
                            <div className="bg-background rounded-2xl p-4 border border-cardAccent">
                                <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">
                                    {language === 'ar' ? 'تكلفة الوصفة' : 'Recipe Cost'}
                                </p>
                                <p className="text-xl font-black text-accentGreen">
                                    {calculateRecipeCost(recipe).toLocaleString()} {currency}
                                </p>
                            </div>

                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        </div>
                    ))}

                    {filteredRecipes.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <ClipboardList size={48} className="mx-auto text-secondary/30 mb-4" />
                            <p className="text-secondary font-bold">
                                {language === 'ar' ? 'لا توجد وصفات' : 'No recipes found'}
                            </p>
                            <p className="text-secondary/60 text-sm mt-2">
                                {language === 'ar' ? 'أضف وصفة جديدة لتعريف مكونات المنتجات' : 'Add a recipe to define product ingredients'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cardAccent bg-background/50">
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الوصفة' : 'Recipe'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المنتج النهائي' : 'Output'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المكونات' : 'Ingredients'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التكلفة' : 'Cost'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecipes.map(recipe => (
                                <tr key={recipe.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <ChefHat className="text-primary" size={20} />
                                            </div>
                                            <span className="font-black text-textPrimary">{recipe.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="text-secondary font-bold">{recipe.outputQuantity} × {getItemName(recipe.outputItemId)}</span></td>
                                    <td className="p-5 text-center"><span className="font-black text-textPrimary">{recipe.ingredients.length}</span></td>
                                    <td className="p-5"><span className="font-black text-accentGreen">{calculateRecipeCost(recipe).toLocaleString()} {currency}</span></td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditModal(recipe)} className="p-2.5 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit3 size={14} /></button>
                                            <button onClick={() => handleDelete(recipe.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-2xl shadow-2xl p-10 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingRecipe ? (language === 'ar' ? 'تعديل الوصفة' : 'Edit Recipe') : (language === 'ar' ? 'إضافة وصفة جديدة' : 'Add New Recipe')}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* اسم الوصفة */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم الوصفة' : 'Recipe Name'} *
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={language === 'ar' ? 'مثال: وصفة برجر لحم' : 'e.g., Beef Burger Recipe'}
                                />
                            </div>

                            {/* المنتج النهائي */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'المنتج النهائي' : 'Output Product'} *
                                    </label>
                                    <select
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                        value={formData.outputItemId}
                                        onChange={e => setFormData({ ...formData, outputItemId: e.target.value })}
                                    >
                                        <option value="">{language === 'ar' ? 'اختر المنتج...' : 'Select product...'}</option>
                                        {menuItems.map(item => (
                                            <option key={item.id} value={item.id}>{language === 'ar' ? item.nameAr : item.nameEn}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الكمية المنتجة' : 'Output Quantity'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors"
                                        value={formData.outputQuantity}
                                        onChange={e => setFormData({ ...formData, outputQuantity: Number(e.target.value) })}
                                        min={1}
                                    />
                                </div>
                            </div>

                            {/* المكونات */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest">
                                        {language === 'ar' ? 'المكونات' : 'Ingredients'}
                                    </label>
                                    <button onClick={addIngredient} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                                        <Plus size={16} /> {language === 'ar' ? 'إضافة مكون' : 'Add Ingredient'}
                                    </button>
                                </div>

                                {formData.ingredients.map((ing, index) => (
                                    <div key={index} className="flex gap-3 items-center bg-background p-4 rounded-2xl border border-cardAccent">
                                        <select
                                            className="flex-1 p-3 bg-surface border border-cardAccent rounded-xl text-textPrimary font-bold focus:border-primary outline-none transition-colors text-sm"
                                            value={ing.itemId}
                                            onChange={e => updateIngredient(index, 'itemId', e.target.value)}
                                        >
                                            <option value="">{language === 'ar' ? 'اختر المكون...' : 'Select...'}</option>
                                            {inventory.map(item => (
                                                <option key={item.id} value={item.id}>{item.name}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            className="w-24 p-3 bg-surface border border-cardAccent rounded-xl text-textPrimary font-bold focus:border-primary outline-none transition-colors text-sm text-center"
                                            value={ing.quantity || ''}
                                            onChange={e => updateIngredient(index, 'quantity', Number(e.target.value))}
                                            placeholder={language === 'ar' ? 'الكمية' : 'Qty'}
                                        />
                                        <select
                                            className="w-24 p-3 bg-surface border border-cardAccent rounded-xl text-textPrimary font-bold focus:border-primary outline-none transition-colors text-sm"
                                            value={ing.unit}
                                            onChange={e => updateIngredient(index, 'unit', e.target.value)}
                                        >
                                            <option value="unit">{language === 'ar' ? 'وحدة' : 'Unit'}</option>
                                            <option value="kg">{language === 'ar' ? 'كجم' : 'Kg'}</option>
                                            <option value="g">{language === 'ar' ? 'جرام' : 'g'}</option>
                                            <option value="l">{language === 'ar' ? 'لتر' : 'L'}</option>
                                            <option value="ml">{language === 'ar' ? 'مل' : 'ml'}</option>
                                        </select>
                                        <button onClick={() => removeIngredient(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* ملاحظات */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                                </label>
                                <textarea
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none transition-colors resize-none"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder={language === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'}
                                />
                            </div>

                            <button
                                onClick={editingRecipe ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingRecipe ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'حفظ الوصفة' : 'Save Recipe')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BOM;
