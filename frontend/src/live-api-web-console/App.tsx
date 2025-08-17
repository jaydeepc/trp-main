import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import Layout from "./components/layout/Layout";
import LandingPage from "./pages/LandingPage";
import InteractionPage from "./pages/InteractionPage";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App() {
  const handleNavigateToDashboard = () => {
    console.log('Navigate to Dashboard clicked');
  };

  return (
    <LiveAPIProvider url={uri} apiKey={API_KEY}>
      <Layout handleNavigateToDashboard={handleNavigateToDashboard}>
        <Router>
          <div className="App">
            <Routes>
              {/* Landing Page Route */}
              <Route
                path="/"
                element={
                  <LandingPage />
                }
              />

              {/* Live API Voice Console Route */}
              <Route
                path="/interaction"
                element={
                  <InteractionPage />
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </Layout>
    </LiveAPIProvider>
  );
}

export default App;
