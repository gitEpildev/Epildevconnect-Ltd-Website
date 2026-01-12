import { motion } from 'framer-motion';
import { ExternalLink, Github, FolderGit2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchGitHubRepos } from '../utils/api';

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  github: string;
  demo: string;
  featured?: boolean;
  updatedAt?: string;
  stars?: number;
  forks?: number;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchGitHubRepos();
        if (data && data.projects && Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else {
          setProjects([]);
        }
      } catch (err: any) {
        console.error('[Projects] Failed to load projects:', err);
        setError(err.response?.data?.message || 'Failed to load projects');
        // Keep empty array on error - don't show fallback projects
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
    // Refresh every 5 minutes
    const interval = setInterval(loadProjects, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <FolderGit2 className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Projects
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono">
            A collection of my work and contributions
          </p>
        </motion.div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-quantum-glow animate-spin" />
              <p className="text-gray-400 font-mono">Loading projects from GitHub...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-400 font-mono mb-2">Error loading projects</p>
              <p className="text-gray-500 text-sm font-mono">{error}</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 font-mono">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`glass glass-hover rounded-2xl p-6 flex flex-col ${
                project.featured ? 'ring-2 ring-quantum-glow ring-opacity-30' : ''
              }`}
            >
              {project.featured && (
                <span className="inline-block px-3 py-1 bg-quantum-glow bg-opacity-20 text-quantum-glow text-xs font-mono rounded-lg mb-4 w-fit">
                  FEATURED
                </span>
              )}

              <h3 className="text-xl font-mono font-bold mb-3">{project.title}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-grow">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-white bg-opacity-5 text-xs font-mono rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-all text-sm font-mono"
                >
                  <Github className="w-4 h-4" />
                  Code
                </a>
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-quantum-glow bg-opacity-20 hover:bg-opacity-30 text-quantum-glow rounded-lg transition-all text-sm font-mono"
                >
                  <ExternalLink className="w-4 h-4" />
                  Demo
                </a>
              </div>
            </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


