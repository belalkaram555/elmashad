import React, { useState } from 'react';
import { CreditCard, Plus, Edit2, Trash2, Check, X, Users, Star, Package } from 'lucide-react';
import { PlanConfig } from '../../types/superAdminTypes';

const mockPlans: PlanConfig[] = [
    { id: 'basic', name: 'Basic', nameAr: 'الأساسية', price: 99, billingCycle: 'monthly', storageQuotaMB: 500, employeeLimit: 5, features: ['POS System', 'Basic Reports', 'Email Support'] },
    { id: 'pro', name: 'Pro', nameAr: 'الاحترافية', price: 199, billingCycle: 'monthly', storageQuotaMB: 2000, employeeLimit: 15, features: ['Everything in Basic', 'Kitchen Display', 'Online Ordering', 'Advanced Analytics', 'Priority Support'], isPopular: true },
    { id: 'enterprise', name: 'Enterprise', nameAr: 'المؤسسية', price: 399, billingCycle: 'monthly', storageQuotaMB: 5000, employeeLimit: 999, features: ['Everything in Pro', 'Multi-Warehouse', 'Custom Branding', 'API Access', 'Dedicated Support'] }
];

const mockRevenue = { totalMRR: 38450, totalARR: 461400, trialConversion: 67, churnRate: 2.1, planDist: { basic: 45, pro: 62, enterprise: 20 } };

const Subscriptions: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'plans' | 'overview'>('overview');

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="sa-page-title">Subscriptions & Billing</h1>
                    <p style={{ color: 'var(--sa-text-secondary)', fontSize: '14px', marginTop: '4px' }}>Manage subscription plans and revenue</p>
                </div>
                <button className="sa-btn sa-btn-primary"><Plus size={18} /> Create Plan</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                <button onClick={() => setActiveTab('overview')} className={`sa-btn ${activeTab === 'overview' ? 'sa-btn-primary' : 'sa-btn-ghost'}`}>Revenue Overview</button>
                <button onClick={() => setActiveTab('plans')} className={`sa-btn ${activeTab === 'plans' ? 'sa-btn-primary' : 'sa-btn-ghost'}`}>Manage Plans</button>
            </div>

            {activeTab === 'overview' && (
                <div className="sa-stats-grid">
                    <div className="sa-glass-card sa-stat-card" style={{ padding: '24px' }}>
                        <p style={{ color: 'var(--sa-text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Monthly Recurring Revenue</p>
                        <p style={{ fontSize: '32px', fontWeight: 800 }}>${mockRevenue.totalMRR.toLocaleString()}</p>
                    </div>
                    <div className="sa-glass-card sa-stat-card" style={{ padding: '24px' }}>
                        <p style={{ color: 'var(--sa-text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Annual Recurring Revenue</p>
                        <p style={{ fontSize: '32px', fontWeight: 800 }}>${mockRevenue.totalARR.toLocaleString()}</p>
                    </div>
                    <div className="sa-glass-card sa-stat-card" style={{ padding: '24px' }}>
                        <p style={{ color: 'var(--sa-text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Trial Conversion</p>
                        <p style={{ fontSize: '32px', fontWeight: 800 }}>{mockRevenue.trialConversion}%</p>
                    </div>
                    <div className="sa-glass-card sa-stat-card" style={{ padding: '24px' }}>
                        <p style={{ color: 'var(--sa-text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Churn Rate</p>
                        <p style={{ fontSize: '32px', fontWeight: 800 }}>{mockRevenue.churnRate}%</p>
                    </div>
                </div>
            )}

            {activeTab === 'plans' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {mockPlans.map(plan => (
                        <div key={plan.id} className="sa-glass-card" style={{ padding: '32px', position: 'relative', border: plan.isPopular ? '2px solid var(--sa-accent-primary)' : undefined }}>
                            {plan.isPopular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--sa-accent-gradient)', padding: '4px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={12} /> Popular</div>}
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{plan.name}</h3>
                                <p style={{ color: 'var(--sa-text-secondary)' }}>{plan.nameAr}</p>
                            </div>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <span style={{ fontSize: '48px', fontWeight: 800, background: 'var(--sa-accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>${plan.price}</span>
                                <span style={{ color: 'var(--sa-text-secondary)' }}> / month</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--sa-border)' }}>
                                <div style={{ textAlign: 'center' }}><Users size={20} style={{ color: 'var(--sa-accent-primary)' }} /><p style={{ fontWeight: 700 }}>{plan.employeeLimit === 999 ? '∞' : plan.employeeLimit}</p><p style={{ fontSize: '11px', color: 'var(--sa-text-secondary)' }}>Employees</p></div>
                                <div style={{ textAlign: 'center' }}><Package size={20} style={{ color: 'var(--sa-accent-primary)' }} /><p style={{ fontWeight: 700 }}>{plan.storageQuotaMB >= 1000 ? `${plan.storageQuotaMB / 1000}GB` : `${plan.storageQuotaMB}MB`}</p><p style={{ fontSize: '11px', color: 'var(--sa-text-secondary)' }}>Storage</p></div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>{plan.features.map((f, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}><Check size={16} style={{ color: 'var(--sa-success)' }} /><span style={{ fontSize: '14px' }}>{f}</span></div>)}</div>
                            <div style={{ display: 'flex', gap: '12px' }}><button className="sa-btn sa-btn-ghost" style={{ flex: 1 }}><Edit2 size={16} /> Edit</button><button className="sa-btn sa-btn-danger" style={{ padding: '12px' }}><Trash2 size={16} /></button></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
