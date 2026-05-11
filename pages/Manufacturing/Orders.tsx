// التصنيع - أوامر التصنيع
// إدارة أوامر الإنتاج والتصنيع

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    ClipboardList, Search, Plus, XCircle, Trash2, Edit3,
    Package, CheckCircle, Clock, AlertCircle, Play, Pause
} from 'lucide-react';

interface ManufacturingOrder {
    id: string;
    orderNumber: string;
    recipeId: string;
    recipeName: string;
    quantity: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    startDate?: string;
    endDate?: string;
    notes?: string;
    createdAt: string;
}

const ManufacturingOrders: React.FC = () => {
    const { settings } = useData();
    const { language } = useLanguage();

    const [orders, setOrders] = useState<ManufacturingOrder[]>(() => {
        const saved = localStorage.getItem('manufacturing_orders');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [editingOrder, setEditingOrder] = useState<ManufacturingOrder | null>(null);
    const [formData, setFormData] = useState({
        recipeName: '',
        quantity: 1,
        notes: ''
    });

    // الوصفات المحفوظة
    const recipes = useMemo(() => {
        const saved = localStorage.getItem('bom_recipes');
        return saved ? JSON.parse(saved) : [];
    }, []);

    const saveOrders = (data: ManufacturingOrder[]) => {
        localStorage.setItem('manufacturing_orders', JSON.stringify(data));
        setOrders(data);
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.orderNumber.includes(searchQuery) || o.recipeName.includes(searchQuery);
        const matchesFilter = filterStatus === 'all' || o.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleAdd = () => {
        if (!formData.recipeName || formData.quantity <= 0) {
            alert(language === 'ar' ? 'يرجى اختيار الوصفة وإدخال الكمية' : 'Please select recipe and enter quantity');
            return;
        }

        const newOrder: ManufacturingOrder = {
            id: Date.now().toString(),
            orderNumber: `MO-${Date.now().toString().slice(-6)}`,
            recipeId: '',
            recipeName: formData.recipeName,
            quantity: formData.quantity,
            status: 'pending',
            notes: formData.notes,
            createdAt: new Date().toISOString()
        };

        saveOrders([...orders, newOrder]);
        closeModal();
    };

    const updateStatus = (id: string, status: ManufacturingOrder['status']) => {
        saveOrders(orders.map(o => {
            if (o.id === id) {
                return {
                    ...o,
                    status,
                    startDate: status === 'in_progress' && !o.startDate ? new Date().toISOString() : o.startDate,
                    endDate: status === 'completed' ? new Date().toISOString() : o.endDate
                };
            }
            return o;
        }));
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingOrder(null);
        setFormData({ recipeName: '', quantity: 1, notes: '' });
    };

    const handleDelete = (id: string) => {
        if (confirm(language === 'ar' ? 'هل تريد حذف هذا الأمر؟' : 'Delete this order?')) {
            saveOrders(orders.filter(o => o.id !== id));
        }
    };

    const getStatusColor = (status: ManufacturingOrder['status']) => {
        switch (status) {
            case 'pending': return 'bg-secondary/10 text-secondary';
            case 'in_progress': return 'bg-primary/10 text-primary';
            case 'completed': return 'bg-accentGreen/10 text-accentGreen';
            case 'cancelled': return 'bg-red-500/10 text-red-500';
            default: return 'bg-secondary/10 text-secondary';
        }
    };

    const getStatusName = (status: ManufacturingOrder['status']) => {
        const names = {
            pending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
            in_progress: language === 'ar' ? 'قيد التنفيذ' : 'In Progress',
            completed: language === 'ar' ? 'مكتمل' : 'Completed',
            cancelled: language === 'ar' ? 'ملغي' : 'Cancelled'
        };
        return names[status];
    };

    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        inProgress: orders.filter(o => o.status === 'in_progress').length,
        completed: orders.filter(o => o.status === 'completed').length
    }), [orders]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'أوامر التصنيع' : 'Manufacturing Orders'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'إدارة أوامر الإنتاج والتصنيع' : 'Manage production and manufacturing orders'}
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

                    <select
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                        <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                        <option value="in_progress">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
                        <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
                    </select>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'أمر جديد' : 'New Order'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <ClipboardList className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الأوامر' : 'Total Orders'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                            <Clock className="text-secondary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
                            <p className="text-2xl font-black text-secondary">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Play className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</p>
                            <p className="text-2xl font-black text-primary">{stats.inProgress}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مكتمل' : 'Completed'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.completed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'رقم الأمر' : 'Order #'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الوصفة' : 'Recipe'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <ClipboardList size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد أوامر' : 'No orders found'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5"><span className="font-black text-primary">{order.orderNumber}</span></td>
                                    <td className="p-5"><span className="font-bold text-textPrimary">{order.recipeName}</span></td>
                                    <td className="p-5 text-center"><span className="font-black text-textPrimary">{order.quantity}</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(order.status)}`}>
                                            {getStatusName(order.status)}
                                        </span>
                                    </td>
                                    <td className="p-5"><span className="text-secondary font-bold">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span></td>
                                    <td className="p-5">
                                        <div className="flex justify-center gap-2">
                                            {order.status === 'pending' && (
                                                <button onClick={() => updateStatus(order.id, 'in_progress')} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all" title={language === 'ar' ? 'بدء التنفيذ' : 'Start'}>
                                                    <Play size={14} />
                                                </button>
                                            )}
                                            {order.status === 'in_progress' && (
                                                <button onClick={() => updateStatus(order.id, 'completed')} className="p-2 bg-accentGreen/10 text-accentGreen rounded-lg hover:bg-accentGreen hover:text-white transition-all" title={language === 'ar' ? 'إكمال' : 'Complete'}>
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(order.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {language === 'ar' ? 'أمر تصنيع جديد' : 'New Manufacturing Order'}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الوصفة' : 'Recipe'} *
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.recipeName}
                                    onChange={e => setFormData({ ...formData, recipeName: e.target.value })}
                                >
                                    <option value="">{language === 'ar' ? 'اختر الوصفة...' : 'Select Recipe...'}</option>
                                    {recipes.map((r: any) => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
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
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    min={1}
                                />
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
                                onClick={handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {language === 'ar' ? 'إنشاء أمر التصنيع' : 'Create Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManufacturingOrders;
