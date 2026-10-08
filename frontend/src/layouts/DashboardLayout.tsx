import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { SecurityDemoModal } from '../components/SecurityDemoModal';

export const DashboardLayout: React.FC = () => {
  const [resetKey, setResetKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans bg-cyber-grid bg-radial-vignette overflow-x-hidden">
      <Header
        onReset={handleReset}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        onOpenDemo={() => setIsDemoModalOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-8 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden min-w-0">
          <Outlet key={resetKey} context={{ onOpenDemo: () => setIsDemoModalOpen(true) }} />
        </main>
      </div>

      {/* Global Hackathon Security Demo Modal */}
      <SecurityDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};
