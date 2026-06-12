import { ReactNode } from 'react';
import Navigation from './Navigation';
import ParticleBackground from './ParticleBackground';
import SocialLinks from './SocialLinks';
import Footer from './Footer';
interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="gradient-mesh" />
      <ParticleBackground />
      <div className="noise-overlay" />
      <Navigation />
      <SocialLinks />
      <main className="relative z-10 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
