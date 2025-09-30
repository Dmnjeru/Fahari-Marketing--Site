// frontend/src/app/components/Modal.tsx
"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Optional title */}
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}

        {/* Modal body */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
