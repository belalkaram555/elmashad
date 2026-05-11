
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Trash2, MapPin, Warehouse as WarehouseIcon, Edit3, XCircle } from 'lucide-react';
import { Warehouse } from '../types';
import { Button, Input } from '../components/ui/Atoms';
import { Modal } from '../components/ui/Modal';

const Warehouses: React.FC = () => {
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useData();
  const { t, language } = useLanguage();

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<Warehouse>({ id: '', name: '', location: '' });

  const handleOpenAdd = () => {
    setFormData({ id: Date.now().toString(), name: '', location: '' });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleOpenEdit = (w: Warehouse) => {
    setFormData(w);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    if (isEdit) {
      updateWarehouse(formData);
    } else {
      addWarehouse({ ...formData, id: Date.now().toString() });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-8 pb-12 font-cairo">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white">{t('warehouses')}</h2>
          <p className="text-secondary text-xs mt-1 font-bold">إدارة مواقع التخزين والتوزيع المكاني</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={20} /> إضافة مخزن
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map(w => (
          <div key={w.id} className="bg-surface p-8 rounded-[32px] border border-white/5 hover:border-primary/40 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center text-primary border border-white/5 shadow-inner">
                  <WarehouseIcon size={24} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">{w.name}</h3>
                  <p className="text-xs text-secondary font-bold flex items-center gap-1"><MapPin size={12} /> {w.location || 'غير محدد'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
              <button onClick={() => handleOpenEdit(w)} className="flex-1 py-3 bg-background border border-white/5 text-accentBlue rounded-xl hover:bg-accentBlue hover:text-white transition-all shadow-sm font-bold text-xs flex items-center justify-center gap-2">
                <Edit3 size={14} /> تعديل
              </button>
              {w.id !== '1' && (
                <button onClick={() => deleteWarehouse(w.id)} className="flex-1 py-3 bg-background border border-white/5 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm font-bold text-xs flex items-center justify-center gap-2">
                  <Trash2 size={14} /> حذف
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <Modal.Header title={isEdit ? 'تعديل بيانات المخزن' : 'إضافة مخزن جديد'} subtitle="أدخل تفاصيل الموقع والمسمى" />
          <Modal.Body>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('name')}</label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="مثال: المخزن الرئيسي" autoFocus />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('location')}</label>
                <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="مثال: الطابق الأرضي - خلف المطبخ" />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth size="lg" onClick={handleSave}>{isEdit ? 'حفظ التغييرات' : 'إضافة المخزن'}</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Warehouses;
