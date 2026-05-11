
import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { printDocument } from '../utils/printService';
import { 
  Calendar, User, Clock, Banknote, Landmark, AlertTriangle, 
  CheckCircle2, Search, TrendingUp, Printer, FileText, Filter, Eye, X 
} from 'lucide-react';

const Shifts: React.FC = () => {
  const { shiftHistory, settings, orders } = useData();
  const { language } = useLanguage();
  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

  // Search and Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'matched' | 'shortage' | 'surplus'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [previewReport, setPreviewReport] = useState<{
    show: boolean;
    title: string;
    subtitle?: string;
    content: string;
  } | null>(null);

  // Filter history
  const filteredShifts = useMemo(() => {
    return shiftHistory.filter(shift => {
      const matchSearch = shift.userName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const diff = (shift.endBalance || 0) - (shift.expectedBalance || 0);
      let matchStatus = true;
      if (statusFilter === 'matched') matchStatus = diff === 0;
      else if (statusFilter === 'shortage') matchStatus = diff < 0;
      else if (statusFilter === 'surplus') matchStatus = diff > 0;
      
      let matchDate = true;
      if (dateFilter) {
        const shiftDate = new Date(shift.startTime).toISOString().split('T')[0];
        matchDate = shiftDate === dateFilter;
      }
      
      return matchSearch && matchStatus && matchDate;
    });
  }, [shiftHistory, searchTerm, statusFilter, dateFilter]);

  // Shared Report HTML generator
  const getShiftReportHtml = (shift: any) => {
    const shiftOrders = orders.filter(o => o.shiftId === shift.id && o.status === 'completed');
    const diff = (shift.endBalance || 0) - (shift.expectedBalance || 0);

    return `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; color: #111;">
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd;">
          <h3 style="margin-top: 0; border-bottom: 2px solid #333; padding-bottom: 8px; font-size: 14px; font-weight: bold; color: #111;">معلومات الوردية</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #333;">
            <tr>
              <td style="padding: 5px 0; width: 50%;"><strong>المستخدم / الكاشير:</strong> ${shift.userName}</td>
              <td style="padding: 5px 0; width: 50%;"><strong>تاريخ الفتح:</strong> ${new Date(shift.startTime).toLocaleDateString('ar-EG')} ${new Date(shift.startTime).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>تاريخ الإغلاق:</strong> ${shift.endTime ? `${new Date(shift.endTime).toLocaleDateString('ar-EG')} ${new Date(shift.endTime).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}` : 'مفتوحة'}</td>
              <td style="padding: 5px 0;"><strong>الرصيد الافتتاحي:</strong> ${shift.startBalance.toLocaleString()} ${currency}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>إجمالي المبيعات:</strong> ${shift.totalSales.toLocaleString()} ${currency}</td>
              <td style="padding: 5px 0;"><strong>الرصيد المتوقع:</strong> ${shift.expectedBalance?.toLocaleString() || '---'} ${currency}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>الرصيد الفعلي عند الإغلاق:</strong> ${shift.endBalance?.toLocaleString() || '---'} ${currency}</td>
              <td style="padding: 5px 0;"><strong>الفارق (العجز/الزيادة):</strong> 
                <strong style="color: ${diff === 0 ? '#22c55e' : diff < 0 ? '#ef4444' : '#3b82f6'}">
                  ${diff === 0 ? 'متطابق' : (diff < 0 ? 'عجز: ' : 'زيادة: ') + Math.abs(diff).toLocaleString()} ${currency}
                </strong>
              </td>
            </tr>
          </table>
        </div>

        <h3 style="border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 12px; font-size: 13px; font-weight: bold; color: #111;">المبيعات التفصيلية للوردية (${shiftOrders.length} فاتورة)</h3>
        <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 11px; margin-bottom: 15px; color: #333;">
          <thead>
            <tr style="background: #333; color: #fff;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;"># الفاتورة</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">الوقت</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">نوع الطلب</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">طريقة الدفع</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">العميل</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${shiftOrders.map(order => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">#${order.id}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(order.createdAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${order.type === 'takeaway' ? 'تيك أواي' : 'عميل'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${order.paymentMethod === 'cash' ? 'نقدي' : order.paymentMethod === 'instapay' ? 'InstaPay' : 'آجل'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${order.customerName || '-'}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: left; font-weight: bold;">${order.total.toFixed(2)} ${currency}</td>
              </tr>
            `).join('')}
            ${shiftOrders.length === 0 ? `
              <tr>
                <td colspan="6" style="padding: 15px; text-align: center; color: #999;">لا توجد مبيعات في هذه الوردية</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    `;
  };

  const handlePrintShiftReport = (shift: any) => {
    const shiftSalesContentHtml = getShiftReportHtml(shift);
    printDocument({
      title: 'تقرير مبيعات الوردية تفصيلي',
      subtitle: `وردية #${shift.id}`,
      settings,
      content: shiftSalesContentHtml,
      showSignature: true
    });
  };

  const handleViewShiftReport = (shift: any) => {
    const shiftSalesContentHtml = getShiftReportHtml(shift);
    setPreviewReport({
      show: true,
      title: 'تقرير مبيعات الوردية تفصيلي',
      subtitle: `وردية #${shift.id}`,
      content: shiftSalesContentHtml
    });
  };

  return (
    <div className="space-y-6 pb-12 font-cairo animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">سجل الورديات</h2>
          <p className="text-secondary text-xs mt-1 font-bold">مراجعة أداء الكاشيرات ومطابقة النقدية</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface p-4 rounded-[24px] border border-white/5 shadow-lg">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="ابحث باسم الكاشير..."
            className="w-full h-11 pr-10 pl-3 bg-background border-2 border-cardAccent rounded-xl text-sm text-textPrimary font-bold outline-none focus:border-primary transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary z-10" />
          <input
            type="date"
            className="w-full h-11 pr-10 pl-3 bg-background border-2 border-cardAccent rounded-xl text-sm text-textPrimary font-bold outline-none focus:border-primary transition-all"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
          <select
            className="w-full h-11 pr-10 pl-3 bg-background border-2 border-cardAccent rounded-xl text-sm text-textPrimary font-bold outline-none focus:border-primary transition-all appearance-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="all">كل الحالات</option>
            <option value="matched">متطابقة</option>
            <option value="shortage">عجز</option>
            <option value="surplus">زيادة</option>
          </select>
        </div>
      </div>

      <div className="bg-surface rounded-[24px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-right">
            <thead className="text-[10px] text-secondary uppercase bg-background/50 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-4 font-black tracking-widest">التاريخ / المستخدم</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 font-black tracking-widest text-center">وقت الفتح/الإغلاق</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 font-black tracking-widest text-center">الرصيد الافتتاحي</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 font-black tracking-widest text-center">إجمالي المبيعات</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 font-black tracking-widest text-center">المتوقع / الفعلي</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 font-black tracking-widest text-center">الحالة</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 font-black tracking-widest text-left">تقرير المبيعات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-secondary opacity-30 italic font-black">لا توجد ورديات مطابقة للبحث</td>
                </tr>
              ) : (
                filteredShifts.map(shift => {
                  const diff = (shift.endBalance || 0) - (shift.expectedBalance || 0);
                  const isShortage = diff < 0;
                  const isSurplus = diff > 0;

                  return (
                    <tr key={shift.id} className="hover:bg-background/40 transition-colors group">
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary border border-white/5 shrink-0">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-black text-white text-xs sm:text-sm">{shift.userName}</p>
                            <p className="text-[9px] text-secondary font-bold">{new Date(shift.startTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                        <div className="flex flex-col gap-0.5 max-w-[110px] mx-auto">
                          <span className="text-[9px] bg-background px-1.5 py-0.5 rounded border border-white/5 text-secondary font-black truncate">فتح: {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <span className="text-[9px] bg-background px-1.5 py-0.5 rounded border border-white/5 text-secondary font-black truncate">قفل: {shift.endTime ? new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center font-bold text-white text-xs sm:text-sm">{shift.startBalance.toLocaleString()}</td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center font-black text-primary text-xs sm:text-sm">{shift.totalSales.toLocaleString()}</td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-xs sm:text-sm">{shift.expectedBalance?.toLocaleString() || '---'}</span>
                          <span className="text-[9px] text-secondary">فعلي: {shift.endBalance?.toLocaleString() || '---'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                        {diff === 0 ? (
                          <span className="inline-flex items-center gap-1 text-accentGreen font-black text-[10px] sm:text-xs">
                            <CheckCircle2 size={12}/> متطابق
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 font-black text-[10px] sm:text-xs ${isShortage ? 'text-red-500' : 'text-accentBlue'}`}>
                            {isShortage ? <AlertTriangle size={12}/> : <TrendingUp size={12}/>}
                            {isShortage ? 'عجز: ' : 'زيادة: '} {Math.abs(diff).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewShiftReport(shift)}
                            className="flex items-center gap-1 px-2 py-1.5 bg-accentBlue/15 hover:bg-accentBlue text-accentBlue hover:text-background border border-accentBlue/25 rounded-xl text-[10px] font-black transition-all"
                            title="عرض تفاصيل مبيعات الوردية"
                          >
                            <Eye size={12} />
                            <span>عرض</span>
                          </button>
                          <button
                            onClick={() => handlePrintShiftReport(shift)}
                            className="flex items-center gap-1 px-2 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-background border border-primary/20 rounded-xl text-[10px] font-black transition-all"
                            title="طباعة مبيعات الوردية"
                          >
                            <Printer size={12} />
                            <span>طباعة</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Shifts;
