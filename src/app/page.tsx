'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RSVPModal, { RSVPFormData } from '@/components/RSVPModal';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useGuest } from '@/contexts/GuestContext';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setGuestData } = useGuest();
  
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleRSVPSubmit = async (formData: RSVPFormData) => {
    try {
      // Simulate API call with 500ms delay as required
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store guest data in context for access in the tables page
      setGuestData(formData);
      
      // Close the modal
      closeModal();
      
      // Redirect to tables page
      router.push('/tables');
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      alert("There was an error submitting your RSVP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      openModal();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden">
      <h1 className="hello text-6xl md:text-7xl lg:text-8xl uppercase mb-8 md:mb-12">HELLO</h1>
      
      <button 
        className="border-2 border-text-white px-8 py-3 text-text-white text-lg md:text-xl uppercase transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-text-white focus:ring-offset-1 focus:ring-offset-bg-black"
        onClick={openModal}
        onKeyDown={handleKeyDown}
        aria-haspopup="dialog"
      >
        RSVP
      </button>

      <RSVPModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleRSVPSubmit}
      />
      
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
}
