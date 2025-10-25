import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { RFQProvider, useRFQ } from "./contexts/RFQContext";
import Layout from "./layout/Layout";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import RFQWizard from "./pages/RFQWizard";
import { useEffect } from "react";
import voiceAppCommandBus from "./services/VoiceAppCommandBus";
import './App.css';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

// RFQ Wizard Wrapper to extract rfqId from URL params
interface RFQWizardWrapperProps {
  onBackToDashboard: () => void;
}

const RFQWizardWrapper: React.FC<RFQWizardWrapperProps> = ({ onBackToDashboard }) => {
  const { rfqId } = useParams<{ rfqId: string }>();

  return (
    <RFQWizard
      rfqId={rfqId || ""}
      onBackToDashboard={onBackToDashboard}
    />
  );
};


function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/background-pattern.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <ReduxProvider store={store}>
        <LiveAPIProvider url={uri} apiKey={API_KEY}>
          <RFQProvider>
            <Router>
              <AppContent />
            </Router>
          </RFQProvider>
        </LiveAPIProvider>
      </ReduxProvider>
    </div>
  );
}

// Component that has access to navigation inside Router context
const AppContent: React.FC = () => {
  const navigate = useNavigate();

  const { createRFQ } = useRFQ();

  const handleCreateRFQ = async () => {
    console.log('Header: Creating new RFQ');
    const newRFQ = await createRFQ();
    navigate(`/rfq-wizard/${newRFQ.rfqId}`);
  };

  const handleViewRFQ = (rfqId: string) => {
    console.log('Viewing existing RFQ:', rfqId);
    navigate(`/rfq?rfqId=${rfqId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Register app commands with voice command bus
  useEffect(() => {
    // Register createRFQ command
    voiceAppCommandBus.registerAppCommand('createRFQ', async () => {
      try {
        const newRFQ = await createRFQ();
        navigate(`/rfq-wizard/${newRFQ.rfqId}`);

        // Send feedback to voice
        voiceAppCommandBus.sendVoiceFeedback('rfqCreated', {
          rfq: newRFQ,
          message: `RFQ ${newRFQ.rfqId} created successfully`
        });

        return {
          success: true,
          message: 'RFQ created and navigated to wizard',
          data: newRFQ
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to create RFQ',
          data: error
        };
      }
    });

    // Register navigation commands
    voiceAppCommandBus.registerAppCommand('navigateTo', async ({ destination }) => {
      const routeMap: Record<string, string> = {
        'dashboard': '/dashboard',
        'create-rfq': '/create-rfq',
        'home': '/'
      };

      const route = routeMap[destination] || destination;
      navigate(route);

      voiceAppCommandBus.sendVoiceFeedback('navigationCompleted', {
        destination,
        route
      });

      return {
        success: true,
        message: `Navigated to ${destination}`,
        data: { destination, route }
      };
    });

    console.log('📡 App commands registered with Voice Command Bus');
  }, [navigate, createRFQ]);

  return (
    <Routes>
      {/* Marketing HomePage - no Layout wrapper */}
      <Route path="/" element={<HomePage />} />

      {/* App routes with Layout wrapper */}
      <Route path="/dashboard" element={
        <Layout handleNavigateToDashboard={handleCreateRFQ}>
          <Dashboard onCreateRFQ={handleCreateRFQ} onViewRFQ={handleViewRFQ} />
        </Layout>
      } />

      <Route path="/rfq-wizard/:rfqId" element={
        <Layout handleNavigateToDashboard={handleCreateRFQ}>
          <RFQWizardWrapper onBackToDashboard={handleBackToDashboard} />
        </Layout>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
