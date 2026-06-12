import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <Shield className="w-8 h-8 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl p-8 space-y-8"
        >
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-quantum-glow" />
              Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed">
              This Privacy Policy explains how Epildevconnect Ltd ("we", "us", or "our") collects, uses, and protects your personal information when you use our website and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-quantum-glow" />
              Information We Collect
            </h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">Discord Information</h3>
                <p className="leading-relaxed">
                  When you log in with Discord, we collect your Discord user ID, username, and avatar. This information is used to identify you and personalise your experience.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">IP Address</h3>
                <p className="leading-relaxed">
                  We automatically collect your IP address for security purposes, including preventing abuse and protecting our services from malicious activity.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Messages and Conversations</h3>
                <p className="leading-relaxed">
                  All messages you send through our messaging system are stored in our database. This allows us to maintain conversation history and provide support when needed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Usage Data</h3>
                <p className="leading-relaxed">
                  We collect information about how you interact with our services, including login times, pages visited, and features used.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-quantum-glow" />
              How We Use Your Information
            </h2>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              <li>To provide and maintain our services</li>
              <li>To enable communication through our messaging system</li>
              <li>To prevent abuse, fraud, and malicious activity</li>
              <li>To improve and optimise our services</li>
              <li>To respond to your enquiries and provide support</li>
              <li>To enforce our Terms of Service and protect our rights</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate technical and organisational security measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and comply with our legal obligations. You may request deletion of your account and data at any time by contacting us.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>File a complaint with a supervisory authority</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed">
              We use Discord OAuth for authentication. When you log in, you are subject to Discord's Privacy Policy. We do not share your personal information with other third parties without your consent.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us through the messaging system or via the contact form on our website.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this policy.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

