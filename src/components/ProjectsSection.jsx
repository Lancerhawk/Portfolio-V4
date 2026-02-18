import { useState, useEffect } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import data from '../data/portfolio.json';

export default function ProjectsSection() {
    const fadeRef = useFadeIn();
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1080);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 1080);
        window.addEventListener('resize', onResize, { passive: true });
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
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
                        <div key={index} style={{
                            background: 'var(--white)', border: 'var(--border-width) solid var(--border)',
                            padding: '2rem', boxShadow: '8px 8px 0 var(--border)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: '1rem', textAlign: 'center', height: '100%', boxSizing: 'border-box',
                        }}>
                            <div style={{
                                fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px',
                                textTransform: 'uppercase', opacity: 0.6, fontFamily: 'Space Mono, monospace'
                            }}>{p.label}</div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: p.logoBg ? '1.5rem' : '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px',
                                    background: p.logoBg ? 'var(--yellow)' : 'transparent',
                                    border: p.logoBg ? '4px solid var(--border)' : 'none',
                                    boxShadow: p.logoBg ? '6px 6px 0 var(--border)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.5rem',
                                }}>
                                    {p.logo && p.logo.startsWith('/')
                                        ? <img src={p.logo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
                                        : (p.logo || '🔥')
                                    }
                                </div>
                                <h3 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-1px' }}>{p.name}</h3>
                            </div>

                            <p style={{
                                fontSize: '1.1rem', opacity: 0.8, width: '100%',
                                fontFamily: 'Space Mono, monospace',
                                textAlign: 'center', lineHeight: 1.6,
                            }}>
                                {p.tagline}
                            </p>

                            {
                                p.description && (
                                    <p style={{
                                        fontSize: '0.95rem', opacity: 0.65, width: '100%',
                                        fontFamily: 'Space Mono, monospace', lineHeight: 1.7,
                                        textAlign: 'justify', textAlignLast: 'center',
                                        marginTop: '-0.5rem',
                                    }}>
                                        {p.description}
                                    </p>
                                )
                            }

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'auto' }}>
                                <a href={p.url} target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1.5rem', background: 'var(--yellow)',
                                        border: '3px solid var(--border)', boxShadow: '5px 5px 0 var(--border)',
                                        textDecoration: 'none', color: 'var(--text)', fontWeight: 700,
                                        fontSize: '1rem', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(5px,5px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '5px 5px 0 var(--border)'; }}
                                >
                                    <i className="fas fa-external-link-alt" /> Visit Site
                                </a>
                                <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1.5rem', background: 'var(--white)',
                                        border: '3px solid var(--border)', boxShadow: '5px 5px 0 var(--border)',
                                        textDecoration: 'none', color: 'var(--text)', fontWeight: 700,
                                        fontSize: '1rem', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(5px,5px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '5px 5px 0 var(--border)'; }}
                                >
                                    <i className="fab fa-github" /> GitHub
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div >
        </section >
    );
}
