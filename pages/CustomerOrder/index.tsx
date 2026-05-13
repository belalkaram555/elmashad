import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Input, Badge, EmptyState } from '../../components/ui/Atoms';
import { Modal } from '../../components/ui/Modal';
import { MenuItem, CartItem, ProductVariant, ProductAddon, CustomerOrder } from '../../types';
import { api } from '../../services/api';
import {
  ShoppingBag, CheckCircle2, AlertCircle, Plus, Minus,
  Trash2, Search, ArrowRight, User, Phone, MapPin,
  Clock, Coffee, RefreshCw, X, ChevronDown
} from 'lucide-react';

export const CustomerOrderPage: React.FC = () => {
  const { menuItems, categories, settings, tables } = useData();
  const { language } = useLanguage();

  // Session & Customer State
  const [sessionToken, setSessionToken] = useState<string>(() => {
    return localStorage.getItem('customer_order_session') || '';
  });
  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem('customer_order_name') || '';
  });
  const [customerPhone, setCustomerPhone] = useState<string>(() => {
    return localStorage.getItem('customer_order_phone') || '';
  });
  const [tableNumber, setTableNumber] = useState<string>(() => {
    const hashParts = window.location.hash.split('?');
    if (hashParts.length > 1) {
      const params = new URLSearchParams(hashParts[1]);
      const tableParam = params.get('table');
      if (tableParam) return tableParam;
    }
    return localStorage.getItem('customer_order_table') || '';
  });

  const [activeOrder, setActiveOrder] = useState<CustomerOrder | null>(null);
  const [step, setStep] = useState<'info' | 'menu' | 'status'>('info');

  // Menu & Cart State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'status'>('menu');

  // Modals & UI status
  const [selectionModal, setSelectionModal] = useState<{ show: boolean; product?: MenuItem }>({ show: false });
  const [selectedVar, setSelectedVar] = useState<ProductVariant | null>(null);
  const [selectedAds, setSelectedAds] = useState<ProductAddon[]>([]);
  const [itemNote, setItemNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

  // Poll for existing session order
  useEffect(() => {
    if (!sessionToken) return;

    const checkSession = async () => {
      try {
        const order = await api.customerOrders.getBySession(sessionToken);
        if (order) {
          setActiveOrder(order);
          // If order is active/pending, load cart items into cart state so they can add more
          setCart(order.items);
          setStep('status');
          setActiveTab('status');
        } else {
          // No active order found for session
          if (step === 'status') {
            setStep('menu');
            setActiveTab('menu');
          }
        }
      } catch (err) {
        console.error('Error polling customer order:', err);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 4000);
    return () => clearInterval(interval);
  }, [sessionToken]);

  // Handle Starting Info Form
  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage(language === 'ar' ? 'الرجاء إدخال الاسم' : 'Please enter your name');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage(language === 'ar' ? 'الرجاء إدخال رقم الهاتف' : 'Please enter your phone number');
      return;
    }
    if (!tableNumber.trim()) {
      setErrorMessage(language === 'ar' ? 'الرجاء اختيار الطاولة' : 'Please select a table');
      return;
    }

    setErrorMessage('');
    const token = sessionToken || Math.random().toString(36).substring(2, 15);
    setSessionToken(token);

    localStorage.setItem('customer_order_session', token);
    localStorage.setItem('customer_order_name', customerName);
    localStorage.setItem('customer_order_phone', customerPhone);
    localStorage.setItem('customer_order_table', tableNumber);

    setStep('menu');
    setActiveTab('menu');
  };

  // Filter Menu Items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (!item.available) return false;
      const matchesCat = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
      const matchesQuery = !searchQuery || 
        item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [menuItems, selectedCategoryId, searchQuery]);

  // Open Selection Modal
  const handleOpenSelection = (product: MenuItem) => {
    setSelectedVar(product.variants && product.variants.length > 0 ? product.variants[0] : null);
    setSelectedAds([]);
    setItemNote('');
    setSelectionModal({ show: true, product });
  };

  // Add Item to Cart (Fixed Strict Mode quantity mutation bug)
  const handleAddToCart = () => {
    if (!selectionModal.product) return;
    const p = selectionModal.product;
    const base = selectedVar ? selectedVar.price : p.basePrice;
    const adsTotal = selectedAds.reduce((sum, a) => sum + a.price, 0);
    const itemTotal = base + adsTotal;

    const cartItem: CartItem = {
      ...p,
      quantity: 1,
      selectedVariant: selectedVar || undefined,
      selectedAddons: selectedAds,
      notes: itemNote,
      totalItemPrice: itemTotal
    };

    setCart(prev => {
      const existingIdx = prev.findIndex(item => 
        item.id === cartItem.id &&
        item.selectedVariant?.id === cartItem.selectedVariant?.id &&
        JSON.stringify(item.selectedAddons) === JSON.stringify(cartItem.selectedAddons) &&
        item.notes === cartItem.notes
      );

      if (existingIdx > -1) {
        const next = [...prev];
        const updatedItem = { ...next[existingIdx] };
        updatedItem.quantity = updatedItem.quantity + 1;
        updatedItem.totalItemPrice = updatedItem.quantity * itemTotal;
        next[existingIdx] = updatedItem;
        return next;
      }
      return [...prev, cartItem];
    });

    setSelectionModal({ show: false });
    setSuccessMessage(language === 'ar' ? 'تم إضافة الصنف للسلة' : 'Item added to cart');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // Quantity adjustments (Fixed Strict Mode quantity mutation bug)
  const updateCartQty = (index: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      const currentItem = next[index];
      const newQty = currentItem.quantity + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        const unitPrice = currentItem.totalItemPrice / currentItem.quantity;
        next[index] = {
          ...currentItem,
          quantity: newQty,
          totalItemPrice: newQty * unitPrice
        };
      }
      return next;
    });
  };

  // Calculations (Tax disabled/removed)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalItemPrice, 0);
  const cartTax = 0; // Tax cancelled
  const cartTotal = cartSubtotal + cartTax;

  // Submit / Update Order
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setIsLoading(true);
    setErrorMessage('');

    const payload = {
      customerName,
      customerPhone,
      tableNumber,
      items: cart,
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      sessionToken
    };

    try {
      if (activeOrder && (activeOrder.status === 'pending' || activeOrder.status === 'accepted')) {
        const updated = await api.customerOrders.update(activeOrder.id, payload);
        setActiveOrder(updated);
      } else {
        const created = await api.customerOrders.create(payload);
        setActiveOrder(created);
      }
      setStep('status');
      setActiveTab('status');
    } catch (err: any) {
      setErrorMessage(err.message || (language === 'ar' ? 'حدث خطأ أثناء إرسال الطلب' : 'Failed to submit order'));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Session
  const handleNewOrder = () => {
    localStorage.removeItem('customer_order_session');
    setSessionToken('');
    setActiveOrder(null);
    setCart([]);
    setStep('info');
  };

  return (
    <div className="w-full min-h-screen bg-background text-textPrimary flex flex-col font-sans select-none overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <header className="bg-surface border-b border-cardAccent p-4 sticky top-0 z-40 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black">
            <Coffee size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-textPrimary">
              {language === 'ar' ? settings.restaurantNameAr : settings.restaurantNameEn}
            </h1>
            <p className="text-[10px] font-bold text-secondary">
              {language === 'ar' ? 'خدمة الطلب من الطاولة' : 'Table Ordering Service'}
            </p>
          </div>
        </div>

        {step !== 'info' && (
          <div className="flex items-center gap-2">
            <Badge variant="primary">
              {language === 'ar' ? `طاولة ${tableNumber}` : `Table ${tableNumber}`}
            </Badge>
            <button 
              onClick={() => setStep('info')}
              className="text-secondary hover:text-primary p-1.5 rounded-lg transition-all"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}
      </header>

      {errorMessage && (
        <div className="m-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in shrink-0">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="m-4 p-4 bg-accentGreen/10 border border-accentGreen/20 text-accentGreen rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in shrink-0">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* STEP 1: INFO FORM */}
      {step === 'info' && (
        <main className="flex-1 flex items-center justify-center p-4 py-8 overflow-y-auto">
          <div className="w-full max-w-md bg-surface border border-cardAccent rounded-[32px] p-6 shadow-xl animate-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black mb-2">
                {language === 'ar' ? 'أهلاً بك في مقهانا' : 'Welcome to our Cafe'}
              </h2>
              <p className="text-xs text-secondary font-bold">
                {language === 'ar' ? 'أدخل تفاصيلك واختَر الطاولة لبدء تصفح المنيو والطلب' : 'Enter details and select table to browse menu and order'}
              </p>
            </div>

            <form onSubmit={handleStartSession} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-secondary mb-2 flex items-center gap-1.5">
                  <User size={14} className="text-primary" />
                  <span>{language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</span>
                </label>
                <Input 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder={language === 'ar' ? 'محمد أحمد' : 'John Doe'}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-secondary mb-2 flex items-center gap-1.5">
                  <Phone size={14} className="text-primary" />
                  <span>{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</span>
                </label>
                <Input 
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-secondary mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  <span>{language === 'ar' ? 'اختر الطاولة التي تجلس عليها' : 'Select Your Table'}</span>
                </label>
                <div className="relative">
                  <select 
                    value={tableNumber}
                    onChange={e => setTableNumber(e.target.value)}
                    required
                    className="w-full h-12 px-4 pr-10 bg-background border-2 border-cardAccent rounded-xl text-sm font-bold text-textPrimary outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="">{language === 'ar' ? '-- اختر الطاولة --' : '-- Select Table --'}</option>
                    {tables.map(table => (
                      <option key={table.id} value={table.name}>
                        {table.name} {language === 'ar' ? `(${table.capacity} مقاعد)` : `(${table.capacity} seats)`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" className="mt-8 shadow-xl shadow-primary/20">
                <span>{language === 'ar' ? 'عرض المنيو والطلب' : 'View Menu & Order'}</span>
                <ArrowRight size={18} className={language === 'ar' ? 'rotate-180' : ''} />
              </Button>
            </form>
          </div>
        </main>
      )}

      {/* STEP 2: MENU & CART & STATUS */}
      {step !== 'info' && (
        <div className="flex-1 flex flex-col pb-28 overflow-y-auto">
          {/* Navigation Tabs */}
          <div className="flex border-b border-cardAccent bg-surface px-4 gap-2 shrink-0 sticky top-[73px] z-30 shadow-sm">
            <button 
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-4 text-xs font-black border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'menu' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-textPrimary'}`}
            >
              <Coffee size={16} />
              <span>{language === 'ar' ? 'المنيو' : 'Menu'}</span>
            </button>

            <button 
              onClick={() => setActiveTab('cart')}
              className={`flex-1 py-4 text-xs font-black border-b-2 transition-all flex items-center justify-center gap-2 relative ${activeTab === 'cart' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-textPrimary'}`}
            >
              <ShoppingBag size={16} />
              <span>{language === 'ar' ? 'سلة الطلبات' : 'Cart'}</span>
              {cart.length > 0 && (
                <span className="absolute top-2 right-4 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-black animate-pulse">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>

            {activeOrder && (
              <button 
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-4 text-xs font-black border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'status' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-textPrimary'}`}
              >
                <Clock size={16} />
                <span>{language === 'ar' ? 'حالة الطلب' : 'Order Status'}</span>
                <span className={`w-2 h-2 rounded-full ${activeOrder.status === 'pending' ? 'bg-amber-500 animate-ping' : activeOrder.status === 'accepted' ? 'bg-accentGreen animate-pulse' : 'bg-gray-500'}`} />
              </button>
            )}
          </div>

          {/* TAB: MENU */}
          {activeTab === 'menu' && (
            <div className="p-4 space-y-4 flex-1 flex flex-col animate-in fade-in duration-300">
              {/* Search */}
              <div className="relative shrink-0">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                <Input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث عن صنف...' : 'Search items...'}
                  className="pr-12"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategoryId === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface text-secondary border border-cardAccent hover:text-textPrimary'}`}
                >
                  {language === 'ar' ? 'الكل' : 'All'}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategoryId === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface text-secondary border border-cardAccent hover:text-textPrimary'}`}
                  >
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {filteredItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleOpenSelection(item)}
                    className="bg-surface border border-cardAccent rounded-[24px] overflow-hidden flex flex-col cursor-pointer active:scale-95 transition-all group hover:border-primary/50 shadow-sm"
                  >
                    <div className="h-32 bg-cardAccent/50 relative overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                      ) : (
                        <Coffee size={36} className="text-secondary/40" />
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="px-2.5 py-1 bg-surface/90 backdrop-blur text-primary font-black text-[10px] rounded-xl border border-cardAccent shadow-sm">
                          {item.basePrice} {currency}
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <h3 className="font-black text-xs text-textPrimary line-clamp-2 mb-2">
                        {language === 'ar' ? item.nameAr : item.nameEn}
                      </h3>
                      <Button size="sm" fullWidth className="py-2 mt-1">
                        <Plus size={14} className="mr-1" />
                        <span>{language === 'ar' ? 'إضافة' : 'Add'}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <EmptyState 
                  icon={Coffee}
                  title={language === 'ar' ? 'لا يوجد أصناف' : 'No items found'}
                  description={language === 'ar' ? 'لم يتم العثور على أصناف تطابق بحثك' : 'No items match your criteria'}
                />
              )}
            </div>
          )}

          {/* TAB: CART */}
          {activeTab === 'cart' && (
            <div className="p-4 space-y-4 flex-1 flex flex-col animate-in fade-in duration-300">
              <h2 className="text-lg font-black">{language === 'ar' ? 'سلة الطلبات' : 'Your Cart'}</h2>

              {cart.length === 0 ? (
                <EmptyState 
                  icon={ShoppingBag}
                  title={language === 'ar' ? 'السلة فارغة' : 'Cart is empty'}
                  description={language === 'ar' ? 'قم بإضافة أصناف من المنيو لإرسال طلبك' : 'Add items from menu to order'}
                  actionLabel={language === 'ar' ? 'تصفح المنيو' : 'Browse Menu'}
                  onAction={() => setActiveTab('menu')}
                />
              ) : (
                <div className="space-y-3 flex-1">
                  {cart.map((item, index) => (
                    <div key={index} className="bg-surface border border-cardAccent rounded-[24px] p-4 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xs text-textPrimary truncate">
                          {language === 'ar' ? item.nameAr : item.nameEn}
                        </h4>
                        {item.selectedVariant && (
                          <p className="text-[10px] text-primary font-bold mt-0.5">
                            {language === 'ar' ? item.selectedVariant.nameAr : item.selectedVariant.nameEn}
                          </p>
                        )}
                        {item.selectedAddons.length > 0 && (
                          <p className="text-[10px] text-secondary font-bold mt-0.5 truncate">
                            {item.selectedAddons.map(a => (language === 'ar' ? a.nameAr : a.nameEn)).join(' + ')}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-[10px] text-amber-500 font-bold mt-1 italic">
                            "{item.notes}"
                          </p>
                        )}
                        <p className="text-xs font-black text-textPrimary mt-1.5">
                          {item.totalItemPrice} {currency}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-background border border-cardAccent rounded-2xl p-1 shrink-0">
                        <button 
                          onClick={() => updateCartQty(index, -1)}
                          className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center text-textPrimary active:scale-95 transition-all hover:bg-red-500/10 hover:text-red-500"
                        >
                          {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                        </button>
                        <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQty(index, 1)}
                          className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center text-textPrimary active:scale-95 transition-all hover:bg-primary/10 hover:text-primary"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Summary (Without Tax) */}
                  <div className="bg-surface border border-cardAccent rounded-[24px] p-4 space-y-2 mt-6">
                    <div className="flex justify-between text-xs text-secondary font-bold">
                      <span>{language === 'ar' ? 'المجموع' : 'Subtotal'}</span>
                      <span>{cartSubtotal.toFixed(2)} {currency}</span>
                    </div>
                    <div className="h-px bg-cardAccent my-2" />
                    <div className="flex justify-between text-sm font-black text-textPrimary">
                      <span>{language === 'ar' ? 'الإجمالي المطلوب' : 'Total'}</span>
                      <span className="text-primary">{cartTotal.toFixed(2)} {currency}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmitOrder} 
                    disabled={isLoading}
                    fullWidth 
                    size="lg" 
                    className="mt-6 shadow-xl shadow-primary/20"
                  >
                    {isLoading ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <span>
                        {activeOrder && (activeOrder.status === 'pending' || activeOrder.status === 'accepted')
                          ? (language === 'ar' ? 'تحديث الطلب عند الكاشير' : 'Update Order')
                          : (language === 'ar' ? 'إرسال الطلب للكاشير' : 'Submit Order')}
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB: STATUS */}
          {activeTab === 'status' && activeOrder && (
            <div className="p-4 space-y-6 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300 py-12">
              <div className="w-24 h-24 rounded-[32px] bg-surface border border-cardAccent flex items-center justify-center shadow-lg">
                {activeOrder.status === 'pending' && (
                  <Clock size={44} className="text-amber-500 animate-spin duration-3000" />
                )}
                {activeOrder.status === 'accepted' && (
                  <Coffee size={44} className="text-accentGreen animate-bounce" />
                )}
                {activeOrder.status === 'completed' && (
                  <CheckCircle2 size={44} className="text-primary animate-in zoom-in" />
                )}
                {activeOrder.status === 'rejected' && (
                  <X size={44} className="text-red-500 animate-in zoom-in" />
                )}
              </div>

              <div className="space-y-2 max-w-sm">
                <h3 className="text-xl font-black">
                  {activeOrder.status === 'pending' && (language === 'ar' ? 'جاري مراجعة طلبك' : 'Pending Review')}
                  {activeOrder.status === 'accepted' && (language === 'ar' ? 'تم قبول الطلب وجاري تحضيره' : 'Accepted & Preparing')}
                  {activeOrder.status === 'completed' && (language === 'ar' ? 'تم اكتمال الفاتورة، شكراً لك!' : 'Order Completed, Thank You!')}
                  {activeOrder.status === 'rejected' && (language === 'ar' ? 'عذراً، تم رفض الطلب' : 'Order Rejected')}
                </h3>
                <p className="text-xs text-secondary font-bold leading-relaxed">
                  {activeOrder.status === 'pending' && (language === 'ar' ? 'طلبك الآن يظهر على شاشة الكاشير للموافقة عليه. يمكنك الاستمرار في إضافة أصناف وتحديث الطلب.' : 'Your order is on cashier screen. You can add more items.')}
                  {activeOrder.status === 'accepted' && (language === 'ar' ? 'الكاشير وافق على طلبك وجاري إعداده بكل حب! يمكنك طلب المزيد بالضغط على المنيو.' : 'Cashier approved your order! Preparing now.')}
                  {activeOrder.status === 'completed' && (language === 'ar' ? 'تم تحويل طلبك لفاتورة مدفوعة ومغلقة في نظام الكاشير.' : 'Order closed and finalized in POS.')}
                  {activeOrder.status === 'rejected' && (language === 'ar' ? 'يرجى مراجعة الكاشير لمزيد من التفاصيل.' : 'Please consult cashier for details.')}
                </p>
              </div>

              <div className="w-full max-w-md bg-surface border border-cardAccent rounded-[24px] p-4 text-left space-y-2">
                <div className="flex justify-between text-xs font-bold text-secondary">
                  <span>{language === 'ar' ? 'رقم الطلب المؤقت:' : 'Order ID:'}</span>
                  <span className="text-textPrimary font-black">{activeOrder.id.split('-')[0]}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-secondary">
                  <span>{language === 'ar' ? 'العميل:' : 'Customer:'}</span>
                  <span className="text-textPrimary font-black">{activeOrder.customerName}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-secondary">
                  <span>{language === 'ar' ? 'الطاولة:' : 'Table:'}</span>
                  <span className="text-textPrimary font-black">{activeOrder.tableNumber}</span>
                </div>
                <div className="h-px bg-cardAccent my-2" />
                <div className="flex justify-between text-sm font-black text-textPrimary">
                  <span>{language === 'ar' ? 'إجمالي الحساب:' : 'Total Amount:'}</span>
                  <span className="text-primary">{activeOrder.total} {currency}</span>
                </div>
              </div>

              {(activeOrder.status === 'completed' || activeOrder.status === 'rejected') ? (
                <Button onClick={handleNewOrder} size="lg" className="px-10">
                  <span>{language === 'ar' ? 'بدء طلب جديد' : 'Start New Order'}</span>
                </Button>
              ) : (
                <Button onClick={() => setActiveTab('menu')} variant="secondary" size="lg" className="px-10">
                  <Plus size={18} className="mr-2" />
                  <span>{language === 'ar' ? 'إضافة المزيد من الأصناف' : 'Add More Items'}</span>
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* FIXED BOTTOM FLOATING CART BAR */}
      {step !== 'info' && activeTab !== 'cart' && cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-surface/90 backdrop-blur-md border-t border-cardAccent flex items-center justify-between z-40 shadow-xl animate-in slide-in-from-bottom">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </div>
            <div>
              <p className="text-xs font-black text-textPrimary">{cartTotal.toFixed(2)} {currency}</p>
              <p className="text-[10px] font-bold text-secondary">{language === 'ar' ? 'الإجمالي المطلوب' : 'Total Amount'}</p>
            </div>
          </div>

          <Button onClick={() => setActiveTab('cart')} className="px-8 shadow-lg shadow-primary/20">
            <span>{language === 'ar' ? 'عرض السلة' : 'View Cart'}</span>
            <ArrowRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
          </Button>
        </div>
      )}

      {/* SELECTION MODAL (VARIANTS / ADDONS) */}
      <Modal 
        isOpen={selectionModal.show} 
        onClose={() => setSelectionModal({ show: false })}
        title={selectionModal.product ? (language === 'ar' ? selectionModal.product.nameAr : selectionModal.product.nameEn) : ''}
      >
        {selectionModal.product && (
          <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-1">
            {/* Variants */}
            {selectionModal.product.variants && selectionModal.product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-black text-secondary">
                  {language === 'ar' ? 'اختر الحجم / النوع' : 'Select Size / Variant'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectionModal.product.variants.map(varItem => (
                    <button
                      key={varItem.id}
                      onClick={() => setSelectedVar(varItem)}
                      className={`p-4 rounded-2xl border text-xs font-black flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${selectedVar?.id === varItem.id ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-surface border-cardAccent text-textPrimary hover:border-primary/50'}`}
                    >
                      <span>{language === 'ar' ? varItem.nameAr : varItem.nameEn}</span>
                      <span className="text-[10px] font-bold opacity-80">{varItem.price} {currency}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {selectionModal.product.addons && selectionModal.product.addons.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-black text-secondary">
                  {language === 'ar' ? 'الإضافات الاختيارية' : 'Optional Addons'}
                </label>
                <div className="space-y-2">
                  {selectionModal.product.addons.map(add => {
                    const isSel = selectedAds.some(a => a.id === add.id);
                    return (
                      <button
                        key={add.id}
                        onClick={() => {
                          setSelectedAds(prev => 
                            isSel ? prev.filter(a => a.id !== add.id) : [...prev, add]
                          );
                        }}
                        className={`w-full p-3.5 rounded-2xl border text-xs font-black flex items-center justify-between transition-all active:scale-95 ${isSel ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-surface border-cardAccent text-textPrimary hover:border-primary/50'}`}
                      >
                        <span>{language === 'ar' ? add.nameAr : add.nameEn}</span>
                        <span>+{add.price} {currency}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Note */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-secondary">
                {language === 'ar' ? 'ملاحظات خاصة' : 'Special Notes'}
              </label>
              <Input 
                value={itemNote}
                onChange={e => setItemNote(e.target.value)}
                placeholder={language === 'ar' ? 'بدون سكر، حليب خالي الدسم...' : 'No sugar, skimmed milk...'}
              />
            </div>

            <Button onClick={handleAddToCart} fullWidth size="lg" className="mt-4 shadow-xl shadow-primary/20">
              <span>{language === 'ar' ? 'تأكيد وإضافة للسلة' : 'Confirm & Add'}</span>
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
