// @ts-nocheck

import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { 
    Clock, CheckCircle2, Flame, ListOrdered, 
    Volume2, VolumeX, Maximize2, Minimize2, AlertTriangle, RotateCcw
} from 'lucide-react';
import { Order } from '../types';
import { EmptyState } from '../components/ui/Atoms';

const NEW_ORDER_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const KitchenTicket = React.memo(({ 
    order, 
    onUpdateStatus, 
    tables, 
    isCompact 
}: { 
    order: Order, 
    onUpdateStatus: (id: string, s: Order['status']) => void, 
    tables: any[],
    isCompact: boolean
}) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const calculateElapsed = () => {
            const mins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            setElapsed(mins);
        };
        calculateElapsed();
        const interval = setInterval(calculateElapsed, 60000);
        return () => clearInterval(interval);
    }, [order.createdAt]);

    const isLate = elapsed >= 10;
    const isWarning = elapsed >= 5 && elapsed < 10;

    const getAgeColor = () => {
        if (elapsed < 5) return 'border-accentGreen bg-accentGreen/5';
        if (isWarning) return 'border-primary bg-primary/5';
        return 'border-red-500 bg-red-500/10 animate-pulse';
    };

    const getBadgeColor = () => {
        if (elapsed < 5) return 'bg-accentGreen';
        if (isWarning) return 'bg-primary';
        return 'bg-red-500';
    };

    const table = tables.find(t => t.id === order.tableId);

    return (
        <div className={`rounded-[20px] border-2 flex flex-col justify-between overflow-hidden shadow-md transition-all duration-500 ${getAgeColor()} ${isCompact ? 'min-h-[180px]' : 'min-h-[240px]'}`}>
            <div className="p-3">
                <div className="flex justify-between items-start mb-3">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className={`${isCompact ? 'text-lg' : 'text-xl'} font-black text-white`}>#{order.id.slice(-4)}</span>
                            {isLate && <AlertTriangle size={14} className="text-red-500" />}
                        </div>
                        <p className="text-[9px] font-black text-secondary uppercase tracking-widest truncate max-w-[80px]">
                            {order.type === 'customer' ? (order.customerName || 'عميل') : 'تيك أواي'}
                        </p>
                    </div>
                    <div className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-1 text-white shadow-sm ${getBadgeColor()}`}>
                        <Clock size={8} /> {elapsed} د
                    </div>
                </div>

                <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="bg-background/40 p-1.5 rounded-lg border border-white/5">
                            <div className="flex gap-2 items-center">
                                <span className="text-xs font-black text-primary">{item.quantity}x</span>
                                <div className="min-w-0">
                                    <span className="text-[11px] font-black text-white block truncate">{item.nameAr}</span>
                                    {item.selectedVariant && (
                                        <span className="text-[7px] font-bold text-accentBlue block leading-none">
                                            {item.selectedVariant.nameAr}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-2 bg-background/80 border-t border-white/5">
                {order.status === 'pending' && (
                    <button onClick={() => onUpdateStatus(order.id, 'preparing')} className="w-full py-2 bg-blue-600 text-white rounded-lg font-black text-[10px] hover:bg-blue-700 transition-all">بدء التحضير</button>
                )}
                {order.status === 'preparing' && (
                    <button onClick={() => onUpdateStatus(order.id, 'ready')} className="w-full py-2 bg-accentGreen text-background rounded-lg font-black text-[10px] hover:bg-accentGreen/90 transition-all">جاهز</button>
                )}
                {order.status === 'ready' && (
                    <button onClick={() => onUpdateStatus(order.id, 'completed')} className="w-full py-2 bg-white text-background rounded-lg font-black text-[10px] hover:bg-gray-100 transition-all">إتمام</button>
                )}
            </div>
        </div>
    );
});

const Kitchen: React.FC = () => {
    const { orders, updateOrderStatus, tables, recallLastOrder, lastCompletedOrderId, categories } = useData();
    const [stationFilter, setStationFilter] = useState('all');
    const [prevOrdersCount, setPrevOrdersCount] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCompact, setIsCompact] = useState(true);

    const activeOrders = useMemo(() => {
        return orders
            .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [orders]);

    useEffect(() => {
        if (activeOrders.length > prevOrdersCount && !isMuted) {
            new Audio(NEW_ORDER_SOUND).play().catch(() => {});
        }
        setPrevOrdersCount(activeOrders.length);
    }, [activeOrders.length, prevOrdersCount, isMuted]);

    const consolidatedItems = useMemo(() => {
        const counts: Record<string, { name: string, qty: number, variant?: string }> = {};
        activeOrders.forEach(order => {
            order.items.forEach(item => {
                const key = `${item.id}-${item.selectedVariant?.id || 'base'}`;
                if (counts[key]) counts[key].qty += item.quantity;
                else counts[key] = { name: item.nameAr, qty: item.quantity, variant: item.selectedVariant?.nameAr };
            });
        });
        return Object.values(counts);
    }, [activeOrders]);

    return (
        <div className="h-full bg-background font-cairo overflow-hidden flex flex-col gap-3">
            <div className="flex flex-col xl:flex-row justify-between items-center gap-3 bg-surface p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                        <Flame size={16} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white leading-tight">المطبخ</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                             <button onClick={() => setIsMuted(!isMuted)} className={`text-[8px] font-black uppercase ${isMuted ? 'text-red-500' : 'text-accentGreen'}`}>
                                {isMuted ? 'صامت' : 'تنبيه مفعل'}
                             </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {lastCompletedOrderId && (
                        <button onClick={recallLastOrder} className="flex items-center gap-1.5 bg-purple-600/20 text-purple-400 border border-purple-600/30 px-3 py-1.5 rounded-xl font-black text-[9px] hover:bg-purple-600 hover:text-white transition-all">
                            <RotateCcw size={12} /> تراجع
                        </button>
                    )}
                    <div className="flex bg-background p-1 rounded-xl border border-white/10">
                        <button onClick={() => setStationFilter('all')} className={`px-3 py-1 rounded-lg font-black text-[9px] transition-all ${stationFilter === 'all' ? 'bg-primary text-background shadow-sm' : 'text-secondary'}`}>الكل</button>
                        {categories.slice(0, 3).map(cat => (
                             <button key={cat.id} onClick={() => setStationFilter(cat.id)} className={`px-3 py-1 rounded-lg font-black text-[9px] transition-all ${stationFilter === cat.id ? 'bg-primary text-background shadow-sm' : 'text-secondary'}`}>{cat.nameAr}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* تصغير مربعات إجمالي المطلوب الآن */}
            {consolidatedItems.length > 0 && (
                <div className="bg-surface/30 p-2 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 min-w-max">
                        <div className="flex items-center gap-1 px-2 text-primary">
                            <ListOrdered size={12} />
                            <span className="text-[9px] font-black uppercase whitespace-nowrap">المطلوب:</span>
                        </div>
                        {consolidatedItems.map((item, idx) => (
                            <div key={idx} className="bg-background px-3 py-1.5 rounded-lg border border-primary/10 flex items-center gap-2 shadow-sm">
                                <span className="text-sm font-black text-primary leading-none">{item.qty}</span>
                                <span className="text-[9px] font-black text-white truncate max-w-[70px]">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeOrders.length === 0 ? (
                <EmptyState icon={CheckCircle2} title="المطبخ فارغ" description="جميع الطلبات تم تجهيزها بنجاح" />
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8">
                        {activeOrders.map(order => (
                            <KitchenTicket key={order.id} order={order} onUpdateStatus={updateOrderStatus} tables={tables} isCompact={isCompact} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kitchen;
