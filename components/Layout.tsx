
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Settings,
  LogOut, Menu as MenuIcon, Users,
  Truck, X, PanelLeftClose, PanelLeft, ShieldCheck,
  Search, ChevronDown, Sun, Moon,
  Receipt, Package, Gamepad2, CircleDot,
  BarChart, History, UtensilsCrossed, AlertTriangle, Activity
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Input } from './ui/Atoms';
import { Modal } from './ui/Modal';

interface SubMenuItem {
  path: string;
  labelAr: string;
  labelEn: string;
  icon: any;
}

interface MenuItem {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: any;
  path?: string;
  subItems?: SubMenuItem[];
  color?: string;
}

interface MenuGroup {
  id: string;
  labelAr?: string;
  labelEn?: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ]
  },
  {
    id: 'pos-group',
    labelAr: 'نقطة البيع',
    labelEn: 'Point of Sale',
    items: [
      {
        id: 'pos',
        labelAr: 'شاشة البيع',
        labelEn: 'POS Screen',
        icon: ShoppingCart,
        color: '#FF9F43',
        subItems: [
          { path: '/pos', labelAr: 'شاشة البيع', labelEn: 'Sales Screen', icon: ShoppingCart },
          { path: '/pos/shifts', labelAr: 'الورديات', labelEn: 'Shifts', icon: History },
          { path: '/pos/reports', labelAr: 'تقارير البيع', labelEn: 'POS Reports', icon: BarChart },
        ]
      },
    ]
  },
  {
    id: 'catalog',
    labelAr: 'الكتالوج',
    labelEn: 'Catalog',
    items: [
      {
        id: 'menu-mgmt',
        labelAr: 'المنيو والتصنيفات',
        labelEn: 'Menu & Categories',
        icon: UtensilsCrossed,
        subItems: [
          { path: '/menu', labelAr: 'أصناف المنيو', labelEn: 'Menu Items', icon: Package },
          { path: '/categories', labelAr: 'التصنيفات', labelEn: 'Categories', icon: LayoutDashboard },
        ]
      },
    ]
  },
  {
    id: 'parties',
    labelAr: 'الأطراف',
    labelEn: 'Parties',
    items: [
      { id: 'customers', labelAr: 'العملاء', labelEn: 'Customers', icon: Users, path: '/customers' },
      { id: 'suppliers', labelAr: 'الموردون', labelEn: 'Suppliers', icon: Truck, path: '/suppliers' },
    ]
  },
  {
    id: 'invoices-group',
    labelAr: 'الفواتير',
    labelEn: 'Invoices',
    items: [
      { id: 'sales-invoices', labelAr: 'فواتير البيع', labelEn: 'Sales Invoices', icon: Receipt, path: '/invoices/sales' },
    ]
  },
  {
    id: 'inventory-group',
    labelAr: 'المخزون',
    labelEn: 'Inventory',
    items: [
      {
        id: 'inventory',
        labelAr: 'المخزون',
        labelEn: 'Inventory',
        icon: Package,
        subItems: [
          { path: '/inventory', labelAr: 'أرصدة المخزن', labelEn: 'Stock Balances', icon: Package },
          { path: '/inventory/movement', labelAr: 'حركة المخزن', labelEn: 'Stock Movement', icon: BarChart },
          { path: '/inventory/shortage', labelAr: 'نواقص المخزون', labelEn: 'Stock Shortage', icon: AlertTriangle },
        ]
      },
    ]
  },
  {
    id: 'gaming-group',
    labelAr: 'الترفيه',
    labelEn: 'Entertainment',
    items: [
      { id: 'playstation', labelAr: 'البلايستيشن', labelEn: 'PlayStation', icon: Gamepad2, path: '/gaming/playstation', color: '#FF9F43' },
      { id: 'billiard', labelAr: 'البينج', labelEn: 'Billiard', icon: CircleDot, path: '/gaming/billiard', color: '#00CFDE' },
    ]
  },
  {
    id: 'settings-group',
    labelAr: 'النظام',
    labelEn: 'System',
    items: [
      {
        id: 'settings',
        labelAr: 'الإعدادات',
        labelEn: 'Settings',
        icon: Settings,
        subItems: [
          { path: '/settings/system', labelAr: 'إعدادات النظام', labelEn: 'System Settings', icon: Settings },
          { path: '/settings/users', labelAr: 'إدارة المستخدمين', labelEn: 'Users', icon: ShieldCheck },
          { path: '/settings/audit', labelAr: 'سجل المراقبة', labelEn: 'Audit Logs', icon: Activity },
        ]
      },
    ]
  },
];

