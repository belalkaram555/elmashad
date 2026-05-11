// المبيعات المتنقلة - خط السير
// تعريف وإدارة خطوط سير المندوبين

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    MapPin, Search, Plus, XCircle, Trash2, Edit3,
    Car, Users, Calendar, Route
} from 'lucide-react';

interface SalesRoute {
    id: string;
    name: string;
    vehicleId: string;
    vehiclePlate: string;
    dayOfWeek: number;
    customers: { id: string; name: string; order: number }[];
    isActive: boolean;
}

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Routes: React.FC = () => {
    const { customers } = useData();
    const { language } = useLanguage();

    // السيارات من localStorage
    const vehicles = (() => {
        const saved = localStorage.getItem('mobile_sales_vehicles');
        return saved ? JSON.parse(saved) : [];
    })();

    const [routes, setRoutes] = useState<SalesRoute[]>(() => {
        const saved = localStorage.getItem('sales_routes');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingRoute, setEditingRoute] = useState<SalesRoute | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        vehicleId: '',
        dayOfWeek: 0,
        customerIds: [] as string[]
    });

    const saveRoutes = (data: SalesRoute[]) => {
        localStorage.setItem('sales_routes', JSON.stringify(data));
        setRoutes(data);
    };

    const filteredRoutes = routes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vehiclePlate.includes(searchQuery)
    );

    const handleAdd = () => {
        if (!formData.name || !formData.vehicleId) {
            alert(language === 'ar' ? 'يرجى إدخال اسم الخط واختيار السيارة' : 'Please enter route name and select vehicle');
            return;
        }

        const vehicle = vehicles.find((v: any) => v.id === formData.vehicleId);
        const routeCustomers = formData.customerIds.map((id, index) => {
            const customer = customers.find(c => c.id === id);
            return { id, name: customer?.name || '', order: index + 1 };
        });

        const newRoute: SalesRoute = {
            id: Date.now().toString(),
            name: formData.name,
            vehicleId: formData.vehicleId,
            vehiclePlate: vehicle?.plateNumber || '',
            dayOfWeek: formData.dayOfWeek,
            customers: routeCustomers,
            isActive: true
        };

        saveRoutes([...routes, newRoute]);
        closeModal();
    };

    const handleEdit = () => {
        if (!editingRoute) return;

        const vehicle = vehicles.find((v: any) => v.id === formData.vehicleId);
        const routeCustomers = formData.customerIds.map((id, index) => {
            const customer = customers.find(c => c.id === id);
            return { id, name: customer?.name || '', order: index + 1 };
        });

        saveRoutes(routes.map(r => r.id === editingRoute.id ? {
            ...r,
            name: formData.name,
            vehicleId: formData.vehicleId,
            vehiclePlate: vehicle?.plateNumber || r.vehiclePlate,
            dayOfWeek: formData.dayOfWeek,
            customers: routeCustomers
        } : r));
        closeModal();
    };

    const openEditModal = (route: SalesRoute) => {
        setEditingRoute(route);
        setFormData({
            name: route.name,
            vehicleId: route.vehicleId,
            dayOfWeek: route.dayOfWeek,
            customerIds: route.customers.map(c => c.id)
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRoute(null);
        setFormData({ name: '', vehicleId: '', dayOfWeek: 0, customerIds: [] });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا الخط؟' : 'Delete this route?')) {
            saveRoutes(routes.filter(r => r.id !== id));
        }
    };

    const toggleCustomer = (customerId: string) => {
        setFormData(prev => ({
            ...prev,
            customerIds: prev.customerIds.includes(customerId)
                ? prev.customerIds.filter(id => id !== customerId)
                : [...prev.customerIds, customerId]
        }));
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'خطوط السير' : 'Sales Routes'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'تعريف وإدارة خطوط سير المندوبين' : 'Define and manage sales routes'}
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
                            className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary placeholder:text-secondary/50 w-48"
                        />
                    </div>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'خط جديد' : 'New Route'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Route className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد الخطوط' : 'Total Routes'}</p>
                            <p className="text-2xl font-black text-textPrimary">{routes.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Users className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}</p>
                            <p className="text-2xl font-black text-accentBlue">{routes.reduce((sum, r) => sum + r.customers.length, 0)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <Car className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'السيارات المخصصة' : 'Vehicles Assigned'}</p>
                            <p className="text-2xl font-black text-accentGreen">{new Set(routes.map(r => r.vehicleId)).size}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Routes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRoutes.map(route => (
                    <div key={route.id} className="bg-surface p-6 rounded-[32px] border border-cardAccent hover:border-primary/40 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <MapPin className="text-primary" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-textPrimary">{route.name}</h3>
                                    <p className="text-xs text-secondary">{route.vehiclePlate}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(route)} className="p-2 bg-background border border-cardAccent text-primary rounded-lg hover:bg-primary hover:text-background transition-all">
                                    <Edit3 size={14} />
                                </button>
                                <button onClick={() => handleDelete(route.id)} className="p-2 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={14} className="text-secondary" />
                            <span className="text-sm font-bold text-accentBlue">
                                {language === 'ar' ? DAYS[route.dayOfWeek] : DAYS_EN[route.dayOfWeek]}
                            </span>
                        </div>

                        <div className="bg-background rounded-xl p-3 border border-cardAccent">
                            <p className="text-[10px] text-secondary font-black uppercase mb-2">
                                {language === 'ar' ? 'العملاء' : 'Customers'} ({route.customers.length})
                            </p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {route.customers.map((c, i) => (
                                    <div key={c.id} className="flex items-center gap-2 text-sm">
                                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-black">
                                            {i + 1}
                                        </span>
                                        <span className="text-textPrimary font-bold">{c.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredRoutes.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <MapPin size={48} className="mx-auto text-secondary/30 mb-4" />
                        <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد خطوط سير' : 'No routes found'}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {editingRoute ? (language === 'ar' ? 'تعديل الخط' : 'Edit Route') : (language === 'ar' ? 'خط سير جديد' : 'New Route')}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'اسم الخط' : 'Route Name'} *
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={language === 'ar' ? 'مثال: خط الرياض الشمالي' : 'e.g., North District'}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'السيارة' : 'Vehicle'} *
                                    </label>
                                    <select
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.vehicleId}
                                        onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                                    >
                                        <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
                                        {vehicles.map((v: any) => (
                                            <option key={v.id} value={v.id}>{v.plateNumber}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'اليوم' : 'Day'}
                                    </label>
                                    <select
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.dayOfWeek}
                                        onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                                    >
                                        {(language === 'ar' ? DAYS : DAYS_EN).map((day, i) => (
                                            <option key={i} value={i}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'العملاء' : 'Customers'} ({formData.customerIds.length})
                                </label>
                                <div className="bg-background rounded-2xl border border-cardAccent p-3 max-h-48 overflow-y-auto">
                                    {customers.map(c => (
                                        <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-surface rounded-xl cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.customerIds.includes(c.id)}
                                                onChange={() => toggleCustomer(c.id)}
                                                className="w-4 h-4 accent-primary"
                                            />
                                            <span className="font-bold text-textPrimary">{c.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={editingRoute ? handleEdit : handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {editingRoute ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إنشاء الخط' : 'Create Route')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Routes;
