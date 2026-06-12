import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Copy, Check, Github, ExternalLink, Loader2, FileCode } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import { fetchGitHubCodeSnippets } from '../utils/api';

interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  repo?: string;
  path?: string;
  fullUrl?: string;
}

const langColors: Record<string, string> = {
  typescript: '#3178c6',
  javascript: '#f7df1e',
  tsx: '#3178c6',
  python: '#3572A5',
  go: '#00ADD8',
  rust: '#dea584',
  css: '#563d7c',
  html: '#e34c26',
  markdown: '#083fa1',
};

export default function CodeViewer() {
  const [codeExamples, setCodeExamples] = useState<CodeSnippet[]>([]);
  const [selectedExample, setSelectedExample] = useState<CodeSnippet | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCodeSnippets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchGitHubCodeSnippets();
        if (data && data.snippets && Array.isArray(data.snippets)) {
          const filtered = data.snippets.filter((s: CodeSnippet) => {
            const p = (s.path || '').toLowerCase();
            const lang = (s.language || '').toLowerCase();
            const title = (s.title || '').toLowerCase();
            if (lang === 'markdown' || lang === 'md') return false;
            if (p.endsWith('.md') || p.endsWith('.mdx')) return false;
            if (title.includes('readme')) return false;
            return true;
          });
          setCodeExamples(filtered);
          if (filtered.length > 0) {
            setSelectedExample(filtered[0]);
          }
        } else {
          setCodeExamples([]);
        }
      } catch (err: any) {
        console.error('[CodeViewer] Failed to load code snippets:', err);
        setError(err.response?.data?.message || 'Failed to load code snippets');
        setCodeExamples([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCodeSnippets();
  }, []);

  const handleCopy = async () => {
    if (selectedExample) {
      await navigator.clipboard.writeText(selectedExample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-2xl p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-quantum-glow animate-spin" />
              <p className="text-gray-500 font-mono text-sm">Loading code snippets from GitHub...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || codeExamples.length === 0) {
    return (
      <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-red-400 font-mono mb-2">Error loading code snippets</p>
            <p className="text-gray-500 text-sm">{error || 'No code snippets found'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedExample) return null;

  const langColor = langColors[selectedExample.language.toLowerCase()] || '#00d9ff';

  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <Code2 className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Code Viewer
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono mb-5">
            Explore code samples and implementations
          </p>
          <a
            href="https://github.com/gitEpildev?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 glass glass-hover rounded-xl font-mono text-sm"
          >
            <Github className="w-4 h-4" />
            View all repositories on GitHub
          </a>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-5">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-2xl p-3 space-y-1 max-h-[600px] overflow-y-auto scrollbar-hide">
              {codeExamples.map((example) => {
                const lc = langColors[example.language.toLowerCase()] || '#00d9ff';
                const active = selectedExample.id === example.id;
                return (
                  <button
                    key={example.id}
                    onClick={() => setSelectedExample(example)}
                    className={`w-full text-left p-3 rounded-xl transition-all font-mono text-xs flex items-center gap-2.5 ${
                      active
                        ? 'bg-quantum-glow/15 text-quantum-glow'
                        : 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lc }} />
                    <span className="truncate">{example.title}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Code panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <FileCode className="w-3.5 h-3.5" style={{ color: langColor }} />
                    <span className="font-mono text-xs text-gray-400">{selectedExample.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-500">{selectedExample.language}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedExample.fullUrl && (
                    <a
                      href={selectedExample.fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all text-xs font-mono text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-3 h-3" />
                      GitHub
                    </a>
                  )}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all text-xs font-mono text-gray-400 hover:text-white"
                  >
                    {copied ? (
                      <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Copied</span></>
                    ) : (
                      <><Copy className="w-3 h-3" /><span>Copy</span></>
                    )}
                  </button>
                </div>
              </div>

              {/* Code body */}
              <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-hide">
                <Highlight
                  theme={themes.nightOwl}
                  code={selectedExample.code}
                  language={(selectedExample.language.toLowerCase() === 'tsx' ? 'tsx' : selectedExample.language.toLowerCase()) as any}
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={`${className} text-[13px] leading-relaxed`} style={style} suppressHydrationWarning>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })} className="hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded">
                          <span className="inline-block w-10 text-right mr-4 text-gray-600/50 select-none text-xs">
                            {i + 1}
                          </span>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
