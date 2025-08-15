import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './components/pages/LandingPage';
import InteractionPage from './components/pages/InteractionPage';

function App() {
  const handleNavigateToDashboard = () => {
    console.log('Navigate to Dashboard clicked');
  };

  return (
    <Router>
      <div className="App">
        <Layout handleNavigateToDashboard={handleNavigateToDashboard}>
          <Routes>
            <Route
              path="/"
              element={<LandingPage />}
            />
            <Route
              path="/interaction"
              element={<InteractionPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
