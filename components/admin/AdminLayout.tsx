import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Building2, CreditCard, Settings, Shield, Activity,
    Users, ChevronLeft, ChevronRight, LogOut, Bell, Search, Menu as MenuIcon,
    X, Moon, Sun, Globe, Store, Wrench
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/superAdmin.css';

// Translations for Admin Dashboard
const ADMIN_TRANSLATIONS = {
    ar: {
        dashboard: 'لوحة التحكم',
        restaurants: 'المطاعم',
        branches: 'الفروع',
        subscriptions: 'الاشتراكات',
        globalSettings: 'الإعدادات العامة',
        auditLogs: 'سجل النشاط',
        adminUsers: 'مستخدمي الأدمن',
        notifications: 'الإشعارات',
        maintenance: 'الصيانة',
        overview: 'نظرة عامة',
        monetization: 'الفواتير',
        system: 'النظام',
        superAdmin: 'المدير العام',
        controlCenter: 'مركز التحكم',
        collapse: 'طي',
        expand: 'توسيع',
        logout: 'تسجيل الخروج',
        search: 'بحث...',
        searchPlaceholder: 'البحث عن المطاعم، الإعدادات...',
        platformOwner: 'مالك المنصة'
    },
    en: {
        dashboard: 'Dashboard',
        restaurants: 'Restaurants',
        branches: 'Branches',
        subscriptions: 'Subscriptions',
        globalSettings: 'Global Settings',
        auditLogs: 'Audit Logs',
        adminUsers: 'Admin Users',
        notifications: 'Notifications',
        maintenance: 'Maintenance',
        overview: 'Overview',
        monetization: 'Monetization',
        system: 'System',
        superAdmin: 'Super Admin',
        controlCenter: 'Control Center',
        collapse: 'Collapse',
        expand: 'Expand',
        logout: 'Logout',
        search: 'Search...',
        searchPlaceholder: 'Search restaurants, settings...',
        platformOwner: 'Platform Owner'
    }
};

