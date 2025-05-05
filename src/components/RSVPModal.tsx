'use client';

import { useEffect, useRef, useState } from 'react';

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: RSVPFormData) => void;
}

export interface RSVPFormData {
  fullName: string;
  email: string;
  phone: string;
  dietaryNotes: string;
}

export default function RSVPModal({ isOpen, onClose, onSubmit }: RSVPModalProps) {
  const [formData, setFormData] = useState<RSVPFormData>({
    fullName: '',
    email: '',
    phone: '',
    dietaryNotes: '',
  });

  const [formErrors, setFormErrors] = useState({
    fullName: false,
    email: false,
  });
  
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [bannerFadingOut, setBannerFadingOut] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const lastFocusableElementRef = useRef<HTMLButtonElement>(null);

  // Form validation
  const isFormValid = formData.fullName.trim() !== '' && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // Error banner auto-dismiss
  useEffect(() => {
    let fadeTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;
    
    if (showErrorBanner) {
      fadeTimer = setTimeout(() => {
        setBannerFadingOut(true);
        
        // After animation completes, actually hide the banner
        hideTimer = setTimeout(() => {
          setShowErrorBanner(false);
          setBannerFadingOut(false);
        }, 300); // Match this to the animation duration
      }, 3000);
    }
    
    return () => {
      if (fadeTimer) clearTimeout(fadeTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [showErrorBanner]);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      // Focus the first input when modal opens
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);

      // Add ESC key listener
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }

        // Handle Cmd/Ctrl+Enter to submit
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && isFormValid) {
          handleSubmit();
        }

        // Handle tab key for focus trap
        if (e.key === 'Tab') {
          const modal = modalRef.current;
          if (!modal) return;

          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, isFormValid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation errors when user types
    if (name === 'fullName' || name === 'email') {
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateField = (name: string, value: string) => {
    if (name === 'fullName') {
      return value.trim() !== '';
    }
    if (name === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    return true;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'fullName' || name === 'email') {
      const isValid = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: !isValid }));
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    const nameValid = validateField('fullName', formData.fullName);
    const emailValid = validateField('email', formData.email);

    if (!nameValid || !emailValid) {
      setFormErrors({
        fullName: !nameValid,
        email: !emailValid
      });
      
      // Show error banner for invalid form
      setBannerFadingOut(false);
      setShowErrorBanner(true);
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-bg-black bg-opacity-70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {showErrorBanner && (
        <div 
          className={`fixed top-0 left-0 w-full bg-red-500 text-text-white p-4 text-center font-bold z-50 ${bannerFadingOut ? 'animate-fadeOut' : 'animate-fadeIn'}`} 
          role="alert"
        >
          Please fix the errors before submitting
        </div>
      )}
      
      <div 
        ref={modalRef}
        className="bg-bg-black border border-text-white p-8 max-w-md w-full mx-4 mb-0 md:m-4 animate-slideUp md:animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold">RSVP</h2>
          <button 
            className="text-text-white text-2xl hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-text-white"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form className="space-y-6" noValidate>
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-text-white">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              id="fullName"
              name="fullName"
              className={`w-full bg-transparent border ${formErrors.fullName ? 'border-red-500' : 'border-text-white'} p-2 text-text-white focus:outline-none focus:ring-2 focus:ring-text-white`}
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              aria-invalid={formErrors.fullName}
              aria-describedby={formErrors.fullName ? "fullNameError" : undefined}
            />
            {formErrors.fullName && (
              <p id="fullNameError" className="text-red-500 text-sm">Please enter your full name</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-text-white">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`w-full bg-transparent border ${formErrors.email ? 'border-red-500' : 'border-text-white'} p-2 text-text-white focus:outline-none focus:ring-2 focus:ring-text-white`}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              aria-invalid={formErrors.email}
              aria-describedby={formErrors.email ? "emailError" : undefined}
            />
            {formErrors.email && (
              <p id="emailError" className="text-red-500 text-sm">Please enter a valid email address</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-text-white">
              Phone (optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full bg-transparent border border-text-white p-2 text-text-white focus:outline-none focus:ring-2 focus:ring-text-white"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dietaryNotes" className="block text-text-white">
              Dietary Notes (optional)
            </label>
            <textarea
              id="dietaryNotes"
              name="dietaryNotes"
              rows={3}
              className="w-full bg-transparent border border-text-white p-2 text-text-white focus:outline-none focus:ring-2 focus:ring-text-white"
              value={formData.dietaryNotes}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-text-white opacity-70">
              <span className="text-red-500">*</span> Required fields
            </p>
            <button
              ref={lastFocusableElementRef}
              type="button"
              className={`border-2 border-text-white px-6 py-2 uppercase transition-opacity ${isFormValid ? 'hover:opacity-70' : 'opacity-50 cursor-not-allowed'}`}
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              Submit
            </button>
          </div>
          
          <p className="text-xs text-text-white opacity-70 mt-4">
            Pro tip: Press Cmd/Ctrl+Enter to submit
          </p>
        </form>
      </div>
    </div>
  );
} 