import React, { useState } from 'react';
import { Save, Globe, Mail, Phone, Shield, Bell, Palette, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { GlobalSettings as GlobalSettingsType } from '../../types/superAdminTypes';

const mockSettings: GlobalSettingsType = {
    platformName: 'M4D CAFE POS',
    platformNameAr: 'M4D CAFE',
    supportEmail: 'support@elmashadcafe.com',
    supportPhone: '+201234567890',
    maintenanceMode: false,
    maintenanceMessage: 'System is under scheduled maintenance.',
    defaultTrialDays: 14,
    defaultCurrency: 'USD',
    allowSelfSignup: true,
};

const GlobalSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<GlobalSettingsType>(mockSettings);
    const [hasChanges, setHasChanges] = useState(false);

    const updateSetting = <K extends keyof GlobalSettingsType>(key: K, value: GlobalSettingsType[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const InputField = ({ label, value, onChange, icon: Icon, type = 'text' }: { label: string; value: string | number; onChange: (v: string) => void; icon: React.ElementType; type?: string }) => (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--sa-text-secondary)', marginBottom: '8px' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <Icon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sa-text-secondary)' }} />
                <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '14px 14px 14px 44px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)', borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px', outline: 'none' }} />
            </div>
        </div>
    );

    const ToggleField = ({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--sa-border)' }}>
            <div>
                <p style={{ fontWeight: 700, marginBottom: '4px' }}>{label}</p>
                <p style={{ fontSize: '13px', color: 'var(--sa-text-secondary)' }}>{description}</p>
            </div>
            <button onClick={() => onChange(!value)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: value ? 'var(--sa-accent-primary)' : 'var(--sa-text-secondary)' }}>
                {value ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="sa-page-title">Global Settings</h1>
                    <p style={{ color: 'var(--sa-text-secondary)', fontSize: '14px', marginTop: '4px' }}>Platform-wide configurations</p>
                </div>
                <button className={`sa-btn ${hasChanges ? 'sa-btn-primary' : 'sa-btn-ghost'}`} disabled={!hasChanges}>
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Branding */}
                <div className="sa-glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Palette size={20} style={{ color: 'var(--sa-accent-primary)' }} /> Branding</h3>
                    <InputField label="Platform Name (English)" value={settings.platformName} onChange={v => updateSetting('platformName', v)} icon={Globe} />
                    <InputField label="Platform Name (Arabic)" value={settings.platformNameAr} onChange={v => updateSetting('platformNameAr', v)} icon={Globe} />
                </div>

                {/* Support */}
                <div className="sa-glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={20} style={{ color: 'var(--sa-accent-primary)' }} /> Support</h3>
                    <InputField label="Support Email" value={settings.supportEmail} onChange={v => updateSetting('supportEmail', v)} icon={Mail} type="email" />
                    <InputField label="Support Phone" value={settings.supportPhone} onChange={v => updateSetting('supportPhone', v)} icon={Phone} type="tel" />
                </div>

                {/* Subscription Defaults */}
                <div className="sa-glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={20} style={{ color: 'var(--sa-accent-primary)' }} /> Subscription Defaults</h3>
                    <InputField label="Default Trial Days" value={settings.defaultTrialDays} onChange={v => updateSetting('defaultTrialDays', parseInt(v) || 0)} icon={Clock} type="number" />
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--sa-text-secondary)', marginBottom: '8px' }}>Default Currency</label>
                        <select value={settings.defaultCurrency} onChange={e => updateSetting('defaultCurrency', e.target.value)} style={{ width: '100%', padding: '14px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)', borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px' }}>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="SAR">SAR (ر.س)</option>
                            <option value="EGP">EGP (ج.م)</option>
                            <option value="AED">AED (د.إ)</option>
                        </select>
                    </div>
                </div>

                {/* System Toggles */}
                <div className="sa-glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={20} style={{ color: 'var(--sa-accent-primary)' }} /> System</h3>
                    <ToggleField label="Maintenance Mode" description="Disable access for all tenants" value={settings.maintenanceMode} onChange={v => updateSetting('maintenanceMode', v)} />
                    <ToggleField label="Allow Self Signup" description="Let new restaurants register on their own" value={settings.allowSelfSignup} onChange={v => updateSetting('allowSelfSignup', v)} />
                </div>
            </div>

            {/* Maintenance Message (shown if maintenance mode is on) */}
            {settings.maintenanceMode && (
                <div className="sa-glass-card" style={{ padding: '24px', marginTop: '24px', borderColor: 'var(--sa-warning)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--sa-warning)' }}>⚠️ Maintenance Message</h3>
                    <textarea value={settings.maintenanceMessage} onChange={e => updateSetting('maintenanceMessage', e.target.value)} rows={3} style={{ width: '100%', padding: '14px', background: 'var(--sa-bg-surface)', border: '1px solid var(--sa-border)', borderRadius: '12px', color: 'var(--sa-text-primary)', fontSize: '14px', resize: 'vertical' }} placeholder="Message shown to users during maintenance..." />
                </div>
            )}
        </div>
    );
};

export default GlobalSettingsPage;
