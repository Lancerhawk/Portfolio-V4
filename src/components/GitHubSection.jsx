import { useEffect, useState } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import data from '../data/portfolio.json';

const LANG_COLORS = {
    JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
    HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', Go: '#00ADD8',
    Rust: '#dea584', 'C++': '#f34b7d', C: '#555555', Ruby: '#701516',
    PHP: '#4F5D95', Shell: '#89e051', Vue: '#41b883', Svelte: '#ff3e00',
    Kotlin: '#A97BFF', Swift: '#F05138', Dart: '#00B4AB',
};

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Single GraphQL query — contribution calendar + pinned repos
const GQL_QUERY = (username) => `{
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

function cellColor(count) {
    if (count === 0) return 'var(--bg-cell)';
    if (count <= 2) return 'var(--accent)';
    if (count <= 5) return 'var(--cyan)';
    return 'var(--yellow)';
}

// Compute current streak + longest streak from contribution weeks
function computeStreaks(weeks) {
    const days = weeks.flatMap(w => w.contributionDays);
    let current = 0, longest = 0, run = 0;
    // Walk newest→oldest for current streak
    for (const d of [...days].reverse()) {
        if (d.contributionCount > 0) current++;
        else break;
    }
    // Walk oldest→newest for longest streak
    for (const d of days) {
        if (d.contributionCount > 0) { run++; if (run > longest) longest = run; }
        else run = 0;
    }
    return { current, longest };
}

// Simple cell — uses native title for tooltip (no overflow/positioning issues)
function Cell({ day, size }) {
    return (
        <div
            title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''}`}
            style={{
                width: size || '100%',
                height: size || undefined,
                aspectRatio: size ? undefined : '1',
                background: cellColor(day.contributionCount),
                border: '1.5px solid var(--border)',
                cursor: 'default',
                transition: 'transform 0.15s',
                boxSizing: 'border-box',
                flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
        />
    );
}

