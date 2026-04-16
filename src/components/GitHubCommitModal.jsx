import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function getExpandedDateRange(localDate) {
    const base = new Date(localDate + 'T00:00:00+05:30');
    const prev = new Date(base.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const next = new Date(base.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return `${prev}..${next}`;
}

function isOnLocalISTDate(isoTimestamp, localDate) {
    const istMs = new Date(isoTimestamp).getTime() + IST_OFFSET_MS;
    const istDate = new Date(istMs).toISOString().split('T')[0];
    return istDate === localDate;
}

const STYLES = `
@keyframes ghModalIn {
    from { transform: translateY(30px) scale(0.95); opacity: 0; }
    to   { transform: translateY(0) scale(1); opacity: 1; }
}
.gh-item-card:hover {
    background: var(--secondary) !important;
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 var(--border) !important;
}
.gh-modal-scroll::-webkit-scrollbar { width: 8px; }
.gh-modal-scroll::-webkit-scrollbar-track { background: var(--bg-cell); }
.gh-modal-scroll::-webkit-scrollbar-thumb { background: var(--border); border: 2px solid var(--bg-cell); }
.gh-view-toggle {
    display: flex;
    background: var(--bg-cell);
    border: 3px solid var(--border);
    box-shadow: 4px 4px 0 var(--border);
    padding: 2px;
}
.gh-toggle-btn {
    padding: 4px 12px;
    border: none;
    background: transparent;
    font-family: 'Space Mono', monospace;
    font-size: 0.7rem;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.1s;
    display: flex;
    align-items: center;
    gap: 6px;
}
.gh-toggle-btn.active {
    background: var(--accent);
    color: var(--text);
}
.repo-header:hover {
    background: var(--bg-cell) !important;
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 var(--border) !important;
}
`;

const getTypeIcon = (type) => {
    switch (type) {
        case 'merge': return <i className="fas fa-code-merge" style={{ color: 'var(--yellow)' }} />;
        case 'repo': return <i className="fas fa-book" style={{ color: 'var(--accent)' }} />;
        default: return <i className="fas fa-code-commit" style={{ color: 'var(--primary)' }} />;
    }
};

const getTypeLabel = (type) => {
    switch (type) {
        case 'merge': return 'MERGE COMMIT';
        case 'repo': return 'REPO CREATED';
        default: return 'COMMIT';
    }
};

function CommitCard({ item, showRepo }) {
    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="gh-item-card"
            style={{
                textDecoration: 'none', color: 'inherit',
                padding: '1.35rem', background: 'var(--white)',
                border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)',
                display: 'flex', flexDirection: 'column', gap: '0.85rem',
                transition: 'all 0.15s',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        fontSize: '0.65rem', fontWeight: 900, padding: '3px 8px',
                        background: 'var(--bg-cell)', border: '2px solid var(--border)',
                        fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        {getTypeIcon(item.type)} {getTypeLabel(item.type)}
                    </div>
                    {showRepo && (
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text)', opacity: 0.5, letterSpacing: '0.5px' }}>
                            {item.repo.toUpperCase()}
                        </div>
                    )}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Space Mono, monospace', opacity: 0.6 }}>
                    {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {item.title}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Space Mono, monospace' }}>
                    SHA: {item.sha || '—'}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'Space Mono, monospace', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    VIEW <i className="fas fa-external-link-alt" style={{ fontSize: '0.6rem' }} />
                </div>
            </div>
        </a>
    );
}

export default function GitHubCommitModal({ isOpen, onClose, date, username, graphCount = 0 }) {
    const [items, setItems] = useState([]);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('gh_view_mode') || 'sequential');
    const [expandedRepos, setExpandedRepos] = useState(new Set());
    const [visibleCount, setVisibleCount] = useState(10);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('gh_view_mode', viewMode);
    }, [viewMode]);

    const groupedItems = useMemo(() => {
        if (viewMode !== 'repo') return [];
        const groups = {};
        items.forEach(item => {
            if (!groups[item.repo]) {
                groups[item.repo] = { name: item.repo, items: [], latest: item.time };
            }
            groups[item.repo].items.push(item);
        });
        return Object.values(groups).sort((a, b) => b.items.length - a.items.length || b.latest - a.latest);
    }, [items, viewMode]);

    const toggleRepo = useCallback((name) => {
        setExpandedRepos(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    }, []);

    useEffect(() => {
        if (!isOpen || !date) return;

        const fetchActivity = async () => {
            setItems([]);
            setVisibleCount(10);
            setLoading(true);
            setLoadingMore(false);
            setError(null);

            const headers = {
                'Accept': 'application/vnd.github.cloak-preview+json',
                ...(TOKEN ? { 'Authorization': `token ${TOKEN}` } : {}),
            };

            const dateRange = getExpandedDateRange(date);

            try {
                const commitUrl = `https://api.github.com/search/commits?q=${encodeURIComponent(`author:${username} committer-date:${dateRange}`)}&per_page=100&sort=author-date&order=desc`;
                const repoUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(`user:${username} created:${dateRange}`)}&per_page=10`;

                const [commitRes, repoRes] = await Promise.allSettled([
                    fetch(commitUrl, { headers }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
                    fetch(repoUrl, { headers }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
                ]);

                const allItems = [];
                const seen = new Set();

                if (commitRes.status === 'fulfilled') {
                    (commitRes.value.items || []).forEach(c => {
                        const ts = c.commit.committer.date;
                        if (!isOnLocalISTDate(ts, date)) return;
                        if (seen.has(c.sha)) return;
                        seen.add(c.sha);

                        const msg = c.commit.message;
                        const isMerge = msg.startsWith('Merge pull request') || msg.startsWith('Merge branch');

                        allItems.push({
                            id: c.sha,
                            type: isMerge ? 'merge' : 'commit',
                            title: msg,
                            repo: c.repository.full_name,
                            time: new Date(ts),
                            url: c.html_url,
                            sha: c.sha.substring(0, 7),
                        });
                    });
                }

                if (repoRes.status === 'fulfilled') {
                    (repoRes.value.items || []).forEach(r => {
                        if (!isOnLocalISTDate(r.created_at, date)) return;
                        if (seen.has(String(r.id))) return;
                        seen.add(String(r.id));
                        allItems.push({
                            id: String(r.id),
                            type: 'repo',
                            title: `Created Repository: ${r.name}`,
                            repo: r.full_name,
                            time: new Date(r.created_at),
                            url: r.html_url,
                        });
                    });
                }

                allItems.sort((a, b) => b.time - a.time);
                setItems(allItems);
                setLoading(false);
            } catch (err) {
                console.error('GitHub fetch error:', err);
                setError('GitHub connection failed. Please try again.');
                setLoading(false);
            }
        };

        fetchActivity();
    }, [isOpen, date, username]);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current || loading || loadingMore || visibleCount >= items.length) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 30) {
            setLoadingMore(true);
            setTimeout(() => {
                setVisibleCount(prev => prev + 10);
                setLoadingMore(false);
            }, 2000);
        }
    }, [loading, loadingMore, visibleCount, items.length]);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const displayedItems = items.slice(0, visibleCount);
    const hasNextBatch = visibleCount < items.length;
    const unavailableCount = Math.max(0, graphCount - items.length);

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 100000,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
            }}
            onClick={onClose}
        >
            <style>{STYLES}</style>
            <div
                style={{
                    width: '100%', maxWidth: '680px', maxHeight: '88vh',
                    background: 'var(--white)', border: '4px solid var(--border)',
                    boxShadow: '16px 16px 0 var(--border)',
                    display: 'flex', flexDirection: 'column',
                    animation: 'ghModalIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                    overflow: 'hidden',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    padding: '1.25rem 1.5rem', background: 'var(--accent)',
                    borderBottom: '4px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <div>
                        <div style={{
                            fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase',
                            letterSpacing: '1px', color: 'var(--text)', opacity: 0.7,
                            fontFamily: 'Space Mono, monospace',
                        }}>
                            {graphCount > 0 ? `${graphCount} CONTRIBUTION${graphCount !== 1 ? 'S' : ''} ON` : 'ACTIVITIES FOR'}
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text)', fontFamily: 'Space Mono, monospace' }}>
                            {formattedDate}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="gh-view-toggle">
                            <button
                                className={`gh-toggle-btn ${viewMode === 'sequential' ? 'active' : ''}`}
                                onClick={() => setViewMode('sequential')}
                                title="List View"
                            >
                                <i className="fas fa-list-ul" />
                            </button>
                            <button
                                className={`gh-toggle-btn ${viewMode === 'repo' ? 'active' : ''}`}
                                onClick={() => setViewMode('repo')}
                                title="Repo View"
                            >
                                <i className="fas fa-layer-group" />
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--pink)', border: '4px solid var(--border)',
                                boxShadow: '4px 4px 0 var(--border)', cursor: 'pointer',
                                fontSize: '1.2rem', color: 'var(--pink-content)', transition: 'all 0.1s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'; }}
                        >
                            <i className="fas fa-times" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="gh-modal-scroll"
                    style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
                >
                    {loading && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', opacity: 0.6, padding: '4rem 0' }}>
                            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '3.5rem', color: 'var(--primary)' }} />
                            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 800, letterSpacing: '1px' }}>FETCHING COMMITS...</div>
                        </div>
                    )}

                    {!loading && error && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                            <div style={{ background: 'var(--pink)', border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.5rem', width: '100%', textAlign: 'center' }}>
                                <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem', marginBottom: '1rem' }} />
                                <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 800 }}>{error}</div>
                            </div>
                        </div>
                    )}

                    {!loading && !error && items.length === 0 && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6, padding: '4rem 0', gap: '1rem' }}>
                            <i className="fas fa-lock" style={{ fontSize: '3rem' }} />
                            <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'Space Mono, monospace', textAlign: 'center' }}>NO PUBLIC COMMITS FOUND</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.7, fontFamily: 'Space Mono, monospace', textAlign: 'center', maxWidth: '420px', lineHeight: 1.6 }}>
                                All {graphCount} contribution{graphCount !== 1 ? 's' : ''} on this day are from private repositories
                                or were recorded by GitHub through internal account linking — not accessible via the public API.
                            </div>
                        </div>
                    )}

                    {!loading && !error && items.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {viewMode === 'sequential' ? (
                                displayedItems.map((item, idx) => (
                                    <CommitCard key={item.id + idx} item={item} showRepo />
                                ))
                            ) : (
                                groupedItems.map((group) => {
                                    const isExpanded = expandedRepos.has(group.name);
                                    return (
                                        <div key={group.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div
                                                className="repo-header"
                                                onClick={() => toggleRepo(group.name)}
                                                style={{
                                                    padding: '1.25rem 1.5rem', background: 'var(--white)',
                                                    border: '4px solid var(--border)', boxShadow: '6px 6px 0 var(--border)',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    cursor: 'pointer', transition: 'all 0.15s'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <i className={`fas ${isExpanded ? 'fa-folder-open text-yellow' : 'fa-folder'}`} style={{ color: isExpanded ? 'var(--yellow)' : 'var(--accent)', fontSize: '1.2rem' }} />
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 950, fontFamily: 'Space Mono, monospace' }}>
                                                        {group.name.toUpperCase()}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, background: 'var(--bg-cell)', padding: '2px 8px', border: '2px solid var(--border)', fontFamily: 'Space Mono, monospace' }}>
                                                        {group.items.length} ACTIVITIES
                                                    </div>
                                                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ opacity: 0.5 }} />
                                                </div>
                                            </div>
                                            <div style={{
                                                maxHeight: isExpanded ? '2000px' : '0',
                                                opacity: isExpanded ? 1 : 0,
                                                overflow: 'hidden',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                display: 'flex', flexDirection: 'column', gap: '1rem',
                                                paddingLeft: '1rem', borderLeft: '4px solid var(--bg-cell)', marginLeft: '1rem'
                                            }}>
                                                <div style={{ paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {group.items.map((item, idx) => (
                                                        <CommitCard key={item.id + idx} item={item} showRepo={false} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {viewMode === 'sequential' && (hasNextBatch || loadingMore) && (
                                <div style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', padding: '1.5rem', gap: '1rem',
                                    opacity: loadingMore ? 1 : 0.4,
                                }}>
                                    <i className={`fas ${loadingMore ? 'fa-spinner fa-spin' : 'fa-arrow-down'}`} style={{ fontSize: '1.5rem' }} />
                                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.85rem', fontWeight: 800 }}>
                                        {loadingMore ? 'LOADING MORE...' : 'SCROLL FOR MORE'}
                                    </div>
                                </div>
                            )}

                            {(viewMode === 'repo' || (!hasNextBatch && !loadingMore)) && unavailableCount > 0 && (
                                <div style={{
                                    padding: '1.35rem', background: 'var(--bg-cell)',
                                    border: '4px dashed var(--border)', marginTop: viewMode === 'repo' ? '1rem' : '0',
                                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                                }}>
                                    <i className="fas fa-lock" style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '2px', opacity: 0.6 }} />
                                    <div>
                                        <div style={{ fontWeight: 900, fontFamily: 'Space Mono, monospace', fontSize: '0.9rem' }}>
                                            {unavailableCount} CONTRIBUTION{unavailableCount !== 1 ? 'S' : ''} NOT PUBLICLY VISIBLE
                                        </div>
                                        <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', fontFamily: 'Space Mono, monospace', lineHeight: 1.6, opacity: 0.7 }}>
                                            These contributions are counted by GitHub but cannot be retrieved via the public API —
                                            they include activity in private repositories and cross-repository work attributed by GitHub internally.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!loading && (
                    <div style={{
                        padding: '1rem 1.5rem', background: 'var(--bg-cell)',
                        borderTop: '4px solid var(--border)', flexShrink: 0,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', fontWeight: 900,
                        flexWrap: 'wrap', gap: '0.5rem',
                    }}>
                        <span>
                            {loadingMore ? 'LOADING...' :
                                viewMode === 'sequential' ? `${displayedItems.length} OF ${items.length} COMMITS SHOWN` :
                                    `SHOWING ${items.length} ACTIVITIES IN ${groupedItems.length} REPOSITORIES`}
                        </span>
                        {unavailableCount > 0 && (
                            <span style={{ opacity: 0.55, fontSize: '0.75rem' }}>
                                <i className="fas fa-lock" style={{ marginRight: '5px' }} />
                                {unavailableCount} IN PRIVATE / LINKED REPOS
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
