// Vercel Serverless Function — GET /api/github
// Read-only proxy to the GitHub API so the token never reaches the browser.
//   ?path=profile                      → GraphQL profile + contribution calendar
//   ?path=repos/<owner>/<repo>[/...]   → REST repo endpoints used by the project modal
//   ?path=search/commits&q=...         → commit search (must be scoped to our user)
//   ?path=search/repositories&q=...    → repo search (must be scoped to our user)
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const portfolio = require('../src/data/portfolio.json');

const USERNAME = portfolio.github?.username || '';
const GITHUB_API = 'https://api.github.com';
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 300;
// VITE_GITHUB_TOKEN is the legacy name; it stays server-side because no client code reads it anymore
const getToken = () => process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;
const PASSTHROUGH_PARAMS = ['q', 'per_page', 'page', 'recursive', 'sort', 'order'];

// Repo sub-endpoints the frontend is allowed to read
const REPO_SUBPATHS = [
    /^$/,
    /^\/languages$/,
    /^\/community\/profile$/,
    /^\/git\/trees\/HEAD$/,
    /^\/contributors$/,
    /^\/commits$/,
    /^\/contents\/.+$/,
];

const cache = new Map();

const profileQuery = (username) => `{
  user(login: "${username}") {
    name
    bio
    avatarUrl
    url
    followers { totalCount }
    following { totalCount }
    repositories(privacy: PUBLIC) { totalCount }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          id
          name
          description
          url
          stargazerCount
          primaryLanguage { name color }
          isFork
        }
      }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

function isOurUser(name) {
    return !!name && name.toLowerCase() === USERNAME.toLowerCase();
}

// Returns the upstream REST path (without query) or null if not allowed
function resolveRestPath(path, query) {
    const repoMatch = path.match(/^repos\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)(\/.*)?$/);
    if (repoMatch) {
        const [, owner, repo, rest = ''] = repoMatch;
        if (!isOurUser(owner)) return null;
        if (!REPO_SUBPATHS.some(re => re.test(rest))) return null;
        const segments = rest.split('/').slice(1);
        if (segments.some(s => s === '' || s === '.' || s === '..')) return null;
        return `/repos/${owner}/${repo}${segments.map(s => '/' + encodeURIComponent(s)).join('')}`;
    }

    if (path === 'search/commits' || path === 'search/repositories') {
        const qualifier = path === 'search/commits' ? 'author' : 'user';
        const terms = String(query.q || '').toLowerCase().split(/\s+/);
        if (!terms.includes(`${qualifier}:${USERNAME.toLowerCase()}`)) return null;
        return `/${path}`;
    }

    return null;
}

function getCached(key) {
    const hit = cache.get(key);
    if (!hit) return null;
    if (hit.expires < Date.now()) {
        cache.delete(key);
        return null;
    }
    return hit.body;
}

function setCached(key, body) {
    if (cache.size >= CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value);
    cache.set(key, { body, expires: Date.now() + CACHE_TTL_MS });
}

function githubHeaders() {
    const token = getToken();
    return {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'arinjain-portfolio',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function fetchProfile() {
    if (!getToken()) {
        return { status: 500, body: { error: 'GitHub token is not configured on the server.' } };
    }
    const r = await fetch(`${GITHUB_API}/graphql`, {
        method: 'POST',
        headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: profileQuery(USERNAME) }),
    });
    return { status: r.status, body: await r.json() };
}

async function fetchRest(restPath, query) {
    const url = new URL(GITHUB_API + restPath);
    PASSTHROUGH_PARAMS.forEach(p => {
        if (query[p] !== undefined) url.searchParams.set(p, String(query[p]));
    });
    const perPage = Number(url.searchParams.get('per_page'));
    if (perPage > 100) url.searchParams.set('per_page', '100');

    const r = await fetch(url, { headers: githubHeaders() });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) return { status: r.status, body: { error: body.message || `GitHub API error ${r.status}` } };
    return { status: 200, body };
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!USERNAME) {
        return res.status(500).json({ error: 'GitHub username is not configured.' });
    }

    const query = req.query || {};
    const path = String(query.path || '').replace(/^\/+|\/+$/g, '');

    let restPath = null;
    if (path !== 'profile') {
        restPath = resolveRestPath(path, query);
        if (!restPath) return res.status(403).json({ error: 'This GitHub path is not allowed.' });
    }

    const cacheKey = path === 'profile' ? 'profile' : `${restPath}?${PASSTHROUGH_PARAMS.map(p => `${p}=${query[p] ?? ''}`).join('&')}`;
    const cached = getCached(cacheKey);
    if (cached) {
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        return res.status(200).json(cached);
    }

    try {
        const { status, body } = path === 'profile' ? await fetchProfile() : await fetchRest(restPath, query);
        if (status === 200) {
            setCached(cacheKey, body);
            // Let Vercel's edge cache absorb repeat visitors
            res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        }
        return res.status(status).json(body);
    } catch (error) {
        console.error('GitHub proxy error:', error);
        return res.status(502).json({ error: 'Failed to reach GitHub. Please try again.' });
    }
}
