// فريق المبيعات - لوحة متابعة فريق المبيعات
// إحصائيات وأداء المندوبين

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    Users, TrendingUp, DollarSign, Target, Award,
    BarChart3, Calendar, User
} from 'lucide-react';

interface SalesAgent {
    id: string;
    name: string;
    phone: string;
    target: number;
    achieved: number;
    commission: number;
}

const SalesTeamDashboard: React.FC = () => {
    const { orders, settings } = useData();
    const { language } = useLanguage();
    const currency = language === 'ar' ? settings.currencyAr : settings.currencyEn;

    // بيانات المندوبين من localStorage
    const [agents] = useState<SalesAgent[]>(() => {
        const saved = localStorage.getItem('sales_agents');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'أحمد محمد', phone: '0501234567', target: 50000, achieved: 35000, commission: 1750 },
            { id: '2', name: 'سعيد علي', phone: '0559876543', target: 40000, achieved: 42000, commission: 2100 },
            { id: '3', name: 'خالد عبدالله', phone: '0567891234', target: 45000, achieved: 28000, commission: 1400 }
        ];
    });

    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('month');

    // إحصائيات عامة
    const stats = useMemo(() => {
        const totalTarget = agents.reduce((sum, a) => sum + a.target, 0);
        const totalAchieved = agents.reduce((sum, a) => sum + a.achieved, 0);
        const totalCommission = agents.reduce((sum, a) => sum + a.commission, 0);
        const achievementRate = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;

        return {
            totalAgents: agents.length,
            totalTarget,
            totalAchieved,
            totalCommission,
            achievementRate: achievementRate.toFixed(1)
        };
    }, [agents]);

    // أفضل مندوب
    const topAgent = useMemo(() => {
        return agents.reduce((best, a) => a.achieved > best.achieved ? a : best, agents[0]);
    }, [agents]);

    return (
        <div className="space-y-8 pb-12 font-cairo">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-textPrimary">
                        {language === 'ar' ? 'لوحة فريق المبيعات' : 'Sales Team Dashboard'}
                    </h2>
                    <p className="text-secondary text-xs mt-1 font-bold">
                        {language === 'ar' ? 'متابعة أداء المندوبين والأهداف' : 'Track agent performance and targets'}
                    </p>
                </div>

                <div className="flex bg-surface rounded-xl border border-cardAccent p-1">
                    <button
                        onClick={() => setSelectedPeriod('today')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedPeriod === 'today' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
                    >
                        {language === 'ar' ? 'اليوم' : 'Today'}
                    </button>
                    <button
                        onClick={() => setSelectedPeriod('week')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedPeriod === 'week' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
                    >
                        {language === 'ar' ? 'الأسبوع' : 'Week'}
                    </button>
                    <button
                        onClick={() => setSelectedPeriod('month')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedPeriod === 'month' ? 'bg-primary text-background' : 'text-secondary hover:text-textPrimary'}`}
                    >
                        {language === 'ar' ? 'الشهر' : 'Month'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Users className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'عدد المندوبين' : 'Total Agents'}</p>
                            <p className="text-2xl font-black text-textPrimary">{stats.totalAgents}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center">
                            <Target className="text-accentBlue" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي الأهداف' : 'Total Targets'}</p>
                            <p className="text-2xl font-black text-accentBlue">{stats.totalTarget.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-accentGreen/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-accentGreen" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي المحقق' : 'Total Achieved'}</p>
                            <p className="text-2xl font-black text-accentGreen">{stats.totalAchieved.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-3xl border border-cardAccent">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <DollarSign className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-secondary text-xs font-bold">{language === 'ar' ? 'إجمالي العمولات' : 'Total Commission'}</p>
                            <p className="text-2xl font-black text-primary">{stats.totalCommission.toLocaleString()} {currency}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievement Rate & Top Agent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* معدل الإنجاز */}
                <div className="bg-surface p-8 rounded-[32px] border border-cardAccent">
                    <h3 className="font-black text-textPrimary text-lg mb-6">
                        {language === 'ar' ? 'معدل تحقيق الأهداف' : 'Achievement Rate'}
                    </h3>
                    <div className="flex items-center justify-center">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="96" cy="96" r="88" className="stroke-cardAccent fill-none" strokeWidth="12" />
                                <circle
                                    cx="96" cy="96" r="88"
                                    className={`fill-none ${Number(stats.achievementRate) >= 100 ? 'stroke-accentGreen' : 'stroke-primary'}`}
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(Number(stats.achievementRate) / 100) * 553} 553`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-black text-textPrimary">{stats.achievementRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* أفضل مندوب */}
                <div className="bg-surface p-8 rounded-[32px] border border-cardAccent">
                    <h3 className="font-black text-textPrimary text-lg mb-6 flex items-center gap-2">
                        <Award className="text-primary" size={20} />
                        {language === 'ar' ? 'أفضل مندوب' : 'Top Agent'}
                    </h3>
                    {topAgent && (
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center font-black text-3xl text-background">
                                {topAgent.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-textPrimary text-xl">{topAgent.name}</h4>
                                <p className="text-secondary text-sm mb-3">{topAgent.phone}</p>
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-[10px] text-secondary font-bold uppercase">{language === 'ar' ? 'المحقق' : 'Achieved'}</p>
                                        <p className="text-lg font-black text-accentGreen">{topAgent.achieved.toLocaleString()} {currency}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-secondary font-bold uppercase">{language === 'ar' ? 'النسبة' : 'Rate'}</p>
                                        <p className="text-lg font-black text-primary">{((topAgent.achieved / topAgent.target) * 100).toFixed(0)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Agents List */}
            <div className="bg-surface rounded-[32px] border border-cardAccent overflow-hidden">
                <div className="p-6 border-b border-cardAccent bg-background/30">
                    <h3 className="font-black text-textPrimary text-lg">
                        {language === 'ar' ? 'أداء المندوبين' : 'Agent Performance'}
                    </h3>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-cardAccent bg-background/50">
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المندوب' : 'Agent'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'الهدف' : 'Target'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'المحقق' : 'Achieved'}</th>
                            <th className="text-center p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'النسبة' : 'Rate'}</th>
                            <th className="text-right p-5 text-[10px] font-black text-secondary uppercase tracking-widest">{language === 'ar' ? 'العمولة' : 'Commission'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map(agent => {
                            const rate = (agent.achieved / agent.target) * 100;
                            return (
                                <tr key={agent.id} className="border-b border-cardAccent/50 hover:bg-background/30 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-lg text-primary border border-primary/20">
                                                {agent.name.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="font-black text-textPrimary block">{agent.name}</span>
                                                <span className="text-xs text-secondary">{agent.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="font-bold text-secondary">{agent.target.toLocaleString()} {currency}</span></td>
                                    <td className="p-5"><span className="font-black text-accentGreen">{agent.achieved.toLocaleString()} {currency}</span></td>
                                    <td className="p-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-20 h-2 bg-cardAccent rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${rate >= 100 ? 'bg-accentGreen' : rate >= 70 ? 'bg-primary' : 'bg-red-500'}`}
                                                    style={{ width: `${Math.min(rate, 100)}%` }}
                                                />
                                            </div>
                                            <span className={`font-black text-sm ${rate >= 100 ? 'text-accentGreen' : 'text-textPrimary'}`}>
                                                {rate.toFixed(0)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="font-black text-primary">{agent.commission.toLocaleString()} {currency}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesTeamDashboard;
