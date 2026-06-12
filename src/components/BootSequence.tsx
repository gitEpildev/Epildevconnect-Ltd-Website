import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
  onSkip: () => void;
}

const bootMessages = [
  'Initialising Epildevconnect...',
  'Loading quantum core...',
  'Connecting to Lanyard API...',
  'Syncing Last.fm stream...',
  'Fetching WakaTime data...',
  'Activating modules...',
  'System ready.',
];

export default function BootSequence({ onComplete, onSkip }: BootSequenceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);

  useEffect(() => {
    if (currentIndex < bootMessages.length) {
      const timer = setTimeout(() => {
        setDisplayedMessages((prev) => [...prev, bootMessages[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 500);

      return () => clearTimeout(completeTimer);
    }
  }, [currentIndex, onComplete]);

  return (
    <div className="fixed inset-0 bg-dark-900 z-50 flex items-center justify-center">
      <div className="max-w-2xl w-full px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-8 font-mono"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-quantum-glow rounded-full animate-pulse"></div>
            <span className="text-quantum-glow text-sm">BOOTING SYSTEM</span>
          </div>

          <div className="space-y-2 min-h-[200px]">
            {displayedMessages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-gray-300 text-sm"
              >
                <span className="text-green-400 mr-2">{'>'}</span>
                {message}
              </motion.div>
            ))}
            {currentIndex < bootMessages.length && (
              <div className="text-gray-300 text-sm">
                <span className="text-green-400 mr-2">{'>'}</span>
                <span className="terminal-cursor inline-block w-2 h-4 bg-quantum-glow ml-1"></span>
              </div>
            )}
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onSkip}
            className="mt-6 text-xs text-gray-500 hover:text-quantum-glow transition-colors"
          >
            Press any key to skip...
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}


