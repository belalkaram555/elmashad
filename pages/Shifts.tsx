
import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
// Added TrendingUp to the lucide-react imports
import { Calendar, User, Clock, Banknote, Landmark, AlertTriangle, CheckCircle2, Search, TrendingUp } from 'lucide-react';

const Shifts: React.FC = () => {
  const { shiftHistory, settings } = useData();
  const { language } = useLanguage();
  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

  return (
    <div className="space-y-8 pb-12 font-cairo animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-black text-white">سجل الورديات</h2>
            <p className="text-secondary text-xs mt-1 font-bold">مراجعة أداء الكاشيرات ومطابقة النقدية</p>
        </div>
      </div>

      <div className="bg-surface rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-[10px] text-secondary uppercase bg-background/50 border-b border-white/5">
              <tr>
                <th className="px-8 py-6 font-black tracking-widest">التاريخ / المستخدم</th>
                <th className="px-8 py-6 font-black tracking-widest text-center">وقت الفتح/الإغلاق</th>
                <th className="px-8 py-6 font-black tracking-widest text-center">الرصيد الافتتاحي</th>
                <th className="px-8 py-6 font-black tracking-widest text-center">إجمالي المبيعات</th>
                <th className="px-8 py-6 font-black tracking-widest text-center">المتوقع / الفعلي</th>
                <th className="px-8 py-6 font-black tracking-widest text-left">الحالة (العجز/الزيادة)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {shiftHistory.length === 0 ? (
                <tr>
                    <td colSpan={6} className="text-center py-32 text-secondary opacity-30 italic font-black">لا توجد ورديات مسجلة حالياً</td>
                </tr>
              ) : (
                shiftHistory.map(shift => {
                  const diff = (shift.endBalance || 0) - (shift.expectedBalance || 0);
                  const isShortage = diff < 0;
                  const isSurplus = diff > 0;

                  return (
                    <tr key={shift.id} className="hover:bg-background/40 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary border border-white/5">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="font-black text-white">{shift.userName}</p>
                                <p className="text-[10px] text-secondary font-bold">{new Date(shift.startTime).toLocaleDateString()}</p>
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                          <div className="flex flex-col gap-1">
                              <span className="text-[10px] bg-background px-2 py-0.5 rounded border border-white/5 text-secondary font-black">فتح: {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <span className="text-[10px] bg-background px-2 py-0.5 rounded border border-white/5 text-secondary font-black">قفل: {shift.endTime ? new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                          </div>
                      </td>
                      <td className="px-8 py-6 text-center font-bold text-white">{shift.startBalance.toLocaleString()}</td>
                      <td className="px-8 py-6 text-center font-black text-primary">{shift.totalSales.toLocaleString()}</td>
                      <td className="px-8 py-6 text-center">
                          <div className="flex flex-col">
                              <span className="text-white font-bold">{shift.expectedBalance?.toLocaleString()}</span>
                              <span className="text-[10px] text-secondary">فعلي: {shift.endBalance?.toLocaleString()}</span>
                          </div>
                      </td>
                      <td className="px-8 py-6 text-left">
                          {diff === 0 ? (
                              <span className="inline-flex items-center gap-1.5 text-accentGreen font-black text-xs">
                                  <CheckCircle2 size={14}/> متطابق
                              </span>
                          ) : (
                              <span className={`inline-flex items-center gap-1.5 font-black text-xs ${isShortage ? 'text-red-500' : 'text-accentBlue'}`}>
                                  {isShortage ? <AlertTriangle size={14}/> : <TrendingUp size={14}/>}
                                  {isShortage ? 'عجز: ' : 'زيادة: '} {Math.abs(diff).toLocaleString()}
                              </span>
                          )}
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
