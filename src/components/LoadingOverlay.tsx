'use client';

import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-black bg-opacity-80">
      <div className="text-text-white text-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-text-white border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <span>Submitting...</span>
        </div>
      </div>
    </div>
  );
} 