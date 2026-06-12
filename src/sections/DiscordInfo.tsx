import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, FileText, ShieldCheck, Mail, ArrowRight, Building2, ExternalLink, Gamepad2 } from 'lucide-react';

const cards = [
  {
    title: 'Bot Terms of Service',
    description: 'The terms that apply to every Discord bot we operate, current and future.',
    icon: FileText,
    to: '/discord/terms',
  },
  {
    title: 'Bot Privacy Policy',
    description: 'What data our bots collect, how it is stored, and your rights under UK law.',
    icon: ShieldCheck,
    to: '/discord/privacy',
  },
  {
    title: 'Support & Contact',
    description: 'Need help with one of our bots, or want one built for your server? Get in touch.',
    icon: Mail,
    to: '/contact',
  },
];

export default function DiscordInfo() {
  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Bot className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">Discord Information</h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Epildevconnect Ltd builds and operates Discord bots and applications, including Achievements, Guess The
            Object BOT, and more. Everything you need to know about using them lives here.
          </p>
        </motion.div>

        {/* Communities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center gap-4 justify-center text-center sm:text-left"
        >
          <Gamepad2 className="w-8 h-8 text-quantum-glow flex-shrink-0" />
          <p className="text-gray-300 leading-relaxed">
            We carry out development work for the <span className="text-white font-semibold">Bloons TD 6 Community</span>,{' '}
            <span className="text-white font-semibold">Galaxy Realms Servers</span>, and other gaming communities and
            businesses.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {cards.map((card, i) => (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
            >
              <Link
                to={card.to}
                className="glass glass-hover rounded-2xl p-6 flex flex-col h-full group transition-all"
              >
                <card.icon className="w-7 h-7 text-quantum-glow mb-4" />
                <h2 className="text-lg font-bold mb-2 text-white">{card.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed flex-1">{card.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-quantum-glow">
                  View
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Company strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-gray-500 flex items-center justify-center gap-2 flex-wrap"
        >
          <Building2 className="w-4 h-4" />
          <span>Epildevconnect Ltd, registered in England and Wales</span>
          <span className="text-gray-600">·</span>
          <a
            href="https://find-and-update.company-information.service.gov.uk/company/17247566"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            Company No. 17247566
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
