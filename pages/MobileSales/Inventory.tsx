// @ts-nocheck
// المبيعات المتنقلة - جرد السيارات
// متابعة مخزون كل سيارة

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Package, Search, Car, Plus, XCircle, Minus,
    TrendingUp, AlertTriangle
} from 'lucide-react';

interface VehicleInventory {
    vehicleId: string;
    vehiclePlate: string;
    items: {
        itemId: string;
        itemName: string;
        quantity: number;
        unit: string;
    }[];
    lastUpdated: string;
}

const VehicleInventoryPage: React.FC = () => {
    const { inventory, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    // السيارات من localStorage
    const vehicles = useMemo(() => {
        const saved = localStorage.getItem('mobile_sales_vehicles');
        return saved ? JSON.parse(saved) : [];
    }, []);

    const [vehicleInventories, setVehicleInventories] = useState<VehicleInventory[]>(() => {
        const saved = localStorage.getItem('vehicle_inventories');
        return saved ? JSON.parse(saved) : [];
    });

    const [selectedVehicle, setSelectedVehicle] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        itemId: '',
        quantity: 0
    });

    const saveInventories = (data: VehicleInventory[]) => {
        localStorage.setItem('vehicle_inventories', JSON.stringify(data));
        setVehicleInventories(data);
    };

    const currentVehicleInventory = vehicleInventories.find(v => v.vehicleId === selectedVehicle);

    const addItemToVehicle = () => {
        if (!selectedVehicle || !formData.itemId || formData.quantity <= 0) {
            alert(language === 'ar' ? 'يرجى اختيار الصنف والكمية' : 'Please select item and quantity');
            return;
        }

        const item = inventory.find(i => i.id === formData.itemId);
        if (!item) return;

        const vehicle = vehicles.find((v: any) => v.id === selectedVehicle);
        if (!vehicle) return;

        const existingInventory = vehicleInventories.find(v => v.vehicleId === selectedVehicle);

        if (existingInventory) {
            const existingItem = existingInventory.items.find(i => i.itemId === formData.itemId);
            if (existingItem) {
                existingItem.quantity += formData.quantity;
            } else {
                existingInventory.items.push({
                    itemId: formData.itemId,
                    itemName: item.name,
                    quantity: formData.quantity,
                    unit: item.unit
                });
            }
            existingInventory.lastUpdated = new Date().toISOString();
            saveInventories([...vehicleInventories]);
        } else {
            const newInventory: VehicleInventory = {
                vehicleId: selectedVehicle,
                vehiclePlate: vehicle.plateNumber,
                items: [{
                    itemId: formData.itemId,
                    itemName: item.name,
                    quantity: formData.quantity,
                    unit: item.unit
                }],
                lastUpdated: new Date().toISOString()
            };
            saveInventories([...vehicleInventories, newInventory]);
        }

        setShowModal(false);
        setFormData({ itemId: '', quantity: 0 });
    };

    const removeItem = (itemId: string) => {
        if (!selectedVehicle) return;

        saveInventories(vehicleInventories.map(v => {
            if (v.vehicleId === selectedVehicle) {
                return {
                    ...v,
                    items: v.items.filter(i => i.itemId !== itemId),
                    lastUpdated: new Date().toISOString()
                };
            }
            return v;
        }));
    };

    const stats = useMemo(() => {
        const totalItems = vehicleInventories.reduce((sum, v) => sum + v.items.length, 0);
        const totalQuantity = vehicleInventories.reduce((sum, v) =>
            sum + v.items.reduce((s, i) => s + i.quantity, 0), 0);
        return { totalItems, totalQuantity, vehiclesWithStock: vehicleInventories.length };
    }, [vehicleInventories]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'جرد السيارات' : 'Vehicle Inventory'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'متابعة مخزون كل سيارة' : 'Track inventory per vehicle'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <select
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary min-w-[200px]"
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                    >
                        <option value="">{language === 'ar' ? 'اختر السيارة...' : 'Select Vehicle...'}</option>
                        {vehicles.map((v: any) => (
                            <option key={v.id} value={v.id}>{v.plateNumber} - {v.model}</option>
                        ))}
                    </select>

                    {selectedVehicle && (
                        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                            <Plus size={20} />
                            {language === 'ar' ? 'إضافة صنف' : 'Add Item'}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Car className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'سيارات بمخزون' : 'Vehicles w/ Stock'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.vehiclesWithStock}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Package className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'أنواع الأصناف' : 'Item Types'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.totalItems}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الكميات' : 'Total Qty'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.totalQuantity}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle Inventory */}
            {selectedVehicle ? (
                <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                    <div className="p-6 border-b border-cardAccent bg-background/30 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Car className="text-primary" size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-textPrimary text-lg">
                                    {vehicles.find((v: any) => v.id === selectedVehicle)?.plateNumber}
                                </h3>
                                <p className="text-secondary text-sm">
                                    {currentVehicleInventory?.items.length || 0} {language === 'ar' ? 'أصناف' : 'items'}
                                </p>
                            </div>
                        </div>
                        {currentVehicleInventory && (
                            <span className="text-xs text-secondary">
                                {language === 'ar' ? 'آخر تحديث:' : 'Updated:'} {new Date(currentVehicleInventory.lastUpdated).toLocaleString('ar-EG')}
                            </span>
                        )}
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cardAccent bg-background/50">
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الصنف' : 'Item'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الوحدة' : 'Unit'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إزالة' : 'Remove'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!currentVehicleInventory || currentVehicleInventory.items.length === 0) ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center">
                                        <Package size={48} className="mx-auto text-secondary/30 mb-4" />
                                        <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد أصناف في هذه السيارة' : 'No items in this vehicle'}</p>
                                    </td>
                                </tr>
                            ) : (
                                currentVehicleInventory.items.map(item => (
                                    <tr key={item.itemId} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-accentBlue/10 flex items-center justify-center">
                                                    <Package className="text-accentBlue" size={18} />
                                                </div>
                                                <span className="font-black text-textPrimary">{item.itemName}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`font-black text-lg ${item.quantity < 10 ? 'text-red-500' : 'text-accentGreen'}`}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center"><span className="text-secondary font-bold">{item.unit}</span></td>
                                        <td className="p-5 text-center">
                                            <button
                                                onClick={() => removeItem(item.itemId)}
                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Minus size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-surface rounded-[32px] border border-cardAccent p-12 text-center">
                    <Car size={64} className="mx-auto text-secondary/30 mb-4" />
                    <p className="text-secondary font-bold text-lg">{language === 'ar' ? 'اختر سيارة لعرض المخزون' : 'Select a vehicle to view inventory'}</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {language === 'ar' ? 'إضافة صنف للسيارة' : 'Add Item to Vehicle'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الصنف' : 'Item'} *
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.itemId}
                                    onChange={e => setFormData({ ...formData, itemId: e.target.value })}
                                >
                                    <option value="">{language === 'ar' ? 'اختر الصنف...' : 'Select Item...'}</option>
                                    {inventory.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الكمية' : 'Quantity'} *
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold text-xl focus:border-primary outline-none"
                                    value={formData.quantity || ''}
                                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    min={1}
                                />
                            </div>

                            <button
                                onClick={addItemToVehicle}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {language === 'ar' ? 'إضافة للسيارة' : 'Add to Vehicle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleInventoryPage;
