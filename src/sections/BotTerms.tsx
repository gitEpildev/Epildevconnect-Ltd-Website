import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, Shield, Scale, Ban, FileText, Building2, ExternalLink } from 'lucide-react';

export default function BotTerms() {
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
              Bot Terms of Service
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
                These Terms of Service ("Terms") apply to all Discord bots and applications developed, published, or
                operated by Epildevconnect Ltd ("Epildev", "we", "us"). This includes, but is not limited to:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Achievements</li>
                <li>Guess The Object BOT</li>
                <li>Any other bot or application we currently operate or release in the future</li>
              </ul>
              <p className="leading-relaxed">
                One document covers them all. By inviting, installing, or interacting with any of our bots, you agree
                to these Terms.
              </p>
            </div>
          </section>

          {/* Who we are */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-quantum-glow" />
              2. Who We Are
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
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
                . We build and operate software, hosting, and automation services.
              </p>
              <p className="leading-relaxed">
                We carry out development work for the Bloons TD 6 Community, Galaxy Realms Servers, and other gaming
                communities and businesses.
              </p>
            </div>
          </section>

          {/* Acceptable use */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-quantum-glow" />
              3. Acceptable Use
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">By using any of our bots, you agree that you will NOT:</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Use the bot in any way that is unlawful, harmful, or abusive</li>
                <li>Attempt to exploit, crash, overload, or disrupt the bot or its infrastructure</li>
                <li>Use the bot to harass, threaten, or harm other users</li>
                <li>Attempt to extract, scrape, or harvest data from the bot</li>
                <li>Use the bot to send spam or unsolicited content</li>
                <li>Attempt to gain unauthorised access to our systems</li>
                <li>Use the bot in any way that may harm the reputation of Epildevconnect Ltd</li>
              </ul>
              <p className="leading-relaxed">
                You must also comply with Discord's own{' '}
                <a
                  href="https://discord.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-quantum-glow hover:underline"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="https://discord.com/guidelines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-quantum-glow hover:underline"
                >
                  Community Guidelines
                </a>{' '}
                at all times.
              </p>
            </div>
          </section>

          {/* Licence */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-quantum-glow" />
              4. Licence
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                Our software is released under the MIT License with Additional Terms:
              </p>
              <div className="bg-dark-800/60 border border-white/10 rounded-xl p-5 font-mono text-sm leading-relaxed space-y-3 text-gray-400">
                <p className="text-gray-300 font-semibold">MIT License with Additional Terms</p>
                <p>Copyright (c) 2026 Epildevconnect Ltd (Epildev)</p>
                <p>
                  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
                  associated documentation files (the "Software"), to deal in the Software without restriction. This
                  includes the rights to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of
                  the Software, subject to the following conditions:
                </p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    The above copyright notice and this permission notice must be included in all copies or substantial
                    portions of the Software.
                  </li>
                  <li>
                    Attribution to Epildevconnect Ltd must be clearly stated in any public use, distribution, or
                    derivative work of the Software.
                  </li>
                  <li>
                    The Software must not be used in any way that is unlawful or that may harm the reputation of
                    Epildevconnect Ltd.
                  </li>
                  <li>
                    No trademark rights are granted. The name "Epildev", "Epildevconnect Ltd", or associated branding
                    must not be used without prior written permission.
                  </li>
                  <li>
                    The Software must not be resold as a standalone product without significant modification or added
                    value.
                  </li>
                </ol>
                <p>
                  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
                  LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
                </p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
                  FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS
                  INTERRUPTION, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR ITS USE.
                </p>
                <p>This software is protected under the Copyright, Designs and Patents Act 1988.</p>
              </div>
            </div>
          </section>

          {/* Availability */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Ban className="w-6 h-6 text-red-400" />
              5. Availability, Suspension and Termination
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                Our bots are provided free of charge and as-is. We reserve the right to:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Take any bot offline, temporarily or permanently, at any time without notice</li>
                <li>Blacklist users or servers that abuse or misuse our bots</li>
                <li>Modify, remove, or add features at any time</li>
              </ul>
              <p className="leading-relaxed">
                We are not obliged to provide support, uptime guarantees, or advance notice of changes.
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Disclaimer of Warranties</h2>
            <p className="text-gray-300 leading-relaxed">
              ALL BOTS AND SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT
              GUARANTEE THAT ANY BOT WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, EPILDEVCONNECT LTD SHALL NOT BE LIABLE FOR ANY CLAIM, DAMAGES, OR
              OTHER LIABILITY, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION, ARISING FROM, OUT OF, OR IN
              CONNECTION WITH THE USE OF ANY OF OUR BOTS OR SERVICES.
            </p>
          </section>

          {/* Governing law */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-quantum-glow" />
              8. Governing Law
            </h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms and any dispute or claim arising out of or in connection with them, including non-contractual
              disputes or claims, shall be governed by the laws of England and Wales. The courts of England and Wales
              shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with
              these Terms.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Changes to These Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update these Terms at any time. Continued use of any of our bots after changes are posted
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Contact</h2>
            <div className="space-y-2 text-gray-300">
              <p className="leading-relaxed">Questions about these Terms? Reach us via:</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Discord: Epildev</li>
                <li>
                  GitHub:{' '}
                  <a
                    href="https://github.com/GitEpildev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-quantum-glow hover:underline"
                  >
                    github.com/GitEpildev
                  </a>
                </li>
                <li>
                  Website:{' '}
                  <Link to="/contact" className="text-quantum-glow hover:underline">
                    Contact form
                  </Link>
                </li>
              </ul>
            </div>
          </section>

          {/* Footer block */}
          <section className="border-t border-white/10 pt-6">
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              Epildevconnect Ltd (Company No. 17247566), registered in England and Wales.
              <br />
              See also our{' '}
              <Link to="/discord/privacy" className="text-quantum-glow hover:underline">
                Bot Privacy Policy
              </Link>
              .
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
