
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Terminal } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-cairo overflow-y-auto custom-scrollbar">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accentBlue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="bg-surface rounded-[40px] border border-white/5 w-full max-w-[480px] overflow-hidden shadow-2xl relative z-10">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center mx-auto mb-8 text-primary shadow-xl border border-primary/20 glow-primary">
            <Terminal size={40} />
          </div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">M4D CAFE</h2>
          <p className="text-secondary font-bold text-sm uppercase tracking-widest">{t('signInMsg')}</p>
        </div>

        <form onSubmit={handleLogin} className="px-12 pb-12 space-y-6">
          {error && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-2xl text-xs text-center font-black">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('username')}</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-background border border-white/5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-bold text-white placeholder:text-secondary/50"
                placeholder="أدخل اسم المستخدم"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary uppercase tracking-widest block mr-2">{t('password')}</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-background border border-white/5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-bold text-white placeholder:text-secondary/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className={`w-full bg-primary text-background py-5 rounded-2xl font-black text-lg shadow-xl glow-primary hover:scale-[1.02] transition-all active:scale-95 mt-6 ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? '...' : t('signIn')}
          </button>

          <p className="text-center text-[10px] font-black text-secondary pt-8 opacity-30">
            V 2.5 PREMIUM ACCOUNTING SYSTEM
          </p>

          
        </form>
      </div>
    </div>
  );
};

export default Login;
