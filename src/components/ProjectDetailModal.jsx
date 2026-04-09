import { useEffect, useState, useRef, useCallback } from 'react';

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const MODAL_STYLES = `
@keyframes projectModalIn {
    from { transform: translateY(40px) scale(0.96); opacity: 0; }
    to   { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes overlayFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
@keyframes gallerySlide {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
}
@keyframes lightboxIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
}
@keyframes spinnerSpin {
    to { transform: rotate(360deg); }
}

* { box-sizing: border-box; }
.proj-modal-tab {
    transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}
.proj-modal-tab:hover {
    background: var(--yellow) !important;
    color: var(--text) !important;
    transform: translate(3px, 3px) !important;
    box-shadow: 0 0 0 var(--border) !important;
}
.proj-modal-tab.active {
    background: var(--yellow) !important;
    color: var(--text) !important;
    box-shadow: 0 0 0 var(--border) !important;
    transform: translate(4px, 4px) !important;
    cursor: default !important;
}
.proj-highlight-item:hover {
    background: var(--yellow) !important;
    transform: translateX(4px);
}
.proj-tech-pill:hover {
    background: var(--cyan) !important;
    color: var(--cyan-content) !important;
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 var(--border) !important;
}
.proj-gallery-thumb:hover {
    border-color: var(--yellow) !important;
    transform: translate(2px, -2px);
}
.proj-gallery-thumb.active {
    border-color: var(--yellow) !important;
    box-shadow: 4px 4px 0 var(--yellow) !important;
}
.proj-action-btn:hover {
    transform: translate(5px, 5px) !important;
    box-shadow: 0 0 0 var(--border) !important;
}
.proj-gh-card:hover {
    background: var(--secondary) !important;
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 var(--border) !important;
}
.proj-tree-item:hover {
    background: var(--yellow) !important;
}
.proj-modal-scroll::-webkit-scrollbar { width: 8px; }
.proj-modal-scroll::-webkit-scrollbar-track { background: var(--bg-cell, #ebedf0); }
.proj-modal-scroll::-webkit-scrollbar-thumb { background: var(--border); border: 2px solid var(--bg-cell, #ebedf0); }
`;

// ── helpers ──────────────────────────────────────────────────────────────────

function parseOwnerRepo(githubUrl) {
    try {
        const parts = githubUrl.replace(/\/$/, '').split('/');
        return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
    } catch {
        return { owner: '', repo: '' };
    }
}

function GhFetch({ url, children }) {
    const [state, setState] = useState({ data: null, loading: true, error: null });
    const [prevUrl, setPrevUrl] = useState(url);

    // Reset state in render if URL changes
    if (url !== prevUrl) {
        setPrevUrl(url);
        setState({ data: null, loading: true, error: null });
    }

    useEffect(() => {
        const headers = {
            'Accept': 'application/vnd.github+json',
            ...(TOKEN ? { Authorization: `token ${TOKEN}` } : {}),
        };
        fetch(url, { headers })
            .then(r => {
                if (!r.ok) throw new Error(`GitHub API error ${r.status}`);
                return r.json();
            })
            .then(d => { setState({ data: d, loading: false, error: null }); })
            .catch(e => { setState({ data: null, loading: false, error: e.message }); });
    }, [url]);

    return children(state);
}

function Spinner() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem 0', opacity: 0.6 }}>
            <div style={{
                width: 44, height: 44, border: '5px solid var(--border)',
                borderTopColor: 'var(--yellow)', borderRadius: '50%',
                animation: 'spinnerSpin 0.8s linear infinite',
            }} />
            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1px' }}>LOADING...</div>
        </div>
    );
}

function ErrorBox({ message }) {
    return (
        <div style={{ background: 'var(--pink)', border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.5rem', textAlign: 'center', margin: '1rem 0' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.8rem', marginBottom: '0.75rem', display: 'block' }} />
            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 800, fontSize: '0.85rem' }}>{message}</div>
        </div>
    );
}

// ── Image Gallery ─────────────────────────────────────────────────────────────

