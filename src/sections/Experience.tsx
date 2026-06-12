import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

const currentYear = new Date().getFullYear();

const experiences = [
  {
    id: 1,
    title: 'Senior DevOps Engineer | AI Modelling & App Development',
    company: 'Apple Inc',
    logo: '/apple-inc.png',
    color: '#000',
    location: 'Remote',
    period: `2022 - ${currentYear}`,
    description:
      'Senior DevOps Engineer specialising in AI Modelling and App Development for Apple\'s enterprise systems. Designing and implementing infrastructure automation, CI/CD pipelines, and deployment strategies for AI/ML models and enterprise applications.',
    highlights: [
      'Designed and implemented end-to-end DevOps pipelines for AI/ML model deployment and enterprise application releases',
      'Automated infrastructure provisioning, configuration management, and orchestration for large-scale distributed systems',
      'Developed and maintained enterprise applications serving thousands of internal users with high availability and performance',
      'Built and optimised CI/CD workflows for AI modelling projects, enabling rapid iteration and deployment of ML models',
      'Collaborated with cross-functional teams including data scientists, ML engineers, and software developers',
      'Optimised deployment processes, application performance, and model inference pipelines to reduce latency',
      'Implemented monitoring, logging, and alerting systems for production AI/ML workloads',
    ],
  },
  {
    id: 2,
    title: 'Bug Fix Specialist & Developer',
    company: 'Miniclip (8 Ball Pool)',
    logo: '/miniclip-logo.png',
    color: '#e74c3c',
    location: 'Contract/Remote',
    period: `2023 - ${currentYear}`,
    description:
      'Contracted to identify and resolve critical bugs in the popular 8 Ball Pool game platform, ensuring smooth gameplay experience for millions of players worldwide.',
    highlights: [
      'Fixed high-priority bugs affecting user experience',
      'Worked with game mechanics and reward systems',
      'Developed automated testing solutions for game features',
      'Collaborated with game development team on critical issues',
    ],
  },
];

export default function Experience() {
  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <Briefcase className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Experience
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono">
            My professional journey and milestones
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line with animated gradient */}
          <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-px">
            <div className="absolute inset-0 bg-gradient-to-b from-quantum-glow via-purple-500/50 to-transparent" />
            <motion.div
              className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-quantum-glow/80 to-transparent"
              animate={{ y: ['0%', '300%', '0%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {/* Timeline dot with company logo */}
                <div className="hidden lg:flex absolute left-8 top-8 -translate-x-1/2 z-10 w-10 h-10 rounded-full items-center justify-center overflow-hidden ring-4 ring-dark-900"
                  style={{ background: exp.color }}
                >
                  <img src={exp.logo} alt={exp.company} className="w-full h-full object-cover" />
                </div>

                <div className="lg:ml-20 glass glass-hover rounded-2xl p-6 group">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1.5 tracking-tight">
                      {exp.title}
                    </h3>
                    <p className="text-lg text-quantum-glow font-semibold mb-3">
                      {exp.company}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-mono text-xs">{exp.period}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-mono text-xs">{exp.location}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-5">{exp.description}</p>

                  <div>
                    <p className="text-[10px] font-mono text-gray-500 mb-3 tracking-widest uppercase">
                      Key Achievements
                    </p>
                    <ul className="space-y-2">
                      {exp.highlights.map((highlight, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                          className="flex items-start gap-3 text-sm"
                        >
                          <span className="text-quantum-glow mt-0.5 text-xs">&#9656;</span>
                          <span className="text-gray-400 leading-relaxed">{highlight}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
