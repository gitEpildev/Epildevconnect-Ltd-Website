import { motion } from 'framer-motion';
import { usePolling, useIdleDetection, useUptime } from '../utils/hooks';
import { fetchLanyardData, fetchLastFmData, fetchWakaTimeData, fetchDiscordProfile } from '../utils/api';
import DiscordPresence from '../components/DiscordPresence';
import NowPlaying from '../components/NowPlaying';
import WakaTimeStats from '../components/WakaTimeStats';
import ActivityFeed from '../components/ActivityFeed';
import SystemUptime from '../components/SystemUptime';

const DISCORD_USER_ID = import.meta.env.VITE_DISCORD_USER_ID || '850726663289700373';

export default function Home() {
  const isIdle = useIdleDetection(60000);
  const uptime = useUptime();

  // Poll APIs at reasonable intervals to avoid rate limiting
  // persistOnError: true keeps showing last known data when offline
  const lanyard = usePolling(() => fetchLanyardData(DISCORD_USER_ID), 10000, true, true); // Every 10 seconds
  const lastfm = usePolling(() => fetchLastFmData(), 10000, true, true); // Every 10 seconds
  const wakatime = usePolling(() => fetchWakaTimeData(), 30000, true, true); // Every 30 seconds
  const discordProfile = usePolling(() => fetchDiscordProfile(DISCORD_USER_ID), 30000, true, true); // Every 30 seconds

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
          <h1 className="text-6xl lg:text-8xl font-bold mb-4 glow-text tracking-tight">
            MY HUB
          </h1>
          <p className="text-xl text-gray-400 font-mono">
            Real-time command centre by{' '}
            <span className="text-quantum-glow">@epildev</span>
          </p>
        </motion.div>

        {/* System Uptime */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <SystemUptime uptime={uptime.formatted} />
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Discord Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <DiscordPresence
              data={lanyard.data}
              profileData={discordProfile.data}
              isLoading={lanyard.isLoading}
              profileIsLoading={discordProfile.isLoading}
              error={lanyard.error}
              hideDetails={isIdle}
              isOffline={lanyard.isOffline}
            />
          </motion.div>

          {/* Now Playing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <NowPlaying
              data={lastfm.data}
              isLoading={lastfm.isLoading}
              error={lastfm.error}
              hideDetails={isIdle}
              isOffline={lastfm.isOffline}
            />
          </motion.div>

          {/* WakaTime Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <WakaTimeStats
              data={wakatime.data}
              isLoading={wakatime.isLoading}
              error={wakatime.error}
              isOffline={wakatime.isOffline}
            />
          </motion.div>
        </div>

        {/* Combined Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <ActivityFeed
            lanyardData={lanyard.data}
            lastfmData={lastfm.data}
            wakatimeData={wakatime.data}
            hideDetails={isIdle}
          />
        </motion.div>
      </div>
    </div>
  );
}


