import React, { useState, useEffect } from 'react';
import {
    Building2, TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight,
    ChevronRight, Zap, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import { PlatformStats, Tenant } from '../../types/superAdminTypes';
import Slider from '../../components/ui/Slider';

// Mock Data
const mockStats: PlatformStats = {
    totalTenants: 148,
    activeTenants: 127,
    trialTenants: 15,
    suspendedTenants: 6,
    totalPlatformRevenue: 458750,
    totalOrders: 1247890,
    monthlyRecurringRevenue: 38450,
    averageRevenuePerTenant: 302.8,
    newTenantsThisMonth: 12,
    churnedTenantsThisMonth: 2,
};

const mockRecentTenants: Partial<Tenant>[] = [
    { id: '1', restaurantName: 'مطعم السلطان', ownerName: 'أحمد محمد', status: 'active', subscriptionPlan: 'pro', totalRevenue: 45200 },
    { id: '2', restaurantName: 'بيتزا الشرق', ownerName: 'محمد علي', status: 'trial', subscriptionPlan: 'basic', totalRevenue: 12500 },
    { id: '3', restaurantName: 'كافيه النخبة', ownerName: 'سارة أحمد', status: 'active', subscriptionPlan: 'enterprise', totalRevenue: 89100 },
    { id: '4', restaurantName: 'مطعم الأصيل', ownerName: 'خالد العربي', status: 'suspended', subscriptionPlan: 'pro', totalRevenue: 0 },
    { id: '5', restaurantName: 'شاورما الملك', ownerName: 'عمر حسن', status: 'active', subscriptionPlan: 'basic', totalRevenue: 28700 },
];

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const numericValue = typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.]/g, ''));

    useEffect(() => {
        // Animated counter
        const duration = 1000;
        const steps = 30;
        const increment = numericValue / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                setDisplayValue(numericValue);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [numericValue]);

    const formatValue = (val: number) => {
        if (typeof value === 'string' && value.includes('$')) {
            return `$${val.toLocaleString()}`;
        }
        return val.toLocaleString();
    };

    return (
        <div className="sa-glass-card sa-stat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: `${color}15`,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color
                }}>
                    <Icon size={24} />
                </div>
                {change !== undefined && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: change >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: change >= 0 ? 'var(--sa-success)' : 'var(--sa-danger)'
                    }}>
                        {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <p style={{ color: 'var(--sa-text-secondary)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{title}</p>
            <p className="sa-animated-value" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--sa-text-primary)' }}>
                {formatValue(displayValue)}
            </p>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const stats = mockStats;

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            active: 'sa-badge-active',
            trial: 'sa-badge-trial',
            suspended: 'sa-badge-suspended',
            expired: 'sa-badge-expired'
        };
        const labels: Record<string, string> = {
            active: 'Active',
            trial: 'Trial',
            suspended: 'Suspended',
            expired: 'Expired'
        };
        return <span className={`sa-badge ${badges[status]}`}>{labels[status]}</span>;
    };

    const getPlanBadge = (plan: string) => {
        const colors: Record<string, string> = {
            basic: '#64748b',
            pro: '#6366f1',
            enterprise: '#8b5cf6'
        };
        return (
            <span style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: `${colors[plan]}20`,
                color: colors[plan]
            }}>
                {plan}
            </span>
        );
    };

    return (
        <div>
            {/* Stats Grid */}
            <div className="sa-stats-grid">
                <StatCard
                    title="Total Restaurants"
                    value={stats.totalTenants}
                    change={8.2}
                    icon={Building2}
                    color="#6366f1"
                />
                <StatCard
                    title="Active Subscriptions"
                    value={stats.activeTenants}
                    change={5.4}
                    icon={CheckCircle2}
                    color="#22c55e"
                />
                <StatCard
                    title="Monthly Revenue (MRR)"
                    value={`$${stats.monthlyRecurringRevenue}`}
                    change={12.7}
                    icon={DollarSign}
                    color="#8b5cf6"
                />
                <StatCard
                    title="Total Platform Orders"
                    value={stats.totalOrders}
                    change={15.3}
                    icon={Activity}
                    color="#06b6d4"
                />
            </div>

            {/* Mobile slider for quick glance */}
            <div className="mt-4 sm:hidden">
                <Slider>
                    <div className="sa-glass-card sa-stat-card">Total: {stats.totalTenants}</div>
                    <div className="sa-glass-card sa-stat-card">Active: {stats.activeTenants}</div>
                    <div className="sa-glass-card sa-stat-card">MRR: ${stats.monthlyRecurringRevenue}</div>
                </Slider>
            </div>

            {/* Content Grid */}
            <div className="sa-content-grid">
                {/* Recent Tenants */}
                <div className="sa-glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--sa-text-primary)' }}>Recent Restaurants</h3>
                            <p style={{ color: 'var(--sa-text-secondary)', fontSize: '13px', marginTop: '4px' }}>Latest tenant activities</p>
                        </div>
                        <button className="sa-btn sa-btn-ghost" style={{ padding: '8px 16px', fontSize: '13px', width: 'auto' }}>
                            View All <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="sa-table-container">
                        <table className="sa-table">
                            <thead>
                                <tr>
                                    <th>Restaurant</th>
                                    <th>Owner</th>
                                    <th>Status</th>
                                    <th>Plan</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockRecentTenants.map(tenant => (
                                    <tr key={tenant.id}>
                                        <td data-label="Restaurant" style={{ fontWeight: 700 }}>{tenant.restaurantName}</td>
                                        <td data-label="Owner" style={{ color: 'var(--sa-text-secondary)' }}>{tenant.ownerName}</td>
                                        <td data-label="Status">{getStatusBadge(tenant.status!)}</td>
                                        <td data-label="Plan">{getPlanBadge(tenant.subscriptionPlan!)}</td>
                                        <td data-label="Revenue" style={{ fontWeight: 700, color: tenant.totalRevenue! > 0 ? 'var(--sa-success)' : 'var(--sa-text-secondary)' }}>
                                            ${tenant.totalRevenue?.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Stats & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Platform Health */}
                    <div className="sa-glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: 'var(--sa-text-primary)' }}>
                            Platform Health
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="sa-live-dot" />
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>API Status</span>
                                </div>
                                <span style={{ color: 'var(--sa-success)', fontWeight: 700, fontSize: '13px' }}>Operational</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Zap size={16} style={{ color: 'var(--sa-warning)' }} />
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Server Load</span>
                                </div>
                                <span style={{ color: 'var(--sa-warning)', fontWeight: 700, fontSize: '13px' }}>42%</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Clock size={16} style={{ color: 'var(--sa-text-secondary)' }} />
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Uptime</span>
                                </div>
                                <span style={{ color: 'var(--sa-success)', fontWeight: 700, fontSize: '13px' }}>99.97%</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="sa-glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: 'var(--sa-text-primary)' }}>
                            Quick Actions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button className="sa-btn sa-btn-primary" style={{ width: '100%' }}>
                                <Building2 size={18} /> Add New Restaurant
                            </button>
                            <button className="sa-btn sa-btn-ghost" style={{ width: '100%' }}>
                                <Users size={18} /> Manage Admins
                            </button>
                            <button className="sa-btn sa-btn-ghost" style={{ width: '100%' }}>
                                <TrendingUp size={18} /> View Analytics
                            </button>
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="sa-glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: 'var(--sa-text-primary)' }}>
                            Alerts
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(245, 158, 11, 0.2)'
                            }}>
                                <AlertTriangle size={18} style={{ color: 'var(--sa-warning)' }} />
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '13px' }}>3 Expiring Trials</p>
                                    <p style={{ fontSize: '11px', color: 'var(--sa-text-secondary)' }}>In the next 7 days</p>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                <AlertTriangle size={18} style={{ color: 'var(--sa-danger)' }} />
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '13px' }}>2 Overdue Payments</p>
                                    <p style={{ fontSize: '11px', color: 'var(--sa-text-secondary)' }}>Requires attention</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
