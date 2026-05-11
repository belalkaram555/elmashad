// @ts-nocheck

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Utensils, X, CheckCircle } from 'lucide-react';

const Tables: React.FC = () => {
  const { tables, addTable, deleteTable } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCap, setNewTableCap] = useState(4);

  const handleAddTable = () => {
      if(!newTableName) return;
      addTable({
          id: Date.now().toString(),
          name: newTableName,
          capacity: newTableCap,
          status: 'available'
      });
      setShowAdd(false);
      setNewTableName('');
  };

  const handleTableClick = (tableId: string) => {
      // Navigate to POS with this table ID pre-selected
      // We'll use state in navigation or just url param? Let's use localstorage for simplicity to pass intent
      localStorage.setItem('selectedTableId', tableId);
      navigate('/pos');
  };

  return (
    <div className="space-y-8 font-cairo pb-12">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-black text-white">إدارة الطاولات</h2>
                <p className="text-secondary text-xs mt-1 font-bold">متابعة حالة الصالة وحجز الطلبات</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-primary text-background px-8 py-3.5 rounded-2xl hover:scale-105 transition-all glow-primary font-black text-sm">
                <Plus size={20} /> إضافة طاولة
            </button>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {tables.map(table => (
                <div 
                    key={table.id}
                    onClick={() => handleTableClick(table.id)}
                    className={`relative p-6 rounded-[32px] border transition-all cursor-pointer group hover:-translate-y-1 shadow-xl flex flex-col items-center justify-center aspect-square
                        ${table.status === 'available' ? 'bg-surface border-white/5 hover:border-accentGreen' : ''}
                        ${table.status === 'occupied' ? 'bg-red-500/10 border-red-500/20' : ''}
                        ${table.status === 'bill_requested' ? 'bg-yellow-500/10 border-yellow-500/20' : ''}
                    `}
                >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors
                        ${table.status === 'available' ? 'bg-background text-secondary group-hover:bg-accentGreen group-hover:text-white' : ''}
                        ${table.status === 'occupied' ? 'bg-red-500 text-white animate-pulse' : ''}
                    `}>
                        <Utensils size={28} />
                    </div>
                    
                    <h3 className="text-lg font-black text-white mb-1">{table.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-secondary">
                        <Users size={12} /> {table.capacity} مقاعد
                    </div>

                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full 
                        ${table.status === 'available' ? 'bg-accentGreen' : 'bg-red-500'}
                    `} />
                    
                    <button onClick={(e) => {e.stopPropagation(); deleteTable(table.id)}} className="absolute top-4 left-4 p-1.5 bg-background rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                </div>
            ))}
        </div>

        {showAdd && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
                <div className="bg-surface rounded-[40px] border border-white/10 w-full max-w-sm shadow-2xl p-8">
                    <h3 className="text-xl font-black text-white mb-6">إضافة طاولة جديدة</h3>
                    <div className="space-y-4">
                        <input className="w-full p-4 bg-background border border-white/5 rounded-2xl text-white font-bold" placeholder="اسم الطاولة (مثلاً: T-10)" value={newTableName} onChange={e => setNewTableName(e.target.value)} />
                        <div className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-white/5">
                            <Users className="text-secondary" />
                            <input type="number" className="bg-transparent w-full text-white font-bold outline-none" placeholder="السعة" value={newTableCap} onChange={e => setNewTableCap(Number(e.target.value))} />
                        </div>
                        <button onClick={handleAddTable} className="w-full bg-primary text-background py-4 rounded-2xl font-black text-lg mt-4">حفظ</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Tables;
