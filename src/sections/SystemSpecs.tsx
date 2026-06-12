import { motion } from 'framer-motion';
import { Monitor, Server, Cpu, MemoryStick, HardDrive, Package, Activity, Layers } from 'lucide-react';
import { fetchSystemSpecs } from '../utils/api';
import { usePolling } from '../utils/hooks';

function CircularGauge({ value, max, label, unit, color = '#00d9ff' }: {
  value: number; max: number; label: string; unit: string; color?: string;
}) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="gauge-ring"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-lg font-bold tabular-nums" style={{ color }}>{Math.round(pct * 100)}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-500 font-mono">{label}</p>
        {unit !== '%' && (
          <p className="text-xs text-gray-400 font-mono">{value}{unit} / {max}{unit}</p>
        )}
      </div>
    </div>
  );
}

function parseGBValue(str: string): number {
  const match = str.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function parseCpuPercent(str: string): number {
  const match = str.match(/([\d.]+)%/);
  return match ? parseFloat(match[1]) : 0;
}

export default function SystemSpecs() {
  const specs = usePolling(() => fetchSystemSpecs(), 5000, true, true);

  const isLoading = specs.isLoading;
  const error = specs.error;

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0, 1].map(i => (
              <div key={i} className="glass rounded-2xl p-6 space-y-4">
                <div className="skeleton-shimmer h-8 w-1/3" />
                <div className="skeleton-shimmer h-48 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !specs.data) {
    return (
      <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-gray-400 font-mono">Failed to load system specifications</p>
          </div>
        </div>
      </div>
    );
  }

  const macSpecs = specs.data.mac;
  const vpsSpecs = specs.data.vps;

  const vpsRamUsed = vpsSpecs.ramUsedGB ?? parseGBValue(vpsSpecs.ram?.split('/')[0] || '0');
  const vpsRamTotal = vpsSpecs.ramTotalGB ?? 128;
  const vpsStorageUsed = vpsSpecs.storageUsedGB ?? parseGBValue(vpsSpecs.storage?.split('/')[0] || '0');
  const vpsStorageTotal = vpsSpecs.storageTotalGB ?? (parseGBValue(vpsSpecs.storage?.split('/')[1] || '960') || 960);
  const vpsCpu = parseFloat(vpsSpecs.cpuUsagePercent) || parseCpuPercent(vpsSpecs.cpu);

  const SpecItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-all group">
      <div className="p-2 rounded-lg bg-quantum-glow/10">
        <Icon className="w-4 h-4 text-quantum-glow" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-500 font-mono uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <Package className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              System Specs
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono">
            Hardware and live system metrics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mac */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass glass-hover rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-quantum-glow/10 rounded-xl">
                <Monitor className="w-6 h-6 text-quantum-glow" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Mac</h2>
                <p className="text-xs text-gray-500 font-mono">{macSpecs.model}</p>
              </div>
            </div>
            <div className="space-y-2">
              <SpecItem icon={Cpu} label="Processor" value={macSpecs.cpu} />
              <SpecItem icon={MemoryStick} label="Memory" value={macSpecs.ram} />
              <SpecItem icon={HardDrive} label="Storage" value={macSpecs.storage} />
              <SpecItem icon={Activity} label="OS" value={macSpecs.os} />
            </div>
          </motion.div>

          {/* Bare Metal Server */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass glass-hover rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-quantum-glow/10 rounded-xl">
                <Server className="w-6 h-6 text-quantum-glow" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Bare Metal Server</h2>
                <p className="text-xs text-gray-500 font-mono">Dedicated Hardware</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>

            {/* Live usage gauges */}
            <div className="flex justify-around mb-5 py-4 px-2 rounded-xl bg-white/[0.02]">
              <CircularGauge value={vpsCpu} max={100} label="CPU" unit="%" color="#00d9ff" />
              <CircularGauge value={vpsRamUsed} max={vpsRamTotal} label="RAM" unit="GB" color="#8b5cf6" />
              <CircularGauge value={vpsStorageUsed} max={vpsStorageTotal} label="Disk" unit="GB" color="#0ea5e9" />
            </div>

            <div className="space-y-2">
              <SpecItem icon={Cpu} label="Processor" value="16 Core x 3.0 GHz (AMD EPYC 7302P)" />
              <SpecItem icon={MemoryStick} label="Memory" value="128 GB DDR4" />
              <SpecItem icon={HardDrive} label="Storage" value="2 x 960 GB NVMe (RAID 1)" />
              <SpecItem icon={Activity} label="OS" value="Ubuntu 24.04" />
              <SpecItem icon={Layers} label="Quantity" value="5x Bare Metal Servers" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
