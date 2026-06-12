import { motion } from 'framer-motion';
import { Wrench, ExternalLink, Code2, Database, Terminal, Globe, Server, Layers, Music } from 'lucide-react';
import PageHeader from '../components/PageHeader';

interface TechItem {
  name: string;
  url: string;
  icon?: string;
}

const categoryIcons: Record<string, any> = {
  'Programming Languages': Code2,
  'Web & Markup': Globe,
  'Database Languages': Database,
  'Scripting Languages': Terminal,
  'Low-Level': Layers,
  'Frontend Frameworks': Globe,
  'Backend & APIs': Server,
  'Databases & Storage': Database,
  'DevOps & Tools': Server,
  'Audio & Media': Music,
};

const deviconMap: Record<string, string> = {
  'C': 'devicon-c-plain',
  'C++': 'devicon-cplusplus-plain',
  'Java': 'devicon-java-plain',
  'C#': 'devicon-csharp-plain',
  'Python': 'devicon-python-plain',
  'JavaScript': 'devicon-javascript-plain',
  'TypeScript': 'devicon-typescript-plain',
  'Go': 'devicon-go-plain',
  'Swift': 'devicon-swift-plain',
  'PHP': 'devicon-php-plain',
  'HTML': 'devicon-html5-plain',
  'CSS': 'devicon-css3-plain',
  'SCSS': 'devicon-sass-original',
  'SQL': 'devicon-azuresqldatabase-plain',
  'Bash': 'devicon-bash-plain',
  'Lua': 'devicon-lua-plain',
  'React': 'devicon-react-original',
  'Next.js': 'devicon-nextjs-plain',
  'Vue.js': 'devicon-vuejs-plain',
  'Tailwind CSS': 'devicon-tailwindcss-original',
  'Node.js': 'devicon-nodejs-plain',
  'Express': 'devicon-express-original',
  'GraphQL': 'devicon-graphql-plain',
  'PostgreSQL': 'devicon-postgresql-plain',
  'MongoDB': 'devicon-mongodb-plain',
  'MySQL': 'devicon-mysql-plain',
  'Docker': 'devicon-docker-plain',
  'GitHub Actions': 'devicon-githubactions-plain',
  'AWS': 'devicon-amazonwebservices-plain-wordmark',
  'Cloudflare': 'devicon-cloudflare-plain',
  'Nginx': 'devicon-nginx-original',
  'Linux': 'devicon-linux-plain',
};

