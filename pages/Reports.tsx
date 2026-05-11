
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FileText, TrendingDown, DollarSign, Truck, Landmark,
  Users, ArrowRightLeft, Wallet, Package, Calendar,
  XCircle, Printer, Download, Eye, TrendingUp, BarChart3,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { Order, Purchase, TreasuryTransaction, InventoryItem } from '../types';
import { printTable, printFinancialReport } from '../utils/printService';

const Reports: React.FC = () => {
  const { orders, purchases, treasury, inventory, settings } = useData();
  const { t, language } = useLanguage();

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

  // دوال تحديد الفترات السريعة
  const setQuickRange = (range: 'today' | 'week' | 'month' | 'year') => {
    const end = new Date().toISOString().split('T')[0];
    let start = new Date();

    if (range === 'today') {
      start = new Date();
    } else if (range === 'week') {
      start.setDate(start.getDate() - 7);
    } else if (range === 'month') {
      start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    } else if (range === 'year') {
      start = new Date(new Date().getFullYear(), 0, 1);
    }

    setDateRange({ start: start.toISOString().split('T')[0], end });
  };

  const filterByDate = (items: any[], dateField: string = 'createdAt') => {
    return items.filter(item => {
      const itemDate = item[dateField].split('T')[0];
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  };

  const reportTypes = [
    { id: 'sales', name: t('totalSales'), icon: FileText, color: 'text-primary', bg: 'bg-primary/10', desc: 'تقرير مفصل لعمليات البيع والتحصيل.' },
    { id: 'purchases', name: t('purchasesReport'), icon: Truck, color: 'text-accentBlue', bg: 'bg-accentBlue/10', desc: 'تتبع المشتريات من الموردين وتكاليف التوريد.' },
    { id: 'treasury', name: t('treasuryReport'), icon: Landmark, color: 'text-accentGreen', bg: 'bg-accentGreen/10', desc: 'سجل حركات الخزينة الواردة والصادرة.' },
    { id: 'profit_loss', name: t('profitAndLoss'), icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'تحليل الأداء المالي وصافي الأرباح.' },
    { id: 'inventory', name: t('inventory'), icon: Package, color: 'text-orange-400', bg: 'bg-orange-400/10', desc: 'جرد المخزون الحالي وقيمته المالية.' },
    { id: 'expenses', name: t('expensesReport'), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10', desc: 'تحليل المصروفات الإدارية والتشغيلية.' },
  ];

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + '\n' + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${dateRange.start}_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenReport = (id: string) => {
    setSelectedReport(id);
    setIsViewOpen(true);
  };

  // طباعة التقرير بشكل صحيح
  const handlePrintReport = () => {
    if (!selectedReport) return;

    const filteredOrders = filterByDate(orders, 'createdAt');
    const filteredPurchases = filterByDate(purchases, 'date');
    const filteredTreasury = filterByDate(treasury, 'date');

    const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'تقرير';

    if (selectedReport === 'sales') {
      printTable({
        title: reportName,
        subtitle: `الفترة: ${dateRange.start} - ${dateRange.end}`,
        settings,
        headers: ['رقم الطلب', 'التاريخ', 'النوع', 'الدفع', 'الإجمالي'],
        rows: filteredOrders.map((o: Order) => [
          `#${o.id}`,
          new Date(o.createdAt).toLocaleDateString('ar-EG'),
          o.type === 'takeaway' ? 'تيك أواي' : 'عميل',
          o.paymentMethod === 'cash' ? 'نقدي' : o.paymentMethod === 'instapay' ? 'InstaPay' : 'آجل',
          `${o.total.toLocaleString()} ${currency}`
        ]),
        summary: [
          { label: 'عدد الطلبات', value: filteredOrders.length },
          { label: 'إجمالي المبيعات', value: `${filteredOrders.reduce((s: number, o: Order) => s + o.total, 0).toLocaleString()} ${currency}` }
        ]
      });
    } else if (selectedReport === 'purchases') {
      printTable({
        title: reportName,
        subtitle: `الفترة: ${dateRange.start} - ${dateRange.end}`,
        settings,
        headers: ['التاريخ', 'المورد', 'رقم الفاتورة', 'القيمة'],
        rows: filteredPurchases.map((p: Purchase) => [
          p.date,
          p.supplierName || '-',
          p.invoiceNumber || '-',
          `${p.totalAmount.toLocaleString()} ${currency}`
        ]),
        summary: [
          { label: 'عدد الفواتير', value: filteredPurchases.length },
          { label: 'إجمالي المشتريات', value: `${filteredPurchases.reduce((s: number, p: Purchase) => s + p.totalAmount, 0).toLocaleString()} ${currency}` }
        ]
      });
    } else if (selectedReport === 'treasury') {
      const income = filteredTreasury.filter((t: TreasuryTransaction) => t.type === 'income');
      const expense = filteredTreasury.filter((t: TreasuryTransaction) => t.type === 'expense');
      printTable({
        title: reportName,
        subtitle: `الفترة: ${dateRange.start} - ${dateRange.end}`,
        settings,
        headers: ['التاريخ', 'النوع', 'البيان', 'المبلغ'],
        rows: filteredTreasury.map((t: TreasuryTransaction) => [
          new Date(t.date).toLocaleDateString('ar-EG'),
          t.type === 'income' ? 'إيداع' : 'صرف',
          t.description,
          `${t.amount.toLocaleString()} ${currency}`
        ]),
        summary: [
          { label: 'إجمالي المقبوضات', value: `${income.reduce((s: number, t: TreasuryTransaction) => s + t.amount, 0).toLocaleString()} ${currency}` },
          { label: 'إجمالي المدفوعات', value: `${expense.reduce((s: number, t: TreasuryTransaction) => s + t.amount, 0).toLocaleString()} ${currency}` }
        ]
      });
    } else if (selectedReport === 'inventory') {
      printTable({
        title: reportName,
        subtitle: new Date().toLocaleDateString('ar-EG'),
        settings,
        headers: ['الصنف', 'الكمية', 'الوحدة', 'التكلفة', 'القيمة'],
        rows: inventory.map((item: InventoryItem) => {
          const qty = Object.values(item.warehouseQuantities).reduce((a: number, b: number) => a + b, 0);
          return [
            language === 'ar' ? item.nameAr : item.nameEn,
            qty,
            item.unit,
            item.costPerUnit,
            `${(qty * item.costPerUnit).toLocaleString()} ${currency}`
          ];
        }),
        summary: [
          { label: 'عدد الأصناف', value: inventory.length },
          {
            label: 'إجمالي قيمة المخزون', value: `${inventory.reduce((s: number, item: InventoryItem) => {
              const qty = Object.values(item.warehouseQuantities).reduce((a: number, b: number) => a + b, 0);
              return s + (qty * item.costPerUnit);
            }, 0).toLocaleString()} ${currency}`
          }
        ]
      });
    } else if (selectedReport === 'expenses') {
      const expenses = filteredTreasury.filter((t: TreasuryTransaction) => t.type === 'expense');
      printTable({
        title: reportName,
        subtitle: `الفترة: ${dateRange.start} - ${dateRange.end}`,
        settings,
        headers: ['التاريخ', 'البيان', 'المبلغ'],
        rows: expenses.map((e: TreasuryTransaction) => [
          new Date(e.date).toLocaleDateString('ar-EG'),
          e.description,
          `${e.amount.toLocaleString()} ${currency}`
        ]),
        summary: [
          { label: 'إجمالي المصروفات', value: `${expenses.reduce((s: number, t: TreasuryTransaction) => s + t.amount, 0).toLocaleString()} ${currency}` }
        ]
      });
    } else if (selectedReport === 'profit_loss') {
      const sales = filteredOrders.reduce((s: number, o: Order) => s + o.total, 0);
      const purchasesVal = filteredPurchases.reduce((s: number, p: Purchase) => s + p.totalAmount, 0);
      const otherExpenses = filteredTreasury.filter((t: TreasuryTransaction) => t.type === 'expense' && t.category !== 'purchases').reduce((s: number, t: TreasuryTransaction) => s + t.amount, 0);

      printFinancialReport({
        title: reportName,
        dateFrom: dateRange.start,
        dateTo: dateRange.end,
        income: [{ label: 'إجمالي المبيعات', value: sales }],
        expenses: [
          { label: 'تكلفة المشتريات', value: purchasesVal },
          { label: 'المصروفات التشغيلية', value: otherExpenses }
        ],
        currency,
        settings
      });
    }
  };

  return (
    <div className="space-y-10 pb-12 font-cairo no-print animate-in fade-in duration-700">
      {/* Modern Filter Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-surface/40 p-6 md:p-8 rounded-[40px] border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white tracking-tight">{t('reports')}</h2>
          <p className="text-secondary text-sm mt-2 font-bold flex items-center gap-2">
            <Zap size={14} className="text-primary" /> تحليلات ذكية لأداء منشأتك المالية
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto relative z-10">
          {/* Quick Range Selector */}
          <div className="flex bg-background/60 p-1.5 rounded-2xl border border-white/5 w-full sm:w-auto">
            {[
              { id: 'today', label: 'اليوم' },
              { id: 'week', label: 'الأسبوع' },
              { id: 'month', label: 'الشهر' },
              { id: 'year', label: 'العام' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setQuickRange(r.id as any)}
                className="flex-1 sm:px-4 py-2 text-[11px] font-black text-secondary hover:text-white rounded-xl transition-all hover:bg-white/5 active:scale-95"
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 bg-background/80 px-6 py-3 rounded-2xl border border-white/10 shadow-inner group hover:border-primary/30 transition-all w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-primary uppercase mb-1">من تاريخ</span>
              <input
                type="date"
                className="bg-transparent text-sm font-black text-white border-none outline-none focus:ring-0 p-0 cursor-pointer"
                value={dateRange.start}
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-primary uppercase mb-1">إلى تاريخ</span>
              <input
                type="date"
                className="bg-transparent text-sm font-black text-white border-none outline-none focus:ring-0 p-0 cursor-pointer"
                value={dateRange.end}
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <Calendar size={20} className="text-secondary group-hover:text-primary transition-colors ml-4" />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reportTypes.map(report => (
          <div
            key={report.id}
            onClick={() => handleOpenReport(report.id)}
            className="bg-surface p-10 rounded-[44px] border border-white/5 hover:border-primary/40 transition-all group cursor-pointer relative overflow-hidden active:scale-95 shadow-xl hover:shadow-primary/5"
          >
            <div className={`w-20 h-20 rounded-3xl ${report.bg} ${report.color} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
              <report.icon size={36} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">{report.name}</h3>
            <p className="text-sm text-secondary font-bold leading-relaxed mb-8 opacity-80">{report.desc}</p>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 text-primary text-xs font-black uppercase tracking-widest">
                فتح التقرير <ArrowRightLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="p-3 bg-background rounded-2xl border border-white/5 text-secondary opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">
                <Eye size={18} />
              </div>
            </div>

            <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-[0.03] blur-3xl ${report.color.replace('text', 'bg')} group-hover:opacity-[0.08] transition-opacity`} />
          </div>
        ))}
      </div>

      {/* Report Modal Viewer */}
      {isViewOpen && selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-2xl p-4 md:p-10">
          <div className="bg-surface w-full max-w-7xl h-full max-h-[92vh] rounded-[50px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in fade-in duration-500">
            {/* Modal Header */}
            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-background/30 backdrop-blur-md">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-primary/10 text-primary rounded-[24px] shadow-inner">
                  {reportTypes.find(r => r.id === selectedReport)?.icon && React.createElement(reportTypes.find(r => r.id === selectedReport)!.icon, { size: 32 })}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white">{reportTypes.find(r => r.id === selectedReport)?.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-secondary font-bold">تحليل الفترة من</span>
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-black text-white">{dateRange.start}</span>
                    <span className="text-xs text-secondary font-bold">إلى</span>
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-black text-white">{dateRange.end}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handlePrintReport} className="flex items-center gap-3 bg-surface text-white border border-white/10 px-8 py-4 rounded-2xl font-black text-sm hover:bg-white/5 active:scale-95 transition-all"><Printer size={18} /> {t('print')}</button>
                <button
                  onClick={() => {
                    const data = generateReportData(selectedReport, orders, purchases, treasury, inventory, filterByDate);
                    exportToCSV(data, selectedReport);
                  }}
                  className="flex items-center gap-3 bg-primary text-background px-8 py-4 rounded-2xl font-black text-sm glow-primary active:scale-95 transition-all"
                >
                  <Download size={18} /> {t('export')} CSV
                </button>
                <button onClick={() => setIsViewOpen(false)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:rotate-90"><XCircle size={24} /></button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-background/20">
              <ReportContent
                type={selectedReport}
                orders={orders}
                purchases={purchases}
                treasury={treasury}
                inventory={inventory}
                filterByDate={filterByDate}
                currency={currency}
                language={language}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Area */}
      <div className="hidden print:block bg-white text-black p-12">
        <div className="text-center mb-10 border-b-2 border-black pb-8">
          <h1 className="text-4xl font-black mb-2">{settings.restaurantNameAr}</h1>
          <h2 className="text-2xl font-bold text-gray-700">{reportTypes.find(r => r.id === selectedReport)?.name}</h2>
          <p className="text-lg mt-2">نطاق التقرير: من {dateRange.start} إلى {dateRange.end}</p>
        </div>
        {selectedReport && (
          <ReportContent
            type={selectedReport}
            orders={orders}
            purchases={purchases}
            treasury={treasury}
            inventory={inventory}
            filterByDate={filterByDate}
            currency={currency}
            language={language}
            isPrint={true}
          />
        )}
      </div>
    </div>
  );
};

// مكون عرض محتوى التقرير
const ReportContent = ({ type, orders, purchases, treasury, inventory, filterByDate, currency, language, isPrint = false }: any) => {
  const filteredOrders = filterByDate(orders, 'createdAt');
  const filteredPurchases = filterByDate(purchases, 'date');
  const filteredTreasury = filterByDate(treasury, 'date');

  if (type === 'sales') {
    const totalSales = filteredOrders.reduce((s: number, o: any) => s + o.total, 0);
    const totalQty = filteredOrders.reduce((s: number, o: any) => s + o.items.reduce((iq: number, i: any) => iq + i.quantity, 0), 0);

    return (
      <div className="space-y-12">
        {!isPrint && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <SummaryCard title="إجمالي المبيعات" value={totalSales} currency={currency} color="text-primary" />
            <SummaryCard title="عدد الطلبات" value={filteredOrders.length} currency="" color="text-accentBlue" />
            <SummaryCard title="كمية الأصناف المباعة" value={totalQty} currency="" color="text-accentGreen" />
            <SummaryCard title="متوسط الفاتورة" value={filteredOrders.length ? (totalSales / filteredOrders.length).toFixed(2) : 0} currency={currency} color="text-purple-500" />
          </div>
        )}
        <div className={`rounded-[32px] overflow-hidden border ${isPrint ? 'border-black' : 'border-white/5 bg-surface/20'}`}>
          <table className={`w-full text-sm text-right border-collapse ${isPrint ? 'text-black' : 'text-white'}`}>
            <thead className={isPrint ? 'border-b-2 border-black bg-gray-100' : 'bg-background/50 border-b border-white/5'}>
              <tr>
                <th className="px-6 py-5">رقم الطلب</th>
                <th className="px-6 py-5 text-center">التاريخ</th>
                <th className="px-6 py-5 text-center">النوع</th>
                <th className="px-6 py-5 text-center">الدفع</th>
                <th className="px-6 py-5 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className={isPrint ? '' : 'divide-y divide-white/5'}>
              {filteredOrders.map((o: any) => (
                <tr key={o.id} className={isPrint ? 'border-b border-gray-200' : 'hover:bg-white/5 transition-colors'}>
                  <td className="px-6 py-5 font-bold">#{o.id}</td>
                  <td className="px-6 py-5 text-center text-xs opacity-70">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-5 text-center text-xs font-black">{o.type}</td>
                  <td className="px-6 py-5 text-center text-xs">{o.paymentMethod}</td>
                  <td className="px-6 py-5 text-left font-black text-primary">{o.total.toLocaleString()} {currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'purchases') {
    const totalPurchases = filteredPurchases.reduce((s: number, p: any) => s + p.totalAmount, 0);
    return (
      <div className="space-y-12">
        {!isPrint && <SummaryCard title="إجمالي المشتريات" value={totalPurchases} currency={currency} color="text-accentBlue" />}
        <div className={`rounded-[32px] overflow-hidden border ${isPrint ? 'border-black' : 'border-white/5 bg-surface/20'}`}>
          <table className="w-full text-sm text-right">
            <thead className={isPrint ? 'border-b-2 border-black bg-gray-100' : 'bg-background/50 border-b border-white/5'}>
              <tr>
                <th className="px-6 py-5">تاريخ الفاتورة</th>
                <th className="px-6 py-5 text-center">المورد</th>
                <th className="px-6 py-5 text-center">رقم المرجع</th>
                <th className="px-6 py-5 text-left">القيمة</th>
              </tr>
            </thead>
            <tbody className={isPrint ? '' : 'divide-y divide-white/5'}>
              {filteredPurchases.map((p: any) => (
                <tr key={p.id} className={isPrint ? 'border-b' : 'hover:bg-white/5 transition-colors'}>
                  <td className="px-6 py-5">{p.date}</td>
                  <td className="px-6 py-5 text-center font-bold text-accentBlue">{p.supplierName}</td>
                  <td className="px-6 py-5 text-center opacity-60">#{p.invoiceNumber}</td>
                  <td className="px-6 py-5 text-left font-black text-red-400">{p.totalAmount.toLocaleString()} {currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'treasury') {
    const income = filteredTreasury.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
    const expense = filteredTreasury.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
    return (
      <div className="space-y-12">
        {!isPrint && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <SummaryCard title="إجمالي المقبوضات" value={income} currency={currency} color="text-accentGreen" />
            <SummaryCard title="إجمالي المدفوعات" value={expense} currency={currency} color="text-red-500" />
            <SummaryCard title="صافي حركة الصندوق" value={income - expense} currency={currency} color="text-primary" />
          </div>
        )}
        <div className={`rounded-[32px] overflow-hidden border ${isPrint ? 'border-black' : 'border-white/5 bg-surface/20'}`}>
          <table className="w-full text-sm text-right">
            <thead className={isPrint ? 'border-b-2 border-black bg-gray-100' : 'bg-background/50 border-b border-white/5'}>
              <tr>
                <th className="px-6 py-5">التاريخ</th>
                <th className="px-6 py-5 text-center">النوع</th>
                <th className="px-6 py-5">البيان</th>
                <th className="px-6 py-5 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className={isPrint ? '' : 'divide-y divide-white/5'}>
              {filteredTreasury.map((t: any) => (
                <tr key={t.id} className={isPrint ? 'border-b' : 'hover:bg-white/5 transition-colors'}>
                  <td className="px-6 py-5 text-xs opacity-60">{new Date(t.date).toLocaleDateString()}</td>
                  <td className={`px-6 py-5 text-center font-black ${t.type === 'income' ? 'text-accentGreen' : 'text-red-500'}`}>
                    <span className={`px-3 py-1 rounded-lg text-[10px] ${t.type === 'income' ? 'bg-accentGreen/10' : 'bg-red-500/10'}`}>
                      {t.type === 'income' ? 'إيداع' : 'صرف'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold">{t.description}</td>
                  <td className={`px-6 py-5 text-left font-black ${t.type === 'income' ? 'text-accentGreen' : 'text-red-500'}`}>{t.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'profit_loss') {
    const sales = filteredOrders.reduce((s: number, o: any) => s + o.total, 0);
    const purchasesVal = filteredPurchases.reduce((s: number, p: any) => s + p.totalAmount, 0);
    const generalExpenses = filteredTreasury.filter((t: any) => t.type === 'expense' && t.category !== 'purchases').reduce((s: number, t: any) => s + t.amount, 0);
    const netProfit = sales - (purchasesVal + generalExpenses);

    return (
      <div className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className={`p-10 rounded-[40px] border ${isPrint ? 'border-black' : 'bg-background/40 border-white/5'}`}>
            <h4 className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-10 border-b border-white/5 pb-4">الإيرادات (Incomes)</h4>
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-white/80">إجمالي المبيعات (+)</span>
              <span className="text-2xl font-black text-accentGreen">{sales.toLocaleString()} <span className="text-xs">{currency}</span></span>
            </div>
          </div>
          <div className={`p-10 rounded-[40px] border ${isPrint ? 'border-black' : 'bg-background/40 border-white/5'}`}>
            <h4 className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-10 border-b border-white/5 pb-4">المصروفات (Expenses)</h4>
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-white/80">تكلفة المشتريات (-)</span>
              <span className="text-2xl font-black text-red-400">{purchasesVal.toLocaleString()} <span className="text-xs">{currency}</span></span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-white/80">المصاريف التشغيلية (-)</span>
              <span className="text-2xl font-black text-red-400">{generalExpenses.toLocaleString()} <span className="text-xs">{currency}</span></span>
            </div>
          </div>
        </div>
        <div className={`p-16 rounded-[60px] text-center border-4 relative overflow-hidden ${netProfit >= 0 ? 'border-accentGreen/30 bg-accentGreen/5' : 'border-red-500/30 bg-red-500/5'}`}>
          <h3 className="text-xl font-black text-secondary mb-4 relative z-10">صافي الربح / الخسارة للفترة المختارة</h3>
          <div className={`text-7xl font-black relative z-10 ${netProfit >= 0 ? 'text-accentGreen' : 'text-red-500'} ${netProfit >= 0 ? 'glow-primary' : ''}`}>
            {netProfit.toLocaleString()} <span className="text-3xl font-bold">{currency}</span>
          </div>
          {netProfit >= 0 ? (
            <TrendingUp size={120} className="absolute -bottom-4 -left-4 text-accentGreen opacity-[0.05] -rotate-12" />
          ) : (
            <TrendingDown size={120} className="absolute -bottom-4 -left-4 text-red-500 opacity-[0.05] -rotate-12" />
          )}
        </div>
      </div>
    );
  }

  if (type === 'inventory') {
    const totalInventoryValue = inventory.reduce((s: number, item: any) => {
      const qty = Object.values(item.warehouseQuantities).reduce((a: any, b: any) => a + b, 0);
      return s + (qty as number * item.costPerUnit);
    }, 0);
    return (
      <div className="space-y-12">
        {!isPrint && <SummaryCard title="إجمالي القيمة المالية للمخزون" value={totalInventoryValue} currency={currency} color="text-orange-400" />}
        <div className={`rounded-[32px] overflow-hidden border ${isPrint ? 'border-black' : 'border-white/5 bg-surface/20'}`}>
          <table className="w-full text-sm text-right">
            <thead className={isPrint ? 'border-b-2 border-black bg-gray-100' : 'bg-background/50 border-b border-white/5'}>
              <tr>
                <th className="px-6 py-5">الصنف</th>
                <th className="px-6 py-5 text-center">الكمية الحالية</th>
                <th className="px-6 py-5 text-center">سعر التكلفة</th>
                <th className="px-6 py-5 text-left">قيمة المخزون</th>
              </tr>
            </thead>
            <tbody className={isPrint ? '' : 'divide-y divide-white/5'}>
              {inventory.map((item: any) => {
                const qty = Object.values(item.warehouseQuantities).reduce((a: any, b: any) => a + b, 0) as number;
                return (
                  <tr key={item.id} className={isPrint ? 'border-b' : 'hover:bg-white/5 transition-colors'}>
                    <td className="px-6 py-5 font-bold">{language === 'ar' ? item.nameAr : item.nameEn}</td>
                    <td className="px-6 py-5 text-center font-black">{qty} <span className="text-[10px] text-secondary">{item.unit}</span></td>
                    <td className="px-6 py-5 text-center text-xs opacity-70">{item.costPerUnit}</td>
                    <td className="px-6 py-5 text-left font-black text-orange-400">{(qty * item.costPerUnit).toLocaleString()} {currency}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'expenses') {
    const expenses = filteredTreasury.filter((t: any) => t.type === 'expense');
    const totalExpenses = expenses.reduce((s: number, t: any) => s + t.amount, 0);
    return (
      <div className="space-y-12">
        {!isPrint && <SummaryCard title="إجمالي المصاريف" value={totalExpenses} currency={currency} color="text-red-500" />}
        <div className={`rounded-[32px] overflow-hidden border ${isPrint ? 'border-black' : 'border-white/5 bg-surface/20'}`}>
          <table className="w-full text-sm text-right">
            <thead className={isPrint ? 'border-b-2 border-black bg-gray-100' : 'bg-background/50 border-b border-white/5'}>
              <tr>
                <th className="px-6 py-5">التاريخ</th>
                <th className="px-6 py-5">البند / البيان</th>
                <th className="px-6 py-5 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className={isPrint ? '' : 'divide-y divide-white/5'}>
              {expenses.map((e: any) => (
                <tr key={e.id} className={isPrint ? 'border-b' : 'hover:bg-white/5 transition-colors'}>
                  <td className="px-6 py-5 text-xs opacity-60">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-6 py-5 font-bold text-white/90">{e.description}</td>
                  <td className="px-6 py-5 text-left font-black text-red-500">{e.amount.toLocaleString()} {currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return <div className="p-20 text-center text-secondary italic font-bold">لا توجد بيانات متاحة لهذا التقرير في هذه الفترة.</div>;
};

const SummaryCard = ({ title, value, currency, color }: any) => (
  <div className="bg-background/40 p-8 rounded-[32px] border border-white/5 shadow-inner">
    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3">{title}</p>
    <h4 className={`text-3xl font-black ${color}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
      <span className="text-xs ml-1 opacity-50">{currency}</span>
    </h4>
  </div>
);

const generateReportData = (type: string, orders: any[], purchases: any[], treasury: any[], inventory: any[], filterFn: any) => {
  switch (type) {
    case 'sales':
      return filterFn(orders, 'createdAt').map((o: any) => ({
        ID: o.id,
        Date: o.createdAt,
        Type: o.type,
        Payment: o.paymentMethod,
        Total: o.total
      }));
    case 'purchases':
      return filterFn(purchases, 'date').map((p: any) => ({
        Date: p.date,
        Supplier: p.supplierName,
        Invoice: p.invoiceNumber,
        Amount: p.totalAmount
      }));
    case 'treasury':
      return filterFn(treasury, 'date').map((t: any) => ({
        Date: t.date,
        Type: t.type,
        Description: t.description,
        Amount: t.amount
      }));
    case 'inventory':
      return inventory.map((i: any) => ({
        Name: i.nameAr,
        Unit: i.unit,
        Qty: Object.values(i.warehouseQuantities).reduce((a: any, b: any) => a + b, 0),
        Cost: i.costPerUnit
      }));
    default:
      return [];
  }
};

export default Reports;
