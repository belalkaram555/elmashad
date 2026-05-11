import React, { useState } from 'react';
import {
    Building2, MapPin, Users, Phone, Clock, MoreVertical, Plus,
    Search, Filter, Eye, Edit2, Power, Trash2, ChevronDown, X,
    CheckCircle2, AlertTriangle, WifiOff, Wifi
} from 'lucide-react';

// Mock Branch Data
const mockBranches = [
    {
        id: '1',
        name: 'فرع المعادي الرئيسي',
        tenantId: '1',
        tenantName: 'مطعم السلطان الذهبي',
        managerName: 'محمد أحمد',
        phone: '+201234567890',
        address: 'شارع 9 المعادي، القاهرة',
        workingHours: '10:00 AM - 11:00 PM',
        devicesCount: 4,
        employeesCount: 12,
        status: 'online' as const,
        todaySales: 15600,
        createdAt: '2024-06-15'
    },
    {
        id: '2',
        name: 'فرع مدينة نصر',
        tenantId: '1',
        tenantName: 'مطعم السلطان الذهبي',
        managerName: 'علي محمود',
        phone: '+201234567891',
        address: 'شارع عباس العقاد، مدينة نصر',
        workingHours: '9:00 AM - 12:00 AM',
        devicesCount: 3,
        employeesCount: 8,
        status: 'online' as const,
        todaySales: 12400,
        createdAt: '2024-09-20'
    },
    {
        id: '3',
        name: 'فرع الرياض',
        tenantId: '2',
        tenantName: 'مطاعم البيت العربي',
        managerName: 'أحمد سعيد',
        phone: '+966501234567',
        address: 'طريق الملك فهد، الرياض',
        workingHours: '11:00 AM - 1:00 AM',
        devicesCount: 5,
        employeesCount: 15,
        status: 'offline' as const,
        todaySales: 0,
        createdAt: '2024-03-10'
    },
    {
        id: '4',
        name: 'فرع جدة',
        tenantId: '2',
        tenantName: 'مطاعم البيت العربي',
        managerName: 'خالد عمر',
        phone: '+966509876543',
        address: 'شارع التحلية، جدة',
        workingHours: '10:00 AM - 11:30 PM',
        devicesCount: 3,
        employeesCount: 10,
        status: 'online' as const,
        todaySales: 22100,
        createdAt: '2024-05-01'
    },
    {
        id: '5',
        name: 'الفرع الرئيسي',
        tenantId: '3',
        tenantName: 'كافيه النخبة الفاخر',
        managerName: 'نورا حسن',
        phone: '+966551234567',
        address: 'العليا، الرياض',
        workingHours: '7:00 AM - 11:00 PM',
        devicesCount: 2,
        employeesCount: 6,
        status: 'maintenance' as const,
        todaySales: 4500,
        createdAt: '2024-08-01'
    }
];

type BranchStatus = 'online' | 'offline' | 'maintenance';

const BranchManagement: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | BranchStatus>('all');
    const [selectedBranch, setSelectedBranch] = useState<typeof mockBranches[0] | null>(null);

    const filteredBranches = mockBranches.filter(branch => {
        const matchesSearch = branch.name.includes(searchQuery) ||
            branch.tenantName.includes(searchQuery) ||
            branch.address.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || branch.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: BranchStatus) => {
        const styles = {
            online: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)', icon: Wifi, label: 'متصل' },
            offline: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', icon: WifiOff, label: 'غير متصل' },
            maintenance: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)', icon: AlertTriangle, label: 'صيانة' }
        };
        const style = styles[status];
        const Icon = style.icon;
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                fontSize: '12px',
                fontWeight: 700
            }}>
                <Icon size={14} />
                {style.label}
            </span>
        );
    };

    const stats = {
        total: mockBranches.length,
        online: mockBranches.filter(b => b.status === 'online').length,
        offline: mockBranches.filter(b => b.status === 'offline').length,
        maintenance: mockBranches.filter(b => b.status === 'maintenance').length
    };

    return (
        <div style={{ color: 'var(--sa-text-primary)' }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'إجمالي الفروع', value: stats.total, icon: Building2, color: 'var(--sa-primary)' },
                    { label: 'فروع متصلة', value: stats.online, icon: CheckCircle2, color: 'var(--sa-success)' },
                    { label: 'فروع غير متصلة', value: stats.offline, icon: WifiOff, color: 'var(--sa-danger)' },
                    { label: 'تحت الصيانة', value: stats.maintenance, icon: AlertTriangle, color: 'var(--sa-warning)' }
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

            {/* Filters */}
            <div className="sa-glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sa-text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم، الشركة، أو العنوان..."
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
                        {['all', 'online', 'offline', 'maintenance'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status as any)}
                                className={`sa-btn ${statusFilter === status ? 'sa-btn-primary' : 'sa-btn-ghost'}`}
                                style={{ padding: '12px 20px' }}
                            >
                                {status === 'all' ? 'الكل' :
                                    status === 'online' ? 'متصل' :
                                        status === 'offline' ? 'غير متصل' : 'صيانة'}
                            </button>
                        ))}
                    </div>

                    <button className="sa-btn sa-btn-primary">
                        <Plus size={18} />
                        إضافة فرع
                    </button>
                </div>
            </div>

            {/* Branches Table */}
            <div className="sa-glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="sa-table-container">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'right' }}>الفرع</th>
                                <th style={{ textAlign: 'right' }}>الشركة</th>
                                <th style={{ textAlign: 'center' }}>المدير</th>
                                <th style={{ textAlign: 'center' }}>الأجهزة</th>
                                <th style={{ textAlign: 'center' }}>الموظفين</th>
                                <th style={{ textAlign: 'center' }}>الحالة</th>
                                <th style={{ textAlign: 'center' }}>مبيعات اليوم</th>
                                <th style={{ textAlign: 'center' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBranches.map((branch) => (
                                <tr key={branch.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: 'var(--sa-accent-gradient)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 800, fontSize: '16px'
                                            }}>
                                                {branch.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '14px' }}>{branch.name}</p>
                                                <p style={{ fontSize: '11px', color: 'var(--sa-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={10} /> {branch.address.substring(0, 30)}...
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--sa-primary)' }}>{branch.tenantName}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                            <Users size={14} style={{ color: 'var(--sa-text-secondary)' }} />
                                            {branch.managerName}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{branch.devicesCount}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{branch.employeesCount}</td>
                                    <td style={{ textAlign: 'center' }}>{getStatusBadge(branch.status)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ fontWeight: 700, color: branch.todaySales > 0 ? 'var(--sa-success)' : 'var(--sa-text-secondary)' }}>
                                            {branch.todaySales.toLocaleString()} ر.س
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px' }} title="عرض">
                                                <Eye size={16} />
                                            </button>
                                            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px' }} title="تعديل">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="sa-btn sa-btn-danger" style={{ padding: '8px' }} title="تعطيل">
                                                <Power size={16} />
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

export default BranchManagement;
