import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface SystemUptimeProps {
  uptime: string;
}

export default function SystemUptime({ uptime }: SystemUptimeProps) {
  // Safety check - ensure uptime is always a string
  const displayUptime = uptime || '00:00:00';
  
  return (
    <motion.div
      layout
      className="glass glass-hover rounded-2xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-quantum-glow bg-opacity-10 rounded-lg">
            <Clock className="w-5 h-5 text-quantum-glow" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-mono">SYSTEM UPTIME</p>
            <p className="text-xl font-mono font-bold text-quantum-glow">{displayUptime}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-green-400 font-mono">ONLINE</span>
        </div>
      </div>
    </motion.div>
  );
}


