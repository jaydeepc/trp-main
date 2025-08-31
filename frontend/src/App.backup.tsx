import React, { useState } from 'react';
import { RFQProvider } from './contexts/RFQContext';
import Dashboard from './components/pages/Dashboard';
import RFQWizard from './components/pages/RFQWizard';
import { useRFQ } from './contexts/RFQContext';

// Simple router state management for MVP
type AppView = 'dashboard' | 'rfq-wizard';

interface AppState {
  currentView: AppView;
  currentRFQId?: string;
}

function AppContent() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'dashboard'
  });

  const { createRFQ } = useRFQ();

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

  switch (appState.currentView) {
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
