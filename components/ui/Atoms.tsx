
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-2xl';
  
  const variants = {
    primary: 'bg-primary text-white glow-primary hover:scale-[1.02]',
    secondary: 'bg-cardAccent text-textPrimary border border-cardAccent hover:bg-background',
    danger: 'bg-red-500 text-white shadow-lg shadow-red-900/20',
    success: 'bg-accentGreen text-white shadow-lg shadow-emerald-900/20',
    outline: 'bg-transparent border border-cardAccent text-secondary hover:text-textPrimary hover:border-primary/50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3.5 text-xs',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`w-full p-4 bg-background border border-cardAccent rounded-2xl text-textPrimary font-bold focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-secondary/50 ${className}`}
      {...props}
    />
  );
};

export const Badge: React.FC<{ children: React.ReactNode, variant?: 'primary' | 'danger' | 'success' }> = ({ children, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    danger: 'bg-red-500/10 text-red-500 border-red-500/20',
    success: 'bg-accentGreen/10 text-accentGreen border-accentGreen/20'
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-[9px] font-black border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const EmptyState: React.FC<{ icon: LucideIcon, title: string, description: string, actionLabel?: string, onAction?: () => void }> = ({ icon: Icon, title, description, actionLabel, onAction }) => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-surface rounded-[32px] flex items-center justify-center mb-6 border border-cardAccent shadow-inner">
            <Icon size={40} className="text-secondary opacity-30" />
        </div>
        <h3 className="text-xl font-black text-textPrimary mb-2">{title}</h3>
        <p className="text-secondary text-sm max-w-xs mb-8 leading-relaxed font-bold">{description}</p>
        {actionLabel && onAction && (
            <Button onClick={onAction} className="px-10">{actionLabel}</Button>
        )}
    </div>
);
