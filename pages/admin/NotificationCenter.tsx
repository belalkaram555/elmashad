import React, { useState } from 'react';
import {
    Bell, Send, Users, Building2, Calendar, Clock, Check,
    X, Search, Filter, Plus, Trash2, Eye, ChevronDown,
    Mail, Smartphone, AlertCircle, Info, CheckCircle2, AlertTriangle
} from 'lucide-react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';
type NotificationTarget = 'all' | 'company' | 'branch' | 'user';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    target: NotificationTarget;
    targetName?: string;
    sentAt: string;
    readCount: number;
    totalRecipients: number;
    status: 'sent' | 'scheduled' | 'draft';
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'تحديث النظام الجديد v2.5',
        message: 'تم إطلاق تحديث جديد يتضمن ميزات محسنة للأداء والأمان.',
        type: 'info',
        target: 'all',
        sentAt: '2026-01-15T10:30:00',
        readCount: 45,
        totalRecipients: 52,
        status: 'sent'
    },
    {
        id: '2',
        title: 'تنبيه: انتهاء الاشتراك قريباً',
        message: 'اشتراككم سينتهي خلال 7 أيام. يرجى التجديد لتجنب انقطاع الخدمة.',
        type: 'warning',
        target: 'company',
        targetName: 'مطعم السلطان الذهبي',
        sentAt: '2026-01-14T14:00:00',
        readCount: 3,
        totalRecipients: 5,
        status: 'sent'
    },
    {
        id: '3',
        title: 'صيانة مجدولة',
        message: 'سيتم إجراء صيانة للنظام يوم الجمعة من 2-4 صباحاً.',
        type: 'warning',
        target: 'all',
        sentAt: '2026-01-20T00:00:00',
        readCount: 0,
        totalRecipients: 52,
        status: 'scheduled'
    },
    {
        id: '4',
        title: 'تم تفعيل حسابكم بنجاح',
        message: 'مرحباً بكم في نظام M4D CAFE POS!',
        type: 'success',
        target: 'company',
        targetName: 'كافيه النخبة',
        sentAt: '2026-01-13T09:00:00',
        readCount: 2,
        totalRecipients: 2,
        status: 'sent'
    },
    {
        id: '5',
        title: 'خطأ في المزامنة',
        message: 'تم اكتشاف مشكلة في مزامنة البيانات. جاري العمل على إصلاحها.',
        type: 'error',
        target: 'branch',
        targetName: 'فرع الرياض',
        sentAt: '2026-01-12T16:30:00',
        readCount: 1,
        totalRecipients: 1,
        status: 'sent'
    }
];

