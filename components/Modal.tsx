
import React from 'react';
import Card from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
        '2xl': 'max-w-2xl',
    };
    
    const isScrollable = size === '2xl';

    return (
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex p-4 print:hidden ${
            isScrollable ? 'justify-center items-start overflow-y-auto' : 'justify-center items-center'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <Card 
            title={title}
            className={`w-full ${sizeClasses[size]} relative ${isScrollable ? 'my-8' : ''}`}
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-2xl font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Close"
          >&times;</button>
          {children}
        </Card>
      </div>
    );
};

export default Modal;
