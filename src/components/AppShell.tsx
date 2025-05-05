import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-bg-black">
      <main className="w-full h-full">
        {children}
      </main>
    </div>
  );
} 