import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Shield, Mail, Key, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'support';
    isActive: boolean;
    lastLogin: string;
    createdAt: string;
}

const mockAdmins: AdminUser[] = [
    { id: '1', name: 'Super Admin', email: 'superadmin@elmashadcafe.com', role: 'super_admin', isActive: true, lastLogin: '2026-01-12T22:00:00', createdAt: '2024-01-01' },
    { id: '2', name: 'Ahmed Mohamed', email: 'ahmed@elmashadcafe.com', role: 'admin', isActive: true, lastLogin: '2026-01-12T18:00:00', createdAt: '2025-06-15' },
    { id: '3', name: 'Sara Ali', email: 'sara@elmashadcafe.com', role: 'support', isActive: true, lastLogin: '2026-01-11T14:30:00', createdAt: '2025-09-01' },
    { id: '4', name: 'Omar Hassan', email: 'omar@elmashadcafe.com', role: 'admin', isActive: false, lastLogin: '2025-12-20T10:00:00', createdAt: '2025-03-10' },
];

const AdminUsers: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getRoleBadge = (role: string) => {
        const config: Record<string, { bg: string; color: string; label: string }> = {
            super_admin: { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', label: 'Super Admin' },
            admin: { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', label: 'Admin' },
            support: { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', label: 'Support' },
        };
        const c = config[role];
        return <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: c.bg, color: c.color }}>{c.label}</span>;
    };

    const toggleActive = (id: string) => {
        setAdmins(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="sa-page-title">Admin Users</h1>
                    <p style={{ color: 'var(--sa-text-secondary)', fontSize: '14px', marginTop: '4px' }}>Manage platform administrators</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="sa-btn sa-btn-primary"><Plus size={18} /> Add Admin</button>
            </div>

            {/* Stats */}
            <div className="sa-stats-grid" style={{ marginBottom: '32px' }}>
                <div className="sa-glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={24} style={{ color: '#8b5cf6' }} /></div>
                    <div><p style={{ fontSize: '24px', fontWeight: 800 }}>{admins.length}</p><p style={{ fontSize: '13px', color: 'var(--sa-text-secondary)' }}>Total Admins</p></div>
                </div>
                <div className="sa-glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={24} style={{ color: '#22c55e' }} /></div>
                    <div><p style={{ fontSize: '24px', fontWeight: 800 }}>{admins.filter(a => a.isActive).length}</p><p style={{ fontSize: '13px', color: 'var(--sa-text-secondary)' }}>Active</p></div>
                </div>
            </div>

            {/* Table */}
            <div className="sa-glass-card" style={{ padding: '24px' }}>
                <div className="sa-table-container">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'var(--sa-accent-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white' }}>{admin.name.charAt(0)}</div>
                                            <span style={{ fontWeight: 700 }}>{admin.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--sa-text-secondary)' }}>{admin.email}</td>
                                    <td>{getRoleBadge(admin.role)}</td>
                                    <td>
                                        <button onClick={() => toggleActive(admin.id)} disabled={admin.role === 'super_admin'} style={{ background: 'none', border: 'none', cursor: admin.role === 'super_admin' ? 'not-allowed' : 'pointer', color: admin.isActive ? 'var(--sa-success)' : 'var(--sa-text-secondary)', opacity: admin.role === 'super_admin' ? 0.5 : 1 }}>
                                            {admin.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                        </button>
                                    </td>
                                    <td style={{ color: 'var(--sa-text-secondary)', fontSize: '13px' }}>{formatDate(admin.lastLogin)}</td>
                                    <td>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px' }} title="Edit"><Edit2 size={16} /></button>
                                            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px' }} title="Reset Password"><Key size={16} /></button>
                                            {admin.role !== 'super_admin' && <button className="sa-btn sa-btn-danger" style={{ padding: '8px' }} title="Delete"><Trash2 size={16} /></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Admin Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setIsModalOpen(false)}>
                    <div onClick={e => e.stopPropagation()} className="sa-glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Add New Admin</h2>
                            <button onClick={() => setIsModalOpen(false)} className="sa-btn sa-btn-ghost" style={{ padding: '8px' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input placeholder="Full Name" style={{ padding: '14px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)', borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px' }} />
                            <input type="email" placeholder="Email" style={{ padding: '14px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)', borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px' }} />
                            <select style={{ padding: '14px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)', borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px' }}>
                                <option value="admin">Admin</option>
                                <option value="support">Support</option>
                            </select>
                            <button className="sa-btn sa-btn-primary" style={{ marginTop: '8px' }}><Plus size={18} /> Create Admin</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