function ImageGallery({ images }) {
    const [active, setActive] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [imgErrors, setImgErrors] = useState({});

    const validImages = (images || []).filter((_, i) => !imgErrors[i]);
    const hasImages = validImages.length > 0;

    const handleImgError = useCallback((origIdx) => {
        setImgErrors(prev => ({ ...prev, [origIdx]: true }));
    }, []);

    if (!hasImages || !images?.length) {
        return (
            <div style={{
                height: 260, background: 'var(--bg-cell, #ebedf0)',
                border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '1rem', opacity: 0.55, marginBottom: '1.5rem',
            }}>
                <i className="fas fa-image" style={{ fontSize: '3rem' }} />
                <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1px' }}>
                    NO SCREENSHOTS YET
                </div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.75rem', opacity: 0.7, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
                    Drop images in <code>public/projects/&lt;slug&gt;/</code> and add paths to portfolio.json
                </div>
            </div>
        );
    }

    // Re-map to original indices for error tracking
    const actualImages = (images || []);

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {/* Main image */}
            <div
                style={{
                    position: 'relative', height: 320, overflow: 'hidden',
                    border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)',
                    background: '#111', cursor: 'zoom-in',
                    marginBottom: '0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onClick={() => setLightbox(true)}
            >
                {!imgErrors[active] ? (
                    <img
                        key={active}
                        src={actualImages[active]}
                        alt={`Screenshot ${active + 1}`}
                        onError={() => handleImgError(active)}
                        style={{
                            maxWidth: '100%', maxHeight: '100%',
                            width: 'auto', height: 'auto',
                            objectFit: 'contain',
                            animation: 'gallerySlide 0.25s ease',
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                        <i className="fas fa-image" style={{ fontSize: '3rem', color: '#fff' }} />
                    </div>
                )}
                <div style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: 'var(--yellow)', border: '3px solid var(--border)',
                    padding: '3px 10px', fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', fontWeight: 900,
                }}>
                    <i className="fas fa-expand" style={{ marginRight: 5 }} />ZOOM
                </div>
                {actualImages.length > 1 && (
                    <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'var(--border)', color: '#fff', padding: '3px 10px', fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', fontWeight: 900 }}>
                        {active + 1} / {actualImages.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {actualImages.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                    {actualImages.map((src, i) => (
                        !imgErrors[i] && (
                            <button
                                key={i}
                                className={`proj-gallery-thumb${active === i ? ' active' : ''}`}
                                onClick={() => setActive(i)}
                                style={{
                                    flexShrink: 0, width: 80, height: 56, padding: 0,
                                    border: '3px solid var(--border)',
                                    boxShadow: active === i ? '4px 4px 0 var(--yellow)' : '3px 3px 0 var(--border)',
                                    overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-cell)',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <img
                                    src={src}
                                    alt={`Thumb ${i + 1}`}
                                    onError={() => handleImgError(i)}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </button>
                        )
                    ))}
                </div>
            )}

            {/* Lightbox - Full Image Zoom */}
            {lightbox && !imgErrors[active] && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200000,
                        background: 'rgba(0,0,0,0.98)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={() => setLightbox(false)}
                >
                    {/* Safe Zone Container: Image is kept in the middle 70% of the screen */}
                    <div style={{
                        width: '74vw',
                        height: '84vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <img
                            key={active}
                            src={actualImages[active]}
                            alt="Full view"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                animation: 'lightboxIn 0.2s ease',
                                // Note: Border removed to avoid any pixel-level clipping confusion, 
                                // using box-shadow for depth instead.
                                boxShadow: '0 0 80px rgba(0,0,0,0.9)',
                            }}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>

                    {/* Controls: Positioned at the very edges of the screen, far from the Safe Zone */}
                    <div style={{ pointerEvents: 'none' }}>
                        <button
                            onClick={() => setLightbox(false)}
                            style={{
                                position: 'fixed', top: 30, right: 30,
                                width: 58, height: 58, background: 'var(--pink)',
                                border: '4px solid var(--border)', boxShadow: '5px 5px 0 var(--border)',
                                cursor: 'pointer', fontSize: '1.4rem', color: 'var(--pink-content)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                pointerEvents: 'auto', zIndex: 20,
                            }}
                        >
                            <i className="fas fa-times" />
                        </button>

                        {actualImages.length > 1 && (
                            <>
                                <button
                                    onClick={e => { e.stopPropagation(); setActive(p => (p - 1 + actualImages.length) % actualImages.length); }}
                                    style={{
                                        position: 'fixed', left: 40, top: '50%', transform: 'translateY(-50%)',
                                        width: 58, height: 58, background: 'var(--yellow)', border: '4px solid var(--border)',
                                        boxShadow: '5px 5px 0 var(--border)', cursor: 'pointer', fontSize: '1.5rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        pointerEvents: 'auto', zIndex: 20,
                                    }}
                                ><i className="fas fa-chevron-left" /></button>
                                <button
                                    onClick={e => { e.stopPropagation(); setActive(p => (p + 1) % actualImages.length); }}
                                    style={{
                                        position: 'fixed', right: 40, top: '50%', transform: 'translateY(-50%)',
                                        width: 58, height: 58, background: 'var(--yellow)', border: '4px solid var(--border)',
                                        boxShadow: '5px 5px 0 var(--border)', cursor: 'pointer', fontSize: '1.5rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        pointerEvents: 'auto', zIndex: 20,
                                    }}
                                ><i className="fas fa-chevron-right" /></button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Commits Section ───────────────────────────────────────────────────────────

function CommitsSection({ baseUrl, owner, repo }) {
    const [expanded, setExpanded] = useState(false);
    const [page, setPage] = useState(1);
    const [allCommits, setAllCommits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [prevBaseUrl, setPrevBaseUrl] = useState(baseUrl);
    const PER_PAGE = 50;

    // Reset when base repository changes
    if (baseUrl !== prevBaseUrl) {
        setPrevBaseUrl(baseUrl);
        setAllCommits([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        setLoading(true);
    }

    useEffect(() => {
        let ignore = false;
        const url = `${baseUrl}/commits?per_page=${PER_PAGE}&page=${page}`;

        const headers = {
            'Accept': 'application/vnd.github+json',
            ...(TOKEN ? { Authorization: `token ${TOKEN}` } : {}),
        };

        fetch(url, { headers })
            .then(r => {
                if (!r.ok) throw new Error(`GitHub API error ${r.status}`);
                return r.json();
            })
            .then(newCommits => {
                if (ignore) return;
                if (newCommits.length < PER_PAGE) setHasMore(false);
                setAllCommits(prev => {
                    const existingShas = new Set(prev.map(c => c.sha));
                    const uniqueNew = newCommits.filter(c => !existingShas.has(c.sha));
                    return [...prev, ...uniqueNew];
                });
                setLoading(false);
            })
            .catch(e => {
                if (ignore) return;
                setError(e.message);
                setLoading(false);
            });
        return () => { ignore = true; };
    }, [baseUrl, page]);

    function formatDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    if (loading && allCommits.length === 0) return <Spinner />;
    if (error && allCommits.length === 0) return <ErrorBox message="Could not load commits." />;
    if (allCommits.length === 0 && !loading) return null;

    return (
        <div style={{ border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', background: 'var(--white)', overflow: 'hidden' }}>
            {/* Header */}
            <button
                onClick={() => setExpanded(p => !p)}
                style={{
                    width: '100%', padding: '1rem 1.25rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--bg-cell, #ebedf0)', border: 'none',
                    borderBottom: expanded ? '4px solid var(--border)' : 'none',
                    cursor: 'pointer', gap: '0.75rem',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i className="fas fa-code-commit" style={{ fontSize: '1rem' }} />
                    <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>
                        COMMITS
                    </span>
                    <span style={{ background: 'var(--yellow)', border: '2px solid var(--border)', padding: '2px 10px', fontFamily: 'Space Mono, monospace', fontSize: '0.72rem', fontWeight: 900 }}>
                        {allCommits.length}{hasMore ? '+' : ''}
                    </span>
                </div>
                <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} style={{ fontSize: '0.85rem', opacity: 0.6 }} />
            </button>

            {/* Commit list */}
            {expanded && (
                <div>
                    {allCommits.map((c, i) => {
                        const msg = c.commit?.message || '';
                        const title = msg.split('\n')[0];
                        const body = msg.split('\n').slice(1).join('\n').trim();
                        const sha = c.sha?.slice(0, 7);
                        const date = formatDate(c.commit?.author?.date || c.commit?.committer?.date);
                        const authorName = c.commit?.author?.name || c.commit?.committer?.name || 'Unknown';
                        const avatarUrl = c.author?.avatar_url;
                        const ghLogin = c.author?.login;
                        const commitUrl = c.html_url;

                        return (
                            <div key={c.sha} style={{
                                padding: '1rem 1.25rem',
                                borderBottom: i < allCommits.length - 1 ? '3px solid var(--border)' : 'none',
                                display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
                            }}>
                                {/* Avatar */}
                                {avatarUrl
                                    ? <img src={avatarUrl} alt={ghLogin} style={{ width: 32, height: 32, border: '3px solid var(--border)', flexShrink: 0, marginTop: 2 }} />
                                    : <div style={{ width: 32, height: 32, background: 'var(--bg-cell,#ebedf0)', border: '3px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                                        <i className="fas fa-user" style={{ fontSize: '0.75rem', opacity: 0.5 }} />
                                    </div>
                                }

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {/* SHA + date row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                                        <a
                                            href={commitUrl} target="_blank" rel="noopener noreferrer"
                                            style={{
                                                fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 900,
                                                background: 'var(--border)', color: '#fff',
                                                padding: '1px 8px', textDecoration: 'none',
                                                letterSpacing: '1px', flexShrink: 0,
                                            }}
                                        >{sha}</a>
                                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', opacity: 0.5 }}>
                                            {ghLogin ? `@${ghLogin}` : authorName}
                                        </span>
                                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.68rem', opacity: 0.45, marginLeft: 'auto' }}>
                                            {date}
                                        </span>
                                    </div>
                                    <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                                        {title}
                                    </div>
                                    {body && (
                                        <pre style={{
                                            fontFamily: 'Space Mono, monospace', fontSize: '0.75rem',
                                            opacity: 0.65, lineHeight: 1.65, marginTop: '0.4rem',
                                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                            background: 'var(--bg-cell,#ebedf0)',
                                            padding: '0.5rem 0.75rem',
                                            border: '2px solid var(--border)',
                                        }}>{body}</pre>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Load more */}
                    {allCommits.length > 0 && hasMore && (
                        <div style={{ padding: '1rem 1.25rem', borderTop: '3px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--bg-cell,#ebedf0)' }}>
                            <button
                                disabled={loading}
                                onClick={() => setPage(p => p + 1)}
                                style={{
                                    background: loading ? 'var(--bg-cell)' : 'var(--yellow)',
                                    border: '3px solid var(--border)',
                                    boxShadow: loading ? 'none' : '4px 4px 0 var(--border)',
                                    padding: '0.5rem 1.25rem',
                                    fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.8rem',
                                    cursor: loading ? 'default' : 'pointer',
                                    transform: loading ? 'translate(2px,2px)' : '',
                                }}
                                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; } }}
                                onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'; } }}
                            >
                                {loading ? 'LOADING...' : <><i className="fas fa-arrow-down" style={{ marginRight: 6 }} />LOAD MORE</>}
                            </button>
                            <a
                                href={`https://github.com/${owner}/${repo}/commits`}
                                target="_blank" rel="noopener noreferrer"
                                style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.75rem', opacity: 0.65, textDecoration: 'underline', color: 'inherit' }}
                            >
                                See all on GitHub <i className="fas fa-arrow-up-right-from-square" />
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── GitHub Analysis Tab ────────────────────────────────────────────────────────

function GitHubAnalysisTab({ githubUrl }) {
    const { owner, repo } = parseOwnerRepo(githubUrl);
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const [treeExpanded, setTreeExpanded] = useState(false);

    if (!owner || !repo) {
        return <ErrorBox message="Could not parse GitHub URL." />;
    }

    return (
        <GhFetch url={baseUrl}>
            {({ data: repoData, loading: repoLoading, error: repoError }) => (
                repoLoading ? <Spinner /> :
                    repoError ? <ErrorBox message={repoError} /> :
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* ── Repo description + tags at top (compact) ── */}
                            <div style={{ border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.25rem', background: 'var(--white)' }}>
                                <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7, marginBottom: '0.75rem' }}>REPOSITORY INFO</div>
                                {repoData.description && (
                                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.88rem', opacity: 0.85, lineHeight: 1.7, marginBottom: '0.75rem' }}>{repoData.description}</p>
                                )}
                                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                    {repoData.language && (
                                        <span style={{ background: 'var(--border)', color: 'var(--bg,#fff)', padding: '3px 12px', fontFamily: 'Space Mono, monospace', fontSize: '0.75rem', fontWeight: 900 }}>
                                            <i className="fas fa-code" style={{ marginRight: 5 }} />{repoData.language}
                                        </span>
                                    )}
                                    {repoData.license?.spdx_id && (
                                        <span style={{ background: 'var(--accent)', border: '2px solid var(--border)', padding: '3px 12px', fontFamily: 'Space Mono, monospace', fontSize: '0.75rem', fontWeight: 900 }}>
                                            <i className="fas fa-scale-balanced" style={{ marginRight: 5 }} />{repoData.license.spdx_id}
                                        </span>
                                    )}
                                    {repoData.topics?.map(t => (
                                        <span key={t} style={{ background: 'var(--bg-cell,#ebedf0)', border: '2px solid var(--border)', padding: '3px 10px', fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', fontWeight: 700 }}>{t}</span>
                                    ))}
                                </div>
                            </div>

                            {/* ── Languages Breakdown ── */}
                            <GhFetch url={`${baseUrl}/languages`}>
                                {({ data: langs, loading, error }) => (
                                    loading ? <Spinner /> : error ? <ErrorBox message={error} /> :
                                        langs && Object.keys(langs).length > 0 ? (
                                            <div style={{ border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.25rem', background: 'var(--white)' }}>
                                                <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7, marginBottom: '1rem' }}>LANGUAGE BREAKDOWN</div>
                                                {(() => {
                                                    const total = Object.values(langs).reduce((a, b) => a + b, 0);
                                                    const COLORS = ['var(--yellow)', 'var(--cyan)', 'var(--pink)', 'var(--accent)', 'var(--primary)', 'var(--secondary)'];
                                                    const entries = Object.entries(langs).sort((a, b) => b[1] - a[1]);
                                                    return (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                            {/* Stacked bar */}
                                                            <div style={{ display: 'flex', height: 16, border: '3px solid var(--border)', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                                                {entries.map(([lang, bytes], i) => (
                                                                    <div key={lang} style={{ width: `${(bytes / total * 100).toFixed(1)}%`, background: COLORS[i % COLORS.length], transition: 'width 0.3s' }} title={`${lang}: ${(bytes / total * 100).toFixed(1)}%`} />
                                                                ))}
                                                            </div>
                                                            {entries.map(([lang, bytes], i) => (
                                                                <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                    <div style={{ width: 14, height: 14, background: COLORS[i % COLORS.length], border: '2px solid var(--border)', flexShrink: 0 }} />
                                                                    <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: '0.85rem', flex: 1 }}>{lang}</div>
                                                                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', opacity: 0.7 }}>{(bytes / total * 100).toFixed(1)}%</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ) : null
                                )}
                            </GhFetch>

                            {/* ── Community Standards ── */}
                            <GhFetch url={`${baseUrl}/community/profile`}>
                                {({ data: community, loading, error }) => (
                                    loading ? <Spinner /> : error ? null : community ? (
                                        <div style={{ border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.25rem', background: 'var(--white)' }}>
                                            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7, marginBottom: '1rem' }}>COMMUNITY STANDARDS</div>
                                            {community.health_percentage !== undefined && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', fontWeight: 900, marginBottom: '0.4rem' }}>
                                                        <span>Health Score</span>
                                                        <span>{community.health_percentage}%</span>
                                                    </div>
                                                    <div style={{ height: 12, background: 'var(--bg-cell, #ebedf0)', border: '3px solid var(--border)' }}>
                                                        <div style={{ height: '100%', width: `${community.health_percentage}%`, background: community.health_percentage >= 80 ? 'var(--accent)' : community.health_percentage >= 50 ? 'var(--yellow)' : 'var(--pink)', transition: 'width 0.5s' }} />
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                {[
                                                    { key: 'readme', label: 'README', icon: 'fas fa-book' },
                                                    { key: 'code_of_conduct', label: 'Code of Conduct', icon: 'fas fa-handshake' },
                                                    { key: 'contributing', label: 'Contributing Guide', icon: 'fas fa-users' },
                                                    { key: 'license', label: 'License', icon: 'fas fa-scale-balanced' },
                                                    { key: 'issue_template', label: 'Issue Templates', icon: 'fas fa-circle-exclamation' },
                                                    { key: 'pull_request_template', label: 'PR Template', icon: 'fas fa-code-pull-request' },
                                                ].map(({ key, label, icon }) => {
                                                    const present = !!(community.files?.[key] || community[key]);
                                                    return (
                                                        <div key={key} style={{
                                                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                                                            padding: '0.5rem 0.75rem',
                                                            background: present ? 'rgba(168,230,207,0.2)' : 'rgba(255,107,157,0.1)',
                                                            border: `3px solid ${present ? 'var(--accent)' : 'var(--pink)'}`,
                                                        }}>
                                                            <i className={icon} style={{ fontSize: '0.9rem', opacity: 0.75 }} />
                                                            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.72rem', fontWeight: 700, flex: 1 }}>{label}</span>
                                                            <i className={`fas ${present ? 'fa-check' : 'fa-xmark'}`} style={{ color: present ? 'var(--accent)' : 'var(--pink)', fontWeight: 900 }} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : null
                                )}
                            </GhFetch>

                            {/* ── File Tree ── */}
                            <GhFetch url={`${baseUrl}/git/trees/HEAD?recursive=0`}>
                                {({ data: tree, loading, error }) => (
                                    loading ? <Spinner /> : error ? <ErrorBox message="Could not fetch repository tree." /> : tree?.tree ? (
                                        <div style={{ border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', background: 'var(--white)' }}>
                                            <div style={{ padding: '1rem 1.25rem', borderBottom: '4px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-cell, #ebedf0)' }}>
                                                <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7 }}>REPOSITORY FILE TREE</div>
                                                <button
                                                    onClick={() => setTreeExpanded(p => !p)}
                                                    style={{ background: 'var(--yellow)', border: '3px solid var(--border)', boxShadow: '3px 3px 0 var(--border)', padding: '3px 12px', fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                                                >
                                                    {treeExpanded ? 'COLLAPSE' : 'EXPAND ALL'}
                                                </button>
                                            </div>
                                            <div style={{ maxHeight: treeExpanded ? 'none' : 320, overflow: treeExpanded ? 'visible' : 'hidden', position: 'relative' }}>
                                                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    {tree.tree
                                                        .filter(item => item.path && !item.path.includes('node_modules') && !item.path.includes('.git'))
                                                        .slice(0, treeExpanded ? undefined : 30)
                                                        .map((item, i) => {
                                                            const depth = (item.path.match(/\//g) || []).length;
                                                            const isDir = item.type === 'tree';
                                                            const name = item.path.split('/').pop();
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className="proj-tree-item"
                                                                    style={{
                                                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                                        paddingLeft: `${depth * 1.25 + 0.5}rem`, paddingTop: '0.2rem', paddingBottom: '0.2rem', paddingRight: '0.5rem',
                                                                        fontFamily: 'Space Mono, monospace', fontSize: '0.78rem',
                                                                        transition: 'background 0.1s', borderRadius: 0,
                                                                    }}
                                                                >
                                                                    <i className={`fas ${isDir ? 'fa-folder' : 'fa-file-code'}`} style={{ fontSize: '0.75rem', color: isDir ? 'var(--yellow)' : 'var(--primary)', flexShrink: 0, width: 14, textAlign: 'center' }} />
                                                                    <span style={{ fontWeight: isDir ? 800 : 400, wordBreak: 'break-all' }}>{name}</span>
                                                                </div>
                                                            );
                                                        })
                                                    }
                                                </div>
                                                {!treeExpanded && tree.tree.length > 30 && (
                                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, var(--white))', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8 }}>
                                                        <button onClick={() => setTreeExpanded(true)} style={{ background: 'var(--border)', color: 'var(--bg,#fff)', border: 'none', padding: '4px 16px', fontFamily: 'Space Mono, monospace', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
                                                            + {tree.tree.length - 30} MORE FILES
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : null
                                )}
                            </GhFetch>

                            {/* ── Contributors ── */}
                            <GhFetch url={`${baseUrl}/contributors?per_page=10`}>
                                {({ data: contributors, loading, error }) => (
                                    loading ? <Spinner /> : error ? null : contributors?.length > 0 ? (
                                        <div style={{ border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.25rem', background: 'var(--white)', marginBottom: '0.5rem' }}>
                                            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7, marginBottom: '1rem' }}>
                                                CONTRIBUTORS ({contributors.length})
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {contributors.map(c => (
                                                    <a
                                                        key={c.id} href={c.html_url} target="_blank" rel="noopener noreferrer"
                                                        className="proj-gh-card"
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                            padding: '0.65rem 0.75rem', textDecoration: 'none', color: 'inherit',
                                                            border: '3px solid var(--border)', boxShadow: '4px 4px 0 var(--border)',
                                                            background: 'var(--white)', transition: 'all 0.15s',
                                                        }}
                                                    >
                                                        <img src={c.avatar_url} alt={c.login} style={{ width: 36, height: 36, border: '3px solid var(--border)', flexShrink: 0 }} />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 800, fontSize: '0.85rem' }}>{c.login}</div>
                                                            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.72rem', opacity: 0.6 }}>{c.contributions} commit{c.contributions !== 1 ? 's' : ''}</div>
                                                        </div>
                                                        <i className="fas fa-arrow-up-right-from-square" style={{ opacity: 0.4, fontSize: '0.8rem' }} />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null
                                )}
                            </GhFetch>

                            {/* ── Commits ── */}
                            <CommitsSection baseUrl={baseUrl} owner={owner} repo={repo} />

                            {/* ── Repo Stats at bottom ── */}
                            <div style={{ background: 'var(--yellow)', border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.25rem' }}>
                                <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7, marginBottom: '0.75rem' }}>REPOSITORY STATS</div>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {[
                                        { icon: 'fas fa-star', label: 'Stars', val: repoData.stargazers_count ?? 0 },
                                        { icon: 'fas fa-code-fork', label: 'Forks', val: repoData.forks_count ?? 0 },
                                        { icon: 'fas fa-eye', label: 'Watchers', val: repoData.watchers_count ?? 0 },
                                        { icon: 'fas fa-circle-dot', label: 'Open Issues', val: repoData.open_issues_count ?? 0 },
                                    ].map(({ icon, label, val }) => (
                                        <div key={label} style={{
                                            flex: '1 1 80px', background: 'var(--white)', border: '3px solid var(--border)',
                                            boxShadow: '4px 4px 0 var(--border)', padding: '0.75rem', textAlign: 'center', minWidth: 80,
                                        }}>
                                            <i className={icon} style={{ fontSize: '1.25rem', display: 'block', marginBottom: '0.4rem' }} />
                                            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '1.1rem' }}>{val.toLocaleString()}</div>
                                            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', opacity: 0.65, letterSpacing: '1px' }}>{label.toUpperCase()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Link to repo */}
                            <a
                                href={githubUrl} target="_blank" rel="noopener noreferrer"
                                className="proj-action-btn"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                                    padding: '0.75rem 1.5rem', background: 'var(--white)',
                                    border: '3px solid var(--border)', boxShadow: '5px 5px 0 var(--border)',
                                    textDecoration: 'none', color: 'var(--text)', fontWeight: 900,
                                    fontSize: '0.95rem', transition: 'all 0.15s', alignSelf: 'flex-start',
                                    fontFamily: 'Space Mono, monospace',
                                }}
                            >
                                <i className="fab fa-github" /> VIEW ON GITHUB
                            </a>
                        </div>
            )}
        </GhFetch>
    );
}

// ── Details Tab ────────────────────────────────────────────────────────────────

function DetailsTab({ project }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Gallery */}
            <ImageGallery images={project.images} />

            {/* Long description */}
            {project.longDescription && (
                <div style={{ border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.25rem', background: 'var(--white)' }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7, marginBottom: '0.75rem' }}>ABOUT THIS PROJECT</div>
                    {project.longDescription.split('\n\n').map((para, i) => (
                        <p key={i} style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.88rem', lineHeight: 1.8, opacity: 0.85, marginBottom: '0.75rem' }}>{para}</p>
                    ))}
                </div>
            )}

            {/* Highlights */}
            {project.highlights?.length > 0 && (
                <div style={{ border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.25rem', background: 'var(--white)' }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7, marginBottom: '0.75rem' }}>KEY HIGHLIGHTS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {project.highlights.map((h, i) => (
                            <div
                                key={i}
                                className="proj-highlight-item"
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                    padding: '0.6rem 0.75rem', border: '3px solid var(--border)',
                                    boxShadow: '4px 4px 0 var(--border)', background: 'var(--white)',
                                    fontFamily: 'Space Mono, monospace', fontSize: '0.82rem', lineHeight: 1.5,
                                    transition: 'all 0.15s',
                                }}
                            >
                                <i className="fas fa-check-circle" style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
                                <span>{h}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tech Stack */}
            {project.techStack?.length > 0 && (
                <div style={{ border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.25rem', background: 'var(--white)' }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7, marginBottom: '0.75rem' }}>TECH STACK</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {project.techStack.map((t, i) => (
                            <div
                                key={i}
                                className="proj-tech-pill"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 0.9rem', border: '3px solid var(--border)',
                                    boxShadow: '4px 4px 0 var(--border)', background: 'var(--white)',
                                    fontFamily: 'Space Mono, monospace', fontWeight: 800, fontSize: '0.8rem',
                                    transition: 'all 0.15s', cursor: 'default',
                                }}
                            >
                                <i className={t.icon} style={{ fontSize: '0.9rem' }} /> {t.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingBottom: '0.5rem' }}>
                {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer"
                        className="proj-action-btn"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                            padding: '0.85rem 1.75rem', background: 'var(--yellow)',
                            border: '3px solid var(--border)', boxShadow: '5px 5px 0 var(--border)',
                            textDecoration: 'none', color: 'var(--yellow-content)', fontWeight: 900,
                            fontSize: '0.95rem', transition: 'all 0.15s', fontFamily: 'Space Mono, monospace',
                        }}
                    >
                        <i className="fas fa-external-link-alt" /> VISIT SITE
                    </a>
                )}
                {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="proj-action-btn"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                            padding: '0.85rem 1.75rem', background: 'var(--white)',
                            border: '3px solid var(--border)', boxShadow: '5px 5px 0 var(--border)',
                            textDecoration: 'none', color: 'var(--text)', fontWeight: 900,
                            fontSize: '0.95rem', transition: 'all 0.15s', fontFamily: 'Space Mono, monospace',
                        }}
                    >
                        <i className="fab fa-github" /> VIEW CODE
                    </a>
                )}
            </div>
        </div>
    );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────

export default function ProjectDetailModal({ project, onClose }) {
    const [activeTab, setActiveTab] = useState('details');
    const scrollRef = useRef(null);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    // Scroll to top when switching tabs
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [activeTab]);

    if (!project) return null;

    const tabs = [
        { id: 'details', icon: 'fas fa-info-circle', label: 'Details' },
        ...(project.githubAnalysis ? [{ id: 'github', icon: 'fab fa-github', label: 'GitHub Analysis' }] : []),
    ];

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 100000,
                background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem', animation: 'overlayFadeIn 0.2s ease',
            }}
            onClick={onClose}
        >
            <style>{MODAL_STYLES}</style>
            <div
                style={{
                    width: '100%', maxWidth: 860,
                    maxHeight: '92vh',
                    background: 'var(--white)',
                    border: '4px solid var(--border)',
                    boxShadow: '16px 16px 0 var(--border)',
                    display: 'flex', flexDirection: 'column',
                    animation: 'projectModalIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                    overflow: 'hidden',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div style={{
                    background: 'var(--secondary)',
                    borderBottom: '4px solid var(--border)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    flexShrink: 0,
                }}>
                    {/* Logo */}
                    <div style={{
                        width: 52, height: 52, flexShrink: 0,
                        background: project.logoBg ? 'var(--yellow)' : 'transparent',
                        border: project.logoBg ? '3px solid var(--border)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.8rem',
                    }}>
                        {project.logo && project.logo.startsWith('/')
                            ? <img src={project.logo} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: project.logoBg ? 6 : 0 }} />
                            : (project.logo || '🔥')
                        }
                    </div>
                    {/* Title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.65, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            {project.label}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {project.name}
                        </div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.78rem', opacity: 0.7, marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {project.tagline}
                        </div>
                    </div>

                    {/* Meta info on right */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                        {project.year && (
                            <div style={{
                                background: 'var(--secondary)', border: '2px solid var(--border)',
                                boxShadow: '3px 3px 0 var(--border)',
                                padding: '2px 10px',
                                fontFamily: 'Space Mono, monospace', fontSize: '0.68rem', fontWeight: 900,
                                letterSpacing: '1px',
                            }}>{project.year}</div>
                        )}
                        {project.status && (
                            <div style={{
                                background: 'var(--accent)', border: '2px solid var(--border)',
                                boxShadow: '3px 3px 0 var(--border)',
                                padding: '2px 10px',
                                fontFamily: 'Space Mono, monospace', fontSize: '0.68rem', fontWeight: 900,
                                letterSpacing: '1px',
                            }}>{project.status.toUpperCase()}</div>
                        )}
                    </div>
                    {/* Close */}
                    <button
                        onClick={onClose}
                        style={{
                            flexShrink: 0, width: 44, height: 44,
                            background: 'var(--pink)', border: '4px solid var(--border)',
                            boxShadow: '4px 4px 0 var(--border)', cursor: 'pointer',
                            fontSize: '1.1rem', color: 'var(--pink-content)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'; }}
                    >
                        <i className="fas fa-times" />
                    </button>
                </div>

                {/* ── Tab Bar ── */}
                {tabs.length > 1 && (
                    <div style={{
                        display: 'flex', borderBottom: '4px solid var(--border)',
                        background: 'var(--bg-cell, #ebedf0)', flexShrink: 0,
                    }}>
                        {tabs.map((tab, idx) => (
                            <button
                                key={tab.id}
                                className={`proj-modal-tab${activeTab === tab.id ? ' active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flex: 1, padding: '1rem',
                                    border: 'none',
                                    borderRight: idx < tabs.length - 1 ? '4px solid var(--border)' : 'none',
                                    background: activeTab === tab.id ? 'var(--yellow)' : 'var(--white)',
                                    cursor: 'pointer', fontFamily: 'Space Mono, monospace',
                                    fontWeight: 900, fontSize: '0.85rem', letterSpacing: '1px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                    boxShadow: activeTab === tab.id ? '0 0 0 var(--border)' : '4px 4px 0 var(--border)',
                                    transform: activeTab === tab.id ? 'translate(3px, 3px)' : '',
                                    transition: 'all 0.1s',
                                }}
                            >
                                <i className={tab.icon} /> {tab.label.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Tab Content ── */}
                <div
                    ref={scrollRef}
                    className="proj-modal-scroll"
                    style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}
                >
                    {activeTab === 'details' && <DetailsTab project={project} />}
                    {activeTab === 'github' && project.githubAnalysis && (
                        <GitHubAnalysisTab githubUrl={project.githubUrl} />
                    )}
                </div>
            </div>
        </div>
    );
}
