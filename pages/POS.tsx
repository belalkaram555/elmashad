
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useCartCalculation } from '../features/pos/hooks/useCartCalculation';
import { Button, Input } from '../components/ui/Atoms';
import { Modal } from '../components/ui/Modal';
import { CartItem, MenuItem, Order, ProductVariant, ProductAddon } from '../types';
import { ReceiptTemplate } from '../components/ReceiptTemplate';
import {
  Plus, Minus, ShoppingBag,
  Printer, LayoutGrid, CheckCircle2, Settings2,
  Trash2, PauseCircle, MessageSquare,
  Coins, DoorOpen, Clock, User, Filter, FileText, Search,
  UserPlus, X, Smartphone, CreditCard, Banknote, Play, Pencil,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { printTaxInvoiceA4, printThermalReceipt } from '../utils/printService';
import { generateZatcaBase64 } from '../utils/zatca';

const CATEGORY_COLORS = [
  '#FF9F43', '#28C76F', '#374151', '#EA5455',
  '#7367F0', '#F1C40F', '#E91E63', '#009688', '#607D8B', '#9C27B0'
];

const POS: React.FC = () => {
  const { menuItems, addOrder, categories, settings, nextOrderNumber, customers, addCustomer, activeShift, openShift } = useData();
  const { t, language } = useLanguage();
  const { user, userRole } = useAuth();
  const { addToast } = useToastStore();

  const {
    cart, addToCart, removeFromCart, updateQuantity,
    clearCart, holdOrder, heldOrders, resumeOrder, updateItemNote, deleteHeldOrder, updateHeldOrder
  } = useCartStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [orderType, setOrderType] = useState<'takeaway' | 'customer'>('customer');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isCompactView, setIsCompactView] = useState(settings.defaultCompactView || false);
  const [mobileStep, setMobileStep] = useState<1 | 2 | 3>(1);

  // Customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Shift
  const [showShiftModal, setShowShiftModal] = useState(!activeShift && userRole === 'cashier');
  const [shiftStartBalance, setShiftStartBalance] = useState(0);

  // Modals
  const [noteModal, setNoteModal] = useState<{ show: boolean; index?: number; value: string }>({ show: false, value: '' });
  const [selectionModal, setSelectionModal] = useState<{ show: boolean; product?: MenuItem }>({ show: false });
  const [selectedVar, setSelectedVar] = useState<ProductVariant | null>(null);
  const [selectedAds, setSelectedAds] = useState<ProductAddon[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showHeldPanel, setShowHeldPanel] = useState(false);
  const [editHeldId, setEditHeldId] = useState<string | null>(null);
  const [editHeldLabel, setEditHeldLabel] = useState('');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Promo Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const promoSlides = useMemo(() => [
    {
      title: "عرض الصباح المميز ☕🥐",
      desc: "ابدأ يومك بنشاط! قهوة إسبريسو كلاسيكية مع كرواسون زبدة طازج بخصم 20%",
      bg: "from-amber-600 to-orange-500",
      tag: "الأكثر مبيعاً"
    },
    {
      title: "انتعاش الصيف مع بستاشيو لاتيه 🧊💚",
      desc: "بستاشيو لاتيه بارد ومثلج مع دبل شوت إسبريسو لترطيب يومك الحار",
      bg: "from-emerald-600 to-teal-500",
      tag: "جديدنا"
    },
    {
      title: "حلويات المشهد الفاخرة 🍰✨",
      desc: "تذوق تشكيلة واسعة من الكعك والحلويات المصنوعة يدوياً بكل حب وشغف",
      bg: "from-pink-600 to-purple-600",
      tag: "موصى به"
    }
  ], []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

  const { subtotal, serviceCharge, tax, total } = useCartCalculation(cart, settings, orderType as any);
  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;
  const receivedNum = parseFloat(cashReceived) || 0;
  const changeAmount = Math.max(0, receivedNum - total);

  const getCategoryColor = (catId: string) => {
    if (catId === 'all') return '#FF9F43';
    const index = categories.findIndex(c => c.id === catId);
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  };

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 8);
    return customers.filter(c =>
      c.name.includes(customerSearch) || (c.phone || '').includes(customerSearch)
    ).slice(0, 8);
  }, [customers, customerSearch]);

  useEffect(() => {
    if (orderType !== 'customer') {
      setSelectedCustomerId(''); setSelectedCustomerName(''); setCustomerSearch('');
      setShowCustomerDropdown(false);
    } else {
      setShowCustomerDropdown(true);
    }
  }, [orderType]);

  const handleOpenShift = () => {
    if (shiftStartBalance < 0) { addToast('رصيد البداية لا يمكن أن يكون بالسالب', 'error'); return; }
    openShift(user || 'guest', user || 'المستخدم', shiftStartBalance);
    setShowShiftModal(false);
  };

  const handleProductClick = (item: MenuItem) => {
    if (!item.available) return;
    if (item.variants.length > 0 || item.addons.length > 0) {
      setSelectedVar(item.variants.length > 0 ? item.variants[0] : null);
      setSelectedAds([]);
      setSelectionModal({ show: true, product: item });
    } else {
      addToCart(item, null, []);
    }
  };

  const handleConfirmSelection = () => {
    if (selectionModal.product) {
      addToCart(selectionModal.product, selectedVar, selectedAds);
      setSelectionModal({ show: false });
    }
  };

  const handleHold = () => {
    if (cart.length === 0) return;
    holdOrder({ orderType, customerName: selectedCustomerName, customerId: selectedCustomerId });
    addToast('تم تعليق الطلب', 'info');
    // reset customer
    setSelectedCustomerId(''); setSelectedCustomerName(''); setCustomerSearch('');
  };

  const handleResumeHeld = (id: string) => {
    const held = resumeOrder(id);
    if (held) {
      setOrderType(held.orderType || 'takeaway');
      setSelectedCustomerName(held.customerName || '');
      setSelectedCustomerId(held.customerId || '');
      setCustomerSearch(held.customerName || '');
      setShowHeldPanel(false);
      addToast('تم استئناف الطلب', 'success');
    }
  };

  const handleSelectCustomer = (id: string, name: string) => {
    setSelectedCustomerId(id);
    setSelectedCustomerName(name);
    setCustomerSearch(name);
    setShowCustomerDropdown(false);
  };

  const handleCreateCustomer = () => {
    if (!newCustomerName.trim()) { addToast('يرجى إدخال اسم العميل', 'error'); return; }
    const newC = { id: `c_${Date.now()}`, name: newCustomerName.trim(), phone: newCustomerPhone.trim(), balance: 0 };
    addCustomer(newC);
    handleSelectCustomer(newC.id, newC.name);
    setShowNewCustomerModal(false);
    setNewCustomerName(''); setNewCustomerPhone('');
    addToast('تم إضافة العميل', 'success');
  };

  const finalizeOrder = (method: 'cash' | 'instapay' | 'credit') => {
    if (!activeShift && userRole !== 'admin') { setShowShiftModal(true); return; }
    if (cart.length === 0) return;
    if (orderType === 'customer' && !selectedCustomerName) { addToast('يرجى اختيار أو إدخال اسم العميل', 'error'); return; }

    const order: Order = {
      id: nextOrderNumber.toString(),
      items: [...cart],
      subtotal, discount: 0, serviceCharge, tax, total,
      paymentMethod: method,
      amountReceived: method === 'cash' ? (receivedNum || total) : total,
      changeAmount: method === 'cash' ? changeAmount : 0,
      type: orderType,
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomerName || undefined,
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      performedBy: { name: user || 'Anonymous', role: userRole || 'Unknown' }
    };
    addOrder(order);
    setLastOrder(order);
    setShowSuccessModal(true);
  };

  const resetPOS = () => {
    clearCart(); setCashReceived('');
    setSelectedCustomerId(''); setSelectedCustomerName(''); setCustomerSearch('');
    setShowSuccessModal(false);
    setMobileStep(1);
  };

  const handlePrintOrder = (order: Order, type: 'a4' | 'thermal') => {
    const qrValue = generateZatcaBase64(settings.restaurantNameAr, settings.taxId, order.createdAt, order.total.toString(), order.tax.toString());
    if (type === 'a4') printTaxInvoiceA4({ order, settings, currency, language, qrValue });
    else printThermalReceipt({ order, settings, currency, language, qrValue });
    resetPOS();
  };

  const filteredItems = useMemo(() =>
    menuItems.filter(item => selectedCategoryId === 'all' || item.categoryId === selectedCategoryId),
    [menuItems, selectedCategoryId]
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5.5rem)] lg:h-[calc(100vh-7rem)] gap-3 font-cairo select-none relative pb-16 lg:pb-0">

      {/* Mobile Wizard Steps Indicator */}
      <div className="lg:hidden flex items-center justify-between bg-surface border-b border-cardAccent p-3 rounded-2xl mb-1 no-print shrink-0">
        <div className="flex items-center gap-1 w-full justify-around">
          <button 
            onClick={() => setMobileStep(1)} 
            className={`flex items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${mobileStep === 1 ? 'bg-primary text-background font-black' : 'text-secondary text-[11px] font-bold'}`}
          >
            <span className="w-5 h-5 rounded-full bg-current text-surface flex items-center justify-center text-[10px] font-black">1</span>
            <span>نوع الطلب</span>
          </button>
          <div className="w-5 h-0.5 bg-cardAccent shrink-0" />
          <button 
            disabled={orderType === 'customer' && !selectedCustomerId} 
            onClick={() => setMobileStep(2)} 
            className={`flex items-center gap-1 px-2 py-1.5 rounded-xl transition-all disabled:opacity-30 ${mobileStep === 2 ? 'bg-primary text-background font-black' : 'text-secondary text-[11px] font-bold'}`}
          >
            <span className="w-5 h-5 rounded-full bg-current text-surface flex items-center justify-center text-[10px] font-black">2</span>
            <span>الأصناف</span>
          </button>
          <div className="w-5 h-0.5 bg-cardAccent shrink-0" />
          <button 
            disabled={cart.length === 0} 
            onClick={() => setMobileStep(3)} 
            className={`flex items-center gap-1 px-2 py-1.5 rounded-xl transition-all disabled:opacity-30 ${mobileStep === 3 ? 'bg-primary text-background font-black' : 'text-secondary text-[11px] font-bold'}`}
          >
            <span className="w-5 h-5 rounded-full bg-current text-surface flex items-center justify-center text-[10px] font-black">3</span>
            <span>الدفع</span>
          </button>
        </div>
      </div>

      {/* Shift closed overlay */}
      {!activeShift && userRole === 'cashier' && (
        <div className="absolute inset-0 z-[45] bg-background/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface p-10 rounded-[32px] border border-primary/20 shadow-2xl text-center max-w-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <DoorOpen size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-black text-textPrimary mb-2">الوردية مغلقة</h3>
            <p className="text-secondary font-bold mb-6 text-sm">يجب فتح وردية جديدة للبدء</p>
            <Button fullWidth onClick={() => setShowShiftModal(true)}>بدء الوردية</Button>
          </div>
        </div>
      )}

      {/* ───── Step 1 (Mobile Only): Order Type & Customer Selector ───── */}
      {mobileStep === 1 && (
        <div className="lg:hidden flex-1 flex flex-col justify-start p-5 bg-surface rounded-[28px] border border-cardAccent shadow-xl overflow-y-auto no-print space-y-6">
          <div className="text-center py-4">
            <h3 className="text-lg font-black text-textPrimary">تحديد نوع الطلب</h3>
            <p className="text-secondary text-xs mt-1">يرجى تحديد نوع الخدمة والعميل للمتابعة</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { setOrderType('takeaway'); }}
              className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl transition-all border-2 gap-2.5 ${orderType === 'takeaway' ? 'bg-primary/10 border-primary text-primary font-black scale-102' : 'border-cardAccent text-secondary'}`}
            >
              <ShoppingBag size={28} />
              <span className="text-sm font-black">تيك أواي</span>
            </button>
            <button 
              onClick={() => { setOrderType('customer'); }}
              className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl transition-all border-2 gap-2.5 ${orderType === 'customer' ? 'bg-accentBlue/10 border-accentBlue text-accentBlue font-black scale-102' : 'border-cardAccent text-secondary'}`}
            >
              <User size={28} />
              <span className="text-sm font-black">عميل</span>
            </button>
          </div>

          {orderType === 'customer' && (
            <div className="p-4 bg-background/40 rounded-2xl border border-cardAccent space-y-3.5 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-secondary">البحث عن عميل</span>
                <button 
                  onClick={() => { setShowNewCustomerModal(true); setNewCustomerName(''); setNewCustomerPhone(''); }}
                  className="text-xs font-black text-accentBlue hover:underline flex items-center gap-1"
                >
                  <UserPlus size={14} /> جديد
                </button>
              </div>
              <div className="relative">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  className="w-full h-11 pr-10 pl-3 bg-background border-2 border-cardAccent rounded-xl text-sm font-bold text-textPrimary outline-none focus:border-accentBlue"
                  placeholder="ابحث عن عميل بالاسم أو الهاتف..."
                  value={customerSearch}
                  onChange={e => { 
                    setCustomerSearch(e.target.value); 
                    setShowCustomerDropdown(true); 
                    if (!e.target.value) { setSelectedCustomerId(''); setSelectedCustomerName(''); } 
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                />
                {selectedCustomerId && (
                  <button onClick={() => { setSelectedCustomerId(''); setSelectedCustomerName(''); setCustomerSearch(''); }} className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary hover:text-red-400">
                    <X size={14} />
                  </button>
                )}
              </div>
              
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="bg-background border border-cardAccent rounded-xl overflow-hidden shadow-lg z-50 max-h-40 overflow-y-auto divide-y divide-cardAccent/30">
                  {filteredCustomers.map(c => (
                    <button key={c.id} onClick={() => handleSelectCustomer(c.id, c.name)}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-right hover:bg-cardAccent transition-colors">
                      <User size={15} className="text-accentBlue shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-black text-textPrimary truncate">{c.name}</p>
                        {c.phone && <p className="text-[11px] text-secondary mt-0.5">{c.phone}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedCustomerId && (
                <div className="flex items-center gap-2 bg-accentBlue/10 rounded-xl px-3 py-2.5 border border-accentBlue/20 animate-in fade-in duration-200">
                  <CheckCircle2 size={15} className="text-accentBlue shrink-0" />
                  <span className="text-xs font-black text-accentBlue">{selectedCustomerName}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 mt-auto">
            <button
              disabled={orderType === 'customer' && !selectedCustomerId}
              onClick={() => setMobileStep(2)}
              className="w-full h-12 bg-primary text-background hover:bg-primary/90 disabled:opacity-30 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>التالي: تحديد المنتجات ⬅️</span>
            </button>
          </div>
        </div>
      )}

      {/* ───── Left: Categories & Products ───── */}
      <div className={`flex-1 flex flex-col gap-3 overflow-hidden no-print ${mobileStep === 2 ? 'flex' : 'hidden lg:flex'}`}>

        {/* Categories bar */}
        <div className="bg-surface p-3 rounded-[24px] border border-cardAccent shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={15} className="text-primary" />
            <span className="font-black text-textPrimary text-xs">الأقسام</span>
            <div className="flex-1" />
            <button
              onClick={() => setIsCompactView(!isCompactView)}
              className={`p-1.5 rounded-lg border transition-all ${isCompactView ? 'bg-primary text-background border-primary' : 'border-cardAccent text-secondary'}`}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
          <div className="flex lg:flex-wrap overflow-x-auto lg:overflow-x-visible scrollbar-hidden gap-1.5 pb-1 lg:pb-0 whitespace-nowrap">
            {[{ id: 'all', nameAr: 'الكل', nameEn: 'All' }, ...categories].map((cat, idx) => {
              const color = cat.id === 'all' ? '#FF9F43' : CATEGORY_COLORS[(idx - 1) % CATEGORY_COLORS.length];
              const isActive = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  style={{ backgroundColor: isActive ? color : 'transparent', borderColor: isActive ? color : 'var(--color-card-accent)', color: isActive ? '#FFF' : 'var(--color-secondary)' }}
                  className="px-4 py-1.5 rounded-lg text-[11px] font-black transition-all border inline-block"
                >
                  {language === 'ar' ? cat.nameAr : (cat as any).nameEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gorgeous Promotional Slider Banner */}
        <div className="relative w-full h-28 sm:h-36 rounded-[22px] overflow-hidden border border-white/5 shadow-lg group shrink-0 select-none">
          <div 
            className="flex h-full transition-all duration-500 ease-out"
            style={{ transform: `translateX(${currentSlide * 100}%)` }}
          >
            {promoSlides.map((slide, idx) => (
              <div 
                key={idx} 
                className={`w-full h-full shrink-0 bg-gradient-to-r ${slide.bg} p-4 sm:p-5 flex flex-col justify-center relative text-white`}
                dir="rtl"
              >
                {/* Badge */}
                <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border border-white/10">
                  {slide.tag}
                </div>
                
                {/* Content */}
                <div className="max-w-[85%] text-right">
                  <h4 className="text-sm sm:text-base font-black mb-1 drop-shadow-sm">{slide.title}</h4>
                  <p className="text-[10px] sm:text-xs text-white/90 font-bold leading-relaxed max-w-xl drop-shadow-sm">{slide.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all border border-white/5"
          >
            <ChevronRight size={14} />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % promoSlides.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all border border-white/5"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-2.5 right-1/2 translate-x-1/2 flex gap-1.5 z-10">
            {promoSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-white w-3' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={`grid gap-2 ${isCompactView ? 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
            {filteredItems.map(item => {
              const count = cart.filter(i => i.id === item.id).reduce((s, i) => s + i.quantity, 0);
              const color = getCategoryColor(item.categoryId);
              return (
                <div
                  key={item.id}
                  onClick={() => handleProductClick(item)}
                  style={{ borderTop: `3px solid ${color}` }}
                  className={`bg-surface rounded-[18px] border border-cardAccent p-3 transition-all relative shadow-sm hover:shadow-md hover:-translate-y-0.5 ${item.available ? 'cursor-pointer' : 'opacity-40 pointer-events-none'}`}
                >
                  {count > 0 && <div style={{ backgroundColor: color }} className="absolute -top-2 -left-1 w-6 h-6 text-white rounded-full flex items-center justify-center font-black text-[9px] z-20 shadow">{count}</div>}
                  <h3 className={`font-black text-textPrimary leading-tight ${isCompactView ? 'text-[9px] line-clamp-1' : 'text-[11px] line-clamp-2'}`}>{language === 'ar' ? item.nameAr : item.nameEn}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <p style={{ color }} className="font-black text-[13px]">{item.basePrice}<span className="text-[8px] text-secondary ml-0.5">{currency}</span></p>
                    <div style={{ backgroundColor: `${color}18`, color }} className="p-1 rounded-md"><Plus size={11} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ───── Right: Cart Sidebar ───── */}
      <div className={`w-full lg:w-[380px] bg-surface border-l border-cardAccent flex flex-col no-print shadow-xl overflow-hidden shrink-0 lg:rounded-none rounded-t-[28px] ${mobileStep === 3 ? 'flex h-full pb-2' : 'hidden lg:flex'}`}>

        {/* Cart Header */}
        <div className="p-3 border-b border-cardAccent flex items-center justify-between bg-background/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black text-[10px] border border-primary/10">#{nextOrderNumber}</div>
            <div>
              <p className="font-black text-textPrimary text-[11px]">فاتورة جديدة</p>
              <p className="text-[8px] text-secondary font-bold flex items-center gap-1"><Clock size={7} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          {/* Hold Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleHold}
              disabled={cart.length === 0}
              title="تعليق الطلب"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-background border border-cardAccent rounded-lg text-secondary hover:text-orange-400 hover:border-orange-400/30 transition-all disabled:opacity-30 text-[10px] font-black"
            >
              <PauseCircle size={13} /> تعليق
            </button>
            <button
              onClick={() => setShowHeldPanel(true)}
              className="relative p-1.5 bg-background border border-cardAccent rounded-lg text-secondary hover:text-primary transition-all"
              title="الطلبات المعلقة"
            >
              <ShoppingBag size={14} />
              {heldOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 text-white rounded-full text-[8px] flex items-center justify-center font-black">{heldOrders.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Order Type */}
        <div className="p-2 bg-background/50 shrink-0">
          <div className="grid grid-cols-2 gap-2 bg-background p-1.5 rounded-[16px] border border-cardAccent">
            <button onClick={() => setOrderType('takeaway')}
              className={`flex items-center justify-center py-3 px-2 rounded-xl transition-all gap-2 ${orderType === 'takeaway' ? 'bg-primary text-background shadow font-black' : 'text-secondary'}`}>
              <ShoppingBag size={18} /><span className="text-sm font-black">تيك أواي</span>
            </button>
            <button onClick={() => setOrderType('customer')}
              className={`flex items-center justify-center py-3 px-2 rounded-xl transition-all gap-2 ${orderType === 'customer' ? 'bg-accentBlue text-background shadow font-black' : 'text-secondary'}`}>
              <User size={18} /><span className="text-sm font-black">عميل</span>
            </button>
          </div>
        </div>

        {/* Customer Selector */}
        {orderType === 'customer' && (
          <div className="px-3 py-2.5 border-b border-cardAccent bg-accentBlue/5 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-secondary uppercase">العميل</span>
              <button onClick={() => { setShowNewCustomerModal(true); setNewCustomerName(''); setNewCustomerPhone(''); }}
                className="text-xs font-black text-accentBlue hover:underline flex items-center gap-1">
                <UserPlus size={14} /> جديد
              </button>
            </div>
            <div className="relative">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                className="w-full h-11 pr-10 pl-3 bg-background border-2 border-cardAccent rounded-xl text-sm font-bold text-textPrimary outline-none focus:border-accentBlue"
                placeholder="ابحث عن عميل..."
                value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); if (!e.target.value) { setSelectedCustomerId(''); setSelectedCustomerName(''); } }}
                onFocus={() => setShowCustomerDropdown(true)}
              />
              {selectedCustomerId && (
                <button onClick={() => { setSelectedCustomerId(''); setSelectedCustomerName(''); setCustomerSearch(''); }} className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary hover:text-red-400">
                  <X size={13} />
                </button>
              )}
            </div>
            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div className="mt-1 bg-background border border-cardAccent rounded-lg overflow-hidden shadow-lg z-50 relative">
                {filteredCustomers.map(c => (
                  <button key={c.id} onClick={() => handleSelectCustomer(c.id, c.name)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-right hover:bg-cardAccent">
                    <User size={14} className="text-accentBlue shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-black text-textPrimary truncate">{c.name}</p>
                      {c.phone && <p className="text-[11px] text-secondary">{c.phone}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedCustomerId && (
              <div className="mt-2 flex items-center gap-1.5 bg-accentBlue/10 rounded-lg px-3 py-2">
                <CheckCircle2 size={14} className="text-accentBlue" />
                <span className="text-xs font-black text-accentBlue">{selectedCustomerName}</span>
              </div>
            )}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-secondary opacity-15">
              <ShoppingBag size={36} />
              <p className="text-[10px] font-black mt-2">السلة فارغة</p>
            </div>
          ) : cart.map((item, idx) => {
            const color = getCategoryColor(item.categoryId);
            return (
              <div key={idx} className="bg-background/40 p-2 rounded-[14px] border border-cardAccent">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-textPrimary text-[10px] truncate leading-tight">{language === 'ar' ? item.nameAr : item.nameEn}</h4>
                    {item.selectedVariant && <p className="text-[8px] font-bold text-accentBlue">({item.selectedVariant.nameAr})</p>}
                    {item.notes && <p className="text-[8px] text-orange-400 italic truncate">{item.notes}</p>}
                  </div>
                  <p style={{ color }} className="text-[11px] font-black shrink-0 mr-1">{(item.totalItemPrice * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setNoteModal({ show: true, index: idx, value: item.notes || '' })} className="p-1 text-secondary hover:text-accentBlue"><MessageSquare size={11} /></button>
                    <button onClick={() => removeFromCart(idx)} className="p-1 text-secondary hover:text-red-400"><Trash2 size={11} /></button>
                  </div>
                  <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded-lg border border-cardAccent">
                    <button onClick={() => updateQuantity(idx, -1)} className="text-secondary hover:text-primary"><Minus size={9} /></button>
                    <span className="text-[10px] font-black text-textPrimary w-3 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(idx, 1)} className="text-secondary hover:text-primary"><Plus size={9} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals & Payment */}
        <div className="p-4 bg-background/80 border-t border-cardAccent space-y-3.5 shrink-0">
          <div className="space-y-0.5">
            <div className="flex justify-between text-secondary text-xs font-bold">
              <span>المجموع</span><span>{subtotal.toFixed(2)} {currency}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-secondary text-xs font-bold">
                <span>الضريبة</span><span>{tax.toFixed(2)} {currency}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black text-textPrimary pt-2 border-t border-cardAccent/30">
              <span className="text-primary">الإجمالي</span>
              <span className="text-primary">{total.toFixed(2)} <span className="text-[9px] opacity-50">{currency}</span></span>
            </div>
          </div>

          {/* Cash received input */}
            <div className="relative">
              <Coins size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-accentGreen" />
            <input
              type="number"
              placeholder="المبلغ المستلم (نقدي)..."
                className="w-full h-11 pr-11 pl-4 bg-background border-2 border-cardAccent rounded-xl text-base font-black text-accentGreen placeholder:text-xs outline-none text-center focus:border-accentGreen"
              value={cashReceived}
              onChange={e => setCashReceived(e.target.value)}
            />
            {cashReceived && receivedNum > total && (
                <div className="text-center text-xs font-black text-accentGreen mt-1.5">
                الباقي: {changeAmount.toFixed(2)} {currency}
              </div>
            )}
          </div>

          {/* Payment Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              disabled={cart.length === 0}
              onClick={() => finalizeOrder('cash')}
              className="flex flex-col items-center justify-center py-2.5 bg-accentGreen text-background rounded-xl font-black text-xs shadow-sm active:scale-95 disabled:opacity-30 gap-1"
            >
              <Banknote size={16} /> نقدي
            </button>
            <button
              disabled={cart.length === 0}
              onClick={() => finalizeOrder('instapay')}
              className="flex flex-col items-center justify-center py-2.5 bg-accentBlue text-background rounded-xl font-black text-xs shadow-sm active:scale-95 disabled:opacity-30 gap-1"
            >
              <Smartphone size={16} /> InstaPay
            </button>
            <button
              disabled={cart.length === 0}
              onClick={() => finalizeOrder('credit')}
              className="flex flex-col items-center justify-center py-2.5 bg-orange-400 text-background rounded-xl font-black text-xs shadow-sm active:scale-95 disabled:opacity-30 gap-1"
            >
              <CreditCard size={16} /> آجل
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Wizard Bottom Bar */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 h-16 bg-surface border-t border-cardAccent flex items-center px-4 justify-between z-[40] no-print shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {mobileStep === 1 && (
          <div className="w-full text-center text-[10px] font-bold text-secondary">
            الخطوة 1 من 3: اختيار نوع الخدمة والعميل
          </div>
        )}
        
        {mobileStep === 2 && (
          <div className="w-full flex items-center justify-between gap-3">
            <button
              onClick={() => setMobileStep(1)}
              className="flex items-center gap-1 px-4 py-2 bg-cardAccent/50 border border-cardAccent rounded-xl text-secondary text-xs font-black"
            >
              <span>نوع الخدمة</span>
            </button>
            <div className="flex-1" />
            <button
              disabled={cart.length === 0}
              onClick={() => setMobileStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background rounded-xl font-black text-xs disabled:opacity-30 shadow-lg"
            >
              <span>مراجعة الطلب والدفع ({cart.reduce((s, i) => s + i.quantity, 0)}) ⬅️</span>
            </button>
          </div>
        )}

        {mobileStep === 3 && (
          <div className="w-full flex items-center justify-between">
            <button
              onClick={() => setMobileStep(2)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-cardAccent border border-cardAccent rounded-xl text-textPrimary text-xs font-black"
            >
              <span>➡️ تعديل الأصناف</span>
            </button>
            <div className="text-[10px] font-black text-secondary">
              الإجمالي: <span className="text-primary text-sm font-black">{total.toFixed(2)} {currency}</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════ MODALS ═══════════════════════════════════ */}

      {/* Product Selection Modal */}
      {selectionModal.show && selectionModal.product && (
        <Modal isOpen onClose={() => setSelectionModal({ show: false })}>
          <Modal.Header title="تخصيص الصنف" subtitle={language === 'ar' ? selectionModal.product.nameAr : selectionModal.product.nameEn} />
          <Modal.Body>
            <div className="space-y-5">
              {selectionModal.product.variants.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-secondary uppercase mb-2 flex items-center gap-1"><Settings2 size={11} /> الحجم / النوع</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectionModal.product.variants.map(v => (
                      <button key={v.id} onClick={() => setSelectedVar(v)}
                        className={`p-3 rounded-xl border-2 text-right transition-all ${selectedVar?.id === v.id ? 'border-primary bg-primary/5 text-textPrimary font-black' : 'border-cardAccent text-secondary'}`}>
                        <p className="text-sm">{v.nameAr}</p>
                        <p className="text-[10px] opacity-60">{v.price} {currency}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {selectionModal.product.addons.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-secondary uppercase mb-2 flex items-center gap-1"><Plus size={11} /> الإضافات</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectionModal.product.addons.map(a => {
                      const isSel = selectedAds.some(i => i.id === a.id);
                      return (
                        <button key={a.id}
                          onClick={() => isSel ? setSelectedAds(selectedAds.filter(i => i.id !== a.id)) : setSelectedAds([...selectedAds, a])}
                          className={`p-3 rounded-xl border-2 text-right transition-all ${isSel ? 'border-accentGreen bg-accentGreen/5 text-textPrimary font-black' : 'border-cardAccent text-secondary'}`}>
                          <p className="text-sm">{a.nameAr}</p>
                          <p className="text-[10px] opacity-60">+{a.price}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth size="lg" onClick={handleConfirmSelection}>تأكيد الإضافة</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Note Modal */}
      {noteModal.show && (
        <Modal isOpen onClose={() => setNoteModal({ show: false, value: '' })}>
          <Modal.Header title="إضافة ملاحظة" />
          <Modal.Body>
            <Input autoFocus placeholder="مثلاً: بدون سكر..." className="h-11 text-sm font-bold"
              value={noteModal.value} onChange={e => setNoteModal({ ...noteModal, value: e.target.value })} />
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth onClick={() => {
              if (noteModal.index !== undefined) updateItemNote(noteModal.index, noteModal.value);
              setNoteModal({ show: false, value: '' });
            }}>حفظ</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Held Orders Panel */}
      {showHeldPanel && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowHeldPanel(false)} />
          <div className="w-[360px] bg-surface border-l border-cardAccent flex flex-col shadow-2xl">
            <div className="p-5 border-b border-cardAccent flex items-center justify-between">
              <div>
                <h3 className="font-black text-textPrimary text-lg">الطلبات المعلقة</h3>
                <p className="text-secondary text-xs font-bold">{heldOrders.length} طلب معلق</p>
              </div>
              <button onClick={() => setShowHeldPanel(false)} className="p-2 text-secondary hover:text-textPrimary rounded-xl bg-background border border-cardAccent">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {heldOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                  <ShoppingBag size={48} />
                  <p className="font-black text-sm mt-3">لا توجد طلبات معلقة</p>
                </div>
              ) : heldOrders.map(held => (
                <div key={held.id} className="bg-background rounded-2xl border border-cardAccent p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {editHeldId === held.id ? (
                        <input
                          autoFocus
                          className="bg-cardAccent border border-primary/30 rounded-lg px-2 py-1 text-xs font-black text-textPrimary outline-none focus:border-primary w-36"
                          value={editHeldLabel}
                          onChange={e => setEditHeldLabel(e.target.value)}
                          onBlur={() => { updateHeldOrder(held.id, { label: editHeldLabel }); setEditHeldId(null); }}
                          onKeyDown={e => { if (e.key === 'Enter') { updateHeldOrder(held.id, { label: editHeldLabel }); setEditHeldId(null); } }}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <p className="font-black text-textPrimary text-sm">{held.label || `طلب #${held.id.slice(-4)}`}</p>
                          <button onClick={() => { setEditHeldId(held.id); setEditHeldLabel(held.label || ''); }}
                            className="p-0.5 text-secondary hover:text-primary">
                            <Pencil size={11} />
                          </button>
                        </div>
                      )}
                      <p className="text-[9px] text-secondary font-bold flex items-center gap-1 mt-0.5">
                        <Clock size={8} /> {new Date(held.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {held.customerName && (
                        <p className="text-[9px] text-accentBlue font-bold flex items-center gap-1 mt-0.5">
                          <User size={8} /> {held.customerName}
                        </p>
                      )}
                    </div>
                    <button onClick={() => deleteHeldOrder(held.id)} className="p-1.5 text-secondary hover:text-red-400 rounded-lg bg-cardAccent">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {/* Items summary */}
                  <div className="space-y-1 mb-3">
                    {held.cart.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-textPrimary truncate">{item.nameAr || item.nameEn}</span>
                        <span className="font-black text-secondary shrink-0 mr-2">×{item.quantity}</span>
                      </div>
                    ))}
                    {held.cart.length > 3 && <p className="text-[9px] text-secondary">+{held.cart.length - 3} أصناف أخرى</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-secondary">
                      {held.cart.reduce((s, i) => s + i.totalItemPrice * i.quantity, 0).toFixed(2)} {currency}
                    </span>
                    <button
                      onClick={() => handleResumeHeld(held.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-background rounded-xl font-black text-[10px] hover:opacity-90"
                    >
                      <Play size={11} /> استئناف وتعديل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <Modal isOpen onClose={() => setShowNewCustomerModal(false)}>
          <Modal.Header title="إضافة عميل جديد" />
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-secondary uppercase block mb-1.5">اسم العميل *</label>
                <input autoFocus className="w-full h-11 px-3 bg-background border-2 border-cardAccent rounded-xl text-sm text-textPrimary font-bold outline-none focus:border-primary"
                  placeholder="اسم العميل..." value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-black text-secondary uppercase block mb-1.5">رقم الهاتف</label>
                <input className="w-full h-11 px-3 bg-background border-2 border-cardAccent rounded-xl text-sm text-textPrimary font-bold outline-none focus:border-primary"
                  placeholder="05xxxxxxxx" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth onClick={handleCreateCustomer}><UserPlus size={15} /> إضافة وتحديد</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Success Modal */}
      {showSuccessModal && lastOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 no-print text-center">
          <div className="bg-surface rounded-[36px] border border-white/10 w-full max-w-xs shadow-2xl p-8">
            <div className="w-14 h-14 bg-accentGreen/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accentGreen/20">
              <CheckCircle2 size={32} className="text-accentGreen" />
            </div>
            <h3 className="text-xl font-black text-textPrimary mb-1">تم بنجاح!</h3>
            <p className="text-secondary font-bold text-xs mb-1">فاتورة: <span className="text-primary font-black">#{lastOrder.id}</span></p>
            {lastOrder.customerName && (
              <p className="text-accentBlue font-bold text-xs mb-1 flex items-center justify-center gap-1">
                <User size={10} /> {lastOrder.customerName}
              </p>
            )}
            <p className="text-primary font-black text-2xl mb-6">{lastOrder.total.toFixed(2)} {currency}</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handlePrintOrder(lastOrder, 'thermal')}
                className="flex flex-col items-center justify-center py-3 bg-primary text-background rounded-2xl font-black text-[10px] gap-1">
                <Printer size={16} /> حراري
              </button>
              <button onClick={() => handlePrintOrder(lastOrder, 'a4')}
                className="flex flex-col items-center justify-center py-3 bg-accentBlue text-background rounded-2xl font-black text-[10px] gap-1">
                <FileText size={16} /> A4
              </button>
              <button onClick={resetPOS}
                className="flex flex-col items-center justify-center py-3 bg-cardAccent text-textPrimary rounded-2xl font-black text-[10px] gap-1 border border-cardAccent">
                <Plus size={16} /> جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Modal */}
      {showShiftModal && (
        <Modal isOpen onClose={() => { if (activeShift) setShowShiftModal(false); }}>
          <Modal.Header title="بدء الوردية" />
          <Modal.Body>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-secondary uppercase block">عهدة البداية</label>
              <input type="number" autoFocus className="w-full h-12 px-3 bg-background border-2 border-cardAccent rounded-xl text-textPrimary font-black text-2xl text-center outline-none"
                value={shiftStartBalance || ''} onChange={e => setShiftStartBalance(Number(e.target.value))} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth onClick={handleOpenShift}>تأكيد البدء</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Receipt Template (hidden for print) */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white text-black">
        {lastOrder && <ReceiptTemplate order={lastOrder} settings={settings} currency={currency} language={language} t={t} />}
      </div>
    </div>
  );
};

export default POS;
