// المبيعات المتنقلة - السيارات
// تعريف وإدارة مركبات التوصيل

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
    Car, Search, Plus, XCircle, Trash2, Edit3,
    LayoutGrid, List, User, MapPin, Package
} from 'lucide-react';

interface Vehicle {
    id: string;
    plateNumber: string;
    model: string;
    driverId: string;
    driverName: string;
    status: 'active' | 'inactive' | 'maintenance';
    notes?: string;
}

const Vehicles: React.FC = () => {
    const { language } = useLanguage();

    const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
        const saved = localStorage.getItem('mobile_sales_vehicles');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({
        plateNumber: '',
        model: '',
        driverName: '',
        status: 'active' as Vehicle['status'],
        notes: ''
    });

    const saveVehicles = (data: Vehicle[]) => {
        localStorage.setItem('mobile_sales_vehicles', JSON.stringify(data));
        setVehicles(data);
    };

    const filteredVehicles = vehicles.filter(v =>
        v.plateNumber.includes(searchQuery) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driverName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        if (!formData.plateNumber || !formData.model) {
            alert(language === 'ar' ? 'يرجى إدخال رقم اللوحة والموديل' : 'Please enter plate number and model');
            return;
        }

        const newVehicle: Vehicle = {
            id: Date.now().toString(),
            plateNumber: formData.plateNumber,
            model: formData.model,
            driverId: '',
            driverName: formData.driverName,
            status: formData.status,
            notes: formData.notes
        };

        saveVehicles([...vehicles, newVehicle]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingVehicle || !formData.plateNumber) return;

        const updatedVehicle: Vehicle = {
            ...editingVehicle,
            plateNumber: formData.plateNumber,
            model: formData.model,
            driverName: formData.driverName,
            status: formData.status,
            notes: formData.notes
        };

        saveVehicles(vehicles.map(v => v.id === editingVehicle.id ? updatedVehicle : v));
        closeModal();
    };

    const openEditModal = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            plateNumber: vehicle.plateNumber,
            model: vehicle.model,
            driverName: vehicle.driverName,
            status: vehicle.status,
            notes: vehicle.notes || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingVehicle(null);
        setFormData({ plateNumber: '', model: '', driverName: '', status: 'active', notes: '' });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذه السيارة؟' : 'Delete this vehicle?')) {
            saveVehicles(vehicles.filter(v => v.id !== id));
        }
    };

    const getStatusColor = (status: Vehicle['status']) => {
        switch (status) {
            case 'active': return 'bg-accentGreen/10 text-accentGreen';
            case 'inactive': return 'bg-secondary/10 text-secondary';
            case 'maintenance': return 'bg-primary/10 text-primary';
            default: return 'bg-secondary/10 text-secondary';
        }
    };

    const getStatusName = (status: Vehicle['status']) => {
        const names = {
            active: language === 'ar' ? 'نشطة' : 'Active',
            inactive: language === 'ar' ? 'غير نشطة' : 'Inactive',
            maintenance: language === 'ar' ? 'صيانة' : 'Maintenance'
        };
        return names[status];
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'السيارات' : 'Vehicles'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة مركبات التوصيل والبيع المتنقل' : 'Manage delivery and mobile sales vehicles'}
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
                        {language === 'ar' ? 'إضافة سيارة' : 'Add Vehicle'}
                    </button>
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
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي السيارات' : 'Total Vehicles'}</p>
                            <p className="text-2xl font-black text-textPrimary">{vehicles.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Car className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'نشطة' : 'Active'}</p>
                            <p className="text-2xl font-black text-accentGreen">{vehicles.filter(v => v.status === 'active').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Car className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'في الصيانة' : 'In Maintenance'}</p>
                            <p className="text-2xl font-black text-primary">{vehicles.filter(v => v.status === 'maintenance').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVehicles.map(vehicle => (
                        <div key={vehicle.id} className="bg-surface p-8 rounded-[32px] border border-cardAccent hover:border-primary/40 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[22px] bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Car className="text-primary" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-textPrimary text-lg">{vehicle.plateNumber}</h3>
                                        <p className="text-xs text-secondary font-bold">{vehicle.model}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(vehicle)} className="p-2.5 bg-background border border-cardAccent text-primary rounded-xl hover:bg-primary hover:text-background transition-all">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(vehicle.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-secondary text-sm">
                                    <User size={14} /> <span className="font-bold">{vehicle.driverName || language === 'ar' ? 'بدون سائق' : 'No Driver'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(vehicle.status)}`}>
                                        {getStatusName(vehicle.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        </div>
                    ))}

                    {filteredVehicles.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <Car size={48} className="mx-auto text-secondary/30 mb-4" />
                            <p className="text-secondary font-bold">
                                {language === 'ar' ? 'لا توجد سيارات' : 'No vehicles found'}
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
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'رقم اللوحة' : 'Plate'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الموديل' : 'Model'}</th>
                                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'السائق' : 'Driver'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.map(vehicle => (
                                <tr key={vehicle.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <Car className="text-primary" size={20} />
                                            </div>
                                            <span className="font-black text-textPrimary">{vehicle.plateNumber}</span>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="text-secondary font-bold">{vehicle.model}</span></td>
                                    <td className="p-5"><span className="text-secondary font-bold">{vehicle.driverName || '-'}</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(vehicle.status)}`}>
                                            {getStatusName(vehicle.status)}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditModal(vehicle)} className="p-2.5 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit3 size={14} /></button>
                                            <button onClick={() => handleDelete(vehicle.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
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
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingVehicle ? (language === 'ar' ? 'تعديل السيارة' : 'Edit Vehicle') : (language === 'ar' ? 'إضافة سيارة جديدة' : 'Add New Vehicle')}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'رقم اللوحة' : 'Plate Number'} *
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.plateNumber}
                                        onChange={e => setFormData({ ...formData, plateNumber: e.target.value })}
                                        placeholder="ABC 1234"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الموديل' : 'Model'} *
                                    </label>
                                    <input
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                        placeholder="Toyota Hilux"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم السائق' : 'Driver Name'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.driverName}
                                    onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الحالة' : 'Status'}
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as Vehicle['status'] })}
                                >
                                    <option value="active">{language === 'ar' ? 'نشطة' : 'Active'}</option>
                                    <option value="inactive">{language === 'ar' ? 'غير نشطة' : 'Inactive'}</option>
                                    <option value="maintenance">{language === 'ar' ? 'في الصيانة' : 'Maintenance'}</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={editingVehicle ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingVehicle ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة السيارة' : 'Add Vehicle')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
