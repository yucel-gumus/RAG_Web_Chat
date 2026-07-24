import React, { PropsWithChildren } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#2D1D19]/60 backdrop-blur-xs z-50 flex justify-center items-center p-4 transition-opacity animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FFEBD3] rounded-3xl shadow-xl border border-[#FFB6A6] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-[#FFB6A6]/40 border-b border-[#FFB6A6]/60">
          <h3 className="text-lg font-bold text-[#2D1D19]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#5D433E] hover:text-[#2D1D19] hover:bg-[#FFB6A6] p-2 rounded-full transition-all active:scale-95"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;