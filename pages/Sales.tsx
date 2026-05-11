
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Printer, FileDown, Eye, Search,
  Filter, RotateCcw, User, FileText, Edit3,
  ShoppingBag, Banknote, CreditCard, Smartphone,
  CheckCircle2, XCircle, Clock, Package, X, Save, Trash2, History
} from 'lucide-react';
import { Order } from '../types';
import { ReceiptTemplate } from '../components/ReceiptTemplate';
import { Input, Button } from '../components/ui/Atoms';
import { Modal } from '../components/ui/Modal';
import * as XLSX from 'xlsx';
import { printTaxInvoiceA4, printThermalReceipt } from '../utils/printService';
import { generateZatcaBase64 } from '../utils/zatca';

const SALES_EDITS_KEY = 'elmashad-sales-invoice-edits';

interface InvoiceEditLog {
  id: string;
  orderId: string;
  editedBy: string;
  editedByRole: string;
  editedAt: string;
  changesSummary: string;
}

const readSalesEdits = (): InvoiceEditLog[] => {
  try {
    const raw = localStorage.getItem(SALES_EDITS_KEY);
    return raw ? (JSON.parse(raw) as InvoiceEditLog[]) : [];
  } catch {
    return [];
  }
};

const writeSalesEdits = (logs: InvoiceEditLog[]) => {
  localStorage.setItem(SALES_EDITS_KEY, JSON.stringify(logs.slice(0, 500)));
};

const paymentLabel = (method: string) => {
  if (method === 'cash') return 'نقدي';
  if (method === 'instapay') return 'InstaPay';
  if (method === 'credit') return 'آجل';
  return method;
};

const paymentColor = (method: string) => {
  if (method === 'cash') return 'text-accentGreen bg-accentGreen/10 border-accentGreen/20';
  if (method === 'instapay') return 'text-accentBlue bg-accentBlue/10 border-accentBlue/20';
  if (method === 'credit') return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
  return 'text-secondary bg-cardAccent border-cardAccent';
};

const paymentIcon = (method: string) => {
  if (method === 'cash') return <Banknote size={11} />;
  if (method === 'instapay') return <Smartphone size={11} />;
  if (method === 'credit') return <CreditCard size={11} />;
  return <Banknote size={11} />;
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  completed: { label: 'مكتمل', cls: 'text-accentGreen bg-accentGreen/10' },
  paid: { label: 'مدفوع', cls: 'text-accentGreen bg-accentGreen/10' },
  pending: { label: 'معلق', cls: 'text-orange-400 bg-orange-400/10' },
  cancelled: { label: 'ملغي', cls: 'text-red-400 bg-red-400/10' },
  preparing: { label: 'قيد التحضير', cls: 'text-accentBlue bg-accentBlue/10' },
  ready: { label: 'جاهز', cls: 'text-primary bg-primary/10' },
};

