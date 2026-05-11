import React, { useState } from 'react';
import {
    Search, Filter, Plus, MoreVertical, Eye, Edit2, Ban, Trash2, RefreshCw,
    Building2, Users, Package, DollarSign, ChevronLeft, ChevronRight, X,
    LogIn, Download, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Tenant, TenantStatus } from '../../types/superAdminTypes';

// Mock Data - Extended Tenants
const mockTenants: Tenant[] = [
    {
        id: '1', restaurantName: 'مطعم السلطان الذهبي', ownerName: 'أحمد محمد علي', email: 'sultan@email.com', phone: '+201234567890',
        address: 'شارع التحرير، القاهرة', country: 'Egypt', city: 'Cairo', status: 'active', subscriptionPlan: 'enterprise',
        subscriptionStart: '2025-01-01', subscriptionEnd: '2026-01-01', storageUsedMB: 2450, storageQuotaMB: 5000,
        totalOrders: 15420, totalRevenue: 245800, employeeCount: 18, createdAt: '2024-06-15', lastActive: '2026-01-12',
        features: { onlineOrdering: true, kitchenDisplay: true, multiWarehouse: true, analytics: true, customBranding: true }
    },
    {
        id: '2', restaurantName: 'بيتزا الشرق الأوسط', ownerName: 'محمد علي حسن', email: 'pizza@email.com', phone: '+201098765432',
        address: 'المعادي، القاهرة', country: 'Egypt', city: 'Cairo', status: 'active', subscriptionPlan: 'pro',
        subscriptionStart: '2025-06-01', subscriptionEnd: '2025-12-01', storageUsedMB: 890, storageQuotaMB: 2000,
        totalOrders: 8540, totalRevenue: 125000, employeeCount: 8, createdAt: '2025-03-10', lastActive: '2026-01-11',
        features: { onlineOrdering: true, kitchenDisplay: true, multiWarehouse: false, analytics: true, customBranding: false }
    },
    {
        id: '3', restaurantName: 'كافيه النخبة الفاخر', ownerName: 'سارة أحمد محمود', email: 'elite@email.com', phone: '+966501234567',
        address: 'شارع الملك فهد، الرياض', country: 'Saudi Arabia', city: 'Riyadh', status: 'trial', subscriptionPlan: 'pro',
        subscriptionStart: '2026-01-01', subscriptionEnd: '2026-01-15', storageUsedMB: 120, storageQuotaMB: 2000,
        totalOrders: 340, totalRevenue: 8900, employeeCount: 5, createdAt: '2026-01-01', lastActive: '2026-01-12',
        features: { onlineOrdering: false, kitchenDisplay: true, multiWarehouse: false, analytics: true, customBranding: false }
    },
    {
        id: '4', restaurantName: 'مطعم الأصيل للمشويات', ownerName: 'خالد العربي محمد', email: 'aseel@email.com', phone: '+971501234567',
        address: 'دبي مول، دبي', country: 'UAE', city: 'Dubai', status: 'suspended', subscriptionPlan: 'basic',
        subscriptionStart: '2025-09-01', subscriptionEnd: '2025-12-01', storageUsedMB: 350, storageQuotaMB: 500,
        totalOrders: 2100, totalRevenue: 35000, employeeCount: 4, createdAt: '2025-08-01', lastActive: '2025-11-28',
        features: { onlineOrdering: false, kitchenDisplay: false, multiWarehouse: false, analytics: false, customBranding: false }
    },
    {
        id: '5', restaurantName: 'شاورما الملك', ownerName: 'عمر حسن أحمد', email: 'king@email.com', phone: '+201555555555',
        address: 'الإسكندرية', country: 'Egypt', city: 'Alexandria', status: 'active', subscriptionPlan: 'basic',
        subscriptionStart: '2025-10-01', subscriptionEnd: '2026-04-01', storageUsedMB: 200, storageQuotaMB: 500,
        totalOrders: 4200, totalRevenue: 67500, employeeCount: 6, createdAt: '2025-09-15', lastActive: '2026-01-12',
        features: { onlineOrdering: false, kitchenDisplay: true, multiWarehouse: false, analytics: false, customBranding: false }
    },
    {
        id: '6', restaurantName: 'مطعم الوادي الأخضر', ownerName: 'فاطمة عبدالله', email: 'valley@email.com', phone: '+966502345678',
        address: 'جدة', country: 'Saudi Arabia', city: 'Jeddah', status: 'expired', subscriptionPlan: 'pro',
        subscriptionStart: '2025-01-01', subscriptionEnd: '2025-07-01', storageUsedMB: 980, storageQuotaMB: 2000,
        totalOrders: 9800, totalRevenue: 156000, employeeCount: 12, createdAt: '2024-12-01', lastActive: '2025-06-28',
        features: { onlineOrdering: true, kitchenDisplay: true, multiWarehouse: true, analytics: true, customBranding: false }
    },
];

