
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Purchase, PurchaseItem } from '../types';
import { Plus, Trash2, Truck, XCircle, ShoppingBag, Warehouse as WarehouseIcon, Printer, Eye, FileDown } from 'lucide-react';
import { printPurchaseInvoice } from '../utils/printService';

const Purchases: React.FC = () => {
  const { purchases, addPurchase, deletePurchase, inventory, settings, suppliers, warehouses } = useData();
  const { t, language } = useLanguage();
  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [cost, setCost] = useState(0);

  const handleAddItem = () => {
    if (!selectedInventoryId || quantity <= 0 || cost <= 0) return;
    const invItem = inventory.find(i => i.id === selectedInventoryId);
    if (!invItem) return;
    const newItem: PurchaseItem = { inventoryItemId: selectedInventoryId, itemName: language === 'ar' ? invItem.nameAr : invItem.nameEn, quantity: Number(quantity), cost: Number(cost), total: Number(quantity) * Number(cost) };
    setPurchaseItems(prev => [...prev, newItem]);
    setSelectedInventoryId(''); setQuantity(0); setCost(0);
  };

  // طباعة فاتورة شراء
  const handlePrintPurchase = (purchase: Purchase) => {
    printPurchaseInvoice({
      invoiceNumber: purchase.invoiceNumber || purchase.id.slice(-8),
      date: purchase.date,
      supplierName: purchase.supplierName || 'غير محدد',
      items: purchase.items.map(item => ({
        name: item.itemName,
        quantity: item.quantity,
        price: item.cost,
        total: item.total
      })),
      totalAmount: purchase.totalAmount,
      paymentMethod: purchase.paymentMethod,
      currency,
      settings,
      notes: purchase.notes
    });
  };

  return (
    <div className="space-y-8 pb-12 font-cairo">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white">{t('purchases')}</h2>
          <p className="text-secondary text-xs mt-1 font-bold">توثيق فواتير المشتريات وتوريد المخزون</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-8 py-3.5 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
          <Plus size={20} /> {t('addPurchase')}
        </button>
      </div>

      <div className="bg-surface rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-[10px] text-secondary uppercase bg-background/50 border-b border-white/5">
              <tr>
                <th className="px-8 py-6 font-black tracking-widest">{t('date')}</th>
                <th className="px-8 py-6 font-black tracking-widest">{t('supplier')}</th>
                <th className="px-8 py-6 font-black tracking-widest">{t('invoiceNum')}</th>
                <th className="px-8 py-6 font-black tracking-widest text-left">{t('total')}</th>
                <th className="px-8 py-6 font-black tracking-widest text-left">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {purchases.map(p => (
                <tr key={p.id} className="hover:bg-background/40 transition-colors group">
                  <td className="px-8 py-6 font-bold text-white">{p.date}</td>
                  <td className="px-8 py-6 font-bold text-secondary">{p.supplierName}</td>
                  <td className="px-8 py-6 font-bold text-secondary">{p.invoiceNumber || '-'}</td>
                  <td className="px-8 py-6 text-left font-black text-accentGreen">{p.totalAmount.toLocaleString()} {currency}</td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handlePrintPurchase(p)} className="p-3 bg-background border border-white/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-all" title="طباعة">
                        <Printer size={16} />
                      </button>
                      <button onClick={() => deletePurchase(p.id)} className="p-3 bg-background border border-white/5 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="حذف">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
          <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-2xl shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white">{t('addPurchase')}</h3>
              <button onClick={() => setShowModal(false)} className="text-secondary hover:text-white transition-colors"><XCircle size={32} /></button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">{t('supplier')}</label>
                  <select className="w-full p-4 bg-background border border-white/5 rounded-2xl text-white font-bold" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                    <option value="">اختر مورد</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">{t('invoiceNum')}</label>
                  <input className="w-full p-4 bg-background border border-white/5 rounded-2xl text-white font-bold" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                </div>
              </div>

              <div className="bg-background rounded-3xl p-6 border border-white/5 space-y-4">
                <h4 className="text-xs font-black text-primary uppercase">إضافة صنف للفاتورة</h4>
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full p-3 bg-surface border border-white/5 rounded-xl text-xs font-bold text-white" value={selectedInventoryId} onChange={e => setSelectedInventoryId(e.target.value)}>
                    <option value="">اختر الصنف</option>
                    {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.nameAr}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input type="number" placeholder="الكمية" className="w-full p-3 bg-surface border border-white/5 rounded-xl text-xs font-bold text-white" value={quantity || ''} onChange={e => setQuantity(Number(e.target.value))} />
                    <input type="number" placeholder="السعر" className="w-full p-3 bg-surface border border-white/5 rounded-xl text-xs font-bold text-white" value={cost || ''} onChange={e => setCost(Number(e.target.value))} />
                  </div>
                </div>
                <button onClick={handleAddItem} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black transition-all">إضافة للفاتورة</button>
              </div>

              <div className="space-y-2">
                {purchaseItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-background rounded-2xl border border-white/5">
                    <div>
                      <p className="text-sm font-black text-white">{item.itemName}</p>
                      <p className="text-[10px] text-secondary">{item.quantity} وحدة × {item.cost}</p>
                    </div>
                    <p className="font-black text-primary">{item.total} {currency}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => { addPurchase({ id: Date.now().toString(), supplierId, supplierName: suppliers.find(s => s.id === supplierId)?.name, warehouseId, invoiceNumber, date: new Date().toISOString().split('T')[0], items: purchaseItems, totalAmount: purchaseItems.reduce((s, i) => s + i.total, 0), paymentMethod }); setShowModal(false); }} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all mt-4">حفظ الفاتورة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
