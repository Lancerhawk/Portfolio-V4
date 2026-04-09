import { useState, useEffect } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import data from '../data/portfolio.json';
import ProjectDetailModal from './ProjectDetailModal';

export default function ProjectsSection() {
    const fadeRef = useFadeIn();
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1080);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 1080);
        window.addEventListener('resize', onResize, { passive: true });
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <>
            <section id="projects" style={{ padding: '3rem 2rem', marginBottom: '3rem' }}>
                <div ref={fadeRef} className="section-fade">
                    <h2 style={{
                        fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem',
                        letterSpacing: '-0.5px', textTransform: 'uppercase',
                        display: 'inline-block', padding: '0.5rem 1rem',
                        background: 'var(--secondary)', border: 'var(--border-width) solid var(--border)',
                        boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 var(--border)'
                    }}>Projects</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                        gap: '2rem',
                    }}>
                        {data.projects.map((p, index) => (
                            <ProjectCard
                                key={index}
                                project={p}
                                onOpenModal={() => setSelectedProject(p)}
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

function ProjectCard({ project: p, onOpenModal }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            style={{
                background: 'var(--white)',
                border: 'var(--border-width) solid var(--border)',
                boxShadow: hovered ? '0 0 0 var(--border)' : '8px 8px 0 var(--border)',
                display: 'flex', flexDirection: 'column',
                gap: '1rem', height: '100%', boxSizing: 'border-box',
                transition: 'box-shadow 0.1s, transform 0.1s',
                transform: hovered ? 'translate(8px, 8px)' : '',
                overflow: 'hidden',
                position: 'relative',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Year badge — top right */}
            {p.year && (
                <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'var(--secondary)', border: '2px solid var(--border)',
                    boxShadow: '3px 3px 0 var(--border)',
                    padding: '2px 10px',
                    fontFamily: 'Space Mono, monospace', fontSize: '0.68rem', fontWeight: 900,
                    letterSpacing: '1px', zIndex: 1,
                }}>{p.year}</div>
            )}
            {/* Card Header */}
            <div style={{
                padding: '1.5rem 1.5rem 0',
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
            }}>
                {/* Logo */}
                <div style={{
                    width: 64, height: 64, flexShrink: 0,
                    background: p.logoBg ? 'var(--yellow)' : 'var(--bg-cell, #ebedf0)',
                    border: '3px solid var(--border)',
                    boxShadow: '4px 4px 0 var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem',
                }}>
                    {p.logo && p.logo.startsWith('/')
                        ? <img src={p.logo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                        : (p.logo || '🔥')
                    }
                </div>
                {/* Title area */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.55, fontFamily: 'Space Mono, monospace', marginBottom: '0.3rem' }}>
                        {p.label}
                    </div>
                    <h3 style={{ fontSize: '1.55rem', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1, wordBreak: 'break-word' }}>
                        {p.name}
                    </h3>
                    {p.status && (
                        <span style={{ display: 'inline-block', marginTop: '0.3rem', background: 'var(--accent)', border: '2px solid var(--border)', padding: '1px 10px', fontFamily: 'Space Mono, monospace', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '1px' }}>
                            ● {p.status.toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            {/* Tagline */}
            <div style={{ padding: '0 1.5rem' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.75, fontFamily: 'Space Mono, monospace', lineHeight: 1.5 }}>
                    {p.tagline}
                </p>
            </div>

            {/* Description */}
            <div style={{ padding: '0 1.5rem' }}>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, fontFamily: 'Space Mono, monospace', lineHeight: 1.7 }}>
                    {p.description}
                </p>
            </div>

            {/* Tech Stack Preview (first 4) */}
            {p.techStack?.length > 0 && (
                <div style={{ padding: '0 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {p.techStack.slice(0, 4).map((t, i) => (
                        <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            padding: '3px 10px', border: '2px solid var(--border)',
                            fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: '0.72rem',
                            background: 'var(--bg-cell, #ebedf0)',
                        }}>
                            <i className={t.icon} style={{ fontSize: '0.68rem' }} /> {t.label}
                        </span>
                    ))}
                    {p.techStack.length > 4 && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '3px 10px', border: '2px solid var(--border)',
                            fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: '0.72rem',
                            background: 'var(--bg-cell, #ebedf0)', opacity: 0.65,
                        }}>+{p.techStack.length - 4} more</span>
                    )}
                </div>
            )}

            {/* GitHub Analysis badge */}
            {p.githubAnalysis && (
                <div style={{ padding: '0 1.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '3px 10px', border: '2px solid var(--border)',
                        fontFamily: 'Space Mono, monospace', fontSize: '0.68rem', fontWeight: 800,
                        background: 'var(--white)', letterSpacing: '0.5px',
                        color: 'var(--text)', opacity: 0.7,
                    }}>
                        <i className="fab fa-github" /> GITHUB ANALYSIS AVAILABLE
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div style={{
                padding: '1rem 1.5rem 1.5rem',
                display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
                marginTop: 'auto', borderTop: '3px solid var(--border)',
                background: 'var(--bg-cell, #ebedf0)',
            }}>
                {/* View Details */}
                <button
                    onClick={onOpenModal}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.65rem 1.25rem', background: 'var(--yellow)',
                        border: '3px solid var(--border)', boxShadow: '5px 5px 0 var(--border)',
                        cursor: 'pointer', color: 'var(--yellow-content)', fontWeight: 900,
                        fontSize: '0.85rem', transition: 'all 0.15s', fontFamily: 'Space Mono, monospace',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(5px,5px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '5px 5px 0 var(--border)'; }}
                >
                    <i className="fas fa-expand-alt" /> VIEW DETAILS
                </button>

                {/* Visit Site */}
                {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.65rem 1.25rem', background: 'var(--white)',
                            border: '3px solid var(--border)', boxShadow: '5px 5px 0 var(--border)',
                            textDecoration: 'none', color: 'var(--text)', fontWeight: 900,
                            fontSize: '0.85rem', transition: 'all 0.15s', fontFamily: 'Space Mono, monospace',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(5px,5px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '5px 5px 0 var(--border)'; }}
                    >
                        <i className="fas fa-external-link-alt" /> LIVE
                    </a>
                )}

                {/* GitHub */}
                {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.65rem 1.25rem', background: 'var(--white)',
                            border: '3px solid var(--border)', boxShadow: '5px 5px 0 var(--border)',
                            textDecoration: 'none', color: 'var(--text)', fontWeight: 900,
                            fontSize: '0.85rem', transition: 'all 0.15s', fontFamily: 'Space Mono, monospace',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(5px,5px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '5px 5px 0 var(--border)'; }}
                    >
                        <i className="fab fa-github" /> GITHUB
                    </a>
                )}
            </div>
        </div>
    );
}
