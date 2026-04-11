import { useState, useEffect } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import data from '../data/portfolio.json';
import ProjectDetailModal from './ProjectDetailModal';

export default function ProjectsSection() {
    const fadeRef = useFadeIn();
    const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', onResize, { passive: true });
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;

    return (
        <>
            <section id="projects" style={{ 
                padding: isMobile ? '2.5rem 1rem' : isTablet ? '3rem 1.5rem' : '4rem 2rem', 
                marginBottom: isMobile ? '1.5rem' : '3rem',
                position: 'relative'
            }}>
                <div ref={fadeRef} className="section-fade">
                    <h2 style={{
                        fontSize: isMobile ? '1.5rem' : '2rem', 
                        fontWeight: 900, 
                        marginBottom: isMobile ? '1.25rem' : '1.5rem',
                        letterSpacing: '-0.5px', 
                        textTransform: 'uppercase',
                        display: 'inline-block', 
                        padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
                        background: 'var(--secondary)', 
                        border: 'var(--border-width) solid var(--border)',
                        boxShadow: isMobile ? '4px 4px 0 var(--border)' : 'var(--shadow-offset) var(--shadow-offset) 0 var(--border)'
                    }}>Projects</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                        gap: isMobile ? '1.5rem' : '2rem',
                    }}>
                        {data.projects.map((p, index) => (
                            <ProjectCard
                                key={index}
                                project={p}
                                onOpenModal={() => setSelectedProject(p)}
                                isMobile={isMobile}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {selectedProject && (
                <ProjectDetailModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </>
    );
}

function ProjectCard({ project: p, onOpenModal, isMobile }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            style={{
                background: 'var(--white)',
                border: 'var(--border-width) solid var(--border)',
                boxShadow: hovered ? '0 0 0 var(--border)' : (isMobile ? '6px 6px 0 var(--border)' : '8px 8px 0 var(--border)'),
                display: 'flex', flexDirection: 'column',
                gap: '1rem', height: '100%', boxSizing: 'border-box',
                transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: hovered ? 'translate(6px, 6px)' : '',
                overflow: 'hidden',
                position: 'relative',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {p.year && (
                <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'var(--secondary)', border: '2px solid var(--border)',
                    boxShadow: '3px 3px 0 var(--border)',
                    padding: '2px 8px',
                    fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', fontWeight: 900,
                    letterSpacing: '0.5px', zIndex: 1,
                }}>{p.year}</div>
            )}
            <div style={{
                padding: isMobile ? '1.25rem 1.25rem 0' : '1.5rem 1.5rem 0',
                display: 'flex', alignItems: 'flex-start', gap: isMobile ? '0.85rem' : '1.25rem',
            }}>
                <div style={{
                    width: isMobile ? 54 : 64, height: isMobile ? 54 : 64, flexShrink: 0,
                    background: p.logoBg ? 'var(--yellow)' : 'var(--bg-cell, #ebedf0)',
                    border: '3px solid var(--border)',
                    boxShadow: '4px 4px 0 var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isMobile ? '1.6rem' : '2rem',
                }}>
                    {p.logo && p.logo.startsWith('/')
                        ? <img src={p.logo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: isMobile ? 6 : 8 }} />
                        : (p.logo || '🔥')
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.55, fontFamily: 'Space Mono, monospace', marginBottom: '0.2rem' }}>
                        {p.label}
                    </div>
                    <h3 style={{ fontSize: isMobile ? '1.35rem' : '1.6rem', fontWeight: 950, letterSpacing: '-0.5px', lineHeight: 1.1, wordBreak: 'break-word' }}>
                        {p.name}
                    </h3>
                    {p.status && (
                        <span style={{ display: 'inline-block', marginTop: '0.4rem', background: 'var(--accent)', border: '2px solid var(--border)', padding: '1px 8px', fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px' }}>
                            ● {p.status.toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            <div style={{ padding: isMobile ? '0 1.25rem' : '0 1.5rem' }}>
                <p style={{ fontSize: isMobile ? '0.88rem' : '0.95rem', fontWeight: 800, opacity: 0.85, fontFamily: 'Space Mono, monospace', lineHeight: 1.5 }}>
                    {p.tagline}
                </p>
            </div>

            <div style={{ padding: isMobile ? '0 1.25rem' : '0 1.5rem' }}>
                <p style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', opacity: 0.65, fontFamily: 'Space Mono, monospace', lineHeight: 1.6 }}>
                    {p.description}
                </p>
            </div>

            {p.techStack?.length > 0 && (
                <div style={{ padding: isMobile ? '0 1.25rem' : '0 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {p.techStack.slice(0, isMobile ? 3 : 4).map((t, i) => (
                        <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            padding: '2px 8px', border: '2px solid var(--border)',
                            fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: '0.7rem',
                            background: 'var(--bg-cell, #ebedf0)',
                        }}>
                            <i className={t.icon} style={{ fontSize: '0.65rem' }} /> {t.label}
                        </span>
                    ))}
                    {p.techStack.length > (isMobile ? 3 : 4) && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '2px 8px', border: '2px solid var(--border)',
                            fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: '0.7rem',
                            background: 'var(--bg-cell, #ebedf0)', opacity: 0.65,
                        }}>+{p.techStack.length - (isMobile ? 3 : 4)}</span>
                    )}
                </div>
            )}

            {p.githubAnalysis && (
                <div style={{ padding: isMobile ? '0 1.25rem' : '0 1.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '2px 8px', border: '1.5px solid var(--border)',
                        fontFamily: 'Space Mono, monospace', fontSize: '0.6rem', fontWeight: 900,
                        background: 'rgba(0,0,0,0.03)', letterSpacing: '0.5px',
                        color: 'var(--text)', opacity: 0.6,
                    }}>
                        <i className="fab fa-github" /> GITHUB ANALYSIS AVAILABLE
                    </div>
                </div>
            )}

            <div style={{
                padding: isMobile ? '1rem 1.25rem 1.25rem' : '1rem 1.5rem 1.5rem',
                display: 'flex', gap: '0.65rem', flexWrap: 'wrap',
                marginTop: 'auto', borderTop: '3px solid var(--border)',
                background: 'var(--bg-cell, #ebedf0)',
            }}>
                <button
                    onClick={onOpenModal}
                    style={{
                        flex: isMobile ? '1 1 auto' : 'unset',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: isMobile ? '0.6rem 1rem' : '0.65rem 1.25rem', background: 'var(--yellow)',
                        border: '3px solid var(--border)', boxShadow: isMobile ? '3px 3px 0 var(--border)' : '5px 5px 0 var(--border)',
                        cursor: 'pointer', color: 'var(--yellow-content)', fontWeight: 900,
                        fontSize: isMobile ? '0.75rem' : '0.85rem', transition: 'all 0.1s', fontFamily: 'Space Mono, monospace',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isMobile ? '3px 3px 0 var(--border)' : '5px 5px 0 var(--border)'; }}
                >
                    <i className="fas fa-expand-alt" /> {isMobile ? 'DETAILS' : 'VIEW DETAILS'}
                </button>

                {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                        style={{
                            flex: isMobile ? '1 1 auto' : 'unset',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: isMobile ? '0.6rem 1rem' : '0.65rem 1.25rem', background: 'var(--white)',
                            border: '3px solid var(--border)', boxShadow: isMobile ? '3px 3px 0 var(--border)' : '5px 5px 0 var(--border)',
                            textDecoration: 'none', color: 'var(--text)', fontWeight: 900,
                            fontSize: isMobile ? '0.75rem' : '0.85rem', transition: 'all 0.1s', fontFamily: 'Space Mono, monospace',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isMobile ? '3px 3px 0 var(--border)' : '5px 5px 0 var(--border)'; }}
                    >
                        <i className="fas fa-external-link-alt" /> LIVE
                    </a>
                )}

                {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                        style={{
                            flex: isMobile ? '1 1 auto' : 'unset',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: isMobile ? '0.6rem 1rem' : '0.65rem 1.25rem', background: 'var(--white)',
                            border: '3px solid var(--border)', boxShadow: isMobile ? '3px 3px 0 var(--border)' : '5px 5px 0 var(--border)',
                            textDecoration: 'none', color: 'var(--text)', fontWeight: 900,
                            fontSize: isMobile ? '0.75rem' : '0.85rem', transition: 'all 0.1s', fontFamily: 'Space Mono, monospace',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isMobile ? '3px 3px 0 var(--border)' : '5px 5px 0 var(--border)'; }}
                    >
                        <i className="fab fa-github" /> {isMobile ? 'REPO' : 'GITHUB'}
                    </a>
                )}
            </div>
        </div>
    );
}
