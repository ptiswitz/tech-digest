// scripts/fetch-sources.js
import Parser from 'rss-parser';
import { sources } from './sources.config.js';

const parser = new Parser();
const ONE_WEEK_AGO = Date.now() - 7 * 24 * 60 * 60 * 1000;

async function fetchGithubRelease(repo, label) {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=5`, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  });
  const releases = await res.json();
  return releases
    .filter(r => new Date(r.published_at) > ONE_WEEK_AGO)
    .map(r => ({
      label,
      title: `${label} ${r.tag_name}`,
      url: r.html_url,
      date: r.published_at,
      body: r.body?.slice(0, 800) ?? '',
      type: 'release',
    }));
}

async function fetchRSS(url, label) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items
      .filter(item => new Date(item.pubDate) > ONE_WEEK_AGO)
      .slice(0, 5)
      .map(item => ({
        label,
        title: item.title,
        url: item.link,
        date: item.pubDate,
        body: item.contentSnippet?.slice(0, 800) ?? '',
        type: 'blog',
      }));
  } catch {
    console.warn(`⚠️  RSS failed: ${url}`);
    return [];
  }
}

export async function fetchAllSources() {
  const results = await Promise.allSettled(
    sources.map(s =>
      s.type === 'github-release'
        ? fetchGithubRelease(s.repo, s.label)
        : fetchRSS(s.url, s.label)
    )
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
}
