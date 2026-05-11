// المبيعات المتنقلة - التسويات
// تسوية حسابات السيارات والمندوبين

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Calculator, Search, Car, Calendar, DollarSign,
    CheckCircle, Clock, FileText, Plus, XCircle
} from 'lucide-react';

interface Settlement {
    id: string;
    vehicleId: string;
    vehiclePlate: string;
    driverName: string;
    date: string;
    salesTotal: number;
    cashCollected: number;
    debtsCollected: number;
    expenses: number;
    netAmount: number;
    status: 'pending' | 'approved';
    notes?: string;
}

const Settlements: React.FC = () => {
    const { settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    // السيارات
    const vehicles = useMemo(() => {
        const saved = localStorage.getItem('mobile_sales_vehicles');
        return saved ? JSON.parse(saved) : [];
    }, []);

    const [settlements, setSettlements] = useState<Settlement[]>(() => {
        const saved = localStorage.getItem('vehicle_settlements');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [formData, setFormData] = useState({
        vehicleId: '',
        salesTotal: 0,
        cashCollected: 0,
        debtsCollected: 0,
        expenses: 0,
        notes: ''
    });

    const saveSettlements = (data: Settlement[]) => {
        localStorage.setItem('vehicle_settlements', JSON.stringify(data));
        setSettlements(data);
    };

    const filteredSettlements = settlements.filter(s => {
        const matchesSearch = s.vehiclePlate.includes(searchQuery) || s.driverName.includes(searchQuery);
        const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleAdd = () => {
        if (!formData.vehicleId) {
            alert(language === 'ar' ? 'يرجى اختيار السيارة' : 'Please select vehicle');
            return;
        }

        const vehicle = vehicles.find((v: any) => v.id === formData.vehicleId);
        const netAmount = formData.cashCollected + formData.debtsCollected - formData.expenses;

        const newSettlement: Settlement = {
            id: Date.now().toString(),
            vehicleId: formData.vehicleId,
            vehiclePlate: vehicle?.plateNumber || '',
            driverName: vehicle?.driverName || '',
            date: new Date().toISOString().split('T')[0],
            salesTotal: formData.salesTotal,
            cashCollected: formData.cashCollected,
            debtsCollected: formData.debtsCollected,
            expenses: formData.expenses,
            netAmount,
            status: 'pending',
            notes: formData.notes
        };

        saveSettlements([...settlements, newSettlement]);
        closeModal();
    };

    const approveSettlement = (id: string) => {
        saveSettlements(settlements.map(s => s.id === id ? { ...s, status: 'approved' as const } : s));
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ vehicleId: '', salesTotal: 0, cashCollected: 0, debtsCollected: 0, expenses: 0, notes: '' });
    };

    const stats = useMemo(() => ({
        total: settlements.length,
        pending: settlements.filter(s => s.status === 'pending').length,
        totalNet: settlements.reduce((sum, s) => sum + s.netAmount, 0),
        todayNet: settlements.filter(s => s.date === new Date().toISOString().split('T')[0]).reduce((sum, s) => sum + s.netAmount, 0)
    }), [settlements]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'التسويات' : 'Settlements'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'تسوية حسابات السيارات والمندوبين' : 'Vehicle and driver account settlements'}
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
                        <option value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</option>
                        <option value="approved">{language === 'ar' ? 'معتمد' : 'Approved'}</option>
                    </select>

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'تسوية جديدة' : 'New Settlement'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <FileText className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي التسويات' : 'Total'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <Clock className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'معلقة' : 'Pending'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'صافي اليوم' : 'Today Net'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.todayNet.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Calculator className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الصافي' : 'Total Net'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.totalNet.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settlements Table */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'السيارة' : 'Vehicle'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'النقدي' : 'Cash'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'التحصيل' : 'Debts'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المصروفات' : 'Expenses'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الصافي' : 'Net'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'اعتماد' : 'Approve'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSettlements.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-12 text-center">
                                    <Calculator size={48} className="mx-auto text-secondary/30 mb-4" />
                                    <p className="text-secondary font-bold">{language === 'ar' ? 'لا توجد تسويات' : 'No settlements found'}</p>
                                </td>
                            </tr>
                        ) : (
                            filteredSettlements.map(s => (
                                <tr key={s.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Car className="text-primary" size={18} />
                                            </div>
                                            <div>
                                                <span className="font-black text-textPrimary block">{s.vehiclePlate}</span>
                                                <span className="text-xs text-secondary">{s.driverName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="text-secondary font-bold">{new Date(s.date).toLocaleDateString('ar-EG')}</span></td>
                                    <td className="p-5"><span className="font-bold text-accentGreen">{s.cashCollected.toLocaleString()}</span></td>
                                    <td className="p-5"><span className="font-bold text-accentBlue">{s.debtsCollected.toLocaleString()}</span></td>
                                    <td className="p-5"><span className="font-bold text-red-500">-{s.expenses.toLocaleString()}</span></td>
                                    <td className="p-5"><span className="font-black text-primary text-lg">{s.netAmount.toLocaleString()} {currency}</span></td>
                                    <td className="p-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${s.status === 'approved' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>
                                            {s.status === 'approved' ? (language === 'ar' ? 'معتمد' : 'Approved') : (language === 'ar' ? 'معلق' : 'Pending')}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        {s.status === 'pending' && (
                                            <button
                                                onClick={() => approveSettlement(s.id)}
                                                className="p-2 bg-accentGreen/10 text-accentGreen rounded-lg hover:bg-accentGreen hover:text-white transition-all"
                                            >
                                                <CheckCircle size={14} />
                                            </button>
                                        )}
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
                                {language === 'ar' ? 'تسوية جديدة' : 'New Settlement'}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'السيارة' : 'Vehicle'} *
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.vehicleId}
                                    onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                                >
                                    <option value="">{language === 'ar' ? 'اختر السيارة...' : 'Select Vehicle...'}</option>
                                    {vehicles.map((v: any) => (
                                        <option key={v.id} value={v.id}>{v.plateNumber} - {v.driverName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'النقدي المحصل' : 'Cash Collected'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.cashCollected || ''}
                                        onChange={e => setFormData({ ...formData, cashCollected: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'الديون المحصلة' : 'Debts Collected'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.debtsCollected || ''}
                                        onChange={e => setFormData({ ...formData, debtsCollected: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'المصروفات' : 'Expenses'}
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.expenses || ''}
                                    onChange={e => setFormData({ ...formData, expenses: Number(e.target.value) })}
                                />
                            </div>

                            {/* Net Preview */}
                            <div className="bg-accentGreen/10 border border-accentGreen/20 rounded-2xl p-4">
                                <p className="text-[10px] text-accentGreen font-black uppercase mb-1">{language === 'ar' ? 'صافي التسوية' : 'Net Settlement'}</p>
                                <p className="text-2xl font-black text-accentGreen">
                                    {(formData.cashCollected + formData.debtsCollected - formData.expenses).toLocaleString()} {currency}
                                </p>
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
                                {language === 'ar' ? 'حفظ التسوية' : 'Save Settlement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settlements;
