
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, XCircle, Trash2, Edit, Activity, Warehouse as WarehouseIcon, ArrowRightLeft, FileDown, Printer, Search, Filter, Archive } from 'lucide-react';
import { InventoryItem } from '../types';
import { EmptyState, Button, Input } from '../components/ui/Atoms';
import { Modal } from '../components/ui/Modal';

const Inventory: React.FC = () => {
    const { inventory, addInventoryItem, editInventoryItem, deleteInventoryItem, settings, warehouses, transferStock } = useData();
    const { t, language } = useLanguage();

    const [showModal, setShowModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('all');

    const [formItem, setFormItem] = useState<Partial<InventoryItem>>({
        nameEn: '', nameAr: '', unit: 'kg', minLevel: 5, costPerUnit: 0, warehouseQuantities: {}
    });

    const [transferData, setTransferData] = useState({ itemId: '', fromId: '', toId: '', quantity: 0, notes: '' });
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || item.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
            const hasQtyInWh = warehouseFilter === 'all' || (item.warehouseQuantities[warehouseFilter] || 0) > 0;
            return matchesSearch && hasQtyInWh;
        });
    }, [inventory, searchQuery, warehouseFilter]);

    const handleOpenAdd = () => {
        setFormItem({ nameEn: '', nameAr: '', unit: 'kg', minLevel: 5, costPerUnit: 0, warehouseQuantities: {} });
        setIsEdit(false);
        setShowModal(true);
    };

    const handleOpenEdit = (e: React.MouseEvent, item: InventoryItem) => {
        e.stopPropagation();
        setFormItem(item);
        setIsEdit(true);
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formItem.nameEn || !formItem.nameAr) return;
        const safeQuantities: { [key: string]: number } = {};
        warehouses.forEach(w => { safeQuantities[w.id] = Number(formItem.warehouseQuantities?.[w.id] || 0); });
        if (isEdit && formItem.id) {
            editInventoryItem({ ...formItem, warehouseQuantities: safeQuantities } as InventoryItem);
        } else {
            addInventoryItem({ id: Date.now().toString(), nameEn: formItem.nameEn!, nameAr: formItem.nameAr!, unit: formItem.unit || 'kg', minLevel: Number(formItem.minLevel), costPerUnit: Number(formItem.costPerUnit), warehouseQuantities: safeQuantities });
        }
        setShowModal(false);
    };

    const getTotalQuantity = (item: InventoryItem) => Object.values(item.warehouseQuantities).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-8 font-cairo">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">{t('inventory')}</h2>
                    <p className="text-secondary text-xs mt-1 font-bold">إدارة المواد الخام والكميات المتوفرة</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => setShowTransferModal(true)} className="gap-3">
                        <ArrowRightLeft size={18} className="text-accentBlue" /> نقل مخزون
                    </Button>
                    <Button onClick={handleOpenAdd} className="gap-3">
                        <Plus size={20} /> إضافة مادة
                    </Button>
                </div>
            </div>

            {/* Advanced Filter Row - UX Improvement */}
            <div className="bg-surface p-4 rounded-3xl border border-cardAccent flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                    <Input
                        placeholder="ابحث باسم المادة الخام..."
                        className="pr-12 py-3 h-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 bg-background/50 p-1.5 rounded-2xl border border-cardAccent w-full md:w-auto overflow-x-auto">
                    <Filter size={14} className="text-secondary mr-3 shrink-0" />
                    <button
                        onClick={() => setWarehouseFilter('all')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${warehouseFilter === 'all' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
                    >
                        كل المخازن
                    </button>
                    {warehouses.map(w => (
                        <button
                            key={w.id}
                            onClick={() => setWarehouseFilter(w.id)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${warehouseFilter === w.id ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
                        >
                            {w.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-surface rounded-[40px] border border-cardAccent overflow-hidden shadow-2xl">
                {filteredInventory.length === 0 ? (
                    <EmptyState icon={Archive} title="لا توجد مواد خام" description="ابدأ بإضافة أول مادة خام لتتبع مخزونك بدقة" actionLabel="إضافة الآن" onAction={handleOpenAdd} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="text-[10px] text-secondary uppercase bg-background/50 border-b border-cardAccent">
                                <tr>
                                    <th className="px-8 py-6 font-black">اسم المادة</th>
                                    <th className="px-8 py-6 font-black text-center">الكمية الإجمالية</th>
                                    <th className="px-8 py-6 font-black">حد التنبيه</th>
                                    <th className="px-8 py-6 font-black">التكلفة</th>
                                    <th className="px-8 py-6 font-black text-left">إجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cardAccent">
                                {filteredInventory.map(item => {
                                    const totalQty = getTotalQuantity(item);
                                    const isCritical = totalQty <= item.minLevel;
                                    return (
                                        <tr key={item.id} className="hover:bg-background/40 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-1.5 h-10 rounded-full ${isCritical ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-accentGreen'}`} />
                                                    <div>
                                                        <p className="font-black text-textPrimary text-base">{language === 'ar' ? item.nameAr : item.nameEn}</p>
                                                        <p className="text-[10px] text-secondary font-bold uppercase mt-0.5">{item.unit}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`px-5 py-2.5 rounded-2xl font-black text-xs border ${isCritical ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-accentGreen/10 text-accentGreen border-accentGreen/20'
                                                    }`}>
                                                    {totalQty} {item.unit}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-secondary font-bold">{item.minLevel} {item.unit}</td>
                                            <td className="px-8 py-6 font-black text-textPrimary">{item.costPerUnit} {currency}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={(e) => handleOpenEdit(e, item)} className="p-3 bg-surface border border-cardAccent text-accentBlue rounded-xl hover:bg-accentBlue hover:text-white transition-all"><Edit size={16} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteInventoryItem(item.id); }} className="p-3 bg-surface border border-cardAccent text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                    <Modal.Header title={isEdit ? 'تعديل مادة خام' : 'إضافة مادة خام جديدة'} subtitle="أدخل تفاصيل المادة الخام والكميات الأولية" />
                    <Modal.Body>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">اسم المادة (عربي)</label>
                                    <Input value={formItem.nameAr} onChange={e => setFormItem({ ...formItem, nameAr: e.target.value })} placeholder="مثال: طحين ابيض" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">اسم المادة (إنجليزي)</label>
                                    <Input value={formItem.nameEn} onChange={e => setFormItem({ ...formItem, nameEn: e.target.value })} placeholder="e.g. White Flour" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">وحدة القياس</label>
                                    <select
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold appearance-none"
                                        value={formItem.unit}
                                        onChange={e => setFormItem({ ...formItem, unit: e.target.value })}
                                    >
                                        <option value="kg">كيلوجرام (KG)</option>
                                        <option value="g">جرام (G)</option>
                                        <option value="l">لتر (L)</option>
                                        <option value="ml">ملليلتر (ML)</option>
                                        <option value="piece">قطعة (Piece)</option>
                                        <option value="box">كرتونة (Box)</option>
                                        <option value="sack">شوال (Sack)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">حد التنبيه (Low Stock Alert)</label>
                                    <Input type="number" value={formItem.minLevel} onChange={e => setFormItem({ ...formItem, minLevel: Number(e.target.value) })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">تكلفة الوحدة الواحدة</label>
                                <Input type="number" value={formItem.costPerUnit} onChange={e => setFormItem({ ...formItem, costPerUnit: Number(e.target.value) })} />
                            </div>

                            {!isEdit && (
                                <div className="p-4 bg-background/50 rounded-2xl border border-cardAccent">
                                    <h4 className="text-xs font-black text-secondary mb-4 flex items-center gap-2"><WarehouseIcon size={14} /> رصيد المخزون الافتتاحي</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {warehouses.map(w => (
                                            <div key={w.id} className="space-y-1">
                                                <label className="text-[9px] font-bold text-secondary">{w.name}</label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    className="text-center font-bold"
                                                    onChange={e => setFormItem({
                                                        ...formItem,
                                                        warehouseQuantities: {
                                                            ...formItem.warehouseQuantities,
                                                            [w.id]: Number(e.target.value)
                                                        }
                                                    })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button fullWidth size="lg" onClick={handleSave}>{isEdit ? 'حفظ التغييرات' : 'إضافة المادة'}</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {showTransferModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/90 backdrop-blur-2xl p-6">
                    <div className="bg-surface rounded-[48px] border border-cardAccent w-full max-w-2xl shadow-2xl p-12 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-3xl font-black text-textPrimary flex items-center gap-4">
                                <ArrowRightLeft className="text-primary" size={32} /> نقل مخزون بين المواقع
                            </h3>
                            <button onClick={() => setShowTransferModal(false)} className="text-secondary hover:text-textPrimary transition-colors"><XCircle size={32} /></button>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-3">المادة الخام</label>
                                    <select className="w-full p-5 bg-background border border-cardAccent rounded-3xl text-textPrimary font-black outline-none focus:border-primary/50" onChange={e => setTransferData({ ...transferData, itemId: e.target.value })}>
                                        <option value="">اختر المادة...</option>
                                        {inventory.map(i => <option key={i.id} value={i.id}>{i.nameAr}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-3">الكمية</label>
                                    <Input type="number" placeholder="0.00" className="p-5 h-auto text-xl font-black" onChange={e => setTransferData({ ...transferData, quantity: Number(e.target.value) })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-3">من موقع</label>
                                    <select className="w-full p-5 bg-background border border-cardAccent rounded-3xl text-textPrimary font-black outline-none focus:border-primary/50" onChange={e => setTransferData({ ...transferData, fromId: e.target.value })}>
                                        <option value="">المصدر</option>
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-3">إلى موقع</label>
                                    <select className="w-full p-5 bg-background border border-cardAccent rounded-3xl text-textPrimary font-black outline-none focus:border-primary/50" onChange={e => setTransferData({ ...transferData, toId: e.target.value })}>
                                        <option value="">الوجهة</option>
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <Button fullWidth size="lg" onClick={() => { if (transferData.itemId && transferData.fromId && transferData.toId) { transferStock(transferData.itemId, transferData.fromId, transferData.toId, transferData.quantity); setShowTransferModal(false); } }} className="py-6 text-xl">تأكيد عملية النقل</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