const NotificationCenter: React.FC = () => {
    const [notifications] = useState<Notification[]>(mockNotifications);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'scheduled' | 'draft'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        type: 'info' as NotificationType,
        target: 'all' as NotificationTarget,
        schedule: false,
        scheduleDate: ''
    });

    const getTypeIcon = (type: NotificationType) => {
        const icons = {
            info: { icon: Info, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
            success: { icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
            warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
            error: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }
        };
        const { icon: Icon, color, bg } = icons[type];
        return (
            <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon size={22} style={{ color }} />
            </div>
        );
    };

    const getStatusBadge = (status: Notification['status']) => {
        const styles = {
            sent: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'تم الإرسال' },
            scheduled: { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', label: 'مجدول' },
            draft: { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b', label: 'مسودة' }
        };
        const style = styles[status];
        return (
            <span style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                background: style.bg, color: style.color
            }}>
                {style.label}
            </span>
        );
    };

    const getTargetBadge = (target: NotificationTarget, targetName?: string) => {
        const icons = {
            all: { icon: Users, label: 'الجميع' },
            company: { icon: Building2, label: targetName || 'شركة' },
            branch: { icon: Building2, label: targetName || 'فرع' },
            user: { icon: Users, label: targetName || 'مستخدم' }
        };
        const { icon: Icon, label } = icons[target];
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)'
            }}>
                <Icon size={12} />
                {label}
            </span>
        );
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.includes(searchQuery) || n.message.includes(searchQuery);
        const matchesStatus = filterStatus === 'all' || n.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: notifications.length,
        sent: notifications.filter(n => n.status === 'sent').length,
        scheduled: notifications.filter(n => n.status === 'scheduled').length,
        draft: notifications.filter(n => n.status === 'draft').length
    };

    return (
        <div style={{ color: 'var(--sa-text-primary)' }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'إجمالي الإشعارات', value: stats.total, icon: Bell, color: 'var(--sa-accent-primary)' },
                    { label: 'تم إرسالها', value: stats.sent, icon: Check, color: 'var(--sa-success)' },
                    { label: 'مجدولة', value: stats.scheduled, icon: Clock, color: 'var(--sa-info)' },
                    { label: 'مسودات', value: stats.draft, icon: Mail, color: 'var(--sa-text-secondary)' }
                ].map((stat, i) => (
                    <div key={i} className="sa-glass-card sa-stat-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--sa-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>{stat.label}</p>
                                <h3 style={{ fontSize: '32px', fontWeight: 800, color: stat.color }}>{stat.value}</h3>
                            </div>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <stat.icon size={24} style={{ color: stat.color }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Actions */}
            <div className="sa-glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sa-text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="بحث في الإشعارات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 50px 14px 16px',
                                background: 'var(--sa-bg-surface)',
                                border: '1px solid var(--sa-border)',
                                borderRadius: '12px',
                                color: 'var(--sa-text-primary)',
                                fontSize: '14px',
                                fontWeight: 600,
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['all', 'sent', 'scheduled', 'draft'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as any)}
                                className={`sa-btn ${filterStatus === status ? 'sa-btn-primary' : 'sa-btn-ghost'}`}
                                style={{ padding: '12px 20px' }}
                            >
                                {status === 'all' ? 'الكل' :
                                    status === 'sent' ? 'مرسلة' :
                                        status === 'scheduled' ? 'مجدولة' : 'مسودات'}
                            </button>
                        ))}
                    </div>

                    <button className="sa-btn sa-btn-primary" onClick={() => setShowComposeModal(true)}>
                        <Plus size={18} />
                        إنشاء إشعار
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="sa-glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {filteredNotifications.map((notification, index) => (
                    <div
                        key={notification.id}
                        style={{
                            padding: '24px',
                            borderBottom: index < filteredNotifications.length - 1 ? '1px solid var(--sa-border)' : 'none',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'flex-start',
                            transition: 'background 0.2s'
                        }}
                        className="hover-bg"
                    >
                        {getTypeIcon(notification.type)}

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h4 style={{ fontWeight: 700, fontSize: '15px' }}>{notification.title}</h4>
                                {getStatusBadge(notification.status)}
                                {getTargetBadge(notification.target, notification.targetName)}
                            </div>

                            <p style={{ color: 'var(--sa-text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>
                                {notification.message}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', color: 'var(--sa-text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} />
                                    {new Date(notification.sentAt).toLocaleDateString('ar-EG', {
                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Eye size={12} />
                                    {notification.readCount} / {notification.totalRecipients} قرأوا
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px' }} title="عرض">
                                <Eye size={16} />
                            </button>
                            <button className="sa-btn sa-btn-danger" style={{ padding: '8px' }} title="حذف">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredNotifications.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--sa-text-secondary)' }}>
                        <Bell size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <p style={{ fontWeight: 600 }}>لا توجد إشعارات</p>
                    </div>
                )}
            </div>

            {/* Compose Modal */}
            {showComposeModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px'
                }}>
                    <div className="sa-glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--sa-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '20px' }}>إنشاء إشعار جديد</h3>
                            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px' }} onClick={() => setShowComposeModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--sa-text-secondary)' }}>
                                    العنوان
                                </label>
                                <input
                                    type="text"
                                    value={newNotification.title}
                                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                                    style={{
                                        width: '100%', padding: '14px', background: 'var(--sa-bg-surface)',
                                        border: '1px solid var(--sa-border)', borderRadius: '12px',
                                        color: 'var(--sa-text-primary)', fontSize: '14px', fontWeight: 600, outline: 'none'
                                    }}
                                    placeholder="عنوان الإشعار..."
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--sa-text-secondary)' }}>
                                    الرسالة
                                </label>
                                <textarea
                                    value={newNotification.message}
                                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                                    rows={4}
                                    style={{
                                        width: '100%', padding: '14px', background: 'var(--sa-bg-surface)',
                                        border: '1px solid var(--sa-border)', borderRadius: '12px',
                                        color: 'var(--sa-text-primary)', fontSize: '14px', fontWeight: 600, outline: 'none', resize: 'none'
                                    }}
                                    placeholder="محتوى الإشعار..."
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--sa-text-secondary)' }}>
                                        نوع الإشعار
                                    </label>
                                    <select
                                        value={newNotification.type}
                                        onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as NotificationType })}
                                        style={{
                                            width: '100%', padding: '14px', background: 'var(--sa-bg-surface)',
                                            border: '1px solid var(--sa-border)', borderRadius: '12px',
                                            color: 'var(--sa-text-primary)', fontSize: '14px', fontWeight: 600, outline: 'none'
                                        }}
                                    >
                                        <option value="info">معلومات</option>
                                        <option value="success">نجاح</option>
                                        <option value="warning">تحذير</option>
                                        <option value="error">خطأ</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--sa-text-secondary)' }}>
                                        إرسال إلى
                                    </label>
                                    <select
                                        value={newNotification.target}
                                        onChange={(e) => setNewNotification({ ...newNotification, target: e.target.value as NotificationTarget })}
                                        style={{
                                            width: '100%', padding: '14px', background: 'var(--sa-bg-surface)',
                                            border: '1px solid var(--sa-border)', borderRadius: '12px',
                                            color: 'var(--sa-text-primary)', fontSize: '14px', fontWeight: 600, outline: 'none'
                                        }}
                                    >
                                        <option value="all">جميع المستخدمين</option>
                                        <option value="company">شركة محددة</option>
                                        <option value="branch">فرع محدد</option>
                                        <option value="user">مستخدم محدد</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '24px', borderTop: '1px solid var(--sa-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className="sa-btn sa-btn-ghost" onClick={() => setShowComposeModal(false)}>
                                إلغاء
                            </button>
                            <button className="sa-btn sa-btn-ghost">
                                <Clock size={16} />
                                جدولة
                            </button>
                            <button className="sa-btn sa-btn-primary">
                                <Send size={16} />
                                إرسال الآن
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
