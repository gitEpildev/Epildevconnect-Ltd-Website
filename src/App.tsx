import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import BootSequence from './components/BootSequence';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './sections/Home';
import Projects from './sections/Projects';
import TechStack from './sections/TechStack';
import SystemSpecs from './sections/SystemSpecs';
import Experience from './sections/Experience';
import CodeViewer from './sections/CodeViewer';
import Contact from './sections/Contact';
import Messages from './sections/Messages';
import AdminDashboard from './sections/AdminDashboard';
import PrivacyPolicy from './sections/PrivacyPolicy';
import TermsOfService from './sections/TermsOfService';
import NotFound from './sections/NotFound';

function App() {
  const [showBoot, setShowBoot] = useState(true);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    // Check if user has already visited
    const hasVisited = localStorage.getItem('myhub_visited');
    
    if (hasVisited) {
      setShowBoot(false);
      setIsBooting(false);
    } else {
      // Mark as visited
      localStorage.setItem('myhub_visited', 'true');
      
      // Boot sequence duration
      setTimeout(() => {
        setIsBooting(false);
      }, 3000);
    }
  }, []);

  const handleSkipBoot = () => {
    setIsBooting(false);
  };

  if (showBoot && isBooting) {
    return <BootSequence onComplete={() => setIsBooting(false)} onSkip={handleSkipBoot} />;
  }

  return (
    <ErrorBoundary>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tech-stack" element={<TechStack />} />
            <Route path="/system-specs" element={<SystemSpecs />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/code-viewer" element={<CodeViewer />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;


