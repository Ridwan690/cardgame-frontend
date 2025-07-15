import React, { useEffect } from "react";

export default function Modal({ children, onClose, size = "md", title }) {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size variants
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full mx-4"
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-lg w-full ${sizeClasses[size]} relative shadow-xl transform transition-all duration-200 animate-in fade-in zoom-in-95`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Tutup modal"
          >
            <svg 
              className="w-5 h-5 text-gray-500 hover:text-gray-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}