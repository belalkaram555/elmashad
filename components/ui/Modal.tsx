
import React, { createContext, useContext } from 'react';
import { XCircle } from 'lucide-react';

interface ModalContextType {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="bg-surface rounded-[32px] border border-cardAccent w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in duration-300 max-h-[calc(100vh-2rem)]">
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

Modal.Header = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const { onClose } = useContext(ModalContext)!;
  return (
    <div className="p-6 border-b border-cardAccent flex justify-between items-center bg-background/20">
      <div>
        <h3 className="text-lg font-black text-textPrimary">{title}</h3>
        {subtitle && <p className="text-[10px] text-secondary font-bold">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="p-1.5 text-secondary hover:text-textPrimary transition-colors">
        <XCircle size={22} />
      </button>
    </div>
  );
};

Modal.Body = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <div className={`p-6 overflow-y-auto custom-scrollbar flex-1 text-textPrimary ${className}`}>
    {children}
  </div>
);

Modal.Footer = ({ children }: { children?: React.ReactNode }) => (
  <div className="p-6 border-t border-cardAccent bg-background/20">
    {children}
  </div>
);
