'use client';

import { useGuest } from '@/contexts/GuestContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SeatPicker from '@/components/SeatPicker';

// Helper functions for localStorage
const safelyGetFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
};

const safelySetToStorage = (key: string, value: any) => {
  try {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
};

export default function TablesPage() {
  const { guestData } = useGuest();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<{ table: number; seat: number } | null>(null);
  const [confirmedSeat, setConfirmedSeat] = useState<{ table: number; seat: number } | null>(null);
  const [showGuestInfo, setShowGuestInfo] = useState(false);
  const [seatMap, setSeatMap] = useState<Record<number, Record<number, string>>>({});
  
  console.log('TablesPage v1.3 - TEMP-NEXT14 rendering');
  
  // Initialize state from localStorage on mount
  useEffect(() => {
    console.log('TablesPage mount effect running');
    setMounted(true);
    
    // Redirect to home if no guest data is present
    if (!guestData) {
      console.log('No guest data, redirecting to home');
      router.push('/');
      return;
    }
    
    // Load selection state from localStorage if available
    const savedSelectedSeat = safelyGetFromStorage('selectedSeat');
    if (savedSelectedSeat) {
      console.log('Loading saved seat from localStorage:', savedSelectedSeat);
      setSelectedSeat(savedSelectedSeat);
    }
    
    const savedConfirmedSeat = safelyGetFromStorage('confirmedSeat');
    if (savedConfirmedSeat) {
      console.log('Loading saved confirmed seat from localStorage:', savedConfirmedSeat);
      setConfirmedSeat(savedConfirmedSeat);
    }
    
    // Load the seat map from localStorage
    const savedSeatMap = safelyGetFromStorage('seatMap');
    if (savedSeatMap) {
      console.log('Loading saved seat map from localStorage:', savedSeatMap);
      setSeatMap(savedSeatMap);
    }
  }, [guestData, router]);
  
  // Save selectedSeat to localStorage
  useEffect(() => {
    if (!mounted) return;
    
    console.log('Saving selectedSeat to localStorage:', selectedSeat);
    safelySetToStorage('selectedSeat', selectedSeat);
  }, [selectedSeat, mounted]);
  
  // Save confirmedSeat to localStorage
  useEffect(() => {
    if (!mounted) return;
    
    console.log('Saving confirmedSeat to localStorage:', confirmedSeat);
    safelySetToStorage('confirmedSeat', confirmedSeat);
  }, [confirmedSeat, mounted]);
  
  // Save seatMap to localStorage
  useEffect(() => {
    if (!mounted) return;
    
    console.log('Saving seatMap to localStorage:', seatMap);
    safelySetToStorage('seatMap', seatMap);
  }, [seatMap, mounted]);
  
  // Debug log for selectedSeat changes
  useEffect(() => {
    console.log('TablesPage: selectedSeat changed', selectedSeat);
  }, [selectedSeat]);
  
  // Debug log for confirmedSeat changes
  useEffect(() => {
    console.log('TablesPage: confirmedSeat changed', confirmedSeat);
  }, [confirmedSeat]);
  
  const handleSeatSelected = (tableIndex: number, seatIndex: number) => {
    console.log(`TablesPage: Seat selected: Table ${tableIndex + 1}, Seat ${seatIndex + 1}`);
    
    // Check if the seat is already taken by someone else
    const tableSeatMap = seatMap[tableIndex + 1] || {};
    const existingSeatAssignment = tableSeatMap[seatIndex + 1];
    
    // If the seat is already assigned to someone else, don't allow selection
    if (existingSeatAssignment && guestData && existingSeatAssignment !== guestData.fullName) {
      console.log('Seat already assigned to:', existingSeatAssignment);
      return;
    }
    
    // Toggle selection if the same seat is selected again
    if (selectedSeat?.table === tableIndex + 1 && selectedSeat?.seat === seatIndex + 1) {
      console.log('TablesPage: Toggling OFF the same seat');
      setSelectedSeat(null);
    } else {
      console.log('TablesPage: Selecting new seat', { table: tableIndex + 1, seat: seatIndex + 1 });
      setSelectedSeat({ 
        table: tableIndex + 1, 
        seat: seatIndex + 1 
      });
    }
    
    // Reset confirmation when selection changes
    if (confirmedSeat) {
      console.log('TablesPage: Resetting confirmation state');
      setConfirmedSeat(null);
    }
  };
  
  const handleSeatConfirmed = (tableIndex: number, seatIndex: number) => {
    // Return early if guestData is null (safety check)
    if (!guestData) {
      console.error('Cannot confirm seat: guest data is missing');
      return;
    }
    
    const tableNum = tableIndex + 1;
    const seatNum = seatIndex + 1;
    
    const seatInfo = { 
      table: tableNum, 
      seat: seatNum 
    };
    
    setConfirmedSeat(seatInfo);
    
    // Update the seatMap with the guest's name
    const updatedSeatMap = { ...seatMap };
    
    // If user had a previous seat, clear it first
    Object.entries(updatedSeatMap).forEach(([tableKey, tableSeats]) => {
      Object.entries(tableSeats).forEach(([seatKey, guestName]) => {
        if (guestName === guestData.fullName) {
          const tblNum = parseInt(tableKey);
          const seatNum = parseInt(seatKey);
          
          // Skip if it's the same seat being reassigned
          if (tblNum === tableNum && seatNum === seatNum) {
            return;
          }
          
          // Clear the previous seat
          delete updatedSeatMap[tblNum][seatNum];
          
          // Remove empty table entries
          if (Object.keys(updatedSeatMap[tblNum]).length === 0) {
            delete updatedSeatMap[tblNum];
          }
        }
      });
    });
    
    // Ensure table object exists
    if (!updatedSeatMap[tableNum]) {
      updatedSeatMap[tableNum] = {};
    }
    
    // Assign the seat
    updatedSeatMap[tableNum][seatNum] = guestData.fullName;
    
    // Update state
    setSeatMap(updatedSeatMap);
    
    // Here you would typically make an API call to reserve the seat
    console.log('Seat confirmed:', seatInfo);
    console.log('Updated seatMap:', updatedSeatMap);
  };
  
  const clearSelection = () => {
    // If user had a confirmed seat, remove them from the seatMap
    if (confirmedSeat) {
      const updatedSeatMap = { ...seatMap };
      const tableNum = confirmedSeat.table;
      const seatNum = confirmedSeat.seat;
      
      // Remove the seat assignment
      if (updatedSeatMap[tableNum]?.[seatNum]) {
        delete updatedSeatMap[tableNum][seatNum];
        
        // Clean up empty table objects
        if (Object.keys(updatedSeatMap[tableNum]).length === 0) {
          delete updatedSeatMap[tableNum];
        }
        
        setSeatMap(updatedSeatMap);
      }
    }
    
    setSelectedSeat(null);
    setConfirmedSeat(null);
    
    // Clear localStorage for selection
    safelySetToStorage('selectedSeat', null);
    safelySetToStorage('confirmedSeat', null);
  };
  
  const toggleGuestInfo = () => {
    setShowGuestInfo(!showGuestInfo);
  };
  
  if (!mounted || !guestData) return null;
  
  return (
    <div className="flex flex-col h-screen bg-bg-black text-text-white overflow-hidden">
      {/* Header with controls */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-text-white gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl uppercase">Seat Picker</h1>
          <div className="bg-green-500 text-bg-black px-3 py-1 rounded-md text-sm font-bold">
            TablesPage v1.3 - TEMP-NEXT14
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            className="border border-text-white px-3 py-1 text-sm uppercase transition-opacity hover:opacity-70"
            onClick={toggleGuestInfo}
            aria-expanded={showGuestInfo}
          >
            {showGuestInfo ? 'Hide' : 'Show'} Guest Info
          </button>
          
          <Link 
            href="/" 
            className="border border-text-white px-3 py-1 text-sm uppercase transition-opacity hover:opacity-70"
          >
            Back
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-[1fr_300px] overflow-hidden">
        {/* Seat picker canvas */}
        <div className="relative w-full h-full min-h-[70vh] overflow-auto">
          <SeatPicker 
            selectedSeat={selectedSeat}
            onSeatSelected={handleSeatSelected}
            onSeatConfirmed={handleSeatConfirmed}
            seatMap={seatMap}
            currentUserName={guestData.fullName}
          />
          
          {/* Confirmed seat info */}
          {confirmedSeat && (
            <div className="absolute top-4 right-4 bg-green-800 bg-opacity-90 border border-green-400 p-4 shadow-lg animate-fadeIn">
              <p className="font-bold mb-1">Seat Confirmed!</p>
              <p>Table {confirmedSeat.table}, Seat {confirmedSeat.seat}</p>
              <button 
                className="mt-2 border border-green-400 text-green-400 px-2 py-1 text-sm uppercase transition-opacity hover:opacity-70"
                onClick={clearSelection}
              >
                Change Seat
              </button>
            </div>
          )}
        </div>
        
        {/* Sidebar with guest info (conditionally displayed) */}
        {showGuestInfo && (
          <div className="border-l border-text-white p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Guest Information</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {guestData.fullName}</p>
              <p><strong>Email:</strong> {guestData.email}</p>
              {guestData.phone && <p><strong>Phone:</strong> {guestData.phone}</p>}
              {guestData.dietaryNotes && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-2">Dietary Notes</h3>
                  <p className="text-sm">{guestData.dietaryNotes}</p>
                </div>
              )}
              
              {confirmedSeat && (
                <div className="mt-6 border-t border-text-white pt-4">
                  <h3 className="text-lg font-bold mb-2">Reserved Seat</h3>
                  <p>Table {confirmedSeat.table}, Seat {confirmedSeat.seat}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer with help text */}
      <footer className="py-2 px-6 border-t border-text-white text-center text-sm opacity-70">
        {(() => {
          // Check if the user has a confirmed seat already
          const userHasConfirmedSeat = guestData && Object.entries(seatMap).some(([tableKey, tableSeats]) => 
            Object.entries(tableSeats).some(([seatKey, guestName]) => 
              guestName === guestData.fullName
            )
          );
          
          if (userHasConfirmedSeat) {
            return "Your seat is confirmed. You can select a different seat to change your reservation.";
          } else if (selectedSeat) {
            return "Click the Confirm Seat button to finalize your selection.";
          } else {
            return "Select a seat by clicking on one of the circles around the tables.";
          }
        })()}
      </footer>
    </div>
  );
}