// الموارد البشرية - الحضور والانصراف
// متابعة مواعيد العمل والانضباط

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Plus, XCircle, Calendar,
    CheckCircle, XIcon, AlertCircle
} from 'lucide-react';

interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: 'present' | 'absent' | 'late' | 'leave';
    notes?: string;
}

const Attendance: React.FC = () => {
    const { employees } = useData();
    const { language } = useLanguage();

    const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
        const saved = localStorage.getItem('attendance_records');
        return saved ? JSON.parse(saved) : [];
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState({
        employeeId: '',
        checkIn: '',
        checkOut: '',
        status: 'present' as AttendanceRecord['status'],
        notes: ''
    });

    const saveAttendance = (records: AttendanceRecord[]) => {
        localStorage.setItem('attendance_records', JSON.stringify(records));
        setAttendance(records);
    };

    // حضور اليوم المحدد
    const todayAttendance = useMemo(() => {
        return attendance.filter(a => a.date === selectedDate);
    }, [attendance, selectedDate]);

    // الموظفين الذين لم يحضروا بعد
    const absentEmployees = useMemo(() => {
        const presentIds = todayAttendance.map(a => a.employeeId);
        return employees.filter(e => !presentIds.includes(e.id));
    }, [employees, todayAttendance]);

    // إحصائيات اليوم
    const stats = useMemo(() => ({
        present: todayAttendance.filter(a => a.status === 'present').length,
        late: todayAttendance.filter(a => a.status === 'late').length,
        absent: absentEmployees.length,
        leave: todayAttendance.filter(a => a.status === 'leave').length
    }), [todayAttendance, absentEmployees]);

    // تسجيل حضور
    const handleAdd = () => {
        if (!formData.employeeId) {
            alert(language === 'ar' ? 'يرجى اختيار الموظف' : 'Please select employee');
            return;
        }

        // التحقق من عدم تسجيل نفس الموظف
        const exists = attendance.some(a =>
            a.employeeId === formData.employeeId && a.date === selectedDate
        );
        if (exists) {
            alert(language === 'ar' ? 'تم تسجيل حضور هذا الموظف مسبقاً' : 'This employee already has attendance record for today');
            return;
        }

        const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            employeeId: formData.employeeId,
            date: selectedDate,
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
            status: formData.status,
            notes: formData.notes
        };

        saveAttendance([...attendance, newRecord]);
        closeModal();
    };

    // تسجيل حضور سريع
    const quickCheckIn = (employeeId: string) => {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            employeeId,
            date: selectedDate,
            checkIn: time,
            status: 'present'
        };

        saveAttendance([...attendance, newRecord]);
    };

    // تسجيل انصراف
    const quickCheckOut = (recordId: string) => {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        saveAttendance(attendance.map(a =>
            a.id === recordId ? { ...a, checkOut: time } : a
        ));
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ employeeId: '', checkIn: '', checkOut: '', status: 'present', notes: '' });
    };

    const getEmployeeDisplayName = (employee: any) => {
        if (!employee) return '-';
        return language === 'ar'
            ? (employee.nameAr || employee.nameEn || employee.name || '-')
            : (employee.nameEn || employee.nameAr || employee.name || '-');
    };

    const getEmployeeName = (id: string) => {
        const emp = employees.find(e => e.id === id);
        return getEmployeeDisplayName(emp);
    };

    const getStatusColor = (status: AttendanceRecord['status']) => {
        switch (status) {
            case 'present': return 'bg-accentGreen/10 text-accentGreen';
            case 'late': return 'bg-primary/10 text-primary';
            case 'absent': return 'bg-red-500/10 text-red-500';
            case 'leave': return 'bg-accentBlue/10 text-accentBlue';
            default: return 'bg-secondary/10 text-secondary';
        }
    };

    const getStatusName = (status: AttendanceRecord['status']) => {
        const names = {
            present: language === 'ar' ? 'حاضر' : 'Present',
            late: language === 'ar' ? 'متأخر' : 'Late',
            absent: language === 'ar' ? 'غائب' : 'Absent',
            leave: language === 'ar' ? 'إجازة' : 'Leave'
        };
        return names[status];
    };

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'الحضور والانصراف' : 'Attendance'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'متابعة مواعيد العمل والانضباط' : 'Track work schedules and punctuality'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-surface border border-cardAccent rounded-2xl py-3 px-4 text-sm font-bold text-textPrimary"
                    />

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                        <Plus size={20} />
                        {language === 'ar' ? 'تسجيل حضور' : 'Record Attendance'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'حاضرين' : 'Present'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.present}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <AlertCircle className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'متأخرين' : 'Late'}</p>
                            <p className="text-2xl font-black text-primary">{stats.late}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <XIcon className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'غائبين' : 'Absent'}</p>
                            <p className="text-2xl font-black text-red-500">{stats.absent}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Calendar className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجازات' : 'On Leave'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.leave}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* سجل الحضور اليوم */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <div className="p-6 border-b border-cardAccent bg-background/30 flex justify-between items-center">
                    <h3 className="font-black text-textPrimary text-lg">
                        {language === 'ar' ? 'سجل الحضور' : 'Attendance Record'} - {new Date(selectedDate).toLocaleDateString('ar-EG')}
                    </h3>
                    <span className="text-secondary text-sm font-bold">
                        {employees.length} {language === 'ar' ? 'موظف' : 'employees'}
                    </span>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الموظف' : 'Employee'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحضور' : 'Check In'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الانصراف' : 'Check Out'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* الموظفين الحاضرين */}
                        {todayAttendance.map(record => (
                            <tr key={record.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-accentGreen/10 flex items-center justify-center font-black text-lg text-accentGreen border border-accentGreen/20">
                                            {getEmployeeName(record.employeeId).charAt(0)}
                                        </div>
                                        <span className="font-black text-textPrimary">{getEmployeeName(record.employeeId)}</span>
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="font-bold text-accentGreen">{record.checkIn || '-'}</span>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="font-bold text-red-400">{record.checkOut || '-'}</span>
                                </td>
                                <td className="p-5 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(record.status)}`}>
                                        {getStatusName(record.status)}
                                    </span>
                                </td>
                                <td className="p-5 text-center">
                                    {!record.checkOut && (
                                        <button
                                            onClick={() => quickCheckOut(record.id)}
                                            className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            {language === 'ar' ? 'تسجيل انصراف' : 'Check Out'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {/* الموظفين الغائبين */}
                        {absentEmployees.map(emp => (
                            <tr key={emp.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors bg-red-500/5">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center font-black text-lg text-red-500 border border-red-500/20">
                                            {getEmployeeDisplayName(emp).charAt(0)}
                                        </div>
                                        <span className="font-black text-textPrimary">{getEmployeeDisplayName(emp)}</span>
                                    </div>
                                </td>
                                <td className="p-5 text-center"><span className="text-secondary">-</span></td>
                                <td className="p-5 text-center"><span className="text-secondary">-</span></td>
                                <td className="p-5 text-center">
                                    <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500/10 text-red-500">
                                        {language === 'ar' ? 'غائب' : 'Absent'}
                                    </span>
                                </td>
                                <td className="p-5 text-center">
                                    <button
                                        onClick={() => quickCheckIn(emp.id)}
                                        className="px-4 py-2 bg-accentGreen/10 text-accentGreen rounded-xl text-sm font-bold hover:bg-accentGreen hover:text-white transition-all"
                                    >
                                        {language === 'ar' ? 'تسجيل حضور' : 'Check In'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                    <div className="bg-surface rounded-[40px] border border-cardAccent w-full max-w-lg shadow-2xl p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-textPrimary">
                                {language === 'ar' ? 'تسجيل حضور' : 'Record Attendance'}
                            </h3>
                            <button onClick={closeModal} className="text-secondary hover:text-textPrimary transition-colors">
                                <XCircle size={32} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الموظف' : 'Employee'} *
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.employeeId}
                                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                >
                                    <option value="">{language === 'ar' ? 'اختر الموظف...' : 'Select Employee...'}</option>
                                    {absentEmployees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{getEmployeeDisplayName(emp)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'وقت الحضور' : 'Check In'}
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.checkIn}
                                        onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                        {language === 'ar' ? 'وقت الانصراف' : 'Check Out'}
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                        value={formData.checkOut}
                                        onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'الحالة' : 'Status'}
                                </label>
                                <select
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as AttendanceRecord['status'] })}
                                >
                                    <option value="present">{language === 'ar' ? 'حاضر' : 'Present'}</option>
                                    <option value="late">{language === 'ar' ? 'متأخر' : 'Late'}</option>
                                    <option value="leave">{language === 'ar' ? 'إجازة' : 'Leave'}</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">
                                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                                </label>
                                <input
                                    className="w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:border-primary outline-none"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleAdd}
                                className="w-full bg-primary text-background py-5 rounded-2xl font-black text-lg glow-primary mt-4 hover:scale-[1.02] transition-transform"
                            >
                                {language === 'ar' ? 'تسجيل الحضور' : 'Record Attendance'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
