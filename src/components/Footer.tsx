import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-20">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-quantum-glow/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 py-7 lg:px-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-white font-semibold">Epildevconnect Ltd</span>
            <span className="text-gray-500">·</span>
            <a
              href="https://find-and-update.company-information.service.gov.uk/company/17247566/officers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              No. 17247566
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-gray-500">·</span>
            <span>England & Wales</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span className="text-gray-600">|</span>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span className="text-gray-600">|</span>
            <Link to="/discord" className="hover:text-white transition-colors">Discord Information</Link>
            <span className="text-gray-600">|</span>
            <span>© {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