// Fluid on desktop, fixed-size + horizontal scroll on mobile
function HeatmapGrid({ weeks }) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize, { passive: true });
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const CELL = 11; // px — fixed size on mobile
    const GAP = 2;

    if (isMobile) {
        return (
            <div style={{
                width: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                paddingBottom: '0.75rem',
                paddingTop: '0.5rem',
                paddingLeft: '4px',
                paddingRight: '4px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--border) transparent',
            }}>
                <div style={{
                    display: 'flex',
                    gap: GAP,
                    width: 'max-content',
                }}>
                    {weeks.map((week, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                            {week.contributionDays.map(day => (
                                <Cell key={day.date} day={day} size={CELL} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Desktop — fluid grid, no scroll
    return (
        <div style={{ width: '100%', overflow: 'hidden', padding: '0.5rem 4px' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                gap: GAP,
                width: '100%',
            }}>
                {weeks.map((week, wi) => (
                    <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                        {week.contributionDays.map(day => (
                            <Cell key={day.date} day={day} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}


export default function GitHubSection() {
    const fadeRef = useFadeIn();
    const username = data.github?.username;
    const [profile, setProfile] = useState(null);
    const [pinnedRepos, setPinnedRepos] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [totalContribs, setTotalContribs] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!username) return;
        const cacheKey = `gh_gql2_${username}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            try {
                const c = JSON.parse(cached);
                // Avoid synchronous state update in effect
                Promise.resolve().then(() => {
                    setProfile(c.profile);
                    setPinnedRepos(c.pinnedRepos);
                    setWeeks(c.weeks);
                    setTotalContribs(c.totalContribs);
                    setLoading(false);
                });
                return;
            } catch { /* ignore */ }
        }

        const headers = {
            'Content-Type': 'application/json',
            ...(TOKEN ? { Authorization: `bearer ${TOKEN}` } : {}),
        };

        fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers,
            body: JSON.stringify({ query: GQL_QUERY(username) }),
        })
            .then(r => r.json())
            .then(gql => {
                const u = gql?.data?.user;
                if (!u) throw new Error('No user');

                const cal = u.contributionsCollection.contributionCalendar;
                const prof = {
                    name: u.name || username, bio: u.bio,
                    avatar_url: u.avatarUrl, html_url: u.url,
                    public_repos: u.repositories.totalCount,
                    followers: u.followers.totalCount,
                    following: u.following.totalCount,
                };
                const pinned = u.pinnedItems.nodes;

                setProfile(prof);
                setPinnedRepos(pinned);
                setWeeks(cal.weeks);
                setTotalContribs(cal.totalContributions);

                sessionStorage.setItem(cacheKey, JSON.stringify({
                    profile: prof, pinnedRepos: pinned,
                    weeks: cal.weeks, totalContribs: cal.totalContributions,
                }));
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [username]);

    const sectionStyle = { padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)', marginBottom: '3rem' };
    const headingStyle = {
        fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1.5rem',
        letterSpacing: '-0.5px', textTransform: 'uppercase',
        display: 'inline-block', padding: '0.5rem 1rem',
        background: 'var(--secondary)', border: 'var(--border-width) solid var(--border)',
        boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 var(--border)',
    };
    const cardStyle = {
        background: 'var(--white)', border: 'var(--border-width) solid var(--border)',
        boxShadow: '8px 8px 0 var(--border)', padding: '1.5rem',
    };

    if (!username) return null;

    return (
        <section id="github" style={sectionStyle}>
            <div ref={fadeRef} className="section-fade">
                <h2 style={headingStyle}>GitHub</h2>

                {loading && (
                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: 'Space Mono, monospace', opacity: 0.6 }}>
                        <i className="fas fa-spinner fa-spin" /> Loading GitHub data…
                    </div>
                )}

                {error && (
                    <div style={{ ...cardStyle, fontFamily: 'Space Mono, monospace', color: 'var(--pink)' }}>
                        <i className="fas fa-exclamation-triangle" /> Could not load GitHub data. Check your token or try again in a minute.
                    </div>
                )}

                {!loading && !error && profile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* ── Profile strip ── */}
                        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <img src={profile.avatar_url} alt={username}
                                style={{ width: 72, height: 72, border: '3px solid var(--border)', boxShadow: '4px 4px 0 var(--border)', borderRadius: 0 }} />
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>{profile.name}</div>
                                {profile.bio && (
                                    <div style={{ fontSize: '0.9rem', opacity: 0.7, fontFamily: 'Space Mono, monospace', marginBottom: '0.5rem' }}>
                                        {profile.bio}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {[
                                        { icon: 'fas fa-code-branch', label: `${profile.public_repos} repos` },
                                        { icon: 'fas fa-users', label: `${profile.followers} followers` },
                                        { icon: 'fas fa-user-friends', label: `${profile.following} following` },
                                    ].map(({ icon, label }) => (
                                        <span key={label} style={{ fontSize: '0.8rem', fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: '0.35rem', opacity: 0.8 }}>
                                            <i className={icon} style={{ color: 'var(--primary)' }} /> {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <a href={profile.html_url} target="_blank" rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 1.2rem', background: 'var(--text)', color: 'var(--white)',
                                    border: 'var(--border-width) solid var(--border)', boxShadow: '4px 4px 0 var(--border)',
                                    textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                                    fontFamily: 'Space Mono, monospace', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'; }}
                            >
                                <i className="fab fa-github" /> View Profile
                            </a>
                        </div>

                        {/* ── Contribution heatmap ── */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        🟩 Contribution Activity
                                    </div>
                                    {(() => {
                                        const { current, longest } = computeStreaks(weeks);
                                        const show = current > 0 ? current : longest;
                                        const icon = current > 0 ? '🔥' : '🏆';
                                        const label = current > 0 ? 'streak' : 'best streak';
                                        return show > 0 ? (
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                                padding: '0.2rem 0.6rem',
                                                background: 'var(--secondary)', border: 'var(--border-width) solid var(--border)',
                                                boxShadow: '3px 3px 0 var(--border)',
                                                color: 'var(--secondary-content)',
                                                fontFamily: 'Space Mono, monospace', fontSize: '0.75rem', fontWeight: 700,
                                            }}>
                                                {icon} {show}-day {label}
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', opacity: 0.7 }}>
                                    {totalContribs.toLocaleString()} contributions · last year
                                </div>
                            </div>

                            {/* Heatmap — fluid on desktop, horizontally scrollable on mobile */}
                            <HeatmapGrid weeks={weeks} />

                            {/* Legend */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', opacity: 0.7 }}>
                                <span>Less</span>
                                {[0, 1, 3, 6].map(n => (
                                    <div key={n} style={{ width: 11, height: 11, background: cellColor(n), border: '1.5px solid var(--border)' }} />
                                ))}
                                <span>More</span>
                            </div>
                        </div>

                        {/* ── Pinned repos ── */}
                        {pinnedRepos.length > 0 && (
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                                    � Pinned Repositories
                                </div>
                                <div className="github-repo-grid">
                                    {pinnedRepos.map(repo => (
                                        <a key={repo.id} href={repo.url} target="_blank" rel="noopener noreferrer"
                                            className="github-repo-card"
                                            style={{ textDecoration: 'none', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '6px 6px 0 var(--border)'; }}
                                        >
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <i className="fas fa-thumbtack" style={{ color: 'var(--primary)', fontSize: '0.75rem' }} />
                                                {repo.name}
                                            </div>
                                            {repo.description && (
                                                <div style={{ fontSize: '0.8rem', opacity: 0.7, fontFamily: 'Space Mono, monospace', marginBottom: '0.75rem', lineHeight: 1.5, flex: 1 }}>
                                                    {repo.description.length > 80 ? repo.description.slice(0, 80) + '…' : repo.description}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                                                {repo.primaryLanguage && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontFamily: 'Space Mono, monospace' }}>
                                                        <span style={{
                                                            width: 10, height: 10, borderRadius: '50%',
                                                            background: repo.primaryLanguage.color || LANG_COLORS[repo.primaryLanguage.name] || '#888',
                                                            border: '1.5px solid var(--border)', display: 'inline-block'
                                                        }} />
                                                        {repo.primaryLanguage.name}
                                                    </span>
                                                )}
                                                <span style={{ fontSize: '0.75rem', fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <i className="fas fa-star" style={{ color: 'var(--secondary)' }} /> {repo.stargazerCount}
                                                </span>
                                                {repo.isFork && (
                                                    <span style={{ fontSize: '0.7rem', fontFamily: 'Space Mono, monospace', opacity: 0.5 }}>
                                                        <i className="fas fa-code-branch" /> fork
                                                    </span>
                                                )}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </section>
    );
}
