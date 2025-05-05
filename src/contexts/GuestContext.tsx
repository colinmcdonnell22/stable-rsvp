'use client';

import React, { createContext, useContext, useState } from 'react';
import { RSVPFormData } from '@/components/RSVPModal';

interface GuestContextType {
  guestData: RSVPFormData | null;
  setGuestData: (data: RSVPFormData) => void;
  clearGuestData: () => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guestData, setGuestDataState] = useState<RSVPFormData | null>(null);

  const setGuestData = (data: RSVPFormData) => {
    setGuestDataState(data);
  };

  const clearGuestData = () => {
    setGuestDataState(null);
  };

  return (
    <GuestContext.Provider value={{ guestData, setGuestData, clearGuestData }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
} 