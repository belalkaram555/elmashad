import React, { useState } from 'react';
import {
    Wrench, Database, Download, Upload, RefreshCw, AlertTriangle,
    CheckCircle2, Clock, Power, Shield, HardDrive, Server,
    Calendar, Play, Pause, Settings, Trash2
} from 'lucide-react';

interface BackupRecord {
    id: string;
    name: string;
    size: string;
    createdAt: string;
    type: 'auto' | 'manual';
    status: 'complete' | 'in-progress' | 'failed';
}

const mockBackups: BackupRecord[] = [
    { id: '1', name: 'backup_2026-01-15_10-00', size: '2.4 GB', createdAt: '2026-01-15T10:00:00', type: 'auto', status: 'complete' },
    { id: '2', name: 'backup_2026-01-14_10-00', size: '2.3 GB', createdAt: '2026-01-14T10:00:00', type: 'auto', status: 'complete' },
    { id: '3', name: 'backup_2026-01-13_manual', size: '2.3 GB', createdAt: '2026-01-13T15:30:00', type: 'manual', status: 'complete' },
    { id: '4', name: 'backup_2026-01-12_10-00', size: '2.2 GB', createdAt: '2026-01-12T10:00:00', type: 'auto', status: 'complete' },
];

const MaintenancePage: React.FC = () => {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [backupInProgress, setBackupInProgress] = useState(false);

    const systemStats = {
        uptime: '45 يوم 12 ساعة',
        lastBackup: '2026-01-15 10:00 AM',
        dbSize: '8.7 GB',
        storageUsed: '45.2 GB',
        storageTotal: '100 GB',
        activeSessions: 127
    };

    const handleToggleMaintenance = () => {
        if (!isMaintenanceMode) {
            if (window.confirm('هل أنت متأكد من تفعيل وضع الصيانة؟ سيتم تعليق جميع خدمات النظام.')) {
                setIsMaintenanceMode(true);
            }
        } else {
            setIsMaintenanceMode(false);
        }
    };

    const handleCreateBackup = () => {
        setBackupInProgress(true);
        setTimeout(() => setBackupInProgress(false), 3000);
    };

    return (
        <div style={{ color: 'var(--sa-text-primary)' }}>
            {/* Maintenance Mode Alert */}
            {isMaintenanceMode && (
                <div style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>وضع الصيانة مفعّل</h4>
                        <p style={{ fontSize: '13px', color: 'var(--sa-text-secondary)' }}>
                            جميع خدمات النظام معلقة حالياً. المستخدمين يرون رسالة صيانة.
                        </p>
                    </div>
                    <button className="sa-btn sa-btn-primary" onClick={handleToggleMaintenance}>
                        <Play size={16} /> إنهاء الصيانة
                    </button>
                </div>
            )}

            {/* System Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'مدة التشغيل', value: systemStats.uptime, icon: Clock, color: 'var(--sa-success)' },
                    { label: 'آخر نسخة احتياطية', value: systemStats.lastBackup, icon: Database, color: 'var(--sa-accent-primary)' },
                    { label: 'الجلسات النشطة', value: systemStats.activeSessions, icon: Server, color: 'var(--sa-info)' }
                ].map((stat, i) => (
                    <div key={i} className="sa-glass-card sa-stat-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--sa-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>{stat.label}</p>
                                <h3 style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</h3>
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

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Quick Actions */}
                <div className="sa-glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Wrench size={20} style={{ color: 'var(--sa-accent-primary)' }} />
                        إجراءات سريعة
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            className={`sa-btn ${isMaintenanceMode ? 'sa-btn-danger' : 'sa-btn-ghost'}`}
                            style={{ justifyContent: 'flex-start', padding: '16px 20px' }}
                            onClick={handleToggleMaintenance}
                        >
                            {isMaintenanceMode ? <Play size={18} /> : <Pause size={18} />}
                            {isMaintenanceMode ? 'إنهاء وضع الصيانة' : 'تفعيل وضع الصيانة'}
                        </button>

                        <button
                            className="sa-btn sa-btn-ghost"
                            style={{ justifyContent: 'flex-start', padding: '16px 20px' }}
                            onClick={handleCreateBackup}
                            disabled={backupInProgress}
                        >
                            {backupInProgress ? <RefreshCw size={18} className="animate-spin" /> : <Database size={18} />}
                            {backupInProgress ? 'جاري النسخ الاحتياطي...' : 'إنشاء نسخة احتياطية'}
                        </button>

                        <button className="sa-btn sa-btn-ghost" style={{ justifyContent: 'flex-start', padding: '16px 20px' }}>
                            <RefreshCw size={18} />
                            تحديث الـ Cache
                        </button>

                        <button className="sa-btn sa-btn-ghost" style={{ justifyContent: 'flex-start', padding: '16px 20px' }}>
                            <Shield size={18} />
                            فحص أمني شامل
                        </button>
                    </div>
                </div>

                {/* Storage Usage */}
                <div className="sa-glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <HardDrive size={20} style={{ color: 'var(--sa-accent-primary)' }} />
                        مساحة التخزين
                    </h3>

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--sa-text-secondary)', fontSize: '13px' }}>المستخدم</span>
                            <span style={{ fontWeight: 700 }}>{systemStats.storageUsed} / {systemStats.storageTotal}</span>
                        </div>
                        <div style={{ height: '12px', background: 'var(--sa-bg-surface)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{
                                width: '45%',
                                height: '100%',
                                background: 'var(--sa-accent-gradient)',
                                borderRadius: '6px'
                            }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ padding: '16px', background: 'var(--sa-bg-surface)', borderRadius: '12px' }}>
                            <p style={{ fontSize: '11px', color: 'var(--sa-text-secondary)', marginBottom: '4px' }}>قاعدة البيانات</p>
                            <p style={{ fontWeight: 700, fontSize: '18px' }}>{systemStats.dbSize}</p>
                        </div>
                        <div style={{ padding: '16px', background: 'var(--sa-bg-surface)', borderRadius: '12px' }}>
                            <p style={{ fontSize: '11px', color: 'var(--sa-text-secondary)', marginBottom: '4px' }}>الملفات</p>
                            <p style={{ fontWeight: 700, fontSize: '18px' }}>36.5 GB</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backups Table */}
            <div className="sa-glass-card" style={{ marginTop: '24px', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--sa-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Database size={20} style={{ color: 'var(--sa-accent-primary)' }} />
                        النسخ الاحتياطية
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="sa-btn sa-btn-ghost" style={{ padding: '10px 16px' }}>
                            <Calendar size={16} />
                            جدولة
                        </button>
                        <button className="sa-btn sa-btn-primary" style={{ padding: '10px 16px' }} onClick={handleCreateBackup}>
                            <Database size={16} />
                            نسخة جديدة
                        </button>
                    </div>
                </div>

                <div className="sa-table-container">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'right' }}>اسم النسخة</th>
                                <th style={{ textAlign: 'center' }}>الحجم</th>
                                <th style={{ textAlign: 'center' }}>التاريخ</th>
                                <th style={{ textAlign: 'center' }}>النوع</th>
                                <th style={{ textAlign: 'center' }}>الحالة</th>
                                <th style={{ textAlign: 'center' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockBackups.map((backup) => (
                                <tr key={backup.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Database size={18} style={{ color: 'var(--sa-accent-primary)' }} />
                                            <span style={{ fontWeight: 600 }}>{backup.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{backup.size}</td>
                                    <td style={{ textAlign: 'center', color: 'var(--sa-text-secondary)' }}>
                                        {new Date(backup.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                            background: backup.type === 'auto' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                                            color: backup.type === 'auto' ? '#06b6d4' : '#8b5cf6'
                                        }}>
                                            {backup.type === 'auto' ? 'تلقائي' : 'يدوي'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                            background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e'
                                        }}>
                                            <CheckCircle2 size={12} /> مكتمل
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px' }} title="تحميل">
                                                <Download size={16} />
                                            </button>
                                            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px' }} title="استعادة">
                                                <Upload size={16} />
                                            </button>
                                            <button className="sa-btn sa-btn-danger" style={{ padding: '8px' }} title="حذف">
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
        </div>
    );
};

export default MaintenancePage;
