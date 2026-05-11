import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToastStore } from '../../store/toastStore';
import { GamingDevice, GamingSession } from '../../types';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  CircleDot, Plus, Play, Square, Clock,
  Trash2, CheckCircle2, User, CreditCard, Banknote, Edit3, History
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Atoms';
import { api, isOnline } from '../../services/api';
import { idbPut, idbDelete } from '../../services/offlineDB';
import { queueOperation } from '../../services/syncService';


const GAMING_EDITS_KEY = 'elmashad-gaming-invoice-edits';

interface GamingEditLog {
  id: string;
  sessionId: string;
  deviceName: string;
  deviceType: string;
  editedBy: string;
  editedByRole: string;
  editedAt: string;
  changesSummary: string;
}

const readGamingEdits = (): GamingEditLog[] => {
  try {
    const raw = localStorage.getItem(GAMING_EDITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeGamingEdits = (logs: GamingEditLog[]) => {
  localStorage.setItem(GAMING_EDITS_KEY, JSON.stringify(logs.slice(0, 500)));
};

const Billiard: React.FC = () => {
  const { customers, settings, orders, gamingDevices, setGamingDevices, gamingSessions, setGamingSessions, addOrder, updateOrder, deleteOrder } = useData();
  const { user, userRole } = useAuth();
  const { language } = useLanguage();
  const { addToast } = useToastStore();
  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

  const devices = gamingDevices.filter(d => d.type === 'billiard');
  const sessions = gamingSessions.filter(s => s.deviceType === 'billiard');

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editDevice, setEditDevice] = useState<GamingDevice | null>(null);
  const [deviceForm, setDeviceForm] = useState({ name: '', hourlyRate: 30 });

  const [showStartModal, setShowStartModal] = useState(false);
  const [startDevice, setStartDevice] = useState<GamingDevice | null>(null);
  const [startCustomerId, setStartCustomerId] = useState('');
  const [startCustomerName, setStartCustomerName] = useState('');
  const [startNotes, setStartNotes] = useState('');

  const [showEndModal, setShowEndModal] = useState(false);
  const [endSession, setEndSession] = useState<GamingSession | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [editInvoiceSession, setEditInvoiceSession] = useState<GamingSession | null>(null);
  const [editInvoiceAmount, setEditInvoiceAmount] = useState('');
  const [editInvoiceDuration, setEditInvoiceDuration] = useState('');
  const [showEditsModal, setShowEditsModal] = useState(false);
  const [gamingEditLogs, setGamingEditLogs] = useState<GamingEditLog[]>(() => readGamingEdits());

  const visibleGamingEditLogs = React.useMemo(() => {
    const logs = gamingEditLogs.filter(log => log.deviceType === 'billiard');
    if (userRole === 'cashier') {
      return logs.filter(log => log.editedBy === (user || ''));
    }
    return logs;
  }, [gamingEditLogs, userRole, user]);

  const getActiveSession = (deviceId: string) =>
    sessions.find(s => s.deviceId === deviceId && s.status === 'active');

  const getElapsedSeconds = (startTime: string) =>
    Math.max(0, Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));

  const getElapsedMinutes = (startTime: string) =>
    Math.max(1, Math.ceil(getElapsedSeconds(startTime) / 60));

  const calcAmount = (seconds: number, rate: number) => (seconds / 3600) * rate;

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} دقيقة`;
    return `${h} س ${m} د`;
  };

  const syncDevice = async (op: 'create' | 'update' | 'delete', device: GamingDevice) => {
    if (op === 'delete') {
      await idbDelete('gamingDevices', device.id);
    } else {
      await idbPut('gamingDevices', device);
    }
    if (isOnline()) {
      try {
        if (op === 'create') await api.gaming.createDevice(device);
        else if (op === 'update') await api.gaming.updateDevice(device);
        else await api.gaming.removeDevice(device.id);
      } catch { await queueOperation('gamingDevices', op, device); }
    } else {
      await queueOperation('gamingDevices', op, device);
    }
  };

  const syncSession = async (op: 'create' | 'update', session: GamingSession) => {
    await idbPut('gamingSessions', session);
    if (isOnline()) {
      try {
        if (op === 'create') await api.gaming.createSession(session);
        else await api.gaming.updateSession(session);
      } catch { await queueOperation('gamingSessions', op, session); }
    } else {
      await queueOperation('gamingSessions', op, session);
    }
  };

  const handleOpenDeviceModal = (device?: GamingDevice) => {
    if (device) {
      setEditDevice(device);
      setDeviceForm({ name: device.name, hourlyRate: device.hourlyRate });
    } else {
      setEditDevice(null);
      setDeviceForm({ name: '', hourlyRate: 30 });
    }
    setShowDeviceModal(true);
  };

  const handleSaveDevice = () => {
    if (!deviceForm.name.trim()) { addToast('يرجى إدخال اسم الطاولة', 'error'); return; }
    if (editDevice) {
      const updated: GamingDevice = { ...editDevice, name: deviceForm.name, hourlyRate: deviceForm.hourlyRate };
      setGamingDevices(prev => prev.map(d => d.id === editDevice.id ? updated : d));
      void syncDevice('update', updated);
      addToast('تم تحديث الطاولة', 'success');
    } else {
      const newDevice: GamingDevice = { id: `bil_${Date.now()}`, name: deviceForm.name, type: 'billiard', hourlyRate: deviceForm.hourlyRate, status: 'available' };
      setGamingDevices(prev => [...prev, newDevice]);
      void syncDevice('create', newDevice);
      addToast('تم إضافة الطاولة', 'success');
    }
    setShowDeviceModal(false);
  };

  const handleDeleteDevice = (deviceId: string) => {
    if (gamingDevices.find(d => d.id === deviceId)?.status === 'in_session') {
      addToast('لا يمكن حذف طاولة في جلسة نشطة', 'error'); return;
    }
    const device = gamingDevices.find(d => d.id === deviceId);
    if (device) {
      setGamingDevices(prev => prev.filter(d => d.id !== deviceId));
      void syncDevice('delete', device);
    }
    addToast('تم حذف الطاولة', 'info');
  };

  const handleStartSession = () => {
    if (!startDevice) return;
    const session: GamingSession = {
      id: `bils_${Date.now()}`,
      deviceId: startDevice.id,
      deviceName: startDevice.name,
      deviceType: 'billiard',
      hourlyRate: startDevice.hourlyRate,
      startTime: new Date().toISOString(),
      status: 'active',
      customerId: startCustomerId || undefined,
      customerName: startCustomerName || undefined,
      notes: startNotes || undefined,
    };
    const updatedDevice: GamingDevice = { ...startDevice, status: 'in_session' };
    setGamingSessions(prev => [...prev, session]);
    setGamingDevices(prev => prev.map(d => d.id === startDevice.id ? updatedDevice : d));
    void syncSession('create', session);
    void syncDevice('update', updatedDevice);
    addToast(`بدأت جلسة ${startDevice.name}`, 'success');
    setShowStartModal(false);
    setStartCustomerId(''); setStartCustomerName(''); setStartNotes('');
  };

  const handleOpenEndModal = (session: GamingSession) => {
    setEndSession(session);
    setPaymentMethod('cash');
    setShowEndModal(true);
  };

  const handleEndSession = () => {
    if (!endSession) return;
    const endTime = new Date().toISOString();
    const seconds = getElapsedSeconds(endSession.startTime);
    const minutes = getElapsedMinutes(endSession.startTime);
    const amount = parseFloat(calcAmount(seconds, endSession.hourlyRate).toFixed(2));
    const updatedSession: GamingSession = { ...endSession, endTime, durationMinutes: minutes, totalAmount: amount, status: 'paid', paymentMethod };
    const order: Order = {
      id: `GAME-${endSession.id}`,
      items: [{
        id: `item-${endSession.id}`,
        nameAr: `جلسة بينج - ${endSession.deviceName}`,
        nameEn: `Billiard session - ${endSession.deviceName}`,
        basePrice: amount,
        cost: 0,
        categoryId: 'gaming',
        image: '',
        available: true,
        variants: [],
        addons: [],
        quantity: 1,
        selectedAddons: [],
        totalItemPrice: amount,
      }],
      subtotal: amount,
      discount: 0,
      tax: 0,
      serviceCharge: 0,
      total: amount,
      paymentMethod: paymentMethod === 'card' ? 'credit' : 'cash',
      amountReceived: amount,
      changeAmount: 0,
      customerId: endSession.customerId,
      customerName: endSession.customerName || 'عميل ألعاب',
      type: 'customer',
      status: 'completed',
      createdAt: endTime,
      completedAt: endTime,
      performedBy: { name: user || 'المستخدم', role: userRole || 'cashier' },
    };
    const dev = gamingDevices.find(d => d.id === endSession.deviceId);
    if (dev) {
      const freed: GamingDevice = { ...dev, status: 'available' };
      setGamingDevices(prev => prev.map(d => d.id === endSession.deviceId ? freed : d));
      void syncDevice('update', freed);
    }
    setGamingSessions(prev => prev.map(s => s.id === endSession.id ? updatedSession : s));
    addOrder(order);
    void syncSession('update', updatedSession);
    addToast(`انتهت جلسة ${endSession.deviceName} — ${amount.toFixed(2)} ${currency}`, 'success');
    setShowEndModal(false);
    setEndSession(null);
  };

  const handleOpenEditInvoice = (session: GamingSession) => {
    setEditInvoiceSession(session);
    setEditInvoiceAmount((session.totalAmount || 0).toString());
    setEditInvoiceDuration((session.durationMinutes || 0).toString());
  };

  const handleSaveInvoice = () => {
    if (!editInvoiceSession) return;
    const amount = Math.max(0, parseFloat(editInvoiceAmount) || 0);
    const duration = Math.max(0, parseInt(editInvoiceDuration) || 0);

    const changed: string[] = [];
    if (amount !== editInvoiceSession.totalAmount) changed.push(`الإجمالي: ${editInvoiceSession.totalAmount} -> ${amount}`);
    if (duration !== editInvoiceSession.durationMinutes) changed.push(`المدة: ${editInvoiceSession.durationMinutes || 0} دقيقة -> ${duration} دقيقة`);

    const updatedSession = { ...editInvoiceSession, totalAmount: amount, durationMinutes: duration };
    setGamingSessions(prev => prev.map(s => s.id === editInvoiceSession.id ? updatedSession : s));
    updateOrder(`GAME-${editInvoiceSession.id}`, {
      subtotal: amount,
      total: amount,
      amountReceived: amount,
      items: (orders.find(o => o.id === `GAME-${editInvoiceSession.id}`)?.items || []).map(item => ({
        ...item,
        nameAr: `جلسة ${editInvoiceSession.deviceType === 'playstation' ? 'بلايستيشن' : 'بينج'} - ${editInvoiceSession.deviceName} (${formatDuration(duration)})`,
        nameEn: `Gaming session - ${editInvoiceSession.deviceName} (${formatDuration(duration)})`,
        basePrice: amount,
        totalItemPrice: amount
      }))
    });
    void syncSession('update', updatedSession);

    if (changed.length > 0) {
      const newLog: GamingEditLog = {
        id: `edit_${Date.now()}`,
        sessionId: editInvoiceSession.id,
        deviceName: editInvoiceSession.deviceName,
        deviceType: 'billiard',
        editedBy: user || 'مستخدم',
        editedByRole: userRole || 'cashier',
        editedAt: new Date().toISOString(),
        changesSummary: changed.join(' | '),
      };
      const nextLogs = [newLog, ...gamingEditLogs];
      setGamingEditLogs(nextLogs);
      writeGamingEdits(nextLogs);
    }

    addToast('تم تعديل فاتورة الجلسة', 'success');
    setEditInvoiceSession(null);
  };

  const handleDeleteInvoice = (session: GamingSession) => {
    if (!window.confirm(`حذف فاتورة ${session.deviceName}؟`)) return;
    deleteOrder(`GAME-${session.id}`);
    addToast('تم حذف فاتورة الجلسة', 'info');
  };

  const completedSessions = sessions.filter(s => s.status !== 'active').sort((a, b) => (b.endTime || '').localeCompare(a.endTime || ''));
  const totalRevenue = completedSessions.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accentBlue/10 rounded-2xl text-accentBlue"><CircleDot size={24} /></div>
          <div>
            <h1 className="text-xl font-black text-textPrimary">جلسات البينج</h1>
            <p className="text-secondary text-xs font-bold">إدارة طاولات البينج والجلسات الزمنية</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEditsModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-black transition-all bg-surface border-cardAccent text-secondary hover:text-textPrimary">
            <History size={16} /> التعديلات
          </button>
          <Button onClick={() => handleOpenDeviceModal()}><Plus size={16} /> إضافة طاولة</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-cardAccent text-center">
          <p className="text-2xl font-black text-accentBlue">{devices.filter(d => d.status === 'in_session').length}</p>
          <p className="text-xs text-secondary font-bold mt-1">طاولات نشطة</p>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-cardAccent text-center">
          <p className="text-2xl font-black text-accentGreen">{devices.filter(d => d.status === 'available').length}</p>
          <p className="text-xs text-secondary font-bold mt-1">طاولات متاحة</p>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-cardAccent text-center">
          <p className="text-2xl font-black text-primary">{totalRevenue.toFixed(0)} {currency}</p>
          <p className="text-xs text-secondary font-bold mt-1">إجمالي الإيرادات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {devices.map(device => {
          const activeSession = getActiveSession(device.id);
          const elapsed = activeSession ? getElapsedMinutes(activeSession.startTime) : 0;
          const currentAmount = activeSession ? calcAmount(getElapsedSeconds(activeSession.startTime), device.hourlyRate) : 0;
          const isActive = device.status === 'in_session';
          return (
            <div key={device.id} className={`bg-surface rounded-[28px] border-2 p-5 transition-all ${isActive ? 'border-accentBlue shadow-lg' : 'border-cardAccent'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-accentBlue/15 text-accentBlue' : 'bg-cardAccent text-secondary'}`}><CircleDot size={20} /></div>
                  <div>
                    <h3 className="font-black text-textPrimary text-sm">{device.name}</h3>
                    <p className="text-[10px] text-secondary font-bold">{device.hourlyRate} {currency}/ساعة</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenDeviceModal(device)} className="p-1.5 text-secondary hover:text-primary rounded-lg"><Edit3 size={14} /></button>
                  {userRole !== 'cashier' && (
                    <button onClick={() => handleDeleteDevice(device.id)} className="p-1.5 text-secondary hover:text-red-500 rounded-lg"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
              {isActive && activeSession ? (
                <div className="space-y-3">
                  <div className="bg-accentBlue/5 rounded-2xl p-3 border border-accentBlue/10 text-center">
                    <div className="flex items-center justify-center gap-1 text-accentBlue mb-1">
                      <Clock size={14} /><span className="font-black text-lg">{formatDuration(elapsed)}</span>
                    </div>
                    <p className="text-accentBlue font-black text-xl">{currentAmount.toFixed(2)} {currency}</p>
                    {activeSession.customerName && (
                      <div className="flex items-center justify-center gap-1 mt-1 text-secondary text-[10px] font-bold">
                        <User size={10} /><span>{activeSession.customerName}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleOpenEndModal(activeSession)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all">
                    <Square size={14} /> إنهاء الجلسة
                  </button>
                </div>
              ) : (
                <button onClick={() => { setStartDevice(device); setShowStartModal(true); }} className="w-full flex items-center justify-center gap-2 py-3 bg-accentBlue text-background rounded-2xl font-black text-sm hover:opacity-90 transition-all">
                  <Play size={16} /> بدء جلسة
                </button>
              )}
            </div>
          );
        })}
      </div>

      {completedSessions.length > 0 && (
        <div className="bg-surface rounded-[28px] border border-cardAccent p-5">
          <h2 className="font-black text-textPrimary mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-accentGreen" /> الجلسات المكتملة ({completedSessions.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-secondary text-[10px] font-black uppercase border-b border-cardAccent">
                  <th className="pb-2 pr-2">الطاولة</th><th className="pb-2">العميل</th><th className="pb-2">المدة</th>
                  <th className="pb-2">الإجمالي</th><th className="pb-2">الدفع</th><th className="pb-2">التاريخ</th><th className="pb-2 text-center">الفاتورة</th>
                </tr>
              </thead>
              <tbody>
                {completedSessions.slice(0, 20).map(s => (
                  <tr key={s.id} className="border-b border-cardAccent/30 hover:bg-background/40 transition-colors">
                    <td className="py-2.5 pr-2 font-bold text-sm text-textPrimary">{s.deviceName}</td>
                    <td className="py-2.5 text-secondary text-sm">{s.customerName || '—'}</td>
                    <td className="py-2.5 text-sm font-bold">{s.durationMinutes ? formatDuration(s.durationMinutes) : '—'}</td>
                    <td className="py-2.5 font-black text-accentBlue">{s.totalAmount?.toFixed(2)} {currency}</td>
                    <td className="py-2.5 text-sm">{s.paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'}</td>
                    <td className="py-2.5 text-secondary text-[10px]">{s.endTime ? new Date(s.endTime).toLocaleString('ar-EG') : ''}</td>
                    <td className="py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleOpenEditInvoice(s)} className="p-2 bg-background border border-cardAccent text-secondary hover:text-primary rounded-xl">
                          <Edit3 size={14} />
                        </button>
                        {userRole !== 'cashier' && (
                          <button onClick={() => handleDeleteInvoice(s)} className="p-2 bg-background border border-cardAccent text-secondary hover:text-red-500 rounded-xl">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showDeviceModal} onClose={() => setShowDeviceModal(false)}>
        <Modal.Header title={editDevice ? 'تعديل الطاولة' : 'إضافة طاولة جديدة'} />
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-secondary uppercase block mb-1.5">اسم الطاولة</label>
              <input autoFocus className="w-full p-3 bg-background border border-cardAccent rounded-xl text-textPrimary font-bold outline-none focus:border-primary"
                placeholder="مثلاً: طاولة البينج 3" value={deviceForm.name} onChange={e => setDeviceForm({ ...deviceForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-black text-secondary uppercase block mb-1.5">سعر الساعة ({currency})</label>
              <input type="number" className="w-full p-3 bg-background border border-cardAccent rounded-xl text-textPrimary font-bold outline-none focus:border-primary"
                value={deviceForm.hourlyRate} onChange={e => setDeviceForm({ ...deviceForm, hourlyRate: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button fullWidth onClick={handleSaveDevice}>{editDevice ? 'حفظ التعديلات' : 'إضافة الطاولة'}</Button>
        </Modal.Footer>
      </Modal>

      <Modal isOpen={showStartModal} onClose={() => setShowStartModal(false)}>
        <Modal.Header title={`بدء جلسة — ${startDevice?.name}`} subtitle={`${startDevice?.hourlyRate} ${currency}/ساعة`} />
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-secondary uppercase block mb-1.5">العميل (اختياري)</label>
              <select className="w-full p-3 bg-background border border-cardAccent rounded-xl text-textPrimary font-bold outline-none focus:border-primary"
                value={startCustomerId} onChange={e => { setStartCustomerId(e.target.value); const c = customers.find(c => c.id === e.target.value); setStartCustomerName(c ? c.name : ''); }}>
                <option value="">بدون عميل محدد</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-secondary uppercase block mb-1.5">أو أدخل اسم العميل مباشرة</label>
              <input className="w-full p-3 bg-background border border-cardAccent rounded-xl text-textPrimary font-bold outline-none focus:border-primary"
                placeholder="اسم العميل..." value={startCustomerName} onChange={e => { setStartCustomerName(e.target.value); if (e.target.value) setStartCustomerId(''); }} />
            </div>
            <div>
              <label className="text-xs font-black text-secondary uppercase block mb-1.5">ملاحظات</label>
              <input className="w-full p-3 bg-background border border-cardAccent rounded-xl text-textPrimary font-bold outline-none focus:border-primary"
                placeholder="ملاحظات اختيارية..." value={startNotes} onChange={e => setStartNotes(e.target.value)} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button fullWidth onClick={handleStartSession}><Play size={16} /> بدء الجلسة الآن</Button>
        </Modal.Footer>
      </Modal>

      <Modal isOpen={showEndModal} onClose={() => setShowEndModal(false)}>
        <Modal.Header title="إنهاء الجلسة وتحصيل المبلغ" />
        <Modal.Body>
          {endSession && (
            <div className="space-y-4">
              <div className="bg-accentBlue/5 border border-accentBlue/10 rounded-2xl p-5 text-center">
                <p className="text-secondary text-xs font-bold mb-1">{endSession.deviceName}</p>
                <p className="text-4xl font-black text-accentBlue">{calcAmount(getElapsedSeconds(endSession.startTime), endSession.hourlyRate).toFixed(2)} {currency}</p>
                <p className="text-secondary text-xs font-bold mt-1"><Clock size={10} className="inline ml-1" />{formatDuration(getElapsedMinutes(endSession.startTime))}</p>
              </div>
              <div>
                <label className="text-xs font-black text-secondary uppercase block mb-2">طريقة الدفع</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPaymentMethod('cash')} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm border-2 transition-all ${paymentMethod === 'cash' ? 'border-accentGreen bg-accentGreen/10 text-accentGreen' : 'border-cardAccent text-secondary'}`}>
                    <Banknote size={16} /> نقدي
                  </button>
                  <button onClick={() => setPaymentMethod('card')} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm border-2 transition-all ${paymentMethod === 'card' ? 'border-accentBlue bg-accentBlue/10 text-accentBlue' : 'border-cardAccent text-secondary'}`}>
                    <CreditCard size={16} /> بطاقة
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button fullWidth onClick={handleEndSession}><CheckCircle2 size={16} /> تأكيد الإنهاء والتحصيل</Button>
        </Modal.Footer>
      </Modal>

      <Modal isOpen={!!editInvoiceSession} onClose={() => setEditInvoiceSession(null)}>
        <Modal.Header title={`تعديل فاتورة ${editInvoiceSession?.deviceName || ''}`} />
        <Modal.Body>
          <div>
              <label className="text-xs font-black text-secondary uppercase block mb-1.5">إجمالي الفاتورة ({currency})</label>
              <input
                autoFocus
                type="number"
                className="w-full p-4 bg-background border border-cardAccent rounded-xl text-textPrimary font-black text-xl text-center outline-none focus:border-primary"
                value={editInvoiceAmount}
                onChange={e => setEditInvoiceAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-black text-secondary uppercase block mb-1.5">إجمالي المدة (بالدقائق)</label>
              <input
                type="number"
                className="w-full p-4 bg-background border border-cardAccent rounded-xl text-textPrimary font-black text-xl text-center outline-none focus:border-primary"
                value={editInvoiceDuration}
                onChange={e => setEditInvoiceDuration(e.target.value)}
              />
            </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setEditInvoiceSession(null)}>إلغاء</Button>
            <Button onClick={handleSaveInvoice}>حفظ التعديل</Button>
          </div>
        </Modal.Footer>
      </Modal>
    
      {showEditsModal && (
        <Modal isOpen={showEditsModal} onClose={() => setShowEditsModal(false)}>
          <Modal.Header title="سجل التعديلات" subtitle={userRole === 'cashier' ? 'تعديلاتك فقط' : 'كل التعديلات'} />
          <Modal.Body>
            {visibleGamingEditLogs.length === 0 ? (
              <p className="text-secondary text-sm font-bold text-center">لا توجد تعديلات مسجلة</p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {visibleGamingEditLogs.map(log => (
                  <div key={log.id} className="bg-background border border-cardAccent rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-black text-textPrimary text-sm">{log.deviceName}</p>
                      <p className="text-[10px] text-secondary font-bold">{new Date(log.editedAt).toLocaleString('ar-EG')}</p>
                    </div>
                    <p className="text-[11px] text-secondary font-bold mb-1">بواسطة: {log.editedBy} ({log.editedByRole === 'admin' ? 'مدير' : 'كاشير'})</p>
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
    </div>
  );
};

export default Billiard;
