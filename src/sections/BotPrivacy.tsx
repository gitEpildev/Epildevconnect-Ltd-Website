import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, Database, Lock, Trash2, Scale, Building2, ExternalLink, ShieldCheck } from 'lucide-react';

export default function BotPrivacy() {
  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Bot className="w-8 h-8 text-quantum-glow" />
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Bot Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono">
            Last updated: 12 June 2026
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl p-8 space-y-8"
        >
          {/* Scope */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Scope</h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                This Privacy Policy applies to all Discord bots and applications developed, published, or operated by
                Epildevconnect Ltd ("Epildev", "we", "us"), including but not limited to Achievements, Guess The Object
                BOT, and any bots we release in the future. One document covers them all.
              </p>
              <p className="leading-relaxed">
                By inviting, installing, or interacting with any of our bots, you agree to the practices described in
                this policy.
              </p>
            </div>
          </section>

          {/* Who we are */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-quantum-glow" />
              2. Who We Are
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Epildevconnect Ltd is a registered company in England and Wales, Company No.{' '}
              <a
                href="https://find-and-update.company-information.service.gov.uk/company/17247566"
                target="_blank"
                rel="noopener noreferrer"
                className="text-quantum-glow hover:underline inline-flex items-center gap-1"
              >
                17247566
                <ExternalLink className="w-3 h-3" />
              </a>
              . We carry out development work for the Bloons TD 6 Community, Galaxy Realms Servers, and other gaming
              communities and businesses.
            </p>
          </section>

          {/* Data we collect */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-quantum-glow" />
              3. Data We Collect
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                Our bots only collect what they need to function. Depending on the bot, this may include:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Discord user IDs and usernames</li>
                <li>Server (guild) IDs and channel IDs</li>
                <li>Command inputs and interactions with the bot</li>
                <li>Game statistics, achievements, scores, and progress data managed by the bot</li>
              </ul>
              <p className="leading-relaxed">
                We do not read or store message content beyond what is required to process a command directed at the
                bot.
              </p>
            </div>
          </section>

          {/* What we don't do */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              4. What We Do NOT Do
            </h2>
            <ul className="space-y-2 text-gray-300 list-disc list-inside ml-4">
              <li>We do not sell your data to anyone</li>
              <li>We do not share your data with third parties</li>
              <li>We do not use your data for advertising or profiling</li>
              <li>We do not track you beyond what the bot needs to function</li>
              <li>We will never use your data in a harmful way</li>
            </ul>
          </section>

          {/* Storage */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-quantum-glow" />
              5. Storage and Retention
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                Data is stored securely on infrastructure owned and operated by Epildevconnect Ltd. We keep data only
                for as long as it is needed for the bot to function.
              </p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Data tied to a server is removed when the bot is removed from that server</li>
                <li>Inactive data may be deleted periodically</li>
                <li>You may request deletion of your data at any time (see section 6)</li>
              </ul>
            </div>
          </section>

          {/* Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-quantum-glow" />
              6. Your Rights
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                Under UK data protection law (UK GDPR and the Data Protection Act 2018), you have the right to:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Request a copy of the data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict our processing of your data</li>
              </ul>
              <p className="leading-relaxed">
                To exercise any of these rights, contact us on Discord (Epildev) or through the{' '}
                <Link to="/contact" className="text-quantum-glow hover:underline">
                  contact form
                </Link>{' '}
                on our website. We will respond within a reasonable timeframe.
              </p>
            </div>
          </section>

          {/* Discord */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Discord</h2>
            <p className="text-gray-300 leading-relaxed">
              Our bots operate on the Discord platform. Discord's own collection and use of your data is governed by{' '}
              <a
                href="https://discord.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-quantum-glow hover:underline"
              >
                Discord's Privacy Policy
              </a>
              , which is separate from this policy.
            </p>
          </section>

          {/* Governing law */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-quantum-glow" />
              8. Governing Law
            </h2>
            <p className="text-gray-300 leading-relaxed">
              This policy and any dispute or claim arising out of or in connection with it shall be governed by the
              laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this policy at any time. Continued use of any of our bots after changes are posted
              constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Footer block */}
          <section className="border-t border-white/10 pt-6">
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              Epildevconnect Ltd (Company No. 17247566), registered in England and Wales.
              <br />
              See also our{' '}
              <Link to="/discord/terms" className="text-quantum-glow hover:underline">
                Bot Terms of Service
              </Link>
              .
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
