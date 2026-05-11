
import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, Archive, Users, Settings,
  BarChart3, UtensilsCrossed, Landmark, Wallet, Warehouse,
  ShieldCheck, Globe, Zap, Database, Smartphone, Laptop,
  ChevronRight, ChevronLeft, Layers, Cpu, Code2, Copyright
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Presentation: React.FC = () => {
  const { language } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "نظرة عامة على المشروع",
      subtitle: "M4D CAFE V2.5",
      description: "نظام إداري متكامل مصمم خصيصاً للمطاعم والمنشآت التجارية، يجمع بين البساطة في الاستخدام والتعقيد الهندسي في المعالجة.",
      icon: LayoutDashboard,
      color: "from-orange-400 to-red-500",
      features: ["واجهة مستخدم احترافية", "دعم كامل للغتين (AR/EN)", "أداء فائق السرعة", "تصميم متجاوب بالكامل"]
    },
    {
      title: "الهيكل الهندسي والتقني",
      subtitle: "The Technical Stack",
      description: "تم بناء النظام باستخدام أحدث التقنيات لضمان الاستقرار والأمان.",
      icon: Cpu,
      color: "from-blue-400 to-cyan-500",
      features: ["React 19 & TypeScript", "Context API State Management", "Tailwind CSS Design System", "Local Persistence (Offline First)"]
    },
    {
      title: "محرك المبيعات (POS)",
      subtitle: "Advanced Point of Sale",
      description: "نظام بيع ذكي يدعم العمليات المعقدة في ثوانٍ معدودة.",
      icon: ShoppingCart,
      color: "from-green-400 to-emerald-600",
      features: ["تعدد الأحجام والأنواع (Variants)", "إضافات مخصصة لكل صنف (Add-ons)", "دعم الطاولات، السفري والتوصيل", "طباعة فواتير حرارية متوافقة مع معايير الزكاة"]
    },
    {
      title: "إدارة المخزون والمستودعات",
      subtitle: "Inventory Intelligence",
      description: "تتبع دقيق لكل جرام من المواد الخام عبر مواقع تخزين متعددة.",
      icon: Archive,
      color: "from-purple-400 to-indigo-600",
      features: ["تنبيهات الحد الأدنى للمخزون", "تحويلات بين المستودعات", "تتبع حركة الصنف (Stock Movement)", "ربط المشتريات بتكلفة الوحدة"]
    },
    {
      title: "الموارد البشرية والرواتب",
      subtitle: "HR & Payroll Engine",
      description: "إدارة كاملة للكادر الوظيفي وحساباتهم المالية.",
      icon: Users,
      color: "from-pink-400 to-rose-600",
      features: ["تسجيل حضور وانصراف ذكي", "مسيرات رواتب آلية", "إدارة السلف والجزاءات", "تتبع المكافآت الشهرية"]
    },
    {
      title: "الخزينة والذكاء المالي",
      subtitle: "Financial Intelligence",
      description: "تقارير مالية فورية تعكس حالة المنشأة بكل دقة.",
      icon: Landmark,
      color: "from-amber-400 to-orange-600",
      features: ["سندات قبض وصرف فورية", "تتبع ديون العملاء والموردين", "تقارير أرباح وخسائر", "تحليل توزيع القائمة مبيعاً"]
    }
  ];

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const currentSlide = slides[activeSlide];

  return (
    <div className="min-h-full flex flex-col items-center justify-center py-10 px-4 font-cairo overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accentBlue/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 mb-20">

        {/* Left Side: Content */}
        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <Zap size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">System Overview</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              {currentSlide.title}
            </h1>
            <h2 className={`text-xl md:text-2xl font-black bg-gradient-to-l ${currentSlide.color} bg-clip-text text-transparent`}>
              {currentSlide.subtitle}
            </h2>
            <p className="text-secondary text-lg leading-relaxed max-w-xl">
              {currentSlide.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSlide.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-surface p-4 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentSlide.color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                  <ShieldCheck size={18} />
                </div>
                <span className="text-sm font-bold text-white/90">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-8">
            <div className="flex gap-3">
              <button onClick={prevSlide} className="p-4 bg-surface rounded-2xl border border-white/5 text-white hover:bg-primary hover:text-background transition-all">
                <ChevronRight size={24} />
              </button>
              <button onClick={nextSlide} className="p-4 bg-surface rounded-2xl border border-white/5 text-white hover:bg-primary hover:text-background transition-all">
                <ChevronLeft size={24} />
              </button>
            </div>
            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeSlide ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Visual representation */}
        <div className="hidden lg:flex justify-center items-center animate-in zoom-in fade-in duration-1000">
          <div className="relative w-full aspect-square max-w-md">
            <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.color} rounded-[60px] opacity-20 blur-[80px] animate-pulse`} />
            <div className="relative bg-surface rounded-[60px] border border-white/10 p-12 shadow-2xl flex items-center justify-center">
              <currentSlide.icon size={200} className={`text-transparent bg-gradient-to-br ${currentSlide.color} bg-clip-text opacity-80`} />

              {/* Floating icons */}
              <div className="absolute top-10 left-10 p-4 bg-background/80 rounded-2xl border border-white/10 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                <Code2 className="text-primary" size={24} />
              </div>
              <div className="absolute bottom-10 right-10 p-4 bg-background/80 rounded-2xl border border-white/10 shadow-xl animate-bounce" style={{ animationDuration: '4s' }}>
                <Database className="text-accentBlue" size={24} />
              </div>
              <div className="absolute top-1/2 -right-8 p-4 bg-background/80 rounded-2xl border border-white/10 shadow-xl animate-pulse">
                <Globe className="text-accentGreen" size={24} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Developer Credits Footer */}
      <div className="w-full bg-surface/50 border-t border-white/5 py-8 mt-auto backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-background font-black text-xl shadow-lg glow-primary">
              B
            </div>
            <div>
              <h3 className="text-white font-black text-lg">Developed by <a href="https://belalkaram.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Eng. Belal Karam</a></h3>
              <p className="text-secondary text-xs font-bold uppercase tracking-widest">Lead Software Architect</p>
            </div>
          </div>

          <div className="flex gap-8 opacity-50">
            <div className="flex items-center gap-2 text-white font-bold text-xs"><Layers size={14} /> v2.5.0</div>
            <div className="flex items-center gap-2 text-white font-bold text-xs"><Copyright size={14} /> 2025 All Rights Reserved</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Presentation;
