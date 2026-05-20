import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getAuthUser, sendDiscordMessage, sendEmail } from '../utils/api';

export default function Contact() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  useEffect(() => {
    const checkAuth = async () => {
      const authUser = await getAuthUser();
      setUser(authUser);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Sending...' });

    try {
      if (user) {
        // Logged in - send via Discord DM
        await sendDiscordMessage(formData.message);
        setStatus({
          type: 'success',
          message: 'Message sent via Discord! I\'ll get back to you soon.',
        });
      } else {
        // Not logged in - send via email
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
          setStatus({
            type: 'error',
            message: 'Please fill in all fields.',
          });
          return;
        }
        await sendEmail(formData.name, formData.email, formData.subject, formData.message);
        setStatus({
          type: 'success',
          message: 'Email sent successfully! I\'ll respond as soon as possible.',
        });
      }

      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus({ type: 'idle', message: '' });
      }, 5000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to send message. Please try again.',
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
            <Mail className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Get In Touch
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono">
            Have a question or want to work together?
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="text-2xl font-mono font-bold mb-6">
              {user ? 'Send Discord Message' : 'Send Email'}
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-quantum-glow animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!user && (
                  <>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-mono text-gray-400 mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white bg-opacity-5 border border-gray-700 rounded-xl focus:outline-none focus:border-quantum-glow transition-colors font-mono"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-mono text-gray-400 mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white bg-opacity-5 border border-gray-700 rounded-xl focus:outline-none focus:border-quantum-glow transition-colors font-mono"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-mono text-gray-400 mb-2"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white bg-opacity-5 border border-gray-700 rounded-xl focus:outline-none focus:border-quantum-glow transition-colors font-mono"
                        placeholder="What's this about?"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-mono text-gray-400 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-white bg-opacity-5 border border-gray-700 rounded-xl focus:outline-none focus:border-quantum-glow transition-colors font-mono resize-none"
                    placeholder="Your message..."
                    required
                  />
                </div>

                {/* Status Message */}
                {status.type !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-mono ${
                      status.type === 'success'
                        ? 'bg-green-500 bg-opacity-10 text-green-400 border border-green-500 border-opacity-20'
                        : status.type === 'error'
                        ? 'bg-red-500 bg-opacity-10 text-red-400 border border-red-500 border-opacity-20'
                        : 'bg-quantum-glow bg-opacity-10 text-quantum-glow border border-quantum-glow border-opacity-20'
                    }`}
                  >
                    {status.type === 'success' && (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {status.type === 'error' && (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    {status.type === 'loading' && (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                    <span>{status.message}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={status.type === 'loading'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-quantum-glow bg-opacity-20 hover:bg-opacity-30 text-quantum-glow rounded-xl transition-all font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status.type === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Auth Status */}
            <div className="glass rounded-2xl p-6">
              <h4 className="font-mono font-semibold mb-4">Contact Method</h4>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-quantum-glow bg-opacity-20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-quantum-glow" />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-quantum-glow">
                        Logged in as {user.profile?.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        Messages will be sent via Discord DM
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    You're not logged in. Messages will be sent via email.
                  </p>
                  <a
                    href="/auth/discord"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] rounded-lg transition-colors text-sm font-mono"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    Login with Discord
                  </a>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="glass rounded-2xl p-6">
              <h4 className="font-mono font-semibold mb-4">Response Time</h4>
              <p className="text-sm text-gray-400 mb-4">
                I typically respond within 24-48 hours during weekdays.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-400 font-mono">
                  Usually responds quickly
                </span>
              </div>
            </div>

            {/* Direct Links */}
            <div className="glass rounded-2xl p-6">
              <h4 className="font-mono font-semibold mb-4">Other Ways to Connect</h4>
              <div className="space-y-3">
                <a
                  href={import.meta.env.VITE_SOCIAL_DISCORD || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-xl transition-all text-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                  <span className="font-mono">Join my Discord</span>
                </a>
                <a
                  href={import.meta.env.VITE_SOCIAL_TELEGRAM || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-xl transition-all text-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0088cc] flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <span className="font-mono">Message on Telegram</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


