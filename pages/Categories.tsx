
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Trash2, Edit3, XCircle, Grid } from 'lucide-react';
import { Category } from '../types';

const Categories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const { t, language } = useLanguage();

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<Category>({ id: '', nameAr: '', nameEn: '' });

  const handleOpenAdd = () => {
    setFormData({ id: Date.now().toString(), nameAr: '', nameEn: '' });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleOpenEdit = (c: Category) => {
    setFormData(c);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSave = () => {
      if(!formData.nameAr || !formData.nameEn) return;
      if(isEdit) updateCategory(formData);
      else addCategory(formData);
      setShowModal(false);
  };

  return (
    <div className="space-y-8 pb-12 font-cairo">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-black text-white">{t('categories')}</h2>
            <p className="text-secondary text-xs mt-1 font-bold">إدارة الأقسام الرئيسية في قائمة الطعام</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary text-background px-8 py-3.5 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
            <Plus size={20} /> {t('add')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map(cat => (
            <div key={cat.id} className="bg-surface p-8 rounded-[32px] border border-white/5 hover:border-primary/50 transition-all group flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-background flex items-center justify-center text-primary mb-6 border border-white/5 shadow-xl">
                    <Grid size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-1">{language === 'ar' ? cat.nameAr : cat.nameEn}</h3>
                <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-6">{cat.nameEn}</p>
                <div className="flex gap-2 w-full">
                    <button onClick={() => handleOpenEdit(cat)} className="flex-1 py-3 bg-background text-secondary hover:text-primary rounded-xl transition-all border border-white/5"><Edit3 size={16} className="mx-auto" /></button>
                    <button onClick={() => deleteCategory(cat.id)} className="flex-1 py-3 bg-background text-secondary hover:text-red-500 rounded-xl transition-all border border-white/5"><Trash2 size={16} className="mx-auto" /></button>
                </div>
            </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
            <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-md shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-white">{isEdit ? 'تعديل قسم' : 'إضافة قسم جديد'}</h3>
                    <button onClick={() => setShowModal(false)} className="text-secondary hover:text-white transition-colors"><XCircle size={32}/></button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">اسم القسم (عربي)</label>
                        <input className="w-full p-4 bg-background border border-white/5 rounded-2xl text-white font-bold" value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">اسم القسم (إنجليزي)</label>
                        <input className="w-full p-4 bg-background border border-white/5 rounded-2xl text-white font-bold" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
                    </div>
                    <button onClick={handleSave} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-all">
                        {t('save')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
