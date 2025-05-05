'use client';

import React, { useEffect, useRef, useState } from 'react';

// Constants for layout
const TABLES_PER_ROW = 5;
const TABLES_PER_COLUMN = 2;
const TOTAL_TABLES = TABLES_PER_ROW * TABLES_PER_COLUMN;
const SEATS_PER_TABLE = 8;

interface SeatPosition {
  tableIndex: number;
  seatIndex: number;
}

interface SeatPickerProps {
  onSeatSelected?: (tableIndex: number, seatIndex: number) => void;
  onSeatConfirmed?: (tableIndex: number, seatIndex: number) => void;
  // Add a prop for the currently selected seat from parent
  selectedSeat?: { table: number; seat: number } | null;
  // Add seatMap for tracking assigned seats
  seatMap?: Record<number, Record<number, string>>;
  // Add current user's name
  currentUserName?: string;
}

export default function SeatPicker({ 
  onSeatSelected, 
  onSeatConfirmed,
  selectedSeat: parentSelectedSeat,
  seatMap = {},
  currentUserName = ''
}: SeatPickerProps) {
  console.log('SeatPicker rendering with props:', { onSeatSelected, onSeatConfirmed, parentSelectedSeat, seatMap, currentUserName });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [hoveredSeat, setHoveredSeat] = useState<SeatPosition | null>(null);
  const [focusedSeat, setFocusedSeat] = useState<SeatPosition | null>(null);
  
  // Convert the parent's selected seat format to internal format if it exists
  const selectedSeat = parentSelectedSeat 
    ? { tableIndex: parentSelectedSeat.table - 1, seatIndex: parentSelectedSeat.seat - 1 } 
    : null;

  console.log('SeatPicker internal selectedSeat state:', selectedSeat);

  // For debugging - log when parent's selection changes
  useEffect(() => {
    console.log('Parent selected seat changed:', parentSelectedSeat);
  }, [parentSelectedSeat]);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    // Initial size
    updateSize();

    // Add resize event listener
    window.addEventListener('resize', updateSize);
    
    // Create a ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate dimensions based on container size
  const baseTableDiameter = Math.min(
    (containerSize.width / (TABLES_PER_ROW + 0.5)) * 0.7,
    (containerSize.height / (TABLES_PER_COLUMN + 0.5)) * 0.7
  );

  // Ensure table diameter is reasonable for the device
  const tableDiameter = Math.max(Math.min(baseTableDiameter, 160), 100);
  const seatDiameter = tableDiameter * 0.15;
  const tableRadius = tableDiameter / 2;
  const seatDistance = tableRadius * 1.1;
  
  // Helper function to check if a seat is assigned and to whom
  const getSeatAssignment = (tableNum: number, seatNum: number): string | null => {
    return seatMap[tableNum]?.[seatNum] || null;
  };
  
  // Helper function to check if a seat is assigned to the current user
  const isSeatAssignedToCurrentUser = (tableNum: number, seatNum: number): boolean => {
    return getSeatAssignment(tableNum, seatNum) === currentUserName;
  };

  // Generate table and seat positions
  const tables = Array.from({ length: TOTAL_TABLES }, (_, tableIndex) => {
    // Determine table position in the grid
    const row = Math.floor(tableIndex / TABLES_PER_ROW);
    const col = tableIndex % TABLES_PER_ROW;

    // Calculate center position for the table
    const xCenter = (col + 0.5) * (tableDiameter * 1.5);
    const yCenter = (row + 0.5) * (tableDiameter * 1.5);

    // Generate seats around the table
    const seats = Array.from({ length: SEATS_PER_TABLE }, (_, seatIndex) => {
      // Calculate angle for this seat (distributed evenly around the table)
      const angle = (seatIndex / SEATS_PER_TABLE) * 2 * Math.PI;

      // Calculate seat position
      const xSeat = xCenter + Math.cos(angle) * seatDistance;
      const ySeat = yCenter + Math.sin(angle) * seatDistance;

      // Check if this seat is assigned
      const tableNum = tableIndex + 1;
      const seatNum = seatIndex + 1;
      const assignedTo = getSeatAssignment(tableNum, seatNum);
      const isAssignedToCurrentUser = assignedTo === currentUserName;
      
      // Check if this seat is hovered, focused, or selected
      const isHovered = 
        (hoveredSeat?.tableIndex === tableIndex && hoveredSeat?.seatIndex === seatIndex);
      const isFocused =
        (focusedSeat?.tableIndex === tableIndex && focusedSeat?.seatIndex === seatIndex);
      const isSelected = 
        (selectedSeat?.tableIndex === tableIndex && selectedSeat?.seatIndex === seatIndex);

      return {
        id: `table-${tableIndex}-seat-${seatIndex}`,
        x: xSeat,
        y: ySeat,
        isHovered,
        isFocused,
        isSelected,
        assignedTo,
        isAssignedToCurrentUser
      };
    });

    return {
      id: `table-${tableIndex}`,
      x: xCenter,
      y: yCenter,
      seats,
    };
  });

  // Calculate total size needed for SVG
  const svgWidth = TABLES_PER_ROW * tableDiameter * 1.5;
  const svgHeight = TABLES_PER_COLUMN * tableDiameter * 1.5;

  const handleSeatHover = (tableIndex: number, seatIndex: number, isHovered: boolean) => {
    if (isHovered) {
      setHoveredSeat({ tableIndex, seatIndex });
    } else if (
      hoveredSeat?.tableIndex === tableIndex && 
      hoveredSeat?.seatIndex === seatIndex
    ) {
      setHoveredSeat(null);
    }
  };

  const handleSeatFocus = (tableIndex: number, seatIndex: number, isFocused: boolean) => {
    if (isFocused) {
      setFocusedSeat({ tableIndex, seatIndex });
    } else if (
      focusedSeat?.tableIndex === tableIndex && 
      focusedSeat?.seatIndex === seatIndex
    ) {
      setFocusedSeat(null);
    }
  };

  const handleSeatClick = (tableIndex: number, seatIndex: number) => {
    // Notify parent component about selection - let parent handle the state
    console.log('SeatPicker: handleSeatClick', tableIndex, seatIndex);
    if (onSeatSelected) {
      onSeatSelected(tableIndex, seatIndex);
    }
  };

  const handleSeatKeyDown = (
    e: React.KeyboardEvent, 
    tableIndex: number, 
    seatIndex: number
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSeatClick(tableIndex, seatIndex);
    }
  };

  const handleConfirmSeat = () => {
    console.log('SeatPicker: handleConfirmSeat', selectedSeat);
    if (selectedSeat && onSeatConfirmed) {
      onSeatConfirmed(selectedSeat.tableIndex, selectedSeat.seatIndex);
    }
  };

  // Get the stroke color for a seat based on its state
  const getSeatStroke = (seat: { 
    isHovered: boolean; 
    isFocused: boolean; 
    isSelected: boolean; 
    assignedTo: string | null;
    isAssignedToCurrentUser: boolean;
  }) => {
    if (seat.isAssignedToCurrentUser) {
      return "url(#seat-user-gradient)";
    } else if (seat.assignedTo) {
      return "url(#seat-occupied-gradient)";
    } else if (seat.isSelected) {
      return "url(#seat-selected-gradient)";
    } else if (seat.isHovered || seat.isFocused) {
      return "url(#seat-gradient)";
    } else {
      return "var(--text-white)";
    }
  };
  
  // Get the fill color for a seat based on its state
  const getSeatFill = (seat: { 
    isHovered: boolean; 
    isFocused: boolean; 
    isSelected: boolean; 
    assignedTo: string | null;
    isAssignedToCurrentUser: boolean;
  }) => {
    if (seat.isAssignedToCurrentUser) {
      return "rgba(16, 185, 129, 0.2)";
    } else if (seat.assignedTo) {
      return "rgba(239, 68, 68, 0.2)";
    } else if (seat.isSelected) {
      return "rgba(16, 185, 129, 0.1)";
    } else if (seat.isHovered || seat.isFocused) {
      return "rgba(59, 130, 246, 0.1)";
    } else {
      return "transparent";
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-auto bg-bg-black relative"
      aria-label="Seat picker with 10 tables of 8 seats each"
    >
      <div className="flex justify-between p-4">
        <div className="bg-green-500 text-bg-black px-3 py-1 rounded-md text-sm font-bold">
          SeatPicker v1.4 - TEMP-NEXT14
        </div>
        <button 
          onClick={() => console.log('Debug: Current state', { hoveredSeat, focusedSeat, selectedSeat, parentSelectedSeat, seatMap })}
          className="bg-blue-500 text-bg-black px-3 py-1 rounded-md text-sm font-bold"
        >
          Debug State
        </button>
      </div>

      <div className="flex justify-center p-4 h-full">
        <svg 
          width={svgWidth} 
          height={svgHeight} 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="max-w-full max-h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Tables */}
          {tables.map((table) => (
            <g key={table.id}>
              {/* Table Circle */}
              <circle
                cx={table.x}
                cy={table.y}
                r={tableRadius}
                fill="var(--bg-black)"
                stroke="var(--text-white)"
                strokeWidth="2"
                aria-label={`Table ${parseInt(table.id.split('-')[1]) + 1}`}
              />
              
              {/* Table Number */}
              <text
                x={table.x}
                y={table.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--text-white)"
                fontSize={tableDiameter * 0.12}
                fontFamily="Helvetica Bold"
              >
                {parseInt(table.id.split('-')[1]) + 1}
              </text>
              
              {/* Seats - now with interactive elements */}
              {table.seats.map((seat) => {
                const tableIndex = parseInt(table.id.split('-')[1]);
                const seatIndex = parseInt(seat.id.split('-')[3]);
                const tableNum = tableIndex + 1;
                const seatNum = seatIndex + 1;
                const isActive = seat.isHovered || seat.isFocused;
                const isSelected = seat.isSelected;
                const isAssigned = seat.assignedTo !== null;
                const isCurrentUserSeat = seat.isAssignedToCurrentUser;
                
                // Only allow interaction if the seat is not assigned to someone else
                const canInteract = !isAssigned || isCurrentUserSeat;
                
                return (
                  <g key={seat.id}
                     tabIndex={canInteract ? 0 : -1}
                     role={canInteract ? "button" : "presentation"}
                     aria-label={
                       isAssigned 
                         ? `Table ${tableNum}, Seat ${seatNum}, assigned to ${seat.assignedTo}${isCurrentUserSeat ? ' (you)' : ''}`
                         : `Table ${tableNum}, Seat ${seatNum}${isSelected ? ', selected' : ''}`
                     }
                     aria-pressed={isSelected}
                     onMouseEnter={canInteract ? () => handleSeatHover(tableIndex, seatIndex, true) : undefined}
                     onMouseLeave={canInteract ? () => handleSeatHover(tableIndex, seatIndex, false) : undefined}
                     onFocus={canInteract ? () => handleSeatFocus(tableIndex, seatIndex, true) : undefined}
                     onBlur={canInteract ? () => handleSeatFocus(tableIndex, seatIndex, false) : undefined}
                     onClick={canInteract ? () => {
                       console.log(`Seat clicked for Table ${tableNum}, Seat ${seatNum}`);
                       handleSeatClick(tableIndex, seatIndex);
                     } : undefined}
                     onKeyDown={canInteract ? (e) => handleSeatKeyDown(e as React.KeyboardEvent, tableIndex, seatIndex) : undefined}
                     className={`focus:outline-none ${canInteract ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                     style={{ outline: isActive ? "2px solid #3b82f6" : "none" }}
                  >
                    {/* Larger hitbox for better interaction (invisible) */}
                    <circle
                      cx={seat.x}
                      cy={seat.y}
                      r={seatDiameter * 1.5}
                      fill="transparent"
                      stroke="transparent"
                      className={canInteract ? "cursor-pointer" : "cursor-not-allowed"}
                    />
                    
                    {/* Visible seat circle */}
                    <circle
                      cx={seat.x}
                      cy={seat.y}
                      r={seatDiameter}
                      fill={getSeatFill(seat)}
                      stroke={getSeatStroke(seat)}
                      strokeWidth={isSelected || isAssigned ? "3" : (isActive ? "3" : "2")}
                      className="transition-all duration-200"
                    />
                    
                    {/* Add a visible dot in the center for easier targeting */}
                    <circle
                      cx={seat.x}
                      cy={seat.y}
                      r={seatDiameter * 0.3}
                      fill={
                        isCurrentUserSeat 
                          ? "rgb(52, 211, 153)" 
                          : (isAssigned 
                              ? "rgb(239, 68, 68)" 
                              : (isSelected 
                                  ? "rgb(52, 211, 153)" 
                                  : (isActive 
                                      ? "rgb(59, 130, 246)" 
                                      : "rgba(255, 255, 255, 0.2)")))
                      }
                      className="transition-all duration-200"
                    />
                    
                    {/* Show name label for assigned seats */}
                    {seat.assignedTo && (
                      <g>
                        {/* Background for better readability */}
                        <rect
                          x={seat.x - seatDiameter * 1.1}
                          y={seat.y + seatDiameter * 0.8}
                          width={seatDiameter * 2.2}
                          height={seatDiameter * 0.7}
                          rx={4}
                          fill="rgba(0,0,0,0.7)"
                          className="transition-all duration-200"
                        />
                        
                        {/* Name text */}
                        <text
                          x={seat.x}
                          y={seat.y + seatDiameter * 1.2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={isCurrentUserSeat ? "rgb(52, 211, 153)" : "white"}
                          fontSize={seatDiameter * 0.45}
                          fontFamily="Helvetica Bold"
                          className="pointer-events-none select-none"
                        >
                          {seat.assignedTo === currentUserName ? 'You' : getInitials(seat.assignedTo)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
          
          {/* Gradient definitions */}
          <defs>
            {/* Hover/focus gradient */}
            <linearGradient id="seat-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            
            {/* Selected seat gradient */}
            <linearGradient id="seat-selected-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
            
            {/* User's confirmed seat gradient */}
            <linearGradient id="seat-user-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            
            {/* Other user's seat gradient */}
            <linearGradient id="seat-occupied-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Confirm Seat button - only show if user has selected a seat and it's not already confirmed */}
      {selectedSeat && !isSeatAssignedToCurrentUser(selectedSeat.tableIndex + 1, selectedSeat.seatIndex + 1) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 animate-fadeIn">
          <button
            className="bg-green-500 text-bg-black font-bold py-4 px-10 rounded-md shadow-lg 
                     hover:bg-green-400 focus:outline-none focus:ring-4 focus:ring-green-400 
                     focus:ring-offset-2 focus:ring-offset-bg-black text-lg animate-pulse"
            onClick={handleConfirmSeat}
            aria-label="Confirm selected seat"
          >
            Confirm Seat
          </button>
          <p className="text-center text-text-white mt-2">
            You selected Table {selectedSeat.tableIndex + 1}, Seat {selectedSeat.seatIndex + 1}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to get initials from a name
function getInitials(name: string): string {
  if (!name) return '';
  
  const words = name.split(' ');
  if (words.length === 1) {
    return name.substring(0, 3); // Use first 3 letters for single words
  }
  
  // Get first letter of first name and first letter of last name
  return `${words[0][0]}${words[words.length - 1][0]}`;
} 