import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Ban, Shield } from 'lucide-react';

export default function TermsOfService() {
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
            <FileText className="w-8 h-8 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Terms of Service
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
          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using Epildevconnect Ltd ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. Account Registration</h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                To use certain features of the Service, you must authenticate using Discord OAuth. By doing so, you agree to:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your Discord account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorised access</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-quantum-glow" />
              3. Acceptable Use Policy
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You agree NOT to use the Service to:
            </p>
            <ul className="space-y-2 text-gray-300 list-disc list-inside ml-4">
              <li>Violate any laws or regulations</li>
              <li>Send spam, unsolicited messages, or advertisements</li>
              <li>Harass, abuse, or threaten others</li>
              <li>Transmit malicious code, viruses, or harmful software</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Collect or harvest user data without permission</li>
              <li>Use automated systems (bots) without authorisation</li>
            </ul>
          </section>

          {/* Content Guidelines */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. Content Guidelines</h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                All content you submit through the Service (including messages) must comply with these guidelines:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>No illegal, harmful, or offensive content</li>
                <li>No copyrighted material without permission</li>
                <li>No personal information of others without consent</li>
                <li>No content that violates any third-party rights</li>
              </ul>
              <p className="leading-relaxed">
                We reserve the right to remove any content that violates these guidelines.
              </p>
            </div>
          </section>

          {/* Rate Limiting */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-quantum-glow" />
              5. Rate Limiting and Abuse Prevention
            </h2>
            <p className="text-gray-300 leading-relaxed">
              To protect our services and ensure fair usage, we implement rate limiting. Excessive requests or abusive behaviour may result in temporary or permanent restrictions on your access to the Service.
            </p>
          </section>

          {/* Account Suspension */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Ban className="w-6 h-6 text-red-400" />
              6. Account Suspension and Termination
            </h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate your access to the Service at any time, without notice, for:
              </p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Abusive or disruptive behaviour</li>
                <li>Suspected fraudulent or illegal activity</li>
                <li>Any other reason we deem necessary to protect the Service or other users</li>
              </ul>
              <p className="leading-relaxed">
                Suspended or terminated accounts may not be reinstated, and all associated data may be deleted.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Your privacy is important to us. Please review our{' '}
              <a href="/privacy" className="text-quantum-glow hover:underline">
                Privacy Policy
              </a>{' '}
              to understand how we collect, use, and protect your information.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-300 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We may modify these Terms of Service at any time. Your continued use of the Service after changes are posted constitutes your acceptance of the modified terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through the messaging system or via the contact form on our website.
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="border-t border-white border-opacity-10 pt-6">
            <p className="text-gray-400 italic text-center">
              By using Epildevconnect Ltd, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

