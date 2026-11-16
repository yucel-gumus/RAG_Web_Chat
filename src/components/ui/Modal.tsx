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
      className="fixed inset-0 bg-[#253341]/55 backdrop-blur-xs z-50 flex justify-center items-center p-4 transition-opacity animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#EDF3EE] rounded-3xl shadow-xl border border-[#BCC7D2] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-[#DCE3EA] border-b border-[#BCC7D2]">
          <h3 className="text-lg font-bold text-[#253341]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#3E5164] hover:text-[#253341] hover:bg-[#DBE6DD] p-2 rounded-full transition-all duration-200 active:scale-95"
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