import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { NotificationToast } from './components/common/NotificationToast';
import { PilgrimAppLayout } from './components/pilgrim/PilgrimAppLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { AuthModal } from './components/common/AuthModal';

import { OfflineBanner } from './components/common/OfflineBanner';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      <Header />
      <OfflineBanner />

      <div className="flex-1">
        {currentView === 'PILGRIM' ? <PilgrimAppLayout /> : <AdminLayout />}
      </div>

      {/* Two-Account System Authentication Modal (Client vs Back-Office) */}
      <AuthModal />

      {/* Floating real-time SMS / Email notification toaster */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
