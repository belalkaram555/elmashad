
import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Order } from '../types';
import { 
  TrendingUp, ShoppingBag, AlertTriangle, DollarSign, 
  PieChart as PieIcon, Zap, Package, CheckCircle2,
  Trophy, ArrowUpRight, BarChart3
} from 'lucide-react';

// Palette mapping for consistent visualization
const CHART_COLORS = ['#FF9F43', '#00CFDE', '#28C76F', '#EA5455', '#7367F0', '#F1C40F'];

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }: any) => (
  <div className="bg-surface p-6 rounded-[32px] border border-cardAccent relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start relative z-10">
      <div className="space-y-2">
        <p className="text-secondary text-[10px] font-black uppercase tracking-widest">{title}</p>
        <h3 className={`text-2xl font-black ${colorClass}`}>{value}</h3>
        {subtitle && <p className="text-[10px] text-secondary font-bold">{subtitle}</p>}
      </div>
      <div className={`p-4 rounded-2xl bg-background border border-cardAccent ${colorClass.replace('text-', 'text-opacity-20 ')} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
    <div className={`absolute -bottom-4 -left-4 w-20 h-20 rounded-full blur-2xl opacity-[0.05] ${colorClass.replace('text-', 'bg-')}`} />
  </div>
);

const Dashboard: React.FC = () => {
  const { orders, inventory, settings, categories } = useData();
  const { t, language } = useLanguage();
  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

  const totalSales = useMemo(() => orders.reduce((sum: number, o: Order) => sum + o.total, 0), [orders]);
  const ordersCount = orders.length;
  
  const lowStockItems = useMemo(() => inventory.filter(i => {
    const totalQty = Object.values(i.warehouseQuantities).reduce((a: number, b: number) => a + b, 0);
    return totalQty <= i.minLevel;
  }).length, [inventory]);

  const salesData = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return dates.map(date => {
      const dayTotal = orders
        .filter(o => o.createdAt.startsWith(date))
        .reduce((sum: number, o: Order) => sum + o.total, 0);
      return { 
        name: new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }), 
        total: dayTotal 
      };
    });
  }, [orders, language]);

  // تحليل توزيع الأقسام
  const categoryDistribution = useMemo(() => {
    if (orders.length === 0) return [];
    const stats: Record<string, number> = {};
    let grandTotal = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        const cat = categories.find(c => c.id === item.categoryId);
        const catName = cat ? (language === 'ar' ? cat.nameAr : cat.nameEn) : (language === 'ar' ? 'أخرى' : 'Other');
        const itemTotal = item.totalItemPrice * item.quantity;
        stats[catName] = (stats[catName] || 0) + itemTotal;
        grandTotal += itemTotal;
      });
    });

    return Object.entries(stats)
      .map(([name, value], idx) => ({
        name,
        value,
        percentage: grandTotal > 0 ? Math.round((value / grandTotal) * 100) : 0,
        color: CHART_COLORS[idx % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [orders, categories, language]);

  // تحليل الأصناف الأكثر مبيعاً (Top Selling Products)
  const topProducts = useMemo(() => {
    if (orders.length === 0) return [];
    const productStats: Record<string, { name: string, qty: number, revenue: number }> = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const key = item.id;
            if (!productStats[key]) {
                productStats[key] = { 
                    name: language === 'ar' ? item.nameAr : item.nameEn, 
                    qty: 0, 
                    revenue: 0 
                };
            }
            productStats[key].qty += item.quantity;
            productStats[key].revenue += item.totalItemPrice * item.quantity;
        });
    });

    const sorted = Object.values(productStats).sort((a, b) => b.qty - a.qty).slice(0, 5);
    const maxQty = sorted[0]?.qty || 1;
    
    return sorted.map(p => ({ ...p, percentage: Math.round((p.qty / maxQty) * 100) }));
  }, [orders, language]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700 font-cairo">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-textPrimary">{t('dashboard')}</h2>
          <p className="text-secondary text-xs mt-1 font-bold">تحليلات الأداء المالي والعمليات المباشرة</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-accentGreen/10 border border-accentGreen/20 rounded-2xl text-accentGreen text-[10px] font-black uppercase">
          <Zap size={14} className="animate-pulse" /> مباشر
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('totalSales')} value={`${totalSales.toLocaleString()} ${currency}`} icon={DollarSign} colorClass="text-accentGreen" subtitle="إجمالي الدخل" />
        <StatCard title={t('totalOrders')} value={ordersCount} icon={ShoppingBag} colorClass="text-primary" subtitle="عدد الفواتير" />
        <StatCard title={t('lowStock')} value={lowStockItems} icon={AlertTriangle} colorClass="text-red-500" subtitle="أصناف النواقص" />
        <StatCard title="متوسط الفاتورة" value={ordersCount > 0 ? (totalSales / ordersCount).toFixed(1) : 0} icon={TrendingUp} colorClass="text-accentBlue" subtitle="معدل صرف العميل" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* شارت المبيعات الرئيسي */}
        <div className="lg:col-span-8 bg-surface p-8 rounded-[40px] border border-cardAccent shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-textPrimary flex items-center gap-3"><TrendingUp className="text-primary" /> مبيعات آخر ٧ أيام</h3>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff9f43" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff9f43" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9A9A9A', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e21', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#ff9f43" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* توزيع الأقسام مبيعاً */}
        <div className="lg:col-span-4 bg-surface p-8 rounded-[40px] border border-cardAccent shadow-sm">
          <h3 className="text-lg font-black text-textPrimary mb-8 flex items-center gap-3"><PieIcon className="text-primary" /> توزيع الأقسام</h3>
          {categoryDistribution.length === 0 ? (
            <div className="h-full flex items-center justify-center text-secondary/30 text-xs font-black py-20">لا توجد بيانات</div>
          ) : (
            <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 mb-8 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      {categoryDistribution.reduce((acc: any, item: any, i: number) => {
                          const strokeDash = (item.percentage * 100) / 100;
                          const offset = categoryDistribution.slice(0, i).reduce((sum, it) => sum + it.percentage, 0);
                          acc.push(
                            <circle key={i} cx="18" cy="18" r="15.9" fill="none" stroke={item.color} strokeWidth="3.5" strokeDasharray={`${strokeDash} 100`} strokeDashoffset={-offset} className="transition-all duration-1000" />
                          );
                          return acc;
                      }, [])}
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-textPrimary">{categoryDistribution[0].percentage}%</span>
                        <span className="text-[7px] font-black text-secondary uppercase tracking-tighter truncate max-w-[60px]">{categoryDistribution[0].name}</span>
                    </div>
                </div>
                <div className="w-full space-y-2 max-h-[140px] overflow-y-auto no-scrollbar">
                    {categoryDistribution.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] font-bold bg-background/40 p-2.5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-textPrimary font-black truncate">{item.name}</span>
                          </div>
                          <span className="font-black text-primary">{item.percentage}%</span>
                      </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الأصناف الأكثر مبيعاً - تصميم جديد بالكامل */}
        <div className="bg-surface p-8 rounded-[40px] border border-cardAccent shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-textPrimary flex items-center gap-3"><Trophy className="text-yellow-500" /> الأصناف الأكثر طلباً</h3>
              <BarChart3 size={18} className="text-secondary opacity-30" />
           </div>
           
           <div className="space-y-6">
              {topProducts.length === 0 ? (
                  <p className="text-center py-10 text-secondary text-xs italic font-bold">لا توجد عمليات بيع مسجلة</p>
              ) : topProducts.map((prod, idx) => (
                  <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-end">
                          <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-secondary bg-background w-6 h-6 flex items-center justify-center rounded-lg border border-cardAccent">#{idx+1}</span>
                              <span className="text-sm font-black text-textPrimary">{prod.name}</span>
                          </div>
                          <div className="text-right">
                              <span className="text-xs font-black text-textPrimary">{prod.qty} <span className="text-[10px] text-secondary font-bold">طلب</span></span>
                          </div>
                      </div>
                      <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-cardAccent">
                          <div 
                            className="h-full bg-gradient-to-l from-primary to-primary/40 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${prod.percentage}%` }}
                          />
                      </div>
                  </div>
              ))}
           </div>
        </div>

        {/* تنبيهات النواقص السريعة */}
        <div className="bg-surface p-8 rounded-[40px] border border-cardAccent shadow-sm">
           <h3 className="text-lg font-black text-textPrimary mb-8 flex items-center gap-3"><Package className="text-red-500" /> حالة المخزون (تحذيرات)</h3>
           <div className="space-y-3">
              {inventory.filter(i => Object.values(i.warehouseQuantities).reduce((a: number, b: number) => a + b, 0) <= i.minLevel).slice(0, 4).map(item => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-background/50 rounded-2xl border border-red-500/10 hover:border-red-500/30 transition-all">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                      <span className="text-sm font-black text-textPrimary">{language === 'ar' ? item.nameAr : item.nameEn}</span>
                   </div>
                   <div className="text-left">
                       <p className="text-[10px] font-black text-red-500">المتبقي: {Object.values(item.warehouseQuantities).reduce((a: number, b: number) => a + b, 0)} {item.unit}</p>
                       <p className="text-[8px] text-secondary font-bold">حد الأمان: {item.minLevel}</p>
                   </div>
                </div>
              ))}
              {lowStockItems === 0 && (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                    <CheckCircle2 size={40} className="text-accentGreen mb-2" />
                    <p className="text-xs font-black">المخزون في حالة ممتازة</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* آخر العمليات المالية */}
      <div className="bg-surface p-8 rounded-[40px] border border-cardAccent shadow-sm">
           <h3 className="text-lg font-black text-textPrimary mb-6 flex items-center gap-3"><CheckCircle2 className="text-accentGreen" /> سجل العمليات الأخيرة</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="flex justify-between items-center p-5 bg-background/50 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                         <ShoppingBag size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-secondary">فاتورة #{order.id.slice(-4)}</p>
                         <p className="text-xs font-black text-textPrimary">{new Date(order.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                      </div>
                   </div>
                   <div className="text-left">
                       <p className="text-sm font-black text-accentGreen">{order.total.toLocaleString()} {currency}</p>
                       <span className="text-[8px] px-2 py-0.5 bg-accentGreen/10 text-accentGreen rounded-md font-black">{t(order.paymentMethod as any)}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
    </div>
  );
};

export default Dashboard;
