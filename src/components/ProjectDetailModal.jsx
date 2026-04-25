import React, { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const GITHUB_CACHE = {};

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
@keyframes projectModalMobileIn {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
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

/* Tree Animation Styles */
.tree-folder-group {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}
.tree-folder-group.expanded {
    grid-template-rows: 1fr;
}
.tree-folder-inner {
    min-height: 0;
}
@media (max-width: 768px) {
    .proj-modal-header {
        padding: 1rem !important;
        gap: 0.75rem !important;
    }
    .proj-modal-title {
        font-size: 1.15rem !important;
    }
}
@media (min-width: 641px) and (max-width: 1024px) {
    .proj-modal-container {
        width: 92% !important;
        max-width: none !important;
        max-height: 90vh !important;
    }
}
`;


function parseOwnerRepo(githubUrl) {
    try {
        const parts = githubUrl.replace(/\/$/, '').split('/');
        return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
    } catch {
        return { owner: '', repo: '' };
    }
}

function GhFetch({ url, children }) {
    const [state, setState] = useState(() => {
        if (GITHUB_CACHE[url]) return { data: GITHUB_CACHE[url], loading: false, error: null };
        return { data: null, loading: true, error: null };
    });
    const [prevUrl, setPrevUrl] = useState(url);

    if (url !== prevUrl) {
        setPrevUrl(url);
        if (GITHUB_CACHE[url]) {
            setState({ data: GITHUB_CACHE[url], loading: false, error: null });
        } else {
            setState({ data: null, loading: true, error: null });
        }
    }

    useEffect(() => {
        if (GITHUB_CACHE[url]) return;

        const headers = {
            'Accept': 'application/vnd.github+json',
            ...(TOKEN ? { Authorization: `token ${TOKEN}` } : {}),
        };
        fetch(url, { headers })
            .then(r => {
                if (!r.ok) throw new Error(`GitHub API error ${r.status}`);
                return r.json();
            })
            .then(d => { 
                GITHUB_CACHE[url] = d;
                setState({ data: d, loading: false, error: null }); 
            })
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

function SyntaxHighlighter({ code, theme = 'dark' }) {
    const tokens = useMemo(() => {
        const rules = theme === 'dark' ? [
            { type: 'comment', regex: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, color: '#6a9955' },
            { type: 'string', regex: /(".*?"|'.*?'|`[\s\S]*?`)/g, color: '#ce9178' },
            { type: 'keyword', regex: /\b(const|let|var|function|return|if|else|import|export|from|class|extends|try|catch|finally|while|for|switch|case|default|break|continue|yield|await|async|typeof|instanceof|new|this|super|throw|in|of|void|delete)\b/g, color: '#569cd6' },
            { type: 'boolean', regex: /\b(true|false|null|undefined)\b/g, color: '#569cd6' },
            { type: 'number', regex: /\b(\d+)\b/g, color: '#b5cea8' },
            { type: 'function', regex: /\b([a-zA-Z_]\w*)(?=\s*\()/g, color: '#dcdcaa' },
            { type: 'tag', regex: /(<[a-zA-Z1-6]+|(?<=<\/)[a-zA-Z1-6]+|(?<=[<])\/?[a-zA-Z1-6]+|(?<=[ />])[a-zA-Z-]+(?==)|(?<==)".*?")/g, color: '#569cd6' }
        ] : [
            { type: 'comment', regex: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, color: '#008000' },
            { type: 'string', regex: /(".*?"|'.*?'|`[\s\S]*?`)/g, color: '#a31515' },
            { type: 'keyword', regex: /\b(const|let|var|function|return|if|else|import|export|from|class|extends|try|catch|finally|while|for|switch|case|default|break|continue|yield|await|async|typeof|instanceof|new|this|super|throw|in|of|void|delete)\b/g, color: '#0000ff' },
            { type: 'boolean', regex: /\b(true|false|null|undefined)\b/g, color: '#0000ff' },
            { type: 'number', regex: /\b(\d+)\b/g, color: '#098658' },
            { type: 'function', regex: /\b([a-zA-Z_]\w*)(?=\s*\()/g, color: '#795e26' },
            { type: 'tag', regex: /(<[a-zA-Z1-6]+|(?<=<\/)[a-zA-Z1-6]+|(?<=[<])\/?[a-zA-Z1-6]+|(?<=[ />])[a-zA-Z-]+(?==)|(?<==)".*?")/g, color: '#800000' }
        ];

        const lines = code.split('\n');
        return lines.map(line => {
            let lineTokens = [{ type: 'text', content: line }];
            rules.forEach(rule => {
                let nextTokens = [];
                lineTokens.forEach(token => {
                    if (token.type !== 'text') {
                        nextTokens.push(token);
                        return;
                    }
                    let lastIdx = 0;
                    let match;
                    rule.regex.lastIndex = 0;
                    while ((match = rule.regex.exec(token.content)) !== null) {
                        if (match.index > lastIdx) {
                            nextTokens.push({ type: 'text', content: token.content.substring(lastIdx, match.index) });
                        }
                        nextTokens.push({ type: rule.type, content: match[0], color: rule.color });
                        lastIdx = rule.regex.lastIndex;
                    }
                    if (lastIdx < token.content.length) {
                        nextTokens.push({ type: 'text', content: token.content.substring(lastIdx) });
                    }
                });
                lineTokens = nextTokens;
            });
            return lineTokens;
        });
    }, [code, theme]);

    return (
        <pre style={{ 
            margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            color: theme === 'dark' ? '#d4d4d4' : 'var(--text)' 
        }}>
            {tokens.map((line, i) => (
                <div key={i} style={{ display: 'flex', minHeight: '1.2rem' }}>
                    <span style={{ 
                        width: '3rem', opacity: 0.3, userSelect: 'none', 
                        textAlign: 'right', marginRight: '1rem', flexShrink: 0, 
                        fontSize: '0.75rem', color: 'inherit'
                    }}>{i + 1}</span>
                    <span style={{ flex: 1 }}>
                        {line.map((token, j) => (
                            <span key={j} style={{ color: token.color || 'inherit' }}>{token.content}</span>
                        ))}
                        {line.length === 1 && line[0].content === '' && ' '}
                    </span>
                </div>
            ))}
        </pre>
    );
}

function MarkdownPreview({ content }) {
    const renderedLines = useMemo(() => {
        const lines = content.split('\n');
        const results = [];
        let inCodeBlock = false;
        let codeBlockContent = [];

        lines.forEach((line, i) => {
            if (line.trim().startsWith('```')) {
                if (inCodeBlock) {
                    results.push(
                        <div key={`code-${i}`} style={{ background: 'var(--bg-cell, #ebedf0)', padding: '1rem', border: '3px solid var(--border)', boxShadow: '4px 4px 0 var(--border)', margin: '1rem 0' }}>
                            <SyntaxHighlighter code={codeBlockContent.join('\n')} language="text" theme="light" />
                        </div>
                    );
                    inCodeBlock = false;
                    codeBlockContent = [];
                } else {
                    inCodeBlock = true;
                }
                return;
            }

            if (inCodeBlock) {
                codeBlockContent.push(line);
                return;
            }

            // Headers
            if (line.startsWith('# ')) {
                results.push(<h1 key={i} style={{ borderBottom: '4px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 950 }}>{line.slice(2)}</h1>);
            } else if (line.startsWith('## ')) {
                results.push(<h2 key={i} style={{ borderBottom: '3px solid var(--border)', paddingBottom: '0.3rem', marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 900 }}>{line.slice(3)}</h2>);
            } else if (line.startsWith('### ')) {
                results.push(<h3 key={i} style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 900 }}>{line.slice(4)}</h3>);
            }
            // Lists
            else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                results.push(
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 950 }}>•</span>
                        <span style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{parseInline(line.trim().slice(2))}</span>
                    </div>
                );
            }
            // Paragraph
            else if (line.trim() === '') {
                results.push(<div key={i} style={{ height: '0.75rem' }} />);
            } else {
                results.push(<p key={i} style={{ fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '0.75rem', opacity: 0.9 }}>{parseInline(line)}</p>);
            }
        });
        return results;
    }, [content]);

    function parseInline(text) {
        // ... (rest same, maybe memoize if needed but let's keep it simple first)
        const parts = [];
        const boldRegex = /\*\*(.*?)\*\*/g;
        let lastIdx = 0;
        let match;
        while ((match = boldRegex.exec(text)) !== null) {
            if (match.index > lastIdx) parts.push(text.substring(lastIdx, match.index));
            parts.push(<strong key={match.index} style={{ fontWeight: 950, color: 'var(--primary)' }}>{match[1]}</strong>);
            lastIdx = boldRegex.lastIndex;
        }
        if (lastIdx < text.length) parts.push(text.substring(lastIdx));
        if (parts.length === 0) return text;
        return parts;
    }

    return (
        <div style={{ padding: '1.5rem', fontFamily: 'Space Mono, monospace', color: 'var(--text)' }}>
            {renderedLines}
        </div>
    );
}

