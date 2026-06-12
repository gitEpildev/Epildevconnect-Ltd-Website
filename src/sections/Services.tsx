import { motion } from 'framer-motion';
import {
  Server,
  Puzzle,
  Globe,
  Database,
  LifeBuoy,
  Settings,
  ShieldCheck,
  Bot,
  Cpu,
  Code2,
  Sparkles,
  Target,
  ExternalLink,
  MessageSquare,
  ClipboardList,
  Hammer,
  HeartHandshake,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTilt } from '../utils/useTilt';
import PageHeader from '../components/PageHeader';

interface Service {
  title: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
  link?: { label: string; url: string };
}

const services: Service[] = [
  {
    title: 'Minecraft Hosting',
    description:
      'Powerful, low-latency Minecraft servers running on dedicated bare-metal hardware. Whitelisted networks, modpacks, Velocity proxies and custom configurations.',
    icon: Server,
    color: '#22c55e',
    features: ['Bare-metal performance', 'DDoS protection', 'Custom configs', '24/7 uptime'],
  },
  {
    title: 'Custom Minecraft Plugins',
    description:
      'Bespoke Spigot, Paper and Velocity plugins built to spec. From TeleHop-style movement systems to economy, custom GUIs and game-mode mechanics.',
    icon: Puzzle,
    color: '#10b981',
    features: ['Spigot / Paper / Velocity', 'API integrations', 'Production-grade code', 'Long-term support'],
  },
  {
    title: 'Website Development',
    description:
      'Modern, responsive websites built with React, TypeScript and Tailwind. From simple landing pages to complex dashboards and storefronts.',
    icon: Globe,
    color: '#00d9ff',
    features: ['React / Next.js', 'Tailwind / SCSS', 'SEO & performance', 'Mobile-first'],
  },
  {
    title: 'Backend Development',
    description:
      'Scalable APIs, microservices and real-time backends. Node, Express, PostgreSQL, Redis, Docker and full CI/CD pipelines.',
    icon: Database,
    color: '#3b82f6',
    features: ['REST & WebSocket APIs', 'PostgreSQL / Redis', 'Auth & OAuth', 'Docker deployments'],
  },
  {
    title: 'IT Support',
    description:
      'Reactive and proactive IT support for individuals and small businesses. Troubleshooting, configuration, infrastructure advice and emergency fixes.',
    icon: LifeBuoy,
    color: '#8b5cf6',
    features: ['Remote diagnostics', 'Network troubleshooting', 'Emergency response', 'Friendly humans'],
  },
  {
    title: 'Server Setup & Management',
    description:
      'End-to-end server provisioning: Ubuntu, Nginx, Cloudflare tunnels, SSL, monitoring and hardening. Set it up once, run it forever.',
    icon: Settings,
    color: '#a855f7',
    features: ['Nginx / Cloudflare', 'SSL & DNS', 'Monitoring & logging', 'Automated backups'],
  },
  {
    title: 'Security Services',
    description:
      'Lock down your stack: SSH hardening, fail2ban, firewalls, secrets management, security audits and incident response.',
    icon: ShieldCheck,
    color: '#ef4444',
    features: ['Hardening audits', 'Firewall & WAF', 'Secrets management', 'Incident response'],
  },
  {
    title: 'Discord Bots',
    description:
      'Custom Discord bots tailored to your community: moderation, giveaways, tickets, role automation, music, AI assistants and integrations.',
    icon: Bot,
    color: '#5865f2',
    features: ['discord.js / py-cord', 'Slash commands', 'Database-backed', 'Custom dashboards'],
  },
  {
    title: 'Automation Tools',
    description:
      'Save hours every week with custom automation: web scrapers, browser automation, scheduled jobs, integrations and data pipelines.',
    icon: Cpu,
    color: '#f59e0b',
    features: ['Browser automation', 'Cron / queues', 'API integrations', 'Reporting dashboards'],
  },
  {
    title: '8 Ball Pool Services',
    description:
      'Services for 8 Ball Pool by Miniclip: Cash, Coins, Cues and more, handled directly by me. Looking for free rewards instead? Check out 8BP Rewards, our separate free rewards platform.',
    icon: Target,
    color: '#eab308',
    features: ['Cash & Coins', 'Cue unlocks', 'Fast turnaround', 'Trusted service'],
    link: { label: 'Free rewards: 8BP Rewards', url: 'https://8ballpool.website/8bp-rewards/home' },
  },
  {
    title: 'Custom Coding Solutions',
    description:
      "If you can describe it, I can probably build it. Tailor-made software for creators, businesses and gaming communities, built properly, documented and supported.",
    icon: Code2,
    color: '#ec4899',
    features: ['Tailor-made', 'Documented & tested', 'Long-term support', 'No black boxes'],
  },
];

const processSteps = [
  { title: 'Enquire', description: 'Tell us what you need through the contact page.', icon: MessageSquare },
  { title: 'Scope', description: 'We agree the spec, timeline and price up front.', icon: ClipboardList },
  { title: 'Build', description: 'Your project is built, tested and kept on track.', icon: Hammer },
  { title: 'Support', description: 'Delivered, documented and supported long-term.', icon: HeartHandshake },
];

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const tilt = useTilt(3);
  const Icon = service.icon;

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-hover rounded-2xl p-6 flex flex-col h-full group"
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.2s ease-out' }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${service.color}1f`, border: `1px solid ${service.color}33` }}
        >
          <Icon className="w-6 h-6" style={{ color: service.color }} />
        </div>
        <h3 className="text-lg font-semibold tracking-tight leading-tight">{service.title}</h3>
      </div>

      <p className="text-gray-400 text-sm leading-relaxed mb-5 flex-grow">{service.description}</p>

      <ul className="space-y-1.5 mb-5">
        {service.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-gray-500 font-mono">
            <span
              className="w-1 h-1 rounded-full flex-shrink-0"
              style={{ background: service.color }}
            />
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Link
          to="/contact"
          className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm font-mono text-gray-300 hover:text-white transition-all border border-white/[0.06]"
        >
          Enquire
          <span aria-hidden>&rarr;</span>
        </Link>
        {service.link && (
          <a
            href={service.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-xl text-sm font-mono transition-all border"
            style={{
              background: `${service.color}14`,
              borderColor: `${service.color}40`,
              color: service.color,
            }}
          >
            {service.link.label}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function Services() {
  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          icon={Sparkles}
          kicker="What we do"
          title="Built for"
          accent="you."
          description="Custom development, hosting and automation for creators, businesses and gaming communities. Everything below is delivered, documented and supported by me directly."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>

        {/* Process strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-14"
        >
          <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500 mb-1 text-center">How it works</p>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white text-center mb-8">
            From idea to delivery
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="glass rounded-2xl p-5 relative"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-quantum-glow/10 border border-quantum-glow/25 flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-quantum-glow" />
                  </span>
                  <span className="text-xs font-mono text-gray-600">0{i + 1}</span>
                </div>
                <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 glass rounded-2xl p-8 lg:p-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-quantum-glow/10 via-purple-500/5 to-transparent" />
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3 tracking-tight">
              Got a project in mind?
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Drop a message and let's talk. No bots, no sales reps. You'll be talking to me directly.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-quantum-glow/15 hover:bg-quantum-glow/25 text-quantum-glow font-mono text-sm border border-quantum-glow/30 transition-all"
            >
              Get in touch
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
