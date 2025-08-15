import React, { useState } from 'react';
import { RFQProvider } from './context/RFQContext';
import Dashboard from './components/pages/Dashboard';
import RFQWizard from './components/pages/RFQWizard';
import VoiceLandingPage from './components/pages/VoiceLandingPage';
import MobileDashboard from './components/mobile/MobileDashboard';
import MobileRFQWizard from './components/mobile/MobileRFQWizard';
import MobileNavigation from './components/mobile/MobileNavigation';
import { useRFQ } from './context/RFQContext';
import { useResponsive } from './hooks/useResponsive';

// Simple router state management for MVP
type AppView = 'voice-landing' | 'dashboard' | 'rfq-wizard';

interface AppState {
  currentView: AppView;
  currentRFQId?: string;
}

function AppContent() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'voice-landing'
  });
  
  const { createRFQ } = useRFQ();
  const { isMobile } = useResponsive();

  const handleCreateRFQ = async () => {
    try {
      const newRFQ = await createRFQ();
      setAppState({
        currentView: 'rfq-wizard',
        currentRFQId: newRFQ.id
      });
    } catch (error) {
      console.error('Failed to create RFQ:', error);
      // In a real app, show error notification
    }
  };

  const handleViewRFQ = (rfqId: string) => {
    setAppState({
      currentView: 'rfq-wizard',
      currentRFQId: rfqId
    });
  };

  const handleBackToDashboard = () => {
    setAppState({
      currentView: 'dashboard'
    });
  };

  const handleNavigateToVoiceLanding = () => {
    setAppState({
      currentView: 'voice-landing'
    });
  };

  const handleNavigateToRFQ = () => {
    handleCreateRFQ();
  };

  // Render current view with responsive components
  if (isMobile) {
    return (
      <>
        <MobileNavigation
          currentView={appState.currentView}
          onCreateRFQ={handleCreateRFQ}
          onBackToDashboard={handleBackToDashboard}
        />
        {appState.currentView === 'voice-landing' ? (
          <VoiceLandingPage
            onNavigateToDashboard={handleBackToDashboard}
            onNavigateToRFQ={handleNavigateToRFQ}
          />
        ) : appState.currentView === 'dashboard' ? (
          <MobileDashboard
            onCreateRFQ={handleCreateRFQ}
            onViewRFQ={handleViewRFQ}
          />
        ) : appState.currentView === 'rfq-wizard' ? (
          appState.currentRFQId ? (
            <MobileRFQWizard
              rfqId={appState.currentRFQId}
              onBackToDashboard={handleBackToDashboard}
            />
          ) : (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-surface-900 mb-4">
                  No RFQ Selected
                </h2>
                <button
                  onClick={handleBackToDashboard}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-surface-900 mb-4">
                Page Not Found
              </h2>
              <button
                onClick={handleBackToDashboard}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop view (original components)
  switch (appState.currentView) {
    case 'voice-landing':
      return (
        <VoiceLandingPage
          onNavigateToDashboard={handleBackToDashboard}
          onNavigateToRFQ={handleNavigateToRFQ}
        />
      );

    case 'dashboard':
      return (
        <Dashboard
          onCreateRFQ={handleCreateRFQ}
          onViewRFQ={handleViewRFQ}
        />
      );
    
    case 'rfq-wizard':
      if (!appState.currentRFQId) {
        return (
          <div className="min-h-screen bg-light-bg flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-dark-slate-gray mb-4">
                No RFQ Selected
              </h2>
              <button
                onClick={handleBackToDashboard}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      }
      
      return (
        <RFQWizard
          rfqId={appState.currentRFQId}
          onBackToDashboard={handleBackToDashboard}
        />
      );
    
    default:
      return (
        <div className="min-h-screen bg-light-bg flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-dark-slate-gray">
              Page Not Found
            </h2>
          </div>
        </div>
      );
  }
}

function App() {
  return (
    <RFQProvider>
      <div className="App">
        <AppContent />
      </div>
    </RFQProvider>
  );
}

export default App;