// Command Menu
const CommandMenu = ({ isOpen, onClose, menuStructure }: { isOpen: boolean; onClose: () => void; menuStructure: MenuItem[] }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allRoutes = useMemo(() => {
    const routes: { label: string; en: string; path: string; icon: any }[] = [];
    menuStructure.forEach(menu => {
      if (menu.subItems) {
        menu.subItems.forEach(sub => routes.push({ label: sub.labelAr, en: sub.labelEn, path: sub.path, icon: sub.icon }));
      } else if (menu.path) {
        routes.push({ label: menu.labelAr, en: menu.labelEn, path: menu.path, icon: menu.icon });
      }
    });
    return routes;
  }, [menuStructure]);

  const filtered = allRoutes.filter(r =>
    r.label.includes(search) || r.en.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) { setSearch(''); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface w-full max-w-xl rounded-[32px] border border-cardAccent shadow-2xl relative z-10 overflow-hidden">
        <div className="p-6 border-b border-cardAccent flex items-center gap-4 bg-background/20">
          <Search className="text-secondary" size={20} />
          <input ref={inputRef} className="bg-transparent border-none outline-none text-textPrimary w-full font-bold text-lg placeholder:text-secondary/30"
            placeholder={language === 'ar' ? 'ابحث عن وظيفة...' : 'Search function...'}
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && filtered.length > 0) { navigate(filtered[0].path); onClose(); } if (e.key === 'Escape') onClose(); }} />
          <div className="px-2 py-1 bg-cardAccent rounded-lg text-[10px] text-secondary font-black border border-cardAccent uppercase">Esc</div>
        </div>
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {filtered.slice(0, 10).map(r => (
            <button key={r.path} onClick={() => { navigate(r.path); onClose(); }}
              className="w-full flex items-center justify-between p-4 hover:bg-background rounded-2xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-background rounded-xl text-secondary group-hover:text-primary transition-colors border border-cardAccent">
                  <r.icon size={20} />
                </div>
                <span className="font-black text-textPrimary">{language === 'ar' ? r.label : r.en}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Collapsible Menu Item
const CollapsibleMenuItem = ({ menu, isCollapsed, language, onNavigate, expandedMenus, toggleMenu }: {
  menu: MenuItem; isCollapsed: boolean; language: string; onNavigate: () => void;
  expandedMenus: string[]; toggleMenu: (id: string) => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = menu.subItems?.some(sub => location.pathname.startsWith(sub.path)) ||
    (menu.path && (location.pathname === menu.path || (menu.path === '/' && location.pathname === '/')));

  const handleClick = () => {
    if (menu.subItems && menu.subItems.length > 0) {
      navigate(menu.subItems[0].path);
      onNavigate();
    } else if (menu.path) {
      navigate(menu.path); onNavigate();
    }
  };

  return (
    <div className="mx-3 mb-0.5">
      {!menu.subItems && (
        <button
          onClick={handleClick}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
            ${isActive ? 'bg-primary/10 text-primary' : 'text-secondary hover:text-textPrimary hover:bg-cardAccent'}
            ${isCollapsed ? 'justify-center px-0' : ''}`}
          title={isCollapsed ? (language === 'ar' ? menu.labelAr : menu.labelEn) : ''}
        >
          <menu.icon size={19} className="transition-transform group-hover:scale-110 shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-sm whitespace-nowrap flex-1 text-right">
              {language === 'ar' ? menu.labelAr : menu.labelEn}
            </span>
          )}
          {isActive && !isCollapsed && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
          )}
        </button>
      )}

      {menu.subItems && !isCollapsed && (
        <>
          <div className="text-[10px] font-black text-secondary/50 uppercase px-4 py-2 mt-1">
            {language === 'ar' ? menu.labelAr : menu.labelEn}
          </div>
          <div className="space-y-0.5">
            {menu.subItems.map(sub => {
              const isSubActive = location.pathname === sub.path || location.pathname.startsWith(sub.path + '/');
              return (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all text-sm mx-3 relative
                    ${isSubActive ? 'bg-primary/10 text-primary font-bold' : 'text-secondary hover:text-textPrimary hover:bg-cardAccent'}`}
                >
                  <sub.icon size={14} className="shrink-0" />
                  <span className="whitespace-nowrap text-[12px] flex-1 text-right">{language === 'ar' ? sub.labelAr : sub.labelEn}</span>
                  {isSubActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-l-full" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </>
      )}

      {menu.subItems && isCollapsed && (
        <button
          onClick={() => {
            navigate(menu.subItems![0].path);
            onNavigate();
          }}
          className={`w-full flex items-center justify-center px-0 py-3 rounded-xl transition-all duration-200 group
            ${isActive ? 'bg-primary/10 text-primary' : 'text-secondary hover:text-textPrimary hover:bg-cardAccent'}`}
          title={language === 'ar' ? menu.labelAr : menu.labelEn}
        >
          <menu.icon size={19} className="transition-transform group-hover:scale-110 shrink-0" />
        </button>
      )}
    </div>
  );
};

const Layout: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { settings, activeShift, closeShift } = useData();
  const { logout, user, userRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [closingBalance, setClosingBalance] = useState('');

  const effectiveRole = userRole === 'cashier' ? 'cashier' : 'admin';
  const cashierAllowedPaths = useMemo(
    () => new Set(['/pos', '/invoices/sales', '/gaming/playstation', '/gaming/billiard', '/inventory']),
    []
  );

  const visibleMenuGroups = useMemo(() => {
    if (effectiveRole === 'admin') return MENU_GROUPS;

    return MENU_GROUPS
      .map(group => {
        const items = group.items
          .map(item => {
            if (item.subItems && item.subItems.length > 0) {
              const subItems = item.subItems.filter(sub => cashierAllowedPaths.has(sub.path));
              return subItems.length > 0 ? { ...item, subItems } : null;
            }
            return item.path && cashierAllowedPaths.has(item.path) ? item : null;
          })
          .filter(Boolean) as MenuItem[];

        return { ...group, items };
      })
      .filter(group => group.items.length > 0);
  }, [effectiveRole, cashierAllowedPaths]);

  const visibleMenuStructure = useMemo(() => visibleMenuGroups.flatMap(g => g.items), [visibleMenuGroups]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsCommandOpen(p => !p); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => { localStorage.setItem('sidebarCollapsed', isCollapsed.toString()); }, [isCollapsed]);

  useEffect(() => {
    const current = visibleMenuStructure.find(m => m.subItems?.some(s => location.pathname.startsWith(s.path)));
    if (current && !expandedMenus.includes(current.id)) setExpandedMenus(prev => [...prev, current.id]);
  }, [location.pathname, visibleMenuStructure, expandedMenus]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (effectiveRole === 'cashier' && activeShift) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [effectiveRole, activeShift]);

  const toggleMenu = (menuId: string) =>
    setExpandedMenus(prev => prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]);

  const getPageTitle = () => {
    for (const menu of visibleMenuStructure) {
      if (menu.subItems) {
        const sub = menu.subItems.find(s => location.pathname.startsWith(s.path));
        if (sub) return language === 'ar' ? sub.labelAr : sub.labelEn;
      }
      if (menu.path && location.pathname === menu.path) return language === 'ar' ? menu.labelAr : menu.labelEn;
    }
    return language === 'ar' ? 'لوحة التحكم' : 'Dashboard';
  };

  const roleLabel = {
    admin: { ar: 'مدير النظام', en: 'Admin' },
    cashier: { ar: 'كاشير', en: 'Cashier' },
  }[effectiveRole] || { ar: 'موظف', en: 'Employee' };

  const handleLogoutClick = () => {
    if (effectiveRole === 'cashier' && activeShift) {
      setClosingBalance(String(activeShift.startBalance + activeShift.totalSales));
      setShowCloseShiftModal(true);
      return;
    }

    logout();
  };

  const handleCloseShiftAndLogout = () => {
    const numericBalance = Number(closingBalance);
    closeShift(Number.isFinite(numericBalance) ? numericBalance : 0);
    setShowCloseShiftModal(false);
    setClosingBalance('');
    logout();
  };

  return (
    <div className="flex h-screen bg-background text-textPrimary font-cairo overflow-hidden relative">
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} menuStructure={visibleMenuStructure} />

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 bg-surface border-l border-cardAccent flex flex-col shadow-2xl transition-all duration-300 md:static md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: isCollapsed ? '5rem' : '16rem' }}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center border-b border-cardAccent shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shrink-0">ك</div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-black text-xs text-textPrimary truncate max-w-[120px]">
                  {language === 'ar' ? settings.restaurantNameAr : settings.restaurantNameEn}
                </h1>
                <p className="text-[8px] text-secondary font-bold uppercase tracking-widest">Cafeteria POS</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button className="md:hidden text-secondary" onClick={() => setIsSidebarOpen(false)}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto no-scrollbar">
          {visibleMenuGroups.map((group, groupIndex) => (
            <div key={group.id}>
              {!isCollapsed && group.labelAr && (
                <div className="px-4 pt-3 pb-1">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-secondary/40">
                    {language === 'ar' ? group.labelAr : group.labelEn}
                  </h3>
                </div>
              )}
              {group.items.map(menu => (
                <CollapsibleMenuItem
                  key={menu.id}
                  menu={menu}
                  isCollapsed={isCollapsed}
                  language={language}
                  onNavigate={() => setIsSidebarOpen(false)}
                  expandedMenus={expandedMenus}
                  toggleMenu={toggleMenu}
                />
              ))}
              {groupIndex < visibleMenuGroups.length - 1 && !isCollapsed && (
                <div className="mx-4 my-1.5">
                  <div className="h-px bg-cardAccent/50" />
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className={`p-3 border-t border-cardAccent ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button onClick={handleLogoutClick}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 w-full bg-background text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm font-black border border-cardAccent ${isCollapsed ? 'px-0 w-10 h-10' : ''}`}>
            <LogOut size={16} />
            {!isCollapsed && <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-4 bg-surface z-30 shrink-0 border-b border-cardAccent">
          <div className="flex items-center gap-2.5 flex-1">
            <button className="md:hidden p-2 text-textPrimary bg-background rounded-lg border border-cardAccent" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon size={20} />
            </button>
            <button onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 text-secondary bg-background rounded-lg border border-cardAccent hover:text-primary transition-colors">
              {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <h2 className="text-base font-black text-textPrimary truncate max-w-[160px] md:max-w-none">{getPageTitle()}</h2>
            <button onClick={() => setIsCommandOpen(true)}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 bg-background border border-cardAccent rounded-lg text-secondary hover:text-textPrimary transition-all">
              <Search size={12} />
              <span className="text-[9px] font-black uppercase">Ctrl+K</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-background text-secondary hover:text-primary transition-colors border border-cardAccent">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="p-2 rounded-lg bg-background text-secondary hover:text-primary transition-colors border border-cardAccent">
              <span className="text-[9px] font-bold uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
            </button>
            <div className="flex items-center gap-2 bg-background px-2.5 py-1.5 rounded-lg border border-cardAccent">
              <div className="hidden sm:block text-right">
                <p className="text-[11px] font-black text-textPrimary leading-tight">{user || 'Admin'}</p>
                <p className="text-[9px] text-secondary font-bold">{language === 'ar' ? roleLabel.ar : roleLabel.en}</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black border border-primary/20 shrink-0 text-xs">
                {user ? user.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {showCloseShiftModal && activeShift && (
        <Modal isOpen onClose={() => setShowCloseShiftModal(false)}>
          <Modal.Header title="إغلاق الوردية" subtitle={`وردية: ${activeShift.userName}`} />
          <Modal.Body>
            <div className="space-y-4">
              <div className="bg-background border border-cardAccent rounded-2xl p-3 space-y-1.5">
                <p className="text-[10px] font-black text-secondary uppercase">العهدة المتوقعة</p>
                <p className="text-2xl font-black text-primary">{(activeShift.startBalance + activeShift.totalSales).toFixed(2)} <span className="text-xs opacity-50">{language === 'ar' ? settings.currencyAr : settings.currencyEn}</span></p>
              </div>
              <div>
                <label className="text-[10px] font-black text-secondary uppercase block mb-1.5">العهدة الفعلية عند الإغلاق</label>
                <Input
                  autoFocus
                  type="number"
                  value={closingBalance}
                  onChange={e => setClosingBalance(e.target.value)}
                  className="h-12 text-base text-center font-black"
                  placeholder="أدخل قيمة العهدة"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" onClick={() => setShowCloseShiftModal(false)}>إلغاء</Button>
              <Button variant="danger" onClick={handleCloseShiftAndLogout}>إغلاق الوردية وتسجيل الخروج</Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Layout;
