
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import {
  UserPlus, Clock, XCircle, Edit3, Trash2, Wallet, Plus,
  CalendarPlus, FileText, Phone, Eye, ShieldCheck,
  User as UserIcon, Lock, Check, ShieldAlert, Key, Shield,
  LayoutGrid, List
} from 'lucide-react';
import { Employee, Loan, AttendanceRecord, UserRole } from '../types';

type Tab = 'list' | 'attendance' | 'loans' | 'payroll';

// Role definitions with Arabic and English labels
const EMPLOYEE_ROLES = [
  { value: 'admin', labelAr: 'مدير النظام', labelEn: 'Admin', icon: ShieldAlert, color: '#EA5455' },
  { value: 'manager', labelAr: 'مدير', labelEn: 'Manager', icon: Shield, color: '#FF9F43' },
  { value: 'accountant', labelAr: 'محاسب', labelEn: 'Accountant', icon: FileText, color: '#00CFDE' },
  { value: 'cashier', labelAr: 'كاشير', labelEn: 'Cashier', icon: Wallet, color: '#28C76F' },
  { value: 'chef', labelAr: 'شيف', labelEn: 'Chef', icon: UserIcon, color: '#7367F0' },
];

const Employees: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, settings } = useData();
  const { t, language } = useLanguage();
  const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formEmployee, setFormEmployee] = useState<Partial<Employee>>({
    nameAr: '',
    nameEn: '',
    role: 'cashier',
    baseSalary: 0,
    phone: '',
    status: 'active',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    username: '',
    password: ''
  });

  const handleOpenAdd = () => {
    setFormEmployee({
      nameAr: '', nameEn: '', role: 'cashier', baseSalary: 0, phone: '',
      status: 'active', shiftStart: '09:00', shiftEnd: '17:00',
      username: '', password: ''
    });
    setIsEdit(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setFormEmployee(emp);
    setIsEdit(true);
    setShowAddModal(true);
  };

  const handleSaveEmployee = () => {
    if (!formEmployee.nameAr || !formEmployee.role) {
      alert(language === 'ar' ? 'يرجى إكمال البيانات الأساسية' : 'Please complete basic info');
      return;
    }

    if (!formEmployee.username || !formEmployee.password) {
      alert(language === 'ar' ? 'يرجى إدخال بيانات الدخول (اسم المستخدم وكلمة المرور)' : 'Please enter login credentials');
      return;
    }

    if (isEdit && formEmployee.id) {
      updateEmployee(formEmployee as Employee);
    } else {
      const newEmp: Employee = {
        ...formEmployee as Employee,
        id: Date.now().toString(),
        nameEn: formEmployee.nameEn || formEmployee.nameAr!,
        penaltyDays: 0,
        absenceDays: 0,
        bonuses: 0,
        insurance: 0,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      addEmployee(newEmp);
    }

    setShowAddModal(false);
  };

  // Get role info helper
  const getRoleInfo = (roleValue: string) => {
    return EMPLOYEE_ROLES.find(r => r.value === roleValue) || EMPLOYEE_ROLES[3]; // default to cashier
  };

  return (
    <div className="space-y-8 font-cairo">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div>
          <h2 className="text-3xl font-black text-textPrimary">{t('employees')}</h2>
          <p className="text-secondary text-xs mt-1 font-bold">إدارة الكادر الوظيفي وبيانات الدخول</p>
        </div>

        <div className="flex gap-2 bg-surface p-1.5 rounded-[22px] border border-cardAccent overflow-x-auto max-w-full shadow-sm">
          {[
            { id: 'list', label: t('employees') },
            { id: 'attendance', label: 'الحضور' },
            { id: 'loans', label: 'السلف' },
            { id: 'payroll', label: 'الرواتب' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-[16px] text-xs font-black whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-background glow-primary' : 'text-secondary hover:text-textPrimary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-surface rounded-xl border border-cardAccent p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
              title="عرض شبكي"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
              title="عرض قائمة"
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-primary text-background px-8 py-3.5 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm"
          >
            <UserPlus size={18} /> {t('add')}
          </button>
        </div>
      </div>

      {activeTab === 'list' && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {employees.map(emp => {
            const roleInfo = getRoleInfo(emp.role);
            const RoleIcon = roleInfo.icon;
            return (
              <div key={emp.id} className="bg-surface p-8 rounded-[32px] border border-cardAccent hover:border-primary/40 transition-all group relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-20 h-20 rounded-[24px] bg-background flex items-center justify-center font-black text-3xl text-primary border border-cardAccent group-hover:scale-110 transition-transform shadow-inner">
                    {emp.nameEn.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-textPrimary text-xl mb-1 truncate">{language === 'ar' ? emp.nameAr : emp.nameEn}</h3>

                    {/* Role Badge */}
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black mt-1"
                      style={{
                        backgroundColor: `${roleInfo.color}15`,
                        color: roleInfo.color,
                        border: `1px solid ${roleInfo.color}30`
                      }}
                    >
                      <RoleIcon size={12} />
                      {language === 'ar' ? roleInfo.labelAr : roleInfo.labelEn}
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl w-fit border border-cardAccent mt-3">
                      <div className={`w-2 h-2 rounded-full ${emp.status === 'active' ? 'bg-accentGreen glow-primary' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-black text-textPrimary uppercase">{emp.status === 'active' ? t('active') : t('inactive')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center text-secondary border-t border-cardAccent pt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest mb-1">الراتب الأساسي</span>
                    <span className="text-textPrimary font-black text-lg">{emp.baseSalary.toLocaleString()} <span className="text-xs text-secondary">{currency}</span></span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(emp)} className="p-3 bg-background border border-cardAccent text-accentBlue rounded-xl hover:bg-accentBlue hover:text-white transition-all shadow-sm"><Edit3 size={16} /></button>
                    <button onClick={() => deleteEmployee(emp.id)} className="p-3 bg-background border border-cardAccent text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'list' && viewMode === 'list' && (
        <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden animate-in fade-in duration-500">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cardAccent bg-background/50">
                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">الموظف</th>
                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">الوظيفة</th>
                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">الراتب</th>
                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">الهاتف</th>
                <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">الحالة</th>
                <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const roleInfo = getRoleInfo(emp.role);
                const RoleIcon = roleInfo.icon;
                return (
                  <tr key={emp.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center font-black text-lg text-primary border border-cardAccent">
                          {emp.nameEn.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-textPrimary">{language === 'ar' ? emp.nameAr : emp.nameEn}</p>
                          <p className="text-xs text-secondary">{emp.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black"
                        style={{
                          backgroundColor: `${roleInfo.color}15`,
                          color: roleInfo.color,
                          border: `1px solid ${roleInfo.color}30`
                        }}
                      >
                        <RoleIcon size={12} />
                        {language === 'ar' ? roleInfo.labelAr : roleInfo.labelEn}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="font-black text-textPrimary">{emp.baseSalary.toLocaleString()}</span>
                      <span className="text-xs text-secondary mr-1">{currency}</span>
                    </td>
                    <td className="p-5">
                      <span className="text-secondary font-bold">{emp.phone || '-'}</span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${emp.status === 'active' ? 'bg-accentGreen' : 'bg-red-500'}`} />
                        <span className="text-xs font-black text-textPrimary">{emp.status === 'active' ? t('active') : t('inactive')}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenEdit(emp)} className="p-2.5 bg-background border border-cardAccent text-accentBlue rounded-lg hover:bg-accentBlue hover:text-white transition-all"><Edit3 size={14} /></button>
                        <button onClick={() => deleteEmployee(emp.id)} className="p-2.5 bg-background border border-cardAccent text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6 overflow-y-auto">
          <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-2xl shadow-2xl p-8 md:p-12 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-textPrimary">{isEdit ? 'تعديل بيانات الموظف' : t('addEmployee')}</h3>
                <p className="text-xs text-secondary font-bold mt-1">تحديث البيانات الأساسية ومعلومات الدخول</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-secondary hover:text-textPrimary transition-colors bg-background/50 p-2 rounded-xl"><XCircle size={28} /></button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('nameAr')}</label>
                  <input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formEmployee.nameAr} onChange={e => setFormEmployee({ ...formEmployee, nameAr: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('nameEn')}</label>
                  <input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formEmployee.nameEn} onChange={e => setFormEmployee({ ...formEmployee, nameEn: e.target.value })} placeholder="الاسم بالإنجليزي (اختياري)" />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2 flex items-center gap-2">
                  <Shield size={12} /> نوع الصلاحية / الوظيفة
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EMPLOYEE_ROLES.map(role => {
                    const RoleIcon = role.icon;
                    const isSelected = formEmployee.role === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setFormEmployee({ ...formEmployee, role: role.value })}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isSelected
                          ? 'border-primary bg-primary/10 shadow-lg scale-105'
                          : 'border-cardAccent hover:border-primary/50 bg-background'
                          }`}
                        style={isSelected ? { borderColor: role.color, backgroundColor: `${role.color}15` } : {}}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${role.color}20`, color: role.color }}
                        >
                          <RoleIcon size={20} />
                        </div>
                        <span className="text-xs font-black text-textPrimary">{language === 'ar' ? role.labelAr : role.labelEn}</span>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check size={16} style={{ color: role.color }} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('salary')}</label>
                  <input type="number" className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-black" value={formEmployee.baseSalary} onChange={e => setFormEmployee({ ...formEmployee, baseSalary: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('phone')}</label>
                  <input className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold" value={formEmployee.phone} onChange={e => setFormEmployee({ ...formEmployee, phone: e.target.value })} />
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                  <Key size={14} /> بيانات الدخول للنظام (إلزامية)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">اسم المستخدم</label>
                    <input
                      className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold"
                      value={formEmployee.username}
                      onChange={e => setFormEmployee({ ...formEmployee, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                      placeholder="مثال: ahmed123"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">كلمة المرور</label>
                    <input
                      type="password"
                      className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold"
                      value={formEmployee.password}
                      onChange={e => setFormEmployee({ ...formEmployee, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-secondary mt-4 text-center">
                  سيستخدم الموظف هذه البيانات لتسجيل الدخول للنظام بصلاحيات {getRoleInfo(formEmployee.role || 'cashier').labelAr}
                </p>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-cardAccent text-secondary py-5 rounded-2xl font-black text-lg"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveEmployee}
                className="flex-[2] bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary shadow-xl"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
