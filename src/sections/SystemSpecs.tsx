import { motion } from 'framer-motion';
import { Monitor, Server, Cpu, MemoryStick, HardDrive, Package, Activity } from 'lucide-react';
import { fetchSystemSpecs } from '../utils/api';
import { usePolling } from '../utils/hooks';

export default function SystemSpecs() {
  // Poll system specs every 5 seconds for real-time CPU/RAM updates
  const specs = usePolling(() => fetchSystemSpecs(), 5000, true, true);
  
  const isLoading = specs.isLoading;
  const error = specs.error;

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-1/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-700 rounded-xl"></div>
                <div className="h-64 bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !specs.data) {
    return (
      <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-gray-400">Failed to load system specifications</p>
          </div>
        </div>
      </div>
    );
  }

  const macSpecs = specs.data.mac;
  const vpsSpecs = specs.data.vps;

  const SpecItem = ({ icon: Icon, label, value, color = 'text-quantum-glow' }: { icon: any; label: string; value: string; color?: string }) => (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white bg-opacity-5 hover:bg-opacity-10 transition-all">
      <div className={`p-2 rounded-lg bg-quantum-glow bg-opacity-10 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-mono mb-1">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center lg:text-left"
        >
          <div className="flex items-center gap-4 mb-4">
            <Package className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              System Specifications
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono">
            My Hardware and system details
          </p>
        </motion.div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mac Specs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass glass-hover rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-quantum-glow bg-opacity-10 rounded-lg">
                <Monitor className="w-6 h-6 text-quantum-glow" />
              </div>
              <div>
                <h2 className="text-2xl font-mono font-bold">Mac</h2>
                <p className="text-sm text-gray-400 font-mono">{macSpecs.model}</p>
              </div>
            </div>
            <div className="space-y-3">
              <SpecItem icon={Cpu} label="Processor" value={macSpecs.cpu} />
              <SpecItem icon={MemoryStick} label="Memory" value={macSpecs.ram} />
              <SpecItem icon={HardDrive} label="Storage" value={macSpecs.storage} />
              <SpecItem icon={Activity} label="Operating System" value={macSpecs.os} />
            </div>
          </motion.div>

          {/* VPS Specs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass glass-hover rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-quantum-glow bg-opacity-10 rounded-lg">
                <Server className="w-6 h-6 text-quantum-glow" />
              </div>
              <div>
                <h2 className="text-2xl font-mono font-bold">VPS Server</h2>
                <p className="text-sm text-gray-400 font-mono">{vpsSpecs.hostname}</p>
              </div>
            </div>
            <div className="space-y-3">
              <SpecItem 
                icon={Cpu} 
                label="Processor" 
                value={vpsSpecs.cpu} 
              />
              <SpecItem 
                icon={MemoryStick} 
                label="Memory" 
                value={vpsSpecs.ram} 
              />
              <SpecItem icon={HardDrive} label="Storage" value={vpsSpecs.storage} />
              <SpecItem icon={Activity} label="Operating System" value={`${vpsSpecs.os} ${vpsSpecs.osRelease}`} />
              <SpecItem icon={Package} label="Node.js" value={vpsSpecs.nodeVersion} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

