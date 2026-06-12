import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Mail, Building2 } from 'lucide-react';
import { usePolling, useIdleDetection, useUptime } from '../utils/hooks';
import { fetchLanyardData, fetchLastFmData, fetchWakaTimeData, fetchDiscordProfile } from '../utils/api';
import { useTilt } from '../utils/useTilt';
import DiscordPresence from '../components/DiscordPresence';
import NowPlaying from '../components/NowPlaying';
import WakaTimeStats from '../components/WakaTimeStats';
import ActivityFeed from '../components/ActivityFeed';
import SystemUptime from '../components/SystemUptime';

const DISCORD_USER_ID = import.meta.env.VITE_DISCORD_USER_ID || '850726663289700373';

const marqueeItems = [
  'Minecraft Hosting',
  'Custom Plugins',
  'Website Development',
  'Backend Development',
  'Discord Bots',
  'Automation Tools',
  'IT Support',
  'Server Management',
  'Security Services',
  '8 Ball Pool Services',
];

function CountUpStat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <div ref={ref}>
      <div className="text-2xl lg:text-3xl font-bold text-white tabular-nums heading-display">
        {display}
        {suffix}
      </div>
      <div className="text-[11px] font-mono uppercase tracking-widest text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function TiltCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const tilt = useTilt(5);
  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.25s ease-out' }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const isIdle = useIdleDetection(60000);
  const uptime = useUptime();

  const lanyard = usePolling(() => fetchLanyardData(DISCORD_USER_ID), 10000, true, true);
  const lastfm = usePolling(() => fetchLastFmData(), 10000, true, true);
  const wakatime = usePolling(() => fetchWakaTimeData(), 30000, true, true);
  const discordProfile = usePolling(() => fetchDiscordProfile(DISCORD_USER_ID), 30000, true, true);

  const safeUptime = uptime || { formatted: '00:00:00' };

  return (
    <div className="min-h-screen px-4 py-12 lg:px-12 lg:py-16">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="relative mb-16 lg:mb-24 pt-6 lg:pt-10">
          {/* Subtle accent glow behind hero */}
          <div
            aria-hidden
            className="absolute -top-20 -left-20 w-[36rem] h-[36rem] rounded-full opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(0,217,255,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-4xl"
          >
            {/* Eyebrow */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono font-semibold tracking-[0.18em] uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Available for work
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-gray-400 text-[10px] font-mono tracking-[0.18em] uppercase">
                <Building2 className="w-3 h-3" />
                Ltd Company · UK
              </span>
            </div>

            {/* Headline */}
            <h1 className="heading-display text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
              <span className="text-white">We build, host</span>
              <br />
              <span className="heading-gradient">and automate.</span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl">
              Professional software, hosting and automation from a UK registered company.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/services"
                className="cta-primary group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-quantum-glow to-purple-500 text-black font-semibold text-sm tracking-wide hover:shadow-[0_0_30px_rgba(0,217,255,0.4)] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Explore Services
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-200 font-semibold text-sm border border-white/10 transition-all"
              >
                <Mail className="w-4 h-4" />
                Start a project
              </Link>
            </div>

            {/* Trust strip */}
            <div className="mt-10 pt-6 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
              <CountUpStat value={11} suffix="+" label="Services" />
              <CountUpStat value={5} label="Bare-metal Servers" />
              <CountUpStat value={100} suffix="%" label="Custom Built" />
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-white heading-display">UK</div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-gray-500 mt-0.5">Registered Ltd</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Services marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="marquee mb-16 lg:mb-20 py-4 border-y border-white/[0.05]"
        >
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-10 text-sm font-mono text-gray-500 whitespace-nowrap">
                {item}
                <span className="text-quantum-glow/40" aria-hidden>&#9670;</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Live status section header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-end justify-between gap-4"
        >
          <div>
            <p className="section-kicker mb-1">Live Dashboard</p>
            <h2 className="heading-display text-2xl lg:text-3xl text-white">What I'm up to right now</h2>
          </div>
        </motion.div>

        {/* Bento Dashboard Grid */}
        <div className="bento-grid">
          {/* Discord Profile - tall card */}
          <TiltCard className="bento-discord" delay={0.2}>
            <DiscordPresence
              data={lanyard.data}
              profileData={discordProfile.data}
              isLoading={lanyard.isLoading}
              profileIsLoading={discordProfile.isLoading}
              error={lanyard.error}
              hideDetails={isIdle}
              isOffline={lanyard.isOffline}
            />
          </TiltCard>

          {/* Now Playing */}
          <TiltCard className="bento-music" delay={0.3}>
            <NowPlaying
              data={lastfm.data}
              isLoading={lastfm.isLoading}
              error={lastfm.error}
              hideDetails={isIdle}
              isOffline={lastfm.isOffline}
            />
          </TiltCard>

          {/* WakaTime Stats */}
          <TiltCard className="bento-waka" delay={0.35}>
            <WakaTimeStats
              data={wakatime.data}
              isLoading={wakatime.isLoading}
              error={wakatime.error}
              isOffline={wakatime.isOffline}
            />
          </TiltCard>

          {/* System Uptime */}
          <TiltCard className="bento-uptime" delay={0.4}>
            <SystemUptime uptime={safeUptime.formatted} />
          </TiltCard>

          {/* Activity Feed */}
          <TiltCard className="bento-activity" delay={0.45}>
            <ActivityFeed
              lanyardData={lanyard.data}
              lastfmData={lastfm.data}
              wakatimeData={wakatime.data}
              hideDetails={isIdle}
              isLoading={wakatime.isLoading || lastfm.isLoading || lanyard.isLoading}
              error={wakatime.error || lastfm.error || lanyard.error}
            />
          </TiltCard>
        </div>
      </div>
    </div>
  );
}
