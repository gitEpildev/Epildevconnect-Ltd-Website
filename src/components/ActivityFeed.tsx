import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Music, Code2, User } from 'lucide-react';

interface ActivityFeedProps {
  lanyardData: any;
  lastfmData: any;
  wakatimeData: any;
  hideDetails: boolean;
}

export default function ActivityFeed({
  lanyardData,
  lastfmData,
  wakatimeData,
  hideDetails,
}: ActivityFeedProps) {
  const activities: Array<{
    icon: any;
    text: string;
    color: string;
    timestamp?: string;
  }> = [];

  // Discord Activity
  if (lanyardData?.success) {
    const presence = lanyardData.data;
    const status = presence.discord_status;
    
    if (status === 'online' || status === 'idle' || status === 'dnd') {
      activities.push({
        icon: User,
        text: `Active on Discord`,
        color: 'text-quantum-glow',
      });
    }

    // Check for activities
    const discordActivities = presence.activities || [];
    discordActivities
      .filter((a: any) => a.type !== 4) // Exclude custom status
      .forEach((activity: any) => {
        if (activity.type === 2) {
          // Spotify
          activities.push({
            icon: Music,
            text: `Listening to ${activity.details} by ${activity.state}`,
            color: 'text-[#1DB954]',
          });
        } else {
          activities.push({
            icon: Activity,
            text: `${activity.name}: ${activity.details || activity.state || 'Active'}`,
            color: 'text-blue-400',
          });
        }
      });
  }

  // Last.fm Activity
  if (lastfmData?.recenttracks?.track?.[0]) {
    const track = lastfmData.recenttracks.track[0];
    const isNowPlaying = track['@attr']?.nowplaying === 'true';
    
    if (isNowPlaying) {
      activities.push({
        icon: Music,
        text: `Now playing: ${track.name} — ${track.artist['#text']}`,
        color: 'text-green-400',
      });
    }
  }

  // WakaTime Activity
  if (wakatimeData?.data) {
    const stats = wakatimeData.data;
    
    // Always show Cursor if it's in the editors list
    const cursorEditor = stats.editors?.find((editor: any) => 
      editor.name.toLowerCase() === 'cursor'
    );
    
    if (cursorEditor) {
      activities.push({
        icon: Code2,
        text: `Using Cursor (${cursorEditor.text})`,
        color: 'text-cyan-400',
      });
    }
    
    // Show top language
    const topLanguage = stats.languages?.[0];
    if (topLanguage) {
      activities.push({
        icon: Code2,
        text: `Coded ${stats.human_readable_total_including_other_language || stats.human_readable_total} in ${topLanguage.name}`,
        color: 'text-purple-400',
      });
    }
  }

  return (
    <motion.div
      layout
      className="glass glass-hover rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-quantum-glow" />
        <h3 className="font-mono text-lg font-semibold">Live Activity Feed</h3>
      </div>

      <AnimatePresence mode="wait">
        {hideDetails ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-gray-500 text-sm text-center py-4"
          >
            Activity hidden (idle mode)
          </motion.div>
        ) : activities.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white bg-opacity-5 hover:bg-opacity-10 transition-all"
              >
                <activity.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${activity.color}`} />
                <p className="text-sm flex-1">{activity.text}</p>
                {activity.timestamp && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {activity.timestamp}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-gray-500 text-sm text-center py-4 italic"
          >
            {hideDetails ? 'Activity hidden (idle mode)' : 'Waiting for activity updates...'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


