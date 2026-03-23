import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

// Get current year for auto-updating dates
const currentYear = new Date().getFullYear();

const experiences = [
  {
    id: 1,
    title: 'Senior DevOps Engineer | AI Modelling & App Development',
    company: 'Apple Inc',
    location: 'Remote',
    period: `2022 - ${currentYear}`,
    description:
      'Senior DevOps Engineer specialising in AI Modelling and App Development for Apple\'s enterprise systems. Designing and implementing infrastructure automation, CI/CD pipelines, and deployment strategies for AI/ML models and enterprise applications.',
    highlights: [
      'Designed and implemented end-to-end DevOps pipelines for AI/ML model deployment and enterprise application releases',
      'Automated infrastructure provisioning, configuration management, and orchestration for large-scale distributed systems',
      'Developed and maintained enterprise applications serving thousands of internal users with high availability and performance',
      'Built and optimised CI/CD workflows for AI modelling projects, enabling rapid iteration and deployment of ML models',
      'Collaborated with cross-functional teams including data scientists, ML engineers, and software developers on infrastructure and application initiatives',
      'Optimised deployment processes, application performance, and model inference pipelines to reduce latency and improve scalability',
      'Implemented monitoring, logging, and alerting systems for production AI/ML workloads and applications',
    ],
  },
  {
    id: 2,
    title: 'Bug Fix Specialist & Developer',
    company: 'Miniclip (8 Ball Pool)',
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-quantum-glow to-transparent"></div>

          {/* Experiences */}
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <div className="hidden lg:block absolute left-8 top-8 w-4 h-4 bg-quantum-glow rounded-full -translate-x-1/2 ring-4 ring-dark-900 z-10"></div>

                <div className="lg:ml-20 glass glass-hover rounded-2xl p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-mono font-bold mb-2">
                      {exp.title}
                    </h3>
                    <p className="text-xl text-quantum-glow font-semibold mb-3">
                      {exp.company}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-mono">{exp.period}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-mono">{exp.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-4">{exp.description}</p>

                  {/* Highlights */}
                  <div>
                    <p className="text-xs font-mono text-gray-400 mb-2">
                      KEY ACHIEVEMENTS
                    </p>
                    <ul className="space-y-2">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="text-quantum-glow mt-1">▸</span>
                          <span className="text-gray-300">{highlight}</span>
                        </li>
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