function FileContentModal({ owner, repo, path, onClose, isMobile }) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const [viewMode, setViewMode] = useState(path.endsWith('.md') ? 'preview' : 'code');

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 110000,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: isMobile ? '0' : '2rem',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%', maxWidth: 900,
                    maxHeight: isMobile ? '100vh' : '90vh',
                    height: isMobile ? '100vh' : 'auto',
                    background: 'var(--white)',
                    border: isMobile ? 'none' : '4px solid var(--border)',
                    boxShadow: isMobile ? 'none' : '12px 12px 0 var(--border)',
                    display: 'flex', flexDirection: 'column',
                    animation: 'projectModalIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                    overflow: 'hidden',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    padding: '1rem 1.25rem', background: 'var(--yellow)',
                    borderBottom: '4px solid var(--border)', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                        <div style={{ width: 40, height: 40, background: 'var(--white)', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className={path.endsWith('.md') ? "fas fa-file-lines" : "fas fa-file-code"} style={{ fontSize: '1.2rem' }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', fontWeight: 900, opacity: 0.6, letterSpacing: '1px' }}>FILE VIEW</div>
                            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 950, fontSize: '0.95rem', wordBreak: 'break-all', lineHeight: 1 }}>{path.split('/').pop()}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {path.endsWith('.md') && (
                            <div style={{ display: 'flex', background: 'var(--white)', border: '3px solid var(--border)', boxShadow: '3px 3px 0 var(--border)', padding: '2px', marginRight: '0.5rem' }}>
                                <button
                                    onClick={() => setViewMode('preview')}
                                    style={{
                                        padding: '4px 12px', border: 'none', background: viewMode === 'preview' ? 'var(--accent)' : 'transparent',
                                        fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer',
                                    }}
                                >PREVIEW</button>
                                <button
                                    onClick={() => setViewMode('code')}
                                    style={{
                                        padding: '4px 12px', border: 'none', background: viewMode === 'code' ? 'var(--accent)' : 'transparent',
                                        fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer',
                                    }}
                                >CODE</button>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--pink)', border: '3px solid var(--border)',
                                boxShadow: '4px 4px 0 var(--border)', width: 40, height: 40,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '1.2rem', transition: 'all 0.1s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'; }}
                        >
                            <i className="fas fa-times" />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '0.5rem 1.25rem', background: 'var(--bg-cell, #ebedf0)', borderBottom: '4px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.68rem', opacity: 0.7, fontWeight: 900, wordBreak: 'break-all' }}>GITHUB:{owner}/{repo}/{path}</div>
                    <div id="copy-status" style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)', opacity: 0, transition: 'opacity 0.3s' }}>COPIED TO CLIPBOARD!</div>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <GhFetch url={url}>
                        {({ data, loading, error }) => (
                            loading ? <Spinner /> :
                                error ? <ErrorBox message={error} /> : dAtA_rEnDeReR(data)
                        )}
                    </GhFetch>
                </div>
            </div>
        </div>
    );

    function dAtA_rEnDeReR(data) {
        if (!data || !data.content) return <ErrorBox message="Empty file or cannot read content." />;

        let decodedContent = "";
        try {
            decodedContent = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        } catch {
            try {
                decodedContent = atob(data.content.replace(/\s/g, ''));
            } catch {
                decodedContent = "Could not decode content.";
            }
        }

        return (
            <>
                <div style={{
                    flex: 1, overflow: 'auto',
                    background: viewMode === 'code' ? '#1e1e1e' : 'var(--white)',
                    color: viewMode === 'code' ? '#d4d4d4' : 'var(--text)',
                    fontFamily: 'Space Mono, monospace',
                }} className="proj-modal-scroll">
                    {viewMode === 'preview' ? (
                        <MarkdownPreview content={decodedContent} />
                    ) : (
                        <div style={{ padding: '1.25rem 0' }}>
                            <SyntaxHighlighter code={decodedContent} />
                        </div>
                    )}
                </div>

                <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-cell, #ebedf0)', borderTop: '4px solid var(--border)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(decodedContent);
                            const el = document.getElementById('copy-status');
                            if (el) {
                                el.style.opacity = '1';
                                setTimeout(() => el.style.opacity = '0', 2500);
                            }
                        }}
                        style={{
                            background: 'var(--yellow)', border: '4px solid var(--border)',
                            boxShadow: '4px 4px 0 var(--border)', padding: '0.65rem 1.5rem',
                            fontFamily: 'Space Mono, monospace', fontSize: '0.85rem', fontWeight: 950,
                            cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.75rem',
                            transition: 'all 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(3px, 3px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'; }}
                    >
                        <i className="fas fa-copy" /> COPY SOURCE CODE
                    </button>
                </div>
            </>
        );
    }
}

