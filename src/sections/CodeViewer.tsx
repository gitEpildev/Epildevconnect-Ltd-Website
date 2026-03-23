import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Copy, Check, Github, ExternalLink, Loader2 } from 'lucide-react';
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
          setCodeExamples(data.snippets);
          if (data.snippets.length > 0) {
            setSelectedExample(data.snippets[0]);
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
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-quantum-glow animate-spin" />
              <p className="text-gray-400 font-mono">Loading code snippets from GitHub...</p>
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
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-400 font-mono mb-2">Error loading code snippets</p>
              <p className="text-gray-500 text-sm font-mono">{error || 'No code snippets found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedExample) {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <Code2 className="w-9 h-9 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Code Viewer
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-mono mb-6">
            Explore code samples and implementations
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/gitEpildev?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 glass glass-hover rounded-xl font-mono text-sm"
            >
              <Github className="w-4 h-4" />
              View all repositories on GitHub
            </a>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Code Examples List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-2xl p-4 space-y-2">
              {codeExamples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => setSelectedExample(example)}
                  className={`w-full text-left p-3 rounded-xl transition-all font-mono text-sm ${
                    selectedExample.id === example.id
                      ? 'bg-quantum-glow bg-opacity-20 text-quantum-glow'
                      : 'text-gray-400 hover:bg-white hover:bg-opacity-5'
                  }`}
                >
                  {example.title}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Code Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-2xl overflow-hidden">
              {/* VS Code-like Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-gray-400">
                      {selectedExample.title}
                    </span>
                    {selectedExample.fullUrl && (
                      <a
                        href={selectedExample.fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-quantum-glow transition-colors"
                      >
                        View on GitHub →
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedExample.fullUrl && (
                    <a
                      href={selectedExample.fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-all text-sm font-mono"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View File</span>
                    </a>
                  )}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-all text-sm font-mono"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Content */}
              <div className="p-6 overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-hide">
                <Highlight
                  theme={themes.nightOwl}
                  code={selectedExample.code}
                  language={(selectedExample.language.toLowerCase() === 'tsx' ? 'tsx' : selectedExample.language.toLowerCase()) as any}
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={`${className} text-sm`} style={style} suppressHydrationWarning>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          <span className="inline-block w-12 text-right mr-4 text-gray-600 select-none">
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