interface NavItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
    isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isCollapsed }) => {
    return (
        <NavLink
            to={to}
            end={to === '/super-admin'}
            className={({ isActive }) => `sa-nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? label : ''}
        >
            <Icon size={20} />
            {!isCollapsed && <span>{label}</span>}
        </NavLink>
    );
};

const AdminLayout: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const searchRef = useRef<HTMLInputElement>(null);

    // Use app contexts
    const { language, setLanguage, isRTL } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    // Get translation
    const t = (key: keyof typeof ADMIN_TRANSLATIONS.en) => {
        return ADMIN_TRANSLATIONS[language][key] || key;
    };

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    // Handle Ctrl+K for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
                setTimeout(() => searchRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getPageTitle = () => {
        const path = location.pathname.split('/').pop() || 'dashboard';
        const titles: Record<string, string> = {
            'super-admin': t('dashboard'),
            'dashboard': t('dashboard'),
            'tenants': t('restaurants'),
            'branches': t('branches'),
            'subscriptions': t('subscriptions'),
            'settings': t('globalSettings'),
            'audit': t('auditLogs'),
            'admins': t('adminUsers'),
            'notifications': t('notifications'),
            'maintenance': t('maintenance'),
        };
        return titles[path] || t('superAdmin');
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const toggleLanguage = () => {
        setLanguage(language === 'ar' ? 'en' : 'ar');
    };

    return (
        <div className="super-admin-container">
            {/* Mobile Header */}
            <div className="sa-mobile-header">
                <button
                    className="sa-mobile-menu-btn"
                    onClick={() => setIsMobileOpen(true)}
                >
                    <MenuIcon size={22} />
                </button>
                <div className="sa-sidebar-logo" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                    <span>SA</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={toggleTheme}
                        className="sa-mobile-menu-btn"
                        style={{ width: '36px', height: '36px' }}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <button
                        onClick={toggleLanguage}
                        className="sa-mobile-menu-btn"
                        style={{ width: '36px', height: '36px', fontWeight: 700, fontSize: '12px' }}
                    >
                        {language === 'ar' ? 'EN' : 'ع'}
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            <div
                className={`sa-sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sa-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open' : ''}`}>
                {/* Close button for mobile */}
                <button
                    className="sa-mobile-menu-btn mobile-only"
                    onClick={() => setIsMobileOpen(false)}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        left: isRTL ? '16px' : 'auto',
                        right: isRTL ? 'auto' : '16px',
                        zIndex: 10
                    }}
                >
                    <X size={20} />
                </button>

                {/* Logo Section */}
                <div className="sa-sidebar-header">
                    <div className="sa-sidebar-logo">
                        <span>SA</span>
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h1 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--sa-text-primary)' }}>{t('superAdmin')}</h1>
                            <p style={{ fontSize: '11px', color: 'var(--sa-text-secondary)' }}>{t('controlCenter')}</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }} className="sa-scrollbar">
                    <div style={{ padding: '0 20px', marginBottom: '12px' }}>
                        {!isCollapsed && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--sa-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                {t('overview')}
                            </span>
                        )}
                    </div>
                    <NavItem to="/super-admin" icon={LayoutDashboard} label={t('dashboard')} isCollapsed={isCollapsed} />
                    <NavItem to="/super-admin/tenants" icon={Building2} label={t('restaurants')} isCollapsed={isCollapsed} />
                    <NavItem to="/super-admin/branches" icon={Store} label={t('branches')} isCollapsed={isCollapsed} />

                    <div style={{ height: '1px', background: 'var(--sa-border)', margin: '20px 12px' }} />

                    <div style={{ padding: '0 20px', marginBottom: '12px' }}>
                        {!isCollapsed && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--sa-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                {t('monetization')}
                            </span>
                        )}
                    </div>
                    <NavItem to="/super-admin/subscriptions" icon={CreditCard} label={t('subscriptions')} isCollapsed={isCollapsed} />

                    <div style={{ height: '1px', background: 'var(--sa-border)', margin: '20px 12px' }} />

                    <div style={{ padding: '0 20px', marginBottom: '12px' }}>
                        {!isCollapsed && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--sa-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                {t('system')}
                            </span>
                        )}
                    </div>
                    <NavItem to="/super-admin/settings" icon={Settings} label={t('globalSettings')} isCollapsed={isCollapsed} />
                    <NavItem to="/super-admin/audit" icon={Activity} label={t('auditLogs')} isCollapsed={isCollapsed} />
                    <NavItem to="/super-admin/admins" icon={Shield} label={t('adminUsers')} isCollapsed={isCollapsed} />
                    <NavItem to="/super-admin/notifications" icon={Bell} label={t('notifications')} isCollapsed={isCollapsed} />
                    <NavItem to="/super-admin/maintenance" icon={Wrench} label={t('maintenance')} isCollapsed={isCollapsed} />

                    {/* Mobile-only logout in sidebar */}
                    <div className="mobile-only" style={{ padding: '20px 12px', marginTop: 'auto' }}>
                        <button
                            onClick={handleLogout}
                            className="sa-btn sa-btn-danger"
                            style={{ width: '100%' }}
                        >
                            <LogOut size={18} /> {t('logout')}
                        </button>
                    </div>
                </nav>

                {/* Collapse Toggle - Desktop only */}
                <div className="desktop-only" style={{ padding: '16px', borderTop: '1px solid var(--sa-border)' }}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="sa-btn sa-btn-ghost"
                        style={{ width: '100%', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    >
                        {isRTL ? (
                            isCollapsed ? <ChevronLeft size={18} /> : <><ChevronRight size={18} /> {t('collapse')}</>
                        ) : (
                            isCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> {t('collapse')}</>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="sa-main-content sa-scrollbar" style={{ height: '100vh', overflowY: 'auto' }}>
                {/* Header Bar - Desktop */}
                <header className="desktop-only" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    {/* Page Title */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h1 className="sa-page-title">{getPageTitle()}</h1>
                        <p style={{ color: 'var(--sa-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                            {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Header Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {/* Search - Hide on smaller screens */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="sa-btn sa-btn-ghost sa-header-search"
                            style={{ padding: '10px 16px', gap: '10px', width: 'auto' }}
                        >
                            <Search size={16} />
                            <span style={{ fontSize: '12px', opacity: 0.7 }}>Ctrl+K</span>
                        </button>

                        {/* Notifications */}
                        <button className="sa-btn sa-btn-ghost" style={{ padding: '10px', position: 'relative', width: 'auto' }}>
                            <Bell size={18} />
                            <span style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                width: '8px',
                                height: '8px',
                                background: 'var(--sa-danger)',
                                borderRadius: '50%'
                            }} />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="sa-btn sa-btn-ghost"
                            style={{ padding: '10px', width: 'auto' }}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="sa-btn sa-btn-ghost"
                            style={{ padding: '10px', fontWeight: 700, width: 'auto' }}
                        >
                            {language === 'ar' ? 'EN' : 'ع'}
                        </button>

                        {/* Admin Profile */}
                        <div className="sa-header-profile-details" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 16px',
                            background: 'var(--sa-bg-surface)',
                            borderRadius: '14px',
                            border: '1px solid var(--sa-border)'
                        }}>
                            <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                <p style={{ fontWeight: 700, fontSize: '14px' }}>{t('superAdmin')}</p>
                                <p style={{ fontSize: '11px', color: 'var(--sa-text-secondary)' }}>{t('platformOwner')}</p>
                            </div>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--sa-accent-gradient)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '16px',
                                color: 'white'
                            }}>
                                SA
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="sa-btn sa-btn-danger"
                            style={{ padding: '10px', width: 'auto' }}
                            title={t('logout')}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* Mobile Page Title */}
                <div className="mobile-only" style={{ marginBottom: '20px' }}>
                    <h1 className="sa-page-title">{getPageTitle()}</h1>
                    <p style={{ color: 'var(--sa-text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                        {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>

                {/* Page Content */}
                <main>
                    <Outlet />
                </main>
            </div>

            {/* Command Palette (Search Modal) */}
            {isSearchOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingTop: '10vh',
                        padding: '10vh 16px 0',
                        zIndex: 200
                    }}
                    onClick={() => setIsSearchOpen(false)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="sa-glass-card"
                        style={{
                            width: '100%',
                            maxWidth: '600px',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--sa-border)'
                        }}>
                            <Search size={20} style={{ color: 'var(--sa-text-secondary)' }} />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: 'var(--sa-text-primary)',
                                    fontFamily: 'Cairo, sans-serif'
                                }}
                            />
                            <kbd style={{
                                padding: '4px 10px',
                                background: 'var(--sa-bg-surface)',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                border: '1px solid var(--sa-border)'
                            }}>ESC</kbd>
                        </div>
                        <div style={{ padding: '12px', maxHeight: '50vh', overflowY: 'auto' }} className="sa-scrollbar">
                            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--sa-text-secondary)', fontSize: '14px' }}>
                                {t('search')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
