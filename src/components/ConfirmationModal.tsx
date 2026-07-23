import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "هو، پاک یې کړه",
  cancelText = "منع کړه",
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="confirmation-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 dir-rtl">
          {/* Backdrop blur & dim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            id="confirmation-modal-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-md bg-[#1c1b1f] border border-[#2d2c30] rounded-[28px] p-6 shadow-2xl z-10 overflow-hidden text-right"
          >
            {/* Ambient light glow behind header */}
            <div
              className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
                isDanger ? 'bg-red-500/20' : 'bg-[#ffb900]/20'
              }`}
            />

            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#2d2c30]/60 hover:bg-[#2d2c30] text-[#c7c6ca] hover:text-white flex items-center justify-center transition-colors"
              title="تړل"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content header with icon */}
            <div className="flex items-start gap-4 mb-5">
              <div
                className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
                  isDanger
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-[#ffb900]/10 border-[#ffb900]/30 text-[#ffb900]'
                }`}
              >
                {isDanger ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>

              <div className="flex-1 pt-1 min-w-0">
                <h3 className="text-lg font-black text-[#e3e2e6] leading-tight">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-[#8e8d91] mt-2 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2d2c30]/80">
              <button
                id="modal-cancel-btn"
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#2d2c30] hover:bg-[#3d3c40] text-[#e3e2e6] transition-all active:scale-95 cursor-pointer"
              >
                {cancelText}
              </button>

              <button
                id="modal-confirm-btn"
                type="button"
                onClick={onConfirm}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all active:scale-95 shadow-lg cursor-pointer ${
                  isDanger
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-900/40'
                    : 'bg-[#ffb900] hover:bg-[#e0a300] text-black shadow-amber-900/40'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