function buildTreeStructure(items) {
    const root = { name: 'root', type: 'tree', children: {}, path: '' };
    items.forEach(item => {
        const parts = item.path.split('/');
        let current = root;
        parts.forEach((part, index) => {
            if (!current.children[part]) {
                current.children[part] = {
                    name: part,
                    path: parts.slice(0, index + 1).join('/'),
                    type: index === parts.length - 1 ? item.type : 'tree',
                    children: {}
                };
            }
            current = current.children[part];
        });
    });
    return root;
}

const TreeNode = memo(({ node, depth, expandedPaths, togglePath, onFileClick, selectedFile }) => {
    const isDir = node.type === 'tree';
    const isExpanded = expandedPaths.has(node.path);
    const childrenEntries = Object.values(node.children).sort((a, b) => {
        if (a.type === 'tree' && b.type !== 'tree') return -1;
        if (a.type !== 'tree' && b.type === 'tree') return 1;
        return a.name.localeCompare(b.name);
    });

    if (node.name === 'root') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {childrenEntries.map(child => (
                    <TreeNode
                        key={child.path} node={child} depth={0}
                        expandedPaths={expandedPaths} togglePath={togglePath}
                        onFileClick={onFileClick} selectedFile={selectedFile}
                    />
                ))}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
                className="proj-tree-item"
                onClick={() => isDir ? togglePath(node.path) : onFileClick(node.path)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    paddingLeft: `${depth * 1.25 + 0.5}rem`, paddingTop: '0.4rem', paddingBottom: '0.4rem', paddingRight: '0.5rem',
                    fontFamily: 'Space Mono, monospace', fontSize: '0.78rem',
                    transition: 'all 0.15s', cursor: 'pointer',
                    background: !isDir && selectedFile === node.path ? 'var(--cyan)' : 'transparent',
                    borderLeft: depth > 0 ? '1px solid var(--bg-cell, #ebedf0)' : 'none',
                }}
            >
                <i className={`fas ${isDir ? (isExpanded ? 'fa-folder-open text-yellow' : 'fa-folder') : 'fa-file-code'}`}
                    style={{
                        fontSize: '0.85rem',
                        color: isDir ? 'var(--yellow)' : 'var(--primary)',
                        flexShrink: 0, width: 16, textAlign: 'center',
                        transition: 'transform 0.2s'
                    }}
                />
                <span style={{ fontWeight: isDir ? 900 : 400, wordBreak: 'break-all', opacity: isDir ? 1 : 0.85 }}>{node.name}</span>
            </div>

            {isDir && childrenEntries.length > 0 && (
                <div className={`tree-folder-group${isExpanded ? ' expanded' : ''}`}>
                    <div className="tree-folder-inner">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {childrenEntries.map(child => (
                                <TreeNode
                                    key={child.path} node={child} depth={depth + 1}
                                    expandedPaths={expandedPaths} togglePath={togglePath}
                                    onFileClick={onFileClick} selectedFile={selectedFile}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if:
    // 1. This node's expansion state changed
    // 2. This node is a file and its selection state changed
    // 3. The node object itself changed (rare)
    const wasExpanded = prevProps.expandedPaths.has(prevProps.node.path);
    const isNowExpanded = nextProps.expandedPaths.has(nextProps.node.path);
    
    if (wasExpanded !== isNowExpanded) return false;
    
    if (prevProps.node.type !== 'tree') {
        const wasSelected = prevProps.selectedFile === prevProps.node.path;
        const isNowSelected = nextProps.selectedFile === nextProps.node.path;
        if (wasSelected !== isNowSelected) return false;
    }
    
    // Always re-render root to be safe, or if node object changed
    if (prevProps.node.name === 'root' || prevProps.node !== nextProps.node) return false;

    return true; // Use memoized version
});

function ErrorBox({ message }) {
    return (
        <div style={{ background: 'var(--pink)', border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', padding: '1.5rem', textAlign: 'center', margin: '1rem 0' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.8rem', marginBottom: '0.75rem', display: 'block' }} />
            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 800, fontSize: '0.85rem' }}>{message}</div>
        </div>
    );
}


function ImageGallery({ images, isMobile }) {
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
                height: isMobile ? 180 : 260, background: 'var(--bg-cell, #ebedf0)',
                border: '4px solid var(--border)', boxShadow: isMobile ? '4px 4px 0 var(--border)' : '8px 8px 0 var(--border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '1rem', opacity: 0.55, marginBottom: '1.5rem',
            }}>
                <i className="fas fa-image" style={{ fontSize: isMobile ? '2rem' : '3rem' }} />
                <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px' }}>
                    NO SCREENSHOTS
                </div>
            </div>
        );
    }

    const actualImages = (images || []);

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div
                style={{
                    position: 'relative', height: isMobile ? 220 : 360, overflow: 'hidden',
                    border: '4px solid var(--border)', boxShadow: isMobile ? '4px 4px 0 var(--border)' : '8px 8px 0 var(--border)',
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

            {lightbox && !imgErrors[active] && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200000,
                        background: 'rgba(0,0,0,0.98)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={() => setLightbox(false)}
                >
                    <div style={{
                        width: isMobile ? '92vw' : '74vw',
                        height: isMobile ? 'auto' : '84vh',
                        maxHeight: isMobile ? '80vh' : 'unset',
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
                                boxShadow: '0 0 80px rgba(0,0,0,0.9)',
                            }}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>

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
                                        position: 'fixed', left: isMobile ? 15 : 40, top: '50%', transform: 'translateY(-50%)',
                                        width: isMobile ? 44 : 58, height: isMobile ? 44 : 58, background: 'var(--yellow)', border: '4px solid var(--border)',
                                        boxShadow: isMobile ? '3px 3px 0 var(--border)' : '5px 5px 0 var(--border)', cursor: 'pointer', fontSize: isMobile ? '1.1rem' : '1.5rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        pointerEvents: 'auto', zIndex: 20,
                                    }}
                                ><i className="fas fa-chevron-left" /></button>
                                <button
                                    onClick={e => { e.stopPropagation(); setActive(p => (p + 1) % actualImages.length); }}
                                    style={{
                                        position: 'fixed', right: isMobile ? 15 : 40, top: '50%', transform: 'translateY(-50%)',
                                        width: isMobile ? 44 : 58, height: isMobile ? 44 : 58, background: 'var(--yellow)', border: '4px solid var(--border)',
                                        boxShadow: isMobile ? '3px 3px 0 var(--border)' : '5px 5px 0 var(--border)', cursor: 'pointer', fontSize: isMobile ? '1.1rem' : '1.5rem',
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

function CommitsSection({ baseUrl, owner, repo, isMobile }) {
    const [expanded, setExpanded] = useState(false);
    const [page, setPage] = useState(1);
    const [allCommits, setAllCommits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [prevBaseUrl, setPrevBaseUrl] = useState(baseUrl);
    const PER_PAGE = 50;

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
                                {avatarUrl
                                    ? <img src={avatarUrl} alt={ghLogin} style={{ width: 32, height: 32, border: '3px solid var(--border)', flexShrink: 0, marginTop: 2 }} />
                                    : <div style={{ width: 32, height: 32, background: 'var(--bg-cell,#ebedf0)', border: '3px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                                        <i className="fas fa-user" style={{ fontSize: '0.75rem', opacity: 0.5 }} />
                                    </div>
                                }

                                <div style={{ flex: 1, minWidth: 0, paddingBottom: '0.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                        <a
                                            href={commitUrl} target="_blank" rel="noopener noreferrer"
                                            style={{
                                                fontFamily: 'monospace', fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 900,
                                                background: 'var(--border)', color: '#fff',
                                                padding: '1px 8px', textDecoration: 'none',
                                                letterSpacing: '1px', flexShrink: 0,
                                            }}
                                        >{sha}</a>
                                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', opacity: 0.5 }}>
                                            {ghLogin ? `@${ghLogin}` : authorName}
                                        </span>
                                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', opacity: 0.45, marginLeft: isMobile ? '0' : 'auto', width: isMobile ? '100%' : 'auto' }}>
                                            {date}
                                        </span>
                                    </div>
                                    <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 800, fontSize: isMobile ? '0.8rem' : '0.85rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
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

function GitHubAnalysisTab({ githubUrl, isMobile }) {
    const { owner, repo } = parseOwnerRepo(githubUrl);
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const [treeExpanded, setTreeExpanded] = useState(false);
    const [expandedPaths, setExpandedPaths] = useState(new Set());
    const [selectedFile, setSelectedFile] = useState(null);
    const [treeData, setTreeData] = useState(null);

    const togglePath = (path) => {
        setExpandedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    };

    if (!owner || !repo) {
        return <ErrorBox message="Could not parse GitHub URL." />;
    }

    return (
        <GhFetch url={baseUrl}>
            {({ data: repoData, loading: repoLoading, error: repoError }) => (
                repoLoading ? <Spinner /> :
                    repoError ? <ErrorBox message={repoError} /> :
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {selectedFile && (
                                <FileContentModal
                                    owner={owner} repo={repo} path={selectedFile}
                                    onClose={() => setSelectedFile(null)}
                                    isMobile={isMobile}
                                />
                            )}
                            {/* Pre-fetch tree to use for health check fallback */}
                            <GhFetch url={`${baseUrl}/git/trees/HEAD?recursive=1`}>
                                {({ data }) => {
                                    if (data && !treeData) setTreeData(data);
                                    return null;
                                }}
                            </GhFetch>

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
                                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.5rem' }}>
                                                {[
                                                    { key: 'readme', label: 'README', icon: 'fas fa-book' },
                                                    { key: 'code_of_conduct', label: 'Code of Conduct', icon: 'fas fa-handshake' },
                                                    { key: 'contributing', label: 'Contributing Guide', icon: 'fas fa-users' },
                                                    { key: 'license', label: 'License', icon: 'fas fa-scale-balanced' },
                                                    { key: 'issue_template', label: 'Issue Templates', icon: 'fas fa-circle-exclamation' },
                                                    { key: 'pull_request_template', label: 'PR Template', icon: 'fas fa-code-pull-request' },
                                                ].map(({ key, label, icon }) => {
                                                    let present = !!(community.files?.[key] || community[key]);

                                                    // Fallback check for multiple templates in the tree data if we have it
                                                    if (!present && key === 'issue_template' && treeData?.tree) {
                                                        present = treeData.tree.some(item => item.path.includes('.github/ISSUE_TEMPLATE/'));
                                                    }

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

                            <GhFetch url={`${baseUrl}/git/trees/HEAD?recursive=1`}>
                                {({ data: tree, loading, error }) => {
                                    if (loading) return <Spinner />;
                                    if (error) return <ErrorBox message="Could not fetch repository tree." />;
                                    if (!tree?.tree) return null;

                                    const filteredItems = tree.tree.filter(item =>
                                        item.path &&
                                        !item.path.includes('node_modules') &&
                                        !item.path.includes('.git/') &&
                                        !item.path.startsWith('.git')
                                    );

                                    const treeRoot = buildTreeStructure(filteredItems);

                                    return (
                                        <div style={{ border: '4px solid var(--border)', boxShadow: '8px 8px 0 var(--border)', background: 'var(--white)' }}>
                                            <div style={{ padding: '1rem 1.25rem', borderBottom: '4px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-cell, #ebedf0)' }}>
                                                <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7 }}>REPOSITORY FILE TREE</div>
                                                <button
                                                    onClick={() => {
                                                        if (treeExpanded) {
                                                            setTreeExpanded(false);
                                                            setExpandedPaths(new Set());
                                                        } else {
                                                            const allFolders = new Set();
                                                            const walk = (node) => {
                                                                if (node.type === 'tree' && node.path) allFolders.add(node.path);
                                                                Object.values(node.children).forEach(walk);
                                                            };
                                                            walk(treeRoot);
                                                            setExpandedPaths(allFolders);
                                                            setTreeExpanded(true);
                                                        }
                                                    }}
                                                    style={{ background: 'var(--yellow)', border: '3px solid var(--border)', boxShadow: '3px 3px 0 var(--border)', padding: '3px 12px', fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                                                >
                                                    {treeExpanded ? 'COLLAPSE' : 'EXPAND ALL'}
                                                </button>
                                            </div>
                                            <div style={{ maxHeight: 500, overflowY: 'auto', position: 'relative' }} className="proj-modal-scroll">
                                                <div style={{ padding: '0.75rem 0.5rem' }}>
                                                    <TreeNode
                                                        node={treeRoot} depth={0}
                                                        expandedPaths={expandedPaths} togglePath={togglePath}
                                                        onFileClick={(p) => setSelectedFile(p)} selectedFile={selectedFile}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            </GhFetch>

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

                            <CommitsSection baseUrl={baseUrl} owner={owner} repo={repo} isMobile={isMobile} />

                            <div style={{ background: 'var(--yellow)', border: '4px solid var(--border)', boxShadow: isMobile ? '4px 4px 0 var(--border)' : '8px 8px 0 var(--border)', padding: isMobile ? '1rem' : '1.25rem' }}>
                                <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.6, marginBottom: '0.75rem' }}>REPOSITORY STATS</div>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                                    {[
                                        { icon: 'fas fa-star', label: 'Stars', val: repoData.stargazers_count ?? 0 },
                                        { icon: 'fas fa-code-fork', label: 'Forks', val: repoData.forks_count ?? 0 },
                                        { icon: 'fas fa-eye', label: 'Watchers', val: repoData.watchers_count ?? 0 },
                                        { icon: 'fas fa-circle-dot', label: 'Issues', val: repoData.open_issues_count ?? 0 },
                                    ].map(({ icon, label, val }) => (
                                        <div key={label} style={{
                                            background: 'var(--white)', border: '3px solid var(--border)',
                                            boxShadow: isMobile ? '3px 3px 0 var(--border)' : '4px 4px 0 var(--border)', padding: '0.75rem', textAlign: 'center',
                                        }}>
                                            <i className={icon} style={{ fontSize: isMobile ? '1rem' : '1.25rem', display: 'block', marginBottom: '0.4rem' }} />
                                            <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: isMobile ? '0.9rem' : '1.1rem' }}>{val.toLocaleString()}</div>
                                            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.6rem', opacity: 0.6, letterSpacing: '1px' }}>{label.toUpperCase()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

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

function DetailsTab({ project, isMobile }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ImageGallery images={project.images} isMobile={isMobile} />

            {project.longDescription && (
                <div style={{ border: '4px solid var(--border)', boxShadow: isMobile ? '4px 4px 0 var(--border)' : '8px 8px 0 var(--border)', padding: isMobile ? '1rem' : '1.25rem', background: 'var(--white)' }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '1px', opacity: 0.6, marginBottom: '0.75rem' }}>ABOUT THIS PROJECT</div>
                    {project.longDescription.split('\n\n').map((para, i) => (
                        <p key={i} style={{ fontFamily: 'Space Mono, monospace', fontSize: isMobile ? '0.8rem' : '0.88rem', lineHeight: 1.8, opacity: 0.85, marginBottom: '0.75rem' }}>{para}</p>
                    ))}
                </div>
            )}

            {project.highlights?.length > 0 && (
                <div style={{ border: '4px solid var(--border)', boxShadow: isMobile ? '4px 4px 0 var(--border)' : '8px 8px 0 var(--border)', padding: isMobile ? '1rem' : '1.25rem', background: 'var(--white)' }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '1px', opacity: 0.6, marginBottom: '0.75rem' }}>KEY HIGHLIGHTS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {project.highlights.map((h, i) => (
                            <div
                                key={i}
                                className="proj-highlight-item"
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                    padding: isMobile ? '0.5rem' : '0.6rem 0.75rem', border: '3px solid var(--border)',
                                    boxShadow: isMobile ? '3px 3px 0 var(--border)' : '4px 4px 0 var(--border)', background: 'var(--white)',
                                    fontFamily: 'Space Mono, monospace', fontSize: isMobile ? '0.75rem' : '0.82rem', lineHeight: 1.5,
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

            {project.techStack?.length > 0 && (
                <div style={{ border: '4px solid var(--border)', boxShadow: isMobile ? '4px 4px 0 var(--border)' : '8px 8px 0 var(--border)', padding: isMobile ? '1rem' : '1.25rem', background: 'var(--white)' }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '1px', opacity: 0.6, marginBottom: '0.75rem' }}>TECH STACK</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {project.techStack.map((t, i) => (
                            <div
                                key={i}
                                className="proj-tech-pill"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                    padding: isMobile ? '0.4rem 0.7rem' : '0.5rem 0.9rem', border: '3px solid var(--border)',
                                    boxShadow: isMobile ? '3px 3px 0 var(--border)' : '4px 4px 0 var(--border)', background: 'var(--white)',
                                    fontFamily: 'Space Mono, monospace', fontWeight: 800, fontSize: isMobile ? '0.7rem' : '0.8rem',
                                    transition: 'all 0.15s', cursor: 'default',
                                }}
                            >
                                <i className={t.icon} style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }} /> {t.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: isMobile ? '0.75rem' : '1rem', flexWrap: 'wrap', paddingBottom: '0.5rem' }}>
                {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer"
                        className="proj-action-btn"
                        style={{
                            flex: isMobile ? 1 : 'unset',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                            padding: isMobile ? '0.75rem 1rem' : '0.85rem 1.75rem', background: 'var(--yellow)',
                            border: '3px solid var(--border)', boxShadow: isMobile ? '4px 4px 0 var(--border)' : '5px 5px 0 var(--border)',
                            textDecoration: 'none', color: 'var(--yellow-content)', fontWeight: 900,
                            fontSize: isMobile ? '0.85rem' : '0.95rem', transition: 'all 0.15s', fontFamily: 'Space Mono, monospace',
                        }}
                    >
                        <i className="fas fa-external-link-alt" /> {isMobile ? 'SITE' : 'VISIT SITE'}
                    </a>
                )}
                {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="proj-action-btn"
                        style={{
                            flex: isMobile ? 1 : 'unset',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                            padding: isMobile ? '0.75rem 1rem' : '0.85rem 1.75rem', background: 'var(--white)',
                            border: '3px solid var(--border)', boxShadow: isMobile ? '4px 4px 0 var(--border)' : '5px 5px 0 var(--border)',
                            textDecoration: 'none', color: 'var(--text)', fontWeight: 900,
                            fontSize: isMobile ? '0.85rem' : '0.95rem', transition: 'all 0.15s', fontFamily: 'Space Mono, monospace',
                        }}
                    >
                        <i className="fab fa-github" /> {isMobile ? 'CODE' : 'VIEW CODE'}
                    </a>
                )}
            </div>
        </div>
    );
}


export default function ProjectDetailModal({ project, onClose }) {
    const [activeTab, setActiveTab] = useState('details');
    const scrollRef = useRef(null);
    const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize, { passive: true });
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const isMobile = windowWidth < 768;

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [onClose]);

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
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
                padding: isMobile ? '0' : '1rem', animation: 'overlayFadeIn 0.2s ease',
            }}
            onClick={onClose}
        >
            <style>{MODAL_STYLES}</style>
            <div
                className="proj-modal-container"
                style={{
                    width: '100%', maxWidth: 860,
                    maxHeight: isMobile ? '94vh' : '92vh',
                    height: isMobile ? '94vh' : 'auto',
                    background: 'var(--white)',
                    border: isMobile ? 'none' : '4px solid var(--border)',
                    borderTop: isMobile ? '6px solid var(--border)' : '4px solid var(--border)',
                    boxShadow: isMobile ? 'none' : '16px 16px 0 var(--border)',
                    display: 'flex', flexDirection: 'column',
                    animation: isMobile
                        ? 'projectModalMobileIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards'
                        : 'projectModalIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                    overflow: 'hidden',
                    borderRadius: isMobile ? '20px 20px 0 0' : 0,
                }}
                onClick={e => e.stopPropagation()}
            >
                <div 
                    className="proj-modal-header"
                    style={{
                        background: 'var(--secondary)',
                        borderBottom: '4px solid var(--border)',
                        padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
                        display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.25rem',
                        flexShrink: 0,
                        position: 'relative'
                    }}
                >
                    <div style={{
                        width: isMobile ? 44 : 52, height: isMobile ? 44 : 52, flexShrink: 0,
                        background: project.logoBg ? 'var(--yellow)' : 'transparent',
                        border: project.logoBg ? '3px solid var(--border)' : 'none',
                        boxShadow: project.logoBg && !isMobile ? '3px 3px 0 var(--border)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isMobile ? '1.5rem' : '1.8rem',
                    }}>
                        {project.logo && project.logo.startsWith('/')
                            ? <img src={project.logo} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: project.logoBg ? (isMobile ? 4 : 6) : 0 }} />
                            : (project.logo || '🔥')
                        }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '1.5px', opacity: 0.6, textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                            {project.label}
                        </div>
                        <div 
                            className="proj-modal-title"
                            style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 950, letterSpacing: '-0.5px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {project.name}
                        </div>
                    </div>

                    {!isMobile && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0, marginRight: '0.5rem' }}>
                            {project.year && (
                                <div style={{
                                    background: 'var(--secondary)', border: '2px solid var(--border)',
                                    boxShadow: '2px 2px 0 var(--border)',
                                    padding: '1px 8px',
                                    fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', fontWeight: 900,
                                }}>{project.year}</div>
                            )}
                            {project.status && (
                                <div style={{
                                    background: 'var(--accent)', border: '2px solid var(--border)',
                                    boxShadow: '2px 2px 0 var(--border)',
                                    padding: '1px 8px',
                                    fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', fontWeight: 900,
                                }}>{project.status.toUpperCase()}</div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        style={{
                            flexShrink: 0, width: isMobile ? 38 : 44, height: isMobile ? 38 : 44,
                            background: 'var(--pink)', border: '3px solid var(--border)',
                            boxShadow: isMobile ? '3px 3px 0 var(--border)' : '4px 4px 0 var(--border)',
                            cursor: 'pointer',
                            fontSize: isMobile ? '1rem' : '1.1rem', color: 'var(--pink-content)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isMobile ? '3px 3px 0 var(--border)' : '4px 4px 0 var(--border)'; }}
                    >
                        <i className="fas fa-times" />
                    </button>
                </div>

                {tabs.length > 1 && (
                    <div style={{
                        display: 'flex', borderBottom: '4px solid var(--border)',
                        background: 'var(--bg-cell, #ebedf0)', flexShrink: 0,
                        overflowX: 'auto',
                        scrollbarWidth: 'none'
                    }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`proj-modal-tab${activeTab === tab.id ? ' active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flex: isMobile ? 'none' : 1,
                                    minWidth: isMobile ? '140px' : 'unset',
                                    padding: isMobile ? '0.85rem 1rem' : '1rem',
                                    border: 'none',
                                    borderRight: '4px solid var(--border)',
                                    background: activeTab === tab.id ? 'var(--yellow)' : 'var(--white)',
                                    cursor: 'pointer', fontFamily: 'Space Mono, monospace',
                                    fontWeight: 900, fontSize: isMobile ? '0.75rem' : '0.85rem', letterSpacing: '1px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                    boxShadow: 'none',
                                    transform: 'none',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <i className={tab.icon} /> {isMobile ? tab.label.split(' ')[0].toUpperCase() : tab.label.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                <div
                    ref={scrollRef}
                    className="proj-modal-scroll"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: isMobile ? '1.25rem' : '2rem',
                        background: 'var(--white)'
                    }}
                >
                    {activeTab === 'details' && <DetailsTab project={project} isMobile={isMobile} />}
                    {activeTab === 'github' && project.githubAnalysis && (
                        <GitHubAnalysisTab githubUrl={project.githubUrl} isMobile={isMobile} />
                    )}
                </div>
            </div>
        </div>
    );
}