const TenantManagement: React.FC = () => {
    const [tenants] = useState<Tenant[]>(mockTenants);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all');
    const [planFilter, setPlanFilter] = useState<string>('all');
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter tenants
    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.restaurantName.includes(searchQuery) ||
            t.ownerName.includes(searchQuery) ||
            t.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        const matchesPlan = planFilter === 'all' || t.subscriptionPlan === planFilter;
        return matchesSearch && matchesStatus && matchesPlan;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    const paginatedTenants = filteredTenants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusBadge = (status: TenantStatus) => {
        const config: Record<TenantStatus, { class: string; label: string }> = {
            active: { class: 'sa-badge-active', label: 'Active' },
            trial: { class: 'sa-badge-trial', label: 'Trial' },
            suspended: { class: 'sa-badge-suspended', label: 'Suspended' },
            expired: { class: 'sa-badge-expired', label: 'Expired' }
        };
        return <span className={`sa-badge ${config[status].class}`}>{config[status].label}</span>;
    };

    const getPlanBadge = (plan: string) => {
        const colors: Record<string, string> = { basic: '#64748b', pro: '#6366f1', enterprise: '#8b5cf6' };
        return (
            <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', background: `${colors[plan]}20`, color: colors[plan] }}>
                {plan}
            </span>
        );
    };

    const openTenantDetail = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setIsDetailOpen(true);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="sa-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 className="sa-page-title">Restaurants Management</h1>
                    <p style={{ color: 'var(--sa-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                        Manage all {tenants.length} registered restaurants
                    </p>
                </div>
                <button className="sa-btn sa-btn-primary">
                    <Plus size={18} /> Add New Restaurant
                </button>
            </div>

            {/* Filters Bar */}
            <div className="sa-glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div className="sa-filters-bar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sa-text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search by name, owner, or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 14px 12px 44px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)',
                                borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px', outline: 'none'
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as TenantStatus | 'all')}
                        style={{ padding: '12px 16px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)', borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px', cursor: 'pointer' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="suspended">Suspended</option>
                        <option value="expired">Expired</option>
                    </select>

                    {/* Plan Filter */}
                    <select
                        value={planFilter}
                        onChange={e => setPlanFilter(e.target.value)}
                        style={{ padding: '12px 16px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)', borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px', cursor: 'pointer' }}
                    >
                        <option value="all">All Plans</option>
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                    </select>

                    {/* Export */}
                    <button className="sa-btn sa-btn-ghost">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Tenants Table */}
            <div className="sa-glass-card" style={{ padding: '24px' }}>
                <div className="sa-table-container">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Restaurant</th>
                                <th>Owner</th>
                                <th>Status</th>
                                <th>Plan</th>
                                <th>Orders</th>
                                <th>Revenue</th>
                                <th>Last Active</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTenants.map(tenant => (
                                <tr key={tenant.id}>
                                    <td data-label="Restaurant">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'var(--sa-accent-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '14px', flexShrink: 0 }}>
                                                {tenant.restaurantName.charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700 }}>{tenant.restaurantName}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--sa-text-secondary)' }}>{tenant.city}, {tenant.country}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Owner">
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{tenant.ownerName}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--sa-text-secondary)' }}>{tenant.email}</p>
                                        </div>
                                    </td>
                                    <td data-label="Status">{getStatusBadge(tenant.status)}</td>
                                    <td data-label="Plan">{getPlanBadge(tenant.subscriptionPlan)}</td>
                                    <td data-label="Orders" style={{ fontWeight: 600 }}>{tenant.totalOrders.toLocaleString()}</td>
                                    <td data-label="Revenue" style={{ fontWeight: 700, color: 'var(--sa-success)' }}>${tenant.totalRevenue.toLocaleString()}</td>
                                    <td data-label="Last Active" style={{ color: 'var(--sa-text-secondary)', fontSize: '13px' }}>{tenant.lastActive}</td>
                                    <td data-label="Actions">
                                        <div className="sa-table-actions" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button onClick={() => openTenantDetail(tenant)} className="sa-btn sa-btn-ghost" style={{ padding: '8px', width: 'auto' }} title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px', width: 'auto' }} title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px', color: 'var(--sa-info)', width: 'auto' }} title="Login As">
                                                <LogIn size={16} />
                                            </button>
                                            {tenant.status !== 'suspended' ? (
                                                <button className="sa-btn sa-btn-ghost" style={{ padding: '8px', color: 'var(--sa-warning)', width: 'auto' }} title="Suspend">
                                                    <Ban size={16} />
                                                </button>
                                            ) : (
                                                <button className="sa-btn sa-btn-ghost" style={{ padding: '8px', color: 'var(--sa-success)', width: 'auto' }} title="Reactivate">
                                                    <RefreshCw size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="sa-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--sa-border)' }}>
                    <p className="sa-pagination-info" style={{ color: 'var(--sa-text-secondary)', fontSize: '14px' }}>
                        Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTenants.length)} of {filteredTenants.length} restaurants
                    </p>
                    <div className="sa-pagination-buttons" style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="sa-btn sa-btn-ghost" style={{ padding: '8px 12px', opacity: currentPage === 1 ? 0.5 : 1, width: 'auto' }}>
                            <ChevronLeft size={18} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`sa-btn ${currentPage === i + 1 ? 'sa-btn-primary' : 'sa-btn-ghost'}`} style={{ padding: '8px 14px', minWidth: '40px', width: 'auto' }}>
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="sa-btn sa-btn-ghost" style={{ padding: '8px 12px', opacity: currentPage === totalPages ? 0.5 : 1, width: 'auto' }}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tenant Detail Modal */}
            {isDetailOpen && selectedTenant && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 200 }}
                    onClick={() => setIsDetailOpen(false)}
                >
                    <div onClick={e => e.stopPropagation()} className="sa-glass-card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--sa-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '56px', height: '56px', background: 'var(--sa-accent-gradient)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '22px' }}>
                                    {selectedTenant.restaurantName.charAt(0)}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedTenant.restaurantName}</h2>
                                    <p style={{ color: 'var(--sa-text-secondary)', fontSize: '14px' }}>{selectedTenant.city}, {selectedTenant.country}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="sa-btn sa-btn-ghost" style={{ padding: '10px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '24px' }}>
                            {/* Stats Row */}
                            <div className="sa-modal-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ background: 'var(--sa-bg-surface)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                    <Package size={20} style={{ color: 'var(--sa-accent-primary)', marginBottom: '8px' }} />
                                    <p style={{ fontSize: '20px', fontWeight: 800 }}>{selectedTenant.totalOrders.toLocaleString()}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--sa-text-secondary)' }}>Total Orders</p>
                                </div>
                                <div style={{ background: 'var(--sa-bg-surface)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                    <DollarSign size={20} style={{ color: 'var(--sa-success)', marginBottom: '8px' }} />
                                    <p style={{ fontSize: '20px', fontWeight: 800 }}>${selectedTenant.totalRevenue.toLocaleString()}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--sa-text-secondary)' }}>Total Revenue</p>
                                </div>
                                <div style={{ background: 'var(--sa-bg-surface)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                    <Users size={20} style={{ color: 'var(--sa-info)', marginBottom: '8px' }} />
                                    <p style={{ fontSize: '20px', fontWeight: 800 }}>{selectedTenant.employeeCount}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--sa-text-secondary)' }}>Employees</p>
                                </div>
                                <div style={{ background: 'var(--sa-bg-surface)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                                    <Building2 size={20} style={{ color: 'var(--sa-warning)', marginBottom: '8px' }} />
                                    <p style={{ fontSize: '20px', fontWeight: 800 }}>{Math.round(selectedTenant.storageUsedMB / selectedTenant.storageQuotaMB * 100)}%</p>
                                    <p style={{ fontSize: '12px', color: 'var(--sa-text-secondary)' }}>Storage Used</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="sa-modal-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {/* Owner Info */}
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sa-text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner Information</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--sa-text-secondary)' }}>Name</span>
                                            <span style={{ fontWeight: 600 }}>{selectedTenant.ownerName}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--sa-text-secondary)' }}>Email</span>
                                            <span style={{ fontWeight: 600 }}>{selectedTenant.email}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--sa-text-secondary)' }}>Phone</span>
                                            <span style={{ fontWeight: 600 }}>{selectedTenant.phone}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--sa-text-secondary)' }}>Address</span>
                                            <span style={{ fontWeight: 600 }}>{selectedTenant.address}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription Info */}
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sa-text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subscription</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--sa-text-secondary)' }}>Status</span>
                                            {getStatusBadge(selectedTenant.status)}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--sa-text-secondary)' }}>Plan</span>
                                            {getPlanBadge(selectedTenant.subscriptionPlan)}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--sa-text-secondary)' }}>Start Date</span>
                                            <span style={{ fontWeight: 600 }}>{selectedTenant.subscriptionStart}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--sa-text-secondary)' }}>End Date</span>
                                            <span style={{ fontWeight: 600 }}>{selectedTenant.subscriptionEnd}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div style={{ marginTop: '24px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sa-text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enabled Features</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {Object.entries(selectedTenant.features).map(([key, enabled]) => (
                                        <span key={key} style={{
                                            padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                                            background: enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                            color: enabled ? 'var(--sa-success)' : 'var(--sa-text-secondary)',
                                            border: `1px solid ${enabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(100, 116, 139, 0.2)'}`
                                        }}>
                                            {enabled ? <CheckCircle2 size={14} /> : <X size={14} />}
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="sa-modal-actions" style={{ display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--sa-border)' }}>
                                <button className="sa-btn sa-btn-primary" style={{ flex: 1 }}>
                                    <LogIn size={18} /> Login as Restaurant
                                </button>
                                <button className="sa-btn sa-btn-ghost" style={{ flex: 1 }}>
                                    <Edit2 size={18} /> Edit Details
                                </button>
                                {selectedTenant.status !== 'suspended' ? (
                                    <button className="sa-btn sa-btn-danger">
                                        <Ban size={18} /> Suspend
                                    </button>
                                ) : (
                                    <button className="sa-btn" style={{ background: 'var(--sa-success)', color: 'white' }}>
                                        <RefreshCw size={18} /> Reactivate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantManagement;