const techStack: Record<string, TechItem[]> = {
  'Programming Languages': [
    { name: 'C', url: 'https://en.cppreference.com/w/c' },
    { name: 'C++', url: 'https://isocpp.org/' },
    { name: 'Java', url: 'https://www.java.com/' },
    { name: 'C#', url: 'https://dotnet.microsoft.com/languages/csharp' },
    { name: 'Objective C', url: 'https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html' },
    { name: 'Python', url: 'https://www.python.org/' },
    { name: 'JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { name: 'TypeScript', url: 'https://www.typescriptlang.org/' },
    { name: 'Go', url: 'https://go.dev/' },
    { name: 'Swift', url: 'https://www.swift.org/' },
    { name: 'PHP', url: 'https://www.php.net/' },
  ],
  'Web & Markup': [
    { name: 'HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
    { name: 'CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
    { name: 'SCSS', url: 'https://sass-lang.com/' },
  ],
  'Database Languages': [
    { name: 'SQL', url: 'https://www.iso.org/standard/63555.html' },
    { name: 'PL SQL', url: 'https://www.oracle.com/database/technologies/appdev/plsql.html' },
    { name: 'T SQL', url: 'https://docs.microsoft.com/en-us/sql/t-sql/language-reference' },
  ],
  'Scripting Languages': [
    { name: 'Bash', url: 'https://www.gnu.org/software/bash/' },
    { name: 'PowerShell', url: 'https://docs.microsoft.com/en-us/powershell/' },
    { name: 'Perl', url: 'https://www.perl.org/' },
    { name: 'Lua', url: 'https://www.lua.org/' },
    { name: 'Shell Script', url: 'https://www.gnu.org/software/bash/manual/html_node/Shell-Scripts.html' },
  ],
  'Low-Level': [
    { name: 'Assembly', url: 'https://en.wikipedia.org/wiki/Assembly_language' },
  ],
  'Frontend Frameworks': [
    { name: 'React', url: 'https://react.dev/' },
    { name: 'Next.js', url: 'https://nextjs.org/' },
    { name: 'Vue.js', url: 'https://vuejs.org/' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com/' },
    { name: 'Framer Motion', url: 'https://www.framer.com/motion/' },
  ],
  'Backend & APIs': [
    { name: 'Node.js', url: 'https://nodejs.org/' },
    { name: 'Express', url: 'https://expressjs.com/' },
    { name: 'GraphQL', url: 'https://graphql.org/' },
    { name: 'REST', url: 'https://restfulapi.net/' },
    { name: 'WebSocket', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' },
  ],
  'Databases & Storage': [
    { name: 'PostgreSQL', url: 'https://www.postgresql.org/' },
    { name: 'MongoDB', url: 'https://www.mongodb.com/' },
    { name: 'MySQL', url: 'https://www.mysql.com/' },
    { name: 'Supabase', url: 'https://supabase.com/' },
  ],
  'DevOps & Tools': [
    { name: 'Docker', url: 'https://www.docker.com/' },
    { name: 'GitHub Actions', url: 'https://github.com/features/actions' },
    { name: 'AWS', url: 'https://aws.amazon.com/' },
    { name: 'Cloudflare', url: 'https://www.cloudflare.com/' },
    { name: 'Nginx', url: 'https://nginx.org/' },
    { name: 'Linux', url: 'https://www.linux.org/' },
  ],
  'Audio & Media': [
    { name: 'Ableton Live', url: 'https://www.ableton.com/' },
    { name: 'Logic Pro', url: 'https://www.apple.com/logic-pro/' },
    { name: 'Pro Tools', url: 'https://www.avid.com/pro-tools' },
    { name: 'FL Studio', url: 'https://www.image-line.com/fl-studio/' },
    { name: 'OBS Studio', url: 'https://obsproject.com/' },
  ],
};

export default function TechStack() {
  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          icon={Wrench}
          kicker="Tools of the trade"
          title="The"
          accent="stack."
          description="The languages, frameworks and infrastructure behind everything we ship. Chosen because they work, kept because they last."
        />

        <div className="space-y-6">
          {Object.entries(techStack).map(([category, items], categoryIndex) => {
            const CatIcon = categoryIcons[category] || Code2;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.05 }}
                className="glass glass-hover rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-quantum-glow/10">
                    <CatIcon className="w-4 h-4 text-quantum-glow" />
                  </div>
                  <h3 className="text-lg font-semibold text-quantum-glow tracking-tight">
                    {category}
                  </h3>
                  <span className="text-xs font-mono text-gray-500 ml-auto">{items.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {items.map((item, itemIndex) => {
                    const devicon = deviconMap[item.name];
                    return (
                      <motion.a
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.3,
                          delay: categoryIndex * 0.04 + itemIndex * 0.03,
                        }}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 p-3 bg-white/[0.04] hover:bg-white/[0.09] rounded-xl transition-all group cursor-pointer border border-transparent hover:border-white/[0.08]"
                      >
                        {devicon ? (
                          <i className={`${devicon} text-lg text-gray-400 group-hover:text-quantum-glow transition-colors`} />
                        ) : (
                          <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-quantum-glow/40 to-purple-500/30 group-hover:from-quantum-glow/70 group-hover:to-purple-500/50 transition-all flex-shrink-0" />
                        )}
                        <span className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors truncate">{item.name}</span>
                        <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-quantum-glow transition-all opacity-0 group-hover:opacity-100 ml-auto flex-shrink-0" />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