const Sales: React.FC = () => {
  const { orders, settings, updateOrder, deleteOrder } = useData();
  const { t, language } = useLanguage();
  const { userRole, user } = useAuth();
  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<Partial<Order>>({});
  const [showEditsModal, setShowEditsModal] = useState(false);
  const [invoiceEditLogs, setInvoiceEditLogs] = useState<InvoiceEditLog[]>(() => readSalesEdits());

  const filteredOrders = useMemo(() => {
    let fromDate = dateFrom;
    let toDate = dateTo;
    
    // For cashiers, auto-limit to current month only
    if (userRole === 'cashier') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const firstDay = `${year}-${month}-01`;
      const lastDay = new Date(year, now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      fromDate = dateFrom || firstDay;
      toDate = dateTo || lastDay;
    }
    
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter(order => {
        const matchesSearch =
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.customerName || '').includes(searchQuery) ||
          (order.performedBy?.name || '').includes(searchQuery);
        const matchesType = typeFilter === 'all' || order.type === typeFilter;
        const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const orderDate = order.createdAt.split('T')[0];
        const matchesDateFrom = !fromDate || orderDate >= fromDate;
        const matchesDateTo = !toDate || orderDate <= toDate;
        return matchesSearch && matchesType && matchesPayment && matchesStatus && matchesDateFrom && matchesDateTo;
      });
  }, [orders, searchQuery, typeFilter, paymentFilter, statusFilter, dateFrom, dateTo, userRole]);

  const totalGross = filteredOrders.reduce((a, o) => a + o.total, 0);
  const totalTax = filteredOrders.reduce((a, o) => a + o.tax, 0);
  const totalNet = totalGross - totalTax;

  const resetFilters = () => {
    setSearchQuery(''); setDateFrom(''); setDateTo('');
    setTypeFilter('all'); setPaymentFilter('all'); setStatusFilter('all');
  };

  const handlePrint = (order: Order, type: 'a4' | 'thermal' = 'thermal') => {
    const qrValue = generateZatcaBase64(settings.restaurantNameAr, settings.taxId, order.createdAt, order.total.toString(), order.tax.toString());
    if (type === 'a4') printTaxInvoiceA4({ order, settings, currency, language, qrValue });
    else printThermalReceipt({ order, settings, currency, language, qrValue });
  };

  const handleOpenEdit = (order: Order) => {
    setEditOrder(order);
    setEditForm({
      customerName: order.customerName || '',
      paymentMethod: order.paymentMethod,
      status: order.status,
      type: order.type,
    });
  };

  const handleSaveEdit = () => {
    if (!editOrder) return;
    const changed: string[] = [];
    if (editForm.customerName !== undefined && editForm.customerName !== editOrder.customerName) changed.push(`العميل: ${editOrder.customerName || '—'} -> ${editForm.customerName || '—'}`);
    if (editForm.paymentMethod !== undefined && editForm.paymentMethod !== editOrder.paymentMethod) changed.push(`الدفع: ${paymentLabel(editOrder.paymentMethod)} -> ${paymentLabel(editForm.paymentMethod as any)}`);
    if (editForm.status !== undefined && editForm.status !== editOrder.status) changed.push(`الحالة: ${statusConfig[editOrder.status]?.label || editOrder.status} -> ${statusConfig[editForm.status as string]?.label || String(editForm.status)}`);
    if (editForm.type !== undefined && editForm.type !== editOrder.type) changed.push(`نوع الخدمة: ${editOrder.type === 'takeaway' ? 'تيك أواي' : 'عميل'} -> ${editForm.type === 'takeaway' ? 'تيك أواي' : 'عميل'}`);

    if (typeof updateOrder === 'function') {
      updateOrder(editOrder.id, editForm);
    }

    if (changed.length > 0) {
      const newLog: InvoiceEditLog = {
        id: `edit_${Date.now()}`,
        orderId: editOrder.id,
        editedBy: user || 'مستخدم',
        editedByRole: userRole || 'cashier',
        editedAt: new Date().toISOString(),
        changesSummary: changed.join(' | '),
      };
      const nextLogs = [newLog, ...invoiceEditLogs];
      setInvoiceEditLogs(nextLogs);
      writeSalesEdits(nextLogs);
    }

    setEditOrder(null);
  };

  const visibleInvoiceEditLogs = useMemo(() => {
    if (userRole === 'cashier') {
      return invoiceEditLogs.filter(log => log.editedBy === (user || ''));
    }
    return invoiceEditLogs;
  }, [invoiceEditLogs, userRole, user]);

  const handleDeleteOrder = (order: Order) => {
    if (window.confirm(`حذف فاتورة #${order.id}؟`)) {
      deleteOrder(order.id);
    }
  };

  const handleExportExcel = () => {
    const data = filteredOrders.map(o => ({
      'رقم الطلب': o.id,
      'التاريخ': new Date(o.createdAt).toLocaleDateString('ar-EG'),
      'الوقت': new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      'المسؤول': o.performedBy?.name || '',
      'تفاصيل الطلب': o.items.map(i => `${i.nameAr || i.nameEn} x${i.quantity}`).join(' | '),
      'نوع الخدمة': o.type === 'takeaway' ? 'تيك أواي' : 'عميل',
      'اسم العميل': o.customerName || '',
      'طريقة الدفع': paymentLabel(o.paymentMethod),
      'الإجمالي': o.total,
      'الضريبة': o.tax,
      'الحالة': statusConfig[o.status]?.label || o.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [15, 12, 10, 15, 50, 12, 15, 12, 12, 10, 10].map(wch => ({ wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'فواتير البيع');
    XLSX.writeFile(wb, `sales_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5 pb-10 font-cairo">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-textPrimary">فواتير البيع</h2>
          <p className="text-secondary text-xs font-bold mt-0.5">إجمالي {filteredOrders.length} فاتورة</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditsModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-black transition-all bg-surface border-cardAccent text-secondary hover:text-textPrimary"
          >
            <History size={16} /> التعديلات
          </button>
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-black transition-all ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-cardAccent text-secondary hover:text-textPrimary'}`}
          >
            <Filter size={16} /> فلترة
          </button>
          {userRole !== 'cashier' && (
            <button onClick={handleExportExcel} className="flex items-center gap-2 bg-surface text-secondary border border-cardAccent px-4 py-2.5 rounded-xl hover:text-accentGreen transition-all font-black text-sm">
              <FileDown size={16} className="text-accentGreen" /> تصدير
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-surface p-5 rounded-[24px] border border-cardAccent space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                className="w-full pr-9 pl-3 py-2.5 bg-background border border-cardAccent rounded-xl text-sm font-bold text-textPrimary outline-none focus:border-primary"
                placeholder="بحث برقم الطلب أو اسم العميل..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <input type="date" className="px-3 py-2.5 bg-background border border-cardAccent rounded-xl text-sm font-bold text-textPrimary outline-none focus:border-primary" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <input type="date" className="px-3 py-2.5 bg-background border border-cardAccent rounded-xl text-sm font-bold text-textPrimary outline-none focus:border-primary" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            <button onClick={resetFilters} className="flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-cardAccent rounded-xl text-secondary hover:text-red-400 font-black text-sm transition-all">
              <RotateCcw size={14} /> مسح الفلاتر
            </button>
          </div>
          <div className="flex flex-wrap gap-3 pt-3 border-t border-cardAccent">
            {/* Type */}
            <div className="flex bg-background p-1 rounded-xl border border-cardAccent gap-0.5">
              {[['all', 'الكل'], ['takeaway', 'تيك أواي'], ['customer', 'عميل']].map(([v, l]) => (
                <button key={v} onClick={() => setTypeFilter(v)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${typeFilter === v ? 'bg-primary text-white' : 'text-secondary hover:text-textPrimary'}`}>{l}</button>
              ))}
            </div>
            {/* Payment */}
            <div className="flex bg-background p-1 rounded-xl border border-cardAccent gap-0.5">
              {[['all', 'كل الدفع'], ['cash', 'نقدي'], ['instapay', 'InstaPay'], ['credit', 'آجل']].map(([v, l]) => (
                <button key={v} onClick={() => setPaymentFilter(v)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${paymentFilter === v ? 'bg-accentBlue text-white' : 'text-secondary hover:text-textPrimary'}`}>{l}</button>
              ))}
            </div>
            {/* Status */}
            <div className="flex bg-background p-1 rounded-xl border border-cardAccent gap-0.5">
              {[['all', 'كل الحالات'], ['completed', 'مكتمل'], ['pending', 'معلق'], ['cancelled', 'ملغي']].map(([v, l]) => (
                <button key={v} onClick={() => setStatusFilter(v)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${statusFilter === v ? 'bg-accentGreen text-white' : 'text-secondary hover:text-textPrimary'}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {userRole !== 'cashier' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface p-5 rounded-[20px] border border-cardAccent">
            <p className="text-secondary text-[10px] font-black uppercase mb-1">إجمالي المبيعات</p>
            <p className="text-2xl font-black text-accentGreen">{totalGross.toLocaleString()} <span className="text-xs opacity-40">{currency}</span></p>
          </div>
          <div className="bg-surface p-5 rounded-[20px] border border-cardAccent">
            <p className="text-secondary text-[10px] font-black uppercase mb-1">الضريبة المضافة</p>
            <p className="text-2xl font-black text-red-400">{totalTax.toLocaleString()} <span className="text-xs opacity-40">{currency}</span></p>
          </div>
          <div className="bg-surface p-5 rounded-[20px] border border-cardAccent">
            <p className="text-secondary text-[10px] font-black uppercase mb-1">صافي الإيرادات</p>
            <p className="text-2xl font-black text-primary">{totalNet.toLocaleString()} <span className="text-xs opacity-40">{currency}</span></p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface rounded-[24px] border border-cardAccent overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-background/60 border-b border-cardAccent">
              <tr>
                <th className="px-5 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">رقم الطلب</th>
                <th className="px-5 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">المسؤول</th>
                <th className="px-5 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">تفاصيل الطلب</th>
                <th className="px-5 py-4 text-[10px] font-black text-secondary uppercase tracking-widest text-center">نوع الخدمة</th>
                <th className="px-5 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">اسم العميل</th>
                <th className="px-5 py-4 text-[10px] font-black text-secondary uppercase tracking-widest text-left">الإجمالي</th>
                <th className="px-5 py-4 text-[10px] font-black text-secondary uppercase tracking-widest text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cardAccent/50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-25">
                      <Package size={48} className="mb-3" />
                      <p className="font-black text-textPrimary">لا توجد فواتير مطابقة</p>
                      <button onClick={resetFilters} className="mt-3 text-xs text-primary font-bold hover:underline">مسح الفلاتر</button>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map(order => {
                const sc = statusConfig[order.status] || { label: order.status, cls: 'text-secondary bg-cardAccent' };
                return (
                  <tr key={order.id} className="hover:bg-background/50 transition-colors group">

                    {/* Order Number */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-black text-xs">#{order.id}</span>
                        <div className="flex items-center gap-1 text-[9px] text-secondary font-bold">
                          <Calendar size={9} />
                          {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                          {' '}
                          {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </div>
                    </td>

                    {/* Employee */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">
                          {(order.performedBy?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-textPrimary text-xs">{order.performedBy?.name || 'غير محدد'}</p>
                          <p className="text-[9px] text-secondary font-bold">
                            {order.performedBy?.role ? (['admin', 'manager'].includes(order.performedBy.role) ? 'مدير' : 'كاشير') : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Order Items Detail */}
                    <td className="px-5 py-4 max-w-[220px]">
                      <div className="space-y-0.5">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-4 h-4 bg-cardAccent rounded text-[9px] font-black text-secondary flex items-center justify-center shrink-0">×{item.quantity}</span>
                            <span className="text-[10px] font-bold text-textPrimary truncate">{item.nameAr || item.nameEn}</span>
                            {item.selectedVariant && <span className="text-[8px] text-accentBlue font-bold">({item.selectedVariant.nameAr})</span>}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-[9px] text-secondary font-bold">+{order.items.length - 3} صنف آخر</p>
                        )}
                      </div>
                    </td>

                    {/* Service Type */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black ${order.type === 'takeaway' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-accentBlue/10 text-accentBlue border-accentBlue/20'}`}>
                        {order.type === 'takeaway' ? <ShoppingBag size={10} /> : <User size={10} />}
                        {order.type === 'takeaway' ? 'تيك أواي' : 'عميل'}
                      </span>
                    </td>

                    {/* Customer Name */}
                    <td className="px-5 py-4">
                      {order.customerName ? (
                        <div className="flex items-center gap-1.5">
                          <User size={11} className="text-accentBlue shrink-0" />
                          <span className="text-xs font-black text-textPrimary">{order.customerName}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-secondary font-bold">—</span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4 text-left">
                      <div>
                        <p className="text-base font-black text-textPrimary">{order.total.toFixed(2)} <span className="text-[9px] opacity-40">{currency}</span></p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-black mt-1 ${paymentColor(order.paymentMethod)}`}>
                          {paymentIcon(order.paymentMethod)}
                          {paymentLabel(order.paymentMethod)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewOrder(order)}
                          title="عرض الفاتورة"
                          className="p-2 bg-background border border-cardAccent text-secondary hover:text-primary hover:border-primary/30 rounded-xl transition-all"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(order)}
                          title="تعديل"
                          className="p-2 bg-background border border-cardAccent text-secondary hover:text-accentBlue hover:border-accentBlue/30 rounded-xl transition-all"
                        >
                          <Edit3 size={15} />
                        </button>
                        {userRole !== 'cashier' && (
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            title="حذف"
                            className="p-2 bg-background border border-cardAccent text-secondary hover:text-red-500 hover:border-red-500/30 rounded-xl transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint(order, 'thermal')}
                          title="طباعة"
                          className="p-2 bg-background border border-cardAccent text-secondary hover:text-accentGreen hover:border-accentGreen/30 rounded-xl transition-all"
                        >
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)}>
          <Modal.Header
            title={`فاتورة #${viewOrder.id}`}
            subtitle={`${new Date(viewOrder.createdAt).toLocaleString('ar-EG')} · ${paymentLabel(viewOrder.paymentMethod)}`}
          />
          <Modal.Body>
            <div className="space-y-4">
              {/* Items */}
              <div className="bg-background rounded-2xl border border-cardAccent p-4 space-y-2">
                <h4 className="text-[10px] font-black text-secondary uppercase mb-3">تفاصيل الطلب</h4>
                {viewOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-sm text-textPrimary">{item.nameAr || item.nameEn}</p>
                      {item.selectedVariant && <p className="text-[10px] text-accentBlue font-bold">{item.selectedVariant.nameAr}</p>}
                      {item.selectedAddons?.length > 0 && <p className="text-[10px] text-secondary font-bold">{item.selectedAddons.map(a => a.nameAr).join(', ')}</p>}
                      {item.notes && <p className="text-[9px] text-orange-400 italic">ملاحظة: {item.notes}</p>}
                    </div>
                    <div className="text-left shrink-0 mr-2">
                      <p className="font-black text-sm text-textPrimary">{(item.totalItemPrice * item.quantity).toFixed(2)} {currency}</p>
                      <p className="text-[10px] text-secondary">×{item.quantity} × {item.totalItemPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Totals */}
              <div className="bg-background rounded-2xl border border-cardAccent p-4 space-y-2">
                <div className="flex justify-between text-xs text-secondary font-bold"><span>المجموع الجزئي</span><span>{viewOrder.subtotal.toFixed(2)} {currency}</span></div>
                {viewOrder.tax > 0 && <div className="flex justify-between text-xs text-secondary font-bold"><span>ضريبة القيمة المضافة</span><span>{viewOrder.tax.toFixed(2)} {currency}</span></div>}
                <div className="flex justify-between font-black text-textPrimary border-t border-cardAccent pt-2"><span>الإجمالي</span><span className="text-primary">{viewOrder.total.toFixed(2)} {currency}</span></div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cardAccent/50">
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-[9px] text-secondary font-black uppercase mb-1">إجمالي الفاتورة</p>
                    <p className="font-black text-xs text-textPrimary">{viewOrder.total.toFixed(2)} {currency}</p>
                  </div>
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-[9px] text-secondary font-black uppercase mb-1">المبلغ المستلم</p>
                    <p className="font-black text-xs text-accentGreen">{(viewOrder.amountReceived ?? viewOrder.total).toFixed(2)} {currency}</p>
                  </div>
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-[9px] text-secondary font-black uppercase mb-1">المبلغ المتبقي</p>
                    <p className="font-black text-xs text-orange-400">{Math.max(0, viewOrder.total - (viewOrder.amountReceived ?? viewOrder.total)).toFixed(2)} {currency}</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-secondary font-bold"><span>طريقة الدفع</span><span>{paymentLabel(viewOrder.paymentMethod)}</span></div>
              </div>
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background rounded-xl border border-cardAccent p-3">
                  <p className="text-[9px] text-secondary font-black uppercase mb-1">المسؤول</p>
                  <p className="font-black text-xs text-textPrimary">{viewOrder.performedBy?.name || '—'}</p>
                </div>
                <div className="bg-background rounded-xl border border-cardAccent p-3">
                  <p className="text-[9px] text-secondary font-black uppercase mb-1">اسم العميل</p>
                  <p className="font-black text-xs text-textPrimary">{viewOrder.customerName || '—'}</p>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => setViewOrder(null)}>إغلاق</Button>
              <Button variant="outline" onClick={() => handlePrint(viewOrder, 'a4')} className="gap-1 border-accentBlue text-accentBlue hover:bg-accentBlue hover:text-white">
                <FileText size={14} /> A4
              </Button>
              <Button onClick={() => handlePrint(viewOrder, 'thermal')} className="gap-1">
                <Printer size={14} /> حراري
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit Order Modal */}
      {editOrder && (
        <Modal isOpen={!!editOrder} onClose={() => setEditOrder(null)}>
          <Modal.Header title={`تعديل فاتورة #${editOrder.id}`} />
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-secondary uppercase block mb-1.5">اسم العميل</label>
                <input
                  className="w-full p-3 bg-background border border-cardAccent rounded-xl text-textPrimary font-bold outline-none focus:border-primary text-sm"
                  value={editForm.customerName || ''}
                  onChange={e => setEditForm(p => ({ ...p, customerName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-secondary uppercase block mb-1.5">طريقة الدفع</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['cash', 'نقدي', 'text-accentGreen'], ['instapay', 'InstaPay', 'text-accentBlue'], ['credit', 'آجل', 'text-orange-400']].map(([v, l, c]) => (
                    <button key={v} onClick={() => setEditForm(p => ({ ...p, paymentMethod: v as any }))}
                      className={`py-2.5 rounded-xl border-2 text-xs font-black transition-all ${editForm.paymentMethod === v ? `border-current ${c} bg-current/5` : 'border-cardAccent text-secondary'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-secondary uppercase block mb-1.5">نوع الخدمة</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['takeaway', 'تيك أواي'], ['customer', 'عميل']].map(([v, l]) => (
                    <button key={v} onClick={() => setEditForm(p => ({ ...p, type: v as any }))}
                      className={`py-2.5 rounded-xl border-2 text-xs font-black transition-all ${editForm.type === v ? 'border-primary text-primary bg-primary/5' : 'border-cardAccent text-secondary'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-secondary uppercase block mb-1.5">حالة الطلب</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['completed', 'مكتمل'], ['pending', 'معلق'], ['cancelled', 'ملغي']].map(([v, l]) => (
                    <button key={v} onClick={() => setEditForm(p => ({ ...p, status: v as any }))}
                      className={`py-2.5 rounded-xl border-2 text-xs font-black transition-all ${editForm.status === v ? 'border-accentGreen text-accentGreen bg-accentGreen/5' : 'border-cardAccent text-secondary'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setEditOrder(null)}>إلغاء</Button>
              <Button onClick={handleSaveEdit} className="gap-1"><Save size={14} /> حفظ التعديلات</Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}

      {showEditsModal && (
        <Modal isOpen={showEditsModal} onClose={() => setShowEditsModal(false)}>
          <Modal.Header title="سجل تعديلات الفواتير" subtitle={userRole === 'cashier' ? 'تعديلاتك فقط' : 'كل التعديلات'} />
          <Modal.Body>
            {visibleInvoiceEditLogs.length === 0 ? (
              <p className="text-secondary text-sm font-bold">لا توجد تعديلات مسجلة</p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {visibleInvoiceEditLogs.map(log => (
                  <div key={log.id} className="bg-background border border-cardAccent rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-black text-textPrimary text-sm">فاتورة #{log.orderId}</p>
                      <p className="text-[10px] text-secondary font-bold">{new Date(log.editedAt).toLocaleString('ar-EG')}</p>
                    </div>
                    <p className="text-[11px] text-secondary font-bold mb-1">بواسطة: {log.editedBy} ({['admin', 'manager'].includes(log.editedByRole) ? 'مدير' : 'كاشير'})</p>
                    <p className="text-xs text-textPrimary font-bold">{log.changesSummary}</p>
                  </div>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth onClick={() => setShowEditsModal(false)}>إغلاق</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Hidden print container */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
        {viewOrder && <ReceiptTemplate order={viewOrder} settings={settings} currency={currency} language={language} t={t} />}
      </div>
    </div>
  );
};

export default Sales;
