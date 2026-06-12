import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import BootSequence from './components/BootSequence';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './sections/Home';
import Projects from './sections/Projects';
import Services from './sections/Services';
import TechStack from './sections/TechStack';
import SystemSpecs from './sections/SystemSpecs';
import Experience from './sections/Experience';
import CodeViewer from './sections/CodeViewer';
import Contact from './sections/Contact';
import Messages from './sections/Messages';
import AdminDashboard from './sections/AdminDashboard';
import PrivacyPolicy from './sections/PrivacyPolicy';
import TermsOfService from './sections/TermsOfService';
import DiscordInfo from './sections/DiscordInfo';
import BotTerms from './sections/BotTerms';
import BotPrivacy from './sections/BotPrivacy';
import NotFound from './sections/NotFound';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/home" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
        <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
        <Route path="/tech-stack" element={<PageWrapper><TechStack /></PageWrapper>} />
        <Route path="/system-specs" element={<PageWrapper><SystemSpecs /></PageWrapper>} />
        <Route path="/experience" element={<PageWrapper><Experience /></PageWrapper>} />
        <Route path="/code-viewer" element={<PageWrapper><CodeViewer /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/messages" element={<PageWrapper><Messages /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><TermsOfService /></PageWrapper>} />
        <Route path="/discord" element={<PageWrapper><DiscordInfo /></PageWrapper>} />
        <Route path="/discord/terms" element={<PageWrapper><BotTerms /></PageWrapper>} />
        <Route path="/discord/privacy" element={<PageWrapper><BotPrivacy /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [showBoot, setShowBoot] = useState(true);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem('myhub_visited');

    if (hasVisited) {
      setShowBoot(false);
      setIsBooting(false);
    } else {
      localStorage.setItem('myhub_visited', 'true');
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
        <AnimatedRoutes />
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
