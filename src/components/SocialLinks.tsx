import { 
  Instagram, 
  Youtube, 
  Facebook,
  Send
} from 'lucide-react';

// X (Twitter) Icon Component (official X logo SVG)
const XIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// TikTok Icon Component (custom SVG)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { 
    name: 'X', 
    icon: XIcon, 
    url: import.meta.env.VITE_SOCIAL_TWITTER || '#',
    color: 'hover:text-gray-200'
  },
  { 
    name: 'Instagram', 
    icon: Instagram, 
    url: import.meta.env.VITE_SOCIAL_INSTAGRAM || '#',
    color: 'hover:text-[#E4405F]'
  },
  { 
    name: 'YouTube', 
    icon: Youtube, 
    url: import.meta.env.VITE_SOCIAL_YOUTUBE || '#',
    color: 'hover:text-[#FF0000]'
  },
  { 
    name: 'TikTok', 
    icon: TikTokIcon, 
    url: import.meta.env.VITE_SOCIAL_TIKTOK || '#',
    color: 'hover:text-[#00F2EA]'
  },
  { 
    name: 'Telegram', 
    icon: Send, 
    url: import.meta.env.VITE_SOCIAL_TELEGRAM || '#',
    color: 'hover:text-[#0088cc]'
  },
  { 
    name: 'Facebook', 
    icon: Facebook, 
    url: import.meta.env.VITE_SOCIAL_FACEBOOK || '#',
    color: 'hover:text-[#1877F2]'
  },
];

export default function SocialLinks() {
  return (
    <>
      {/* Desktop Social Links - Left Side */}
      <div className="fixed bottom-8 left-8 z-50 hidden lg:block">
        <div className="flex flex-col gap-4 glass rounded-2xl p-4 glow-box">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-xl transition-all duration-300 text-gray-400 hover:bg-white hover:bg-opacity-5 ${social.color}`}
              onMouseEnter={(e) => {
                if (social.name === 'TikTok') {
                  e.currentTarget.classList.add('text-[#00F2EA]');
                  e.currentTarget.classList.remove('text-gray-400');
                }
              }}
              onMouseLeave={(e) => {
                if (social.name === 'TikTok') {
                  e.currentTarget.classList.remove('text-[#00F2EA]');
                  e.currentTarget.classList.add('text-gray-400');
                }
              }}
              aria-label={social.name}
            >
              <social.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>

      {/* Mobile Social Links - Bottom */}
      <div 
        style={{ left: '50%', transform: 'translateX(-50%)' }}
        className="fixed bottom-6 z-40 lg:hidden"
      >
        <div className="flex justify-center gap-2 glass rounded-2xl p-3 shadow-xl mx-auto">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 rounded-xl transition-all duration-300 text-gray-400 hover:bg-white hover:bg-opacity-5 ${social.color}`}
              onMouseEnter={(e) => {
                if (social.name === 'TikTok') {
                  e.currentTarget.classList.add('text-[#00F2EA]');
                  e.currentTarget.classList.remove('text-gray-400');
                }
              }}
              onMouseLeave={(e) => {
                if (social.name === 'TikTok') {
                  e.currentTarget.classList.remove('text-[#00F2EA]');
                  e.currentTarget.classList.add('text-gray-400');
                }
              }}
              aria-label={social.name}
            >
              <social.icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}


