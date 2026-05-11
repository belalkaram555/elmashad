import React, { useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Employee } from '../../types';

const roles = [
  { id: 'admin', ar: 'مدير النظام', en: 'Admin' },
  { id: 'manager', ar: 'مدير', en: 'Manager' },
  { id: 'accountant', ar: 'محاسب', en: 'Accountant' },
  { id: 'cashier', ar: 'كاشير', en: 'Cashier' },
  { id: 'chef', ar: 'شيف', en: 'Chef' },
];

const emptyForm = { name: '', username: '', phone: '', role: 'cashier', password: '' };

const UserManagement: React.FC = () => {
  const { language } = useLanguage();
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const filtered = employees.filter(user =>
    user.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone || '').includes(searchQuery)
  );

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(user => user.status === 'active').length,
  }), [employees]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (user: Employee) => {
    setEditingUser(user);
    setFormData({
      name: user.nameAr || user.nameEn || '',
      username: user.username || '',
      phone: user.phone || '',
      role: user.role || 'cashier',
      password: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(emptyForm);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.username.trim()) return;

    if (editingUser) {
      updateEmployee({
        ...editingUser,
        nameAr: formData.name.trim(),
        nameEn: formData.name.trim(),
        role: formData.role,
        phone: formData.phone.trim(),
        username: formData.username.trim().toLowerCase(),
        password: formData.password.trim() || editingUser.password,
      });
      closeModal();
      return;
    }

    if (!formData.password.trim()) return;
    const employee: Employee = {
      id: `emp-${Date.now()}`,
      nameAr: formData.name.trim(),
      nameEn: formData.name.trim(),
      role: formData.role,
      baseSalary: 0,
      penaltyDays: 0,
      absenceDays: 0,
      bonuses: 0,
      insurance: 0,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      shiftStart: '09:00',
      shiftEnd: '17:00',
      phone: formData.phone.trim(),
      username: formData.username.trim().toLowerCase(),
      password: formData.password,
    };
    addEmployee(employee);
    closeModal();
  };

  const toggleActive = (user: Employee) => {
    updateEmployee({ ...user, status: user.status === 'active' ? 'inactive' : 'active' });
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'ar' ? 'حذف المستخدم؟' : 'Delete user?')) deleteEmployee(id);
  };

  return (
    <div className="space-y-8 pb-12 font-cairo">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-black text-textPrimary">{language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input type="text" placeholder={language === 'ar' ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-surface border border-cardAccent rounded-2xl py-3 px-12 text-sm font-bold text-textPrimary w-56" />
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl glow-primary font-black text-sm">
            <Plus size={20} />{language === 'ar' ? 'مستخدم جديد' : 'New User'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}</p><p className="text-2xl font-black text-textPrimary">{stats.total}</p></div>
        <div className="bg-surface p-6 rounded-3xl border border-cardAccent"><p className="text-secondary text-xs font-bold">{language === 'ar' ? 'مستخدمين نشطين' : 'Active Users'}</p><p className="text-2xl font-black text-accentGreen">{stats.active}</p></div>
      </div>

      <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-cardAccent bg-background/50">
            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الاسم' : 'Name'}</th>
            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'اسم الدخول' : 'Username'}</th>
            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الصلاحية' : 'Role'}</th>
            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'الحالة' : 'Status'}</th>
            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-secondary">{language === 'ar' ? 'لا يوجد مستخدمين' : 'No users'}</td></tr> :
              filtered.map(user => (
                <tr key={user.id} className="border-b border-cardAccent/50 hover:bg-background/30">
                  <td className="p-5 font-black text-textPrimary">{user.nameAr}</td>
                  <td className="p-5 text-secondary">{user.username || '-'}</td>
                  <td className="p-5 text-center"><span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary">{roles.find(r => r.id === user.role)?.[language === 'ar' ? 'ar' : 'en'] || user.role}</span></td>
                  <td className="p-5 text-center"><button onClick={() => toggleActive(user)} className={`px-3 py-1 rounded-full text-xs font-black ${user.status === 'active' ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-500/10 text-red-500'}`}>{user.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}</button></td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditModal(user)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-background transition-all" title={language === 'ar' ? 'تعديل' : 'Edit'}><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title={language === 'ar' ? 'حذف' : 'Delete'}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
        <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10">
          <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-textPrimary">{editingUser ? (language === 'ar' ? 'تعديل مستخدم' : 'Edit User') : (language === 'ar' ? 'مستخدم جديد' : 'New User')}</h3><button onClick={closeModal} className="text-secondary"><XCircle size={32} /></button></div>
          <div className="space-y-4">
            <input placeholder={language === 'ar' ? 'الاسم' : 'Name'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <input placeholder={language === 'ar' ? 'اسم الدخول' : 'Username'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
            <input placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone'} className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            <input placeholder={editingUser ? (language === 'ar' ? 'كلمة مرور جديدة (اختياري)' : 'New password (optional)') : (language === 'ar' ? 'كلمة المرور' : 'Password')} type="password" className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <select className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>{roles.map(r => <option key={r.id} value={r.id}>{language === 'ar' ? r.ar : r.en}</option>)}</select>
            <button onClick={handleSave} className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary">{editingUser ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة' : 'Add')}</button>
          </div>
        </div>
      </div>}
    </div>
  );
};

export default UserManagement;
