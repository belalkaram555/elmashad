
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
import { useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from './components/ui/ToastContainer';
import Layout from './components/Layout';
import { UserRole } from './types';
import { AlertTriangle, RefreshCw, WifiOff, ShieldAlert } from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Categories from './pages/Categories';
import Menu from './pages/Menu';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import StockMovement from './pages/Inventory/StockMovement';
import StockShortage from './pages/Inventory/StockShortage';
import Settings from './pages/Settings';
import SystemSettings from './pages/Settings/SystemSettings';
import UserManagement from './pages/Settings/UserManagement';
import Shifts from './pages/Shifts';
import Reports from './pages/Reports';
import PlayStation from './pages/Gaming/PlayStation';
import Billiard from './pages/Gaming/Billiard';
import AuditLogs from './pages/admin/AuditLogs';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const effectiveRole: UserRole = userRole === 'cashier' ? 'cashier' : 'admin';
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return <AccessDenied />;
  }
  return <Outlet />;
};

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-background text-textPrimary flex items-center justify-center p-6">
        <div className="bg-surface border border-cardAccent rounded-2xl p-8 max-w-lg text-center">
          <AlertTriangle className="mx-auto text-red-400 mb-4" size={36} />
          <h1 className="text-2xl font-black mb-2">حدث خطأ غير متوقع</h1>
          <p className="text-secondary text-sm mb-5">{this.state.error.message}</p>
          <button onClick={() => window.location.reload()} className="bg-primary text-background px-5 py-3 rounded-xl font-black">
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }
}

const AccessDenied = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-6">
    <div className="bg-surface border border-cardAccent rounded-2xl p-8 max-w-lg text-center">
      <ShieldAlert className="mx-auto text-orange-400 mb-4" size={36} />
      <h1 className="text-2xl font-black mb-2">غير مصرح بالدخول</h1>
      <p className="text-secondary text-sm">الحساب الحالي لا يملك صلاحية فتح هذه الصفحة.</p>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen bg-background text-textPrimary flex items-center justify-center p-6">
    <div className="bg-surface border border-cardAccent rounded-2xl p-8 max-w-lg text-center">
      <AlertTriangle className="mx-auto text-primary mb-4" size={36} />
      <h1 className="text-2xl font-black mb-2">الصفحة غير موجودة</h1>
      <p className="text-secondary text-sm mb-5">الرابط المطلوب غير موجود داخل النظام.</p>
      <a href="#/" className="inline-block bg-primary text-background px-5 py-3 rounded-xl font-black">العودة للرئيسية</a>
    </div>
  </div>
);

const DataStatusGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, loadError, isUsingOfflineData, refreshData, syncStatus } = useData();
  const hasPendingOfflineWrites = syncStatus.pendingCount > 0;
  const shouldShowOfflineWriteNotice = !syncStatus.online || hasPendingOfflineWrites;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-textPrimary flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-primary mb-3" size={32} />
          <p className="font-black">جاري تحميل البيانات من قاعدة البيانات...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      {(loadError || isUsingOfflineData) && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[300] bg-surface border border-orange-400/30 text-textPrimary rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 max-w-[92vw]">
          <WifiOff className="text-orange-400" size={18} />
          <span className="text-sm font-bold">{loadError || 'أنت تعمل الآن على بيانات محفوظة مؤقتا.'}</span>
          <button onClick={() => void refreshData()} className="text-primary text-sm font-black">إعادة المحاولة</button>
        </div>
      )}
      {shouldShowOfflineWriteNotice && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] bg-[#1f2937] text-white border border-orange-400/40 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3 max-w-[94vw]">
          <WifiOff className="text-orange-300 shrink-0" size={20} />
          <div className="text-sm font-bold leading-relaxed">
            {syncStatus.syncing
              ? 'جاري مزامنة البيانات المحفوظة أوفلاين مع السيرفر...'
              : 'يتم التسجيل أوفلاين حاليا لحين الاتصال بالسيرفر.'}
            {hasPendingOfflineWrites && (
              <span className="block text-xs text-orange-100 mt-0.5">
                عدد العمليات المنتظرة للمزامنة: {syncStatus.pendingCount}
              </span>
            )}
          </div>
        </div>
      )}
      {children}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <DataProvider>
            <AppErrorBoundary>
            <DataStatusGate>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Layout />}>

                    {/* Dashboard */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route index element={<Dashboard />} />
                    </Route>

                    {/* POS */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier']} />}>
                      <Route path="pos" element={<POS />} />
                    </Route>

                    {/* POS Management (Admin only) */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="pos/shifts" element={<Shifts />} />
                      <Route path="pos/reports" element={<Reports />} />
                    </Route>

                    {/* Menu & Categories */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="menu" element={<Menu />} />
                      <Route path="categories" element={<Categories />} />
                    </Route>

                    {/* Customers & Suppliers */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="customers" element={<Customers />} />
                      <Route path="suppliers" element={<Suppliers />} />
                    </Route>

                    {/* Sales Invoices only */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier']} />}>
                      <Route path="invoices/sales" element={<Sales />} />
                      <Route path="invoices" element={<Sales />} />
                      <Route path="sales" element={<Sales />} />
                    </Route>

                    {/* Inventory balances */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier']} />}>
                      <Route path="inventory" element={<Inventory />} />
                    </Route>

                    {/* Inventory management (Admin only) */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="inventory/movement" element={<StockMovement />} />
                      <Route path="inventory/shortage" element={<StockShortage />} />
                    </Route>

                    {/* Gaming */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier']} />}>
                      <Route path="gaming/playstation" element={<PlayStation />} />
                      <Route path="gaming/billiard" element={<Billiard />} />
                    </Route>

                    {/* Settings */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                      <Route path="settings" element={<Settings />} />
                      <Route path="settings/system" element={<SystemSettings />} />
                      <Route path="settings/users" element={<UserManagement />} />
                    </Route>

                    {/* Audit Logs (Admin & Cashier) */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier']} />}>
                      <Route path="settings/audit" element={<AuditLogs />} />
                    </Route>

                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            </DataStatusGate>
            </AppErrorBoundary>
            <ToastContainer />
          </DataProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
