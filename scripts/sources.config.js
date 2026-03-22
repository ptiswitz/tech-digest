// scripts/sources.config.js
export const sources = [
  // GitHub Releases
  { type: 'github-release', repo: 'vuejs/core', label: 'Vue 3' },
  { type: 'github-release', repo: 'microsoft/TypeScript', label: 'TypeScript' },
  { type: 'github-release', repo: 'vitejs/vite', label: 'Vite' },
  { type: 'github-release', repo: 'vuejs/pinia', label: 'Pinia' },
  { type: 'github-release', repo: 'vitest-dev/vitest', label: 'Vitest' },
  { type: 'github-release', repo: 'microsoft/playwright', label: 'Playwright' },
  { type: 'github-release', repo: 'nodejs/node', label: 'Node.js' },

  // Blogs officiels (RSS)
  { type: 'rss', url: 'https://blog.vuejs.org/feed.rss', label: 'Vue Blog' },
  { type: 'rss', url: 'https://devblogs.microsoft.com/typescript/feed/', label: 'TypeScript Blog' },
  { type: 'rss', url: 'https://vitejs.dev/blog.rss', label: 'Vite Blog' },
  { type: 'rss', url: 'https://nodejs.org/en/feed/releases.xml', label: 'Node.js Blog' },

  // IA / LLM
  { type: 'rss', url: 'https://blog.google/technology/ai/rss/', label: 'Google AI' },
];
