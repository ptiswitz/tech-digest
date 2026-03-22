// scripts/generate-digest.js
import { fetchAllSources } from './fetch-sources.js';
import { buildDigestPage } from './html-builder.js';
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

async function summarizeWithGemini(items) {
  if (items.length === 0) return '## This week\'s priority\nNothing significant this week.';

  const itemsText = items.map(i =>
    `[${i.label}] ${i.title}\n${i.body}`
  ).join('\n\n---\n\n');

  const prompt = `
You are a senior frontend tech lead assistant specialized in the Vue 3 ecosystem.
Your job is to produce a weekly digest that helps a tech lead and their team decide
what to act on, what to monitor, and what to ignore.

## Your audience
- Tech lead + small team of junior/intermediate frontend devs
- Stack: Vue 3, TypeScript, Vite, Pinia, Vitest, Playwright, Node.js, SCSS/BEM
- Working on an automotive web configurator (production app, stability matters)

## Digest structure
For each technology that has relevant news this week, output a section using this exact format:

### [Tech name] [version if release] — [one-line verdict: "upgrade now" / "watch" / "skip"]

**What changed:** 1-2 sentences max. Only the facts.

**Action:**
- 🔴 Do now — [breaking change or critical fix, if any]
- 🟡 Plan — [non-breaking feature worth adopting soon]
- 🔵 Watch — [experimental / RFC / not stable yet]

Skip a category entirely if nothing applies. Skip the whole section if there's nothing
relevant to this stack this week.

## Strict rules
- No marketing language, no hype
- If a release has zero impact on this stack, omit it entirely
- Flag explicitly if something touches Vite's Vue plugin, vue-router, or @pinia/* —
  these are high-impact for this team
- For AI/LLM news: focus on API changes, new models, SDK updates — not announcements
- Always wrap package names, file paths, CLI commands, and config keys in backtick
  inline code. Examples: \`vite\`, \`@pinia/colada\`, \`vite.config.ts\`, \`npm run build\`
- Never use bold for technical terms — backticks only
- Always end with a "## This week's priority" section: one sentence, the single most
  important thing to act on

## Input
Here are this week's items:

${itemsText}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function run() {
  const dateStr = new Date().toISOString().split('T')[0];

  console.log('📡 Fetching sources...');
  const items = await fetchAllSources();
  console.log(`✅ ${items.length} items fetched`);

  console.log('🤖 Summarizing with Gemini...');
  const summary = await summarizeWithGemini(items);

  // Archive previous index.html
  mkdirSync('docs/archives', { recursive: true });
  if (existsSync('docs/index.html')) {
    copyFileSync('docs/index.html', `docs/archives/${dateStr}.html`);
    console.log(`📁 Archived → docs/archives/${dateStr}.html`);
  }

  const html = buildDigestPage({
    summary,
    items,
    dateStr,
    itemCount: items.length,
  });

  writeFileSync('docs/index.html', html);
  console.log('✅ docs/index.html generated');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
