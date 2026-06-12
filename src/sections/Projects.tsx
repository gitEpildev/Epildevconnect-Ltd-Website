import { motion } from 'framer-motion';
import { ExternalLink, Github, FolderGit2, Loader2, Star, GitFork } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchGitHubRepos } from '../utils/api';
import { useTilt } from '../utils/useTilt';
import PageHeader from '../components/PageHeader';

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
  image?: string;
}

const pinnedProjects: Project[] = [
  {
    id: -1,
    title: 'TeleHop',
    description: 'A Minecraft server plugin for seamless teleportation with intuitive commands and a smooth player experience.',
    tech: ['Java', 'Spigot API', 'Minecraft'],
    github: 'https://github.com/gitEpildev/TeleHop',
    demo: 'https://modrinth.com/plugin/telehop',
    featured: true,
    image: '/telehop-logo.png',
  },
];

const pinnedNames = new Set(pinnedProjects.map(p => p.title.toLowerCase()));

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const tilt = useTilt(4);

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`glass glass-hover rounded-2xl flex flex-col overflow-hidden group ${
        project.featured ? 'ring-1 ring-quantum-glow/20' : ''
      }`}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.2s ease-out' }}
    >
      {/* Image area - only for projects with a custom image */}
      {project.image && (
        <div className="h-36 w-full relative overflow-hidden bg-white/[0.02] flex items-center justify-center">
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-auto object-contain drop-shadow-[0_0_20px_rgba(0,217,255,0.15)] p-5"
          />
          {project.featured && (
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-quantum-glow/10 backdrop-blur-sm text-quantum-glow text-[10px] font-mono font-bold rounded-md tracking-widest border border-quantum-glow/15">
              FEATURED
            </span>
          )}
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        {/* Title row with stats */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
          {(project.stars !== undefined && project.stars > 0) && (
            <div className="flex items-center gap-2.5 text-gray-500 text-xs font-mono flex-shrink-0 mt-1">
              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{project.stars}</span>
              {(project.forks !== undefined && project.forks > 0) && (
                <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{project.forks}</span>
              )}
            </div>
          )}
        </div>

        {/* Featured badge inline for non-image cards */}
        {project.featured && !project.image && (
          <span className="inline-block w-fit px-2 py-0.5 bg-quantum-glow/10 text-quantum-glow text-[10px] font-mono font-bold rounded-md tracking-widest border border-quantum-glow/15 mb-2">
            FEATURED
          </span>
        )}

        <p className="text-gray-400 text-sm mb-4 flex-grow leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.slice(0, 5).map((tech, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-white/[0.06] text-[11px] font-mono rounded-md text-gray-300"
            >
              {tech}
            </span>
          ))}
          {project.tech.length > 5 && (
            <span className="px-2 py-0.5 text-[11px] font-mono text-gray-500">
              +{project.tech.length - 5}
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all text-xs font-mono"
          >
            {project.github.includes('github.com') ? <Github className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
            {project.github.includes('github.com') ? 'Code' : 'View'}
          </a>
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-quantum-glow/15 hover:bg-quantum-glow/25 text-quantum-glow rounded-lg transition-all text-xs font-mono"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Demo
          </a>
        </div>
      </div>
    </motion.div>
  );
}

const PROJECTS_CACHE_KEY = 'projects_cache_v1';

function mergeProjects(data: any): Project[] {
  if (data && data.projects && Array.isArray(data.projects)) {
    const filtered = data.projects.filter(
      (p: Project) => !pinnedNames.has(p.title.toLowerCase())
    );
    return [...pinnedProjects, ...filtered];
  }
  return [...pinnedProjects];
}

export default function Projects() {
  // Render cached projects instantly; a fresh copy loads in the background
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const cached = sessionStorage.getItem(PROJECTS_CACHE_KEY);
      if (cached) return mergeProjects(JSON.parse(cached));
    } catch {
      // No usable cache; fall through to the loading state
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(projects.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchGitHubRepos();
        setProjects(mergeProjects(data));
        setError(null);
        try {
          sessionStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(data));
        } catch {
          // Cache write failed; next visit just refetches
        }
      } catch (err: any) {
        // Keep showing cached/pinned projects on background failures
        if (projects.length === 0) {
          setError(err.response?.data?.message || 'Failed to load projects');
          setProjects([...pinnedProjects]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
    const interval = setInterval(loadProjects, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          icon={FolderGit2}
          kicker="Selected work"
          title="Things we"
          accent="built."
          description="From Minecraft plugins and Discord bots to full web platforms. Every project here is designed, built and shipped by us, and most of them are open source."
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-quantum-glow animate-spin" />
              <p className="text-gray-500 font-mono text-sm">Loading projects from GitHub...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="glass rounded-2xl p-8 text-center max-w-md">
              <p className="text-red-400 font-mono mb-2">Error loading projects</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 font-mono">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
