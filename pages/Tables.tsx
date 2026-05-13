// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { api } from '../services/api';
import { Button, Input } from '../components/ui/Atoms';
import { Modal } from '../components/ui/Modal';
import { Plus, Users, Utensils, X, CheckCircle, Clock, Check, ArrowRight, ShoppingBag, Phone } from 'lucide-react';

const Tables: React.FC = () => {
  const { tables, addTable, deleteTable, customerOrders, refreshCustomerOrders, settings } = useData();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { clearCart, addToCart } = useCartStore();

  const [showAdd, setShowAdd] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCap, setNewTableCap] = useState(4);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);

  useEffect(() => {
    refreshCustomerOrders();
    const interval = setInterval(() => {
      refreshCustomerOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshCustomerOrders]);

  const handleAddTable = () => {
    if (!newTableName) return;
    addTable({
      id: Date.now().toString(),
      name: newTableName,
      capacity: newTableCap,
      status: 'available'
    });
    setShowAdd(false);
    setNewTableName('');
  };

  const getTableOrders = (tableName: string) => {
    return customerOrders.filter(o => 
      (o.status === 'pending' || o.status === 'accepted') && 
      (o.tableNumber.trim().toLowerCase() === tableName.trim().toLowerCase() ||
       o.tableNumber.trim() === tableName.replace('T-', '').trim() ||
       `t-${o.tableNumber.trim().toLowerCase()}` === tableName.trim().toLowerCase())
    );
  };

  const handleTableClick = (table: any) => {
    const orders = getTableOrders(table.name);
    if (orders.length > 0) {
      setSelectedTable(table);
    } else {
      localStorage.setItem('selectedTableId', table.id);
      navigate('/pos');
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await api.customerOrders.update(orderId, { status: 'accepted' });
      addToast(language === 'ar' ? 'تم قبول الطلب وجاري إعداده' : 'Order accepted', 'success');
      refreshCustomerOrders();
    } catch (err: any) {
      addToast(err.message || 'Error accepting order', 'error');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await api.customerOrders.update(orderId, { status: 'rejected' });
      addToast(language === 'ar' ? 'تم رفض الطلب' : 'Order rejected', 'info');
      refreshCustomerOrders();
      if (selectedTable && getTableOrders(selectedTable.name).length <= 1) {
        setSelectedTable(null);
      }
    } catch (err: any) {
      addToast(err.message || 'Error rejecting order', 'error');
    }
  };

  const handleConvertOrder = async (order: any, tableId: string) => {
    try {
      clearCart();
      order.items.forEach((i: any) => {
        addToCart(i, i.selectedVariant || null, i.selectedAddons || []);
      });
      await api.customerOrders.update(order.id, { status: 'completed' });
      addToast(language === 'ar' ? 'تم تحويل الطلب إلى شاشة البيع بنجاح' : 'Order converted to cart', 'success');
      refreshCustomerOrders();
      localStorage.setItem('selectedTableId', tableId);
      navigate('/pos');
    } catch (err: any) {
      addToast(err.message || 'Error converting order', 'error');
    }
  };

  return (
    <div className="space-y-8 font-cairo pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white">{language === 'ar' ? 'إدارة الطاولات والطلبات' : 'Tables Management'}</h2>
          <p className="text-secondary text-xs mt-1 font-bold">{language === 'ar' ? 'متابعة حالة الصالة وطلبات مسح الـ QR للعملاء' : 'Manage tables and customer QR orders'}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-primary text-background px-8 py-3.5 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
          <Plus size={20} /> {language === 'ar' ? 'إضافة طاولة' : 'Add Table'}
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map(table => {
          const activeOrders = getTableOrders(table.name);
          const hasPending = activeOrders.some(o => o.status === 'pending');
          const hasAccepted = activeOrders.some(o => o.status === 'accepted');

          return (
            <div 
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`relative p-6 rounded-[32px] border transition-all cursor-pointer group hover:-translate-y-1 shadow-xl flex flex-col justify-between min-h-[200px]
                ${activeOrders.length > 0 
                  ? (hasPending ? 'bg-orange-500/10 border-orange-500/40 glow-orange' : 'bg-primary/10 border-primary/40 glow-primary') 
                  : 'bg-surface border-white/5 hover:border-primary/30'}
              `}
            >
              <div className="flex items-start justify-between w-full">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                  ${activeOrders.length > 0 
                    ? (hasPending ? 'bg-orange-500 text-white animate-pulse' : 'bg-primary text-background') 
                    : 'bg-background text-secondary group-hover:bg-primary group-hover:text-background'}
                `}>
                  <Utensils size={24} />
                </div>
                
                <div className="text-left">
                  <h3 className="text-2xl font-black text-white leading-none">{table.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-secondary mt-1">
                    <Users size={12} /> {table.capacity} {language === 'ar' ? 'مقاعد' : 'Seats'}
                  </div>
                </div>
              </div>

              {/* Order Info Badge */}
              {activeOrders.length > 0 ? (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase
                      ${hasPending ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-primary/20 text-primary border border-primary/30'}
                    `}>
                      {hasPending ? (language === 'ar' ? 'طلب جديد بالانتظار' : 'Pending Order') : (language === 'ar' ? 'جاري التحضير' : 'Preparing')}
                    </span>
                    <span className="text-sm font-black text-white">
                      {activeOrders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)} <span className="text-[10px] opacity-60">{language === 'ar' ? settings.currencyAr : settings.currencyEn}</span>
                    </span>
                  </div>

                  {activeOrders[0]?.customerName && (
                    <div className="flex items-center gap-1.5 text-xs text-secondary font-bold truncate">
                      <Phone size={12} className="text-primary shrink-0" />
                      <span className="truncate">{activeOrders[0].customerName}</span>
                    </div>
                  )}

                  <div className="text-[11px] font-black text-primary flex items-center justify-end gap-1 group-hover:translate-x-[-4px] transition-transform">
                    <span>{language === 'ar' ? 'عرض الطلبات' : 'View Orders'}</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-secondary group-hover:text-primary transition-colors">
                  <span className="text-xs font-bold">{language === 'ar' ? 'الطاولة متاحة' : 'Available'}</span>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}

              <button 
                onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }} 
                className="absolute top-4 left-4 p-2 bg-background rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                title={language === 'ar' ? 'حذف الطاولة' : 'Delete Table'}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Table Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
          <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-sm shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white mb-6">{language === 'ar' ? 'إضافة طاولة جديدة' : 'Add New Table'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-secondary mb-1 block">{language === 'ar' ? 'اسم/رقم الطاولة' : 'Table Name/Number'}</label>
                <input className="w-full p-4 bg-background border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-primary" placeholder="مثلاً: T-10" value={newTableName} onChange={e => setNewTableName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-secondary mb-1 block">{language === 'ar' ? 'سعة الطاولة (عدد المقاعد)' : 'Capacity'}</label>
                <div className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-white/5">
                  <Users className="text-secondary" />
                  <input type="number" className="bg-transparent w-full text-white font-bold outline-none" placeholder="السعة" value={newTableCap} onChange={e => setNewTableCap(Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowAdd(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                <Button fullWidth onClick={handleAddTable}>{language === 'ar' ? 'حفظ' : 'Save'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Table Orders Modal */}
      {selectedTable && (
        <Modal isOpen onClose={() => setSelectedTable(null)}>
          <Modal.Header 
            title={language === 'ar' ? `طلبات الطاولة: ${selectedTable.name}` : `Orders for Table: ${selectedTable.name}`} 
            subtitle={language === 'ar' ? 'مراجعة طلبات العميل من مسح QR' : 'Review customer QR orders'} 
          />
          <Modal.Body>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {getTableOrders(selectedTable.name).map(order => (
                <div key={order.id} className="bg-background border border-cardAccent rounded-2xl p-4 space-y-4 shadow-lg">
                  <div className="flex items-start justify-between border-b border-cardAccent/50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-white">{order.customerName || (language === 'ar' ? 'عميل كافيتيريا' : 'Guest')}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase
                          ${order.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-primary/20 text-primary'}
                        `}>
                          {order.status === 'pending' ? (language === 'ar' ? 'معلق' : 'Pending') : (language === 'ar' ? 'مقبول' : 'Accepted')}
                        </span>
                      </div>
                      {order.phone && (
                        <div className="flex items-center gap-1 text-xs text-secondary mt-1 font-bold">
                          <Phone size={12} className="text-primary" />
                          <span dir="ltr">{order.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <span className="text-xl font-black text-primary">
                        {order.totalAmount?.toFixed(2)} <span className="text-xs opacity-60">{language === 'ar' ? settings.currencyAr : settings.currencyEn}</span>
                      </span>
                      <p className="text-[10px] text-secondary font-bold mt-0.5">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-2">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-surface/50 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-background flex items-center justify-center font-black text-primary text-xs">
                            {item.quantity}x
                          </span>
                          <div>
                            <p className="font-black text-white">{language === 'ar' ? item.nameAr : item.nameEn}</p>
                            {(item.selectedVariant || item.selectedAddons?.length > 0) && (
                              <p className="text-[11px] text-secondary font-bold mt-0.5">
                                {[item.selectedVariant?.nameAr, ...item.selectedAddons?.map(a => a.nameAr)].filter(Boolean).join(' + ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-white text-xs">
                          {((item.price || item.basePrice || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2 w-full">
                    {order.status === 'pending' && (
                      <>
                        <Button 
                          variant="danger" 
                          fullWidth 
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          <X size={16} className="mr-1" /> {language === 'ar' ? 'رفض' : 'Reject'}
                        </Button>
                        <Button 
                          fullWidth 
                          onClick={() => handleAcceptOrder(order.id)}
                        >
                          <Check size={16} className="mr-1" /> {language === 'ar' ? 'قبول وإعداد' : 'Accept'}
                        </Button>
                      </>
                    )}
                    <Button 
                      fullWidth 
                      onClick={() => handleConvertOrder(order, selectedTable.id)}
                    >
                      <ShoppingBag size={16} className="mr-1" /> {language === 'ar' ? 'تحويل للفاتورة' : 'Convert to POS'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="w-full flex justify-between items-center">
              <Button variant="outline" onClick={() => setSelectedTable(null)}>
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
              <Button onClick={() => {
                localStorage.setItem('selectedTableId', selectedTable.id);
                navigate('/pos');
              }}>
                {language === 'ar' ? 'فتح شاشة البيع للطاولة' : 'Open POS for Table'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Tables;
