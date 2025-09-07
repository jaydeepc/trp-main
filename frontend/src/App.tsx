import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { store } from './store';
import { setCurrentStep } from './store/rfqSlice';
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { RFQProvider, useRFQ } from "./contexts/RFQContext";
import { CommercialTermsProvider } from "./contexts/CommercialTermsContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./components/pages/Dashboard";
import RFQWizard from "./components/pages/RFQWizard";
import { useEffect } from "react";
import voiceAppCommandBus from "./services/VoiceAppCommandBus";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

// Main App Routes Component (inside Router context)
interface AppRoutesProps {
  handleCreateRFQ: () => Promise<void>;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ handleCreateRFQ }) => {
  const navigate = useNavigate();

  const handleViewRFQ = (rfqId: string) => {
    console.log('Viewing existing RFQ:', rfqId);
    navigate(`/rfq?rfqId=${rfqId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <Routes>
      {/* Dashboard Route */}
      <Route
        path="/"
        element={
          <Dashboard onCreateRFQ={handleCreateRFQ} onViewRFQ={handleViewRFQ} />
        }
      />

      {/* RFQ Routes */}
      <Route
        path="/rfq-wizard/:rfqId"
        element={
          <RFQWizard rfqId={""} onBackToDashboard={handleBackToDashboard} />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ReduxProvider store={store}>
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <CommercialTermsProvider>
          <Router>
            <RFQProvider>
              <AppContent />
            </RFQProvider>
          </Router>
        </CommercialTermsProvider>
      </LiveAPIProvider>
    </ReduxProvider>
  );
}

// Component that has access to navigation inside Router context
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { createRFQ } = useRFQ();

  const handleCreateRFQ = async () => {
    console.log('Header: Creating new RFQ');
    const newRFQ = await createRFQ();
    navigate(`/rfq-wizard/${newRFQ.id}`);
  };

  // Register app commands with voice command bus
  useEffect(() => {
    // Register createRFQ command
    voiceAppCommandBus.registerAppCommand('createRFQ', async () => {
      try {
        const newRFQ = await createRFQ();
        navigate(`/rfq-wizard/${newRFQ.id}`);

        // Send feedback to voice
        voiceAppCommandBus.sendVoiceFeedback('rfqCreated', {
          rfq: newRFQ,
          message: `RFQ ${newRFQ.id} created successfully`
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
        'dashboard': '/',
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

    // Register step navigation command for RFQ wizard
    voiceAppCommandBus.registerAppCommand('navigateToStep', async ({ step, destination }) => {
      console.log(`📍 Voice navigation to step ${step} (${destination})`);

      // Check if we're in the RFQ wizard context
      const currentPath = window.location.pathname;
      if (!currentPath.includes('rfq-wizard')) {
        console.log('⚠️ Not in RFQ wizard context - navigation may not work');
      }

      // Dispatch to Redux to update the current step
      dispatch(setCurrentStep(step));

      return {
        success: true,
        message: `Navigated to step ${step} (${destination})`,
        data: { step, destination }
      };
    });

    console.log('📡 App commands registered with Voice Command Bus');
  }, [navigate, createRFQ]);

  return (
    <Layout handleNavigateToDashboard={handleCreateRFQ}>
      <AppRoutes handleCreateRFQ={handleCreateRFQ} />
    </Layout>
  );
};

export default App;
