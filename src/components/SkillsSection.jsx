import { useFadeIn } from '../hooks/useFadeIn';
import { useEffect, useRef } from 'react';
import data from '../data/portfolio.json';

function SkillBox({ skill, index }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('fade-in'), index * 80); } }),
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [index]);

    const colorMap = [
        { bg: 'var(--cyan)', content: 'var(--cyan-content)' },
        { bg: 'var(--yellow)', content: 'var(--yellow-content)' },
        { bg: 'var(--pink)', content: 'var(--pink-content)' },
        { bg: 'var(--accent)', content: 'var(--accent-content)' },
        { bg: 'var(--cyan)', content: 'var(--cyan-content)' },
        { bg: 'var(--pink)', content: 'var(--pink-content)' },
        { bg: 'var(--yellow)', content: 'var(--yellow-content)' },
        { bg: 'var(--accent)', content: 'var(--accent-content)' }
    ];
    const colorObj = colorMap[index] || { bg: 'var(--primary)', content: 'var(--primary-content)' };
    const color = colorObj.bg;

    // A fun dotted pattern background for the tags area
    const pattern = `radial-gradient(circle, var(--border) 2px, transparent 2px)`;

    return (
        <div ref={ref} className={`skill-box-anim skill-box-${index + 1}`} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="skill-box-responsive"
                style={{
                    background: skill.isHighlight ? 'var(--white)' : 'var(--bg)',
                    border: '4px solid var(--border)', 
                    borderRadius: '0',
                    boxShadow: '8px 8px 0 var(--border)', 
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    flexGrow: 1
                }}
            >
            {/* Header / Title Bar */}
            <div style={{
                background: color,
                color: colorObj.content,
                padding: '1rem 1.5rem',
                borderBottom: '4px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem'
            }}>
                <i className={skill.icon} style={{ fontSize: '1.8rem', opacity: 0.9 }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>
                    {skill.title}
                </h3>
            </div>

            {/* Tags Container with Retro Dotted Pattern */}
            <div style={{
                padding: '1.8rem 1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                flexGrow: 1,
                alignContent: 'flex-start',
                alignItems: 'flex-start',
                backgroundImage: pattern,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Overlay to dim the dots slightly so they aren't overwhelming */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'var(--white)',
                    opacity: 0.85,
                    zIndex: -1
                }} />

                {skill.tags.map((tag, tagIndex) => {
                    // Random-ish rotations for a "stickers slapped on a board" look
                    const rotations = [-3, 2, -1, 4, -2, 1, 3, -4, 0];
                    const rot = rotations[tagIndex % rotations.length];
                    return (
                        <div key={tag.label}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 0.9rem', fontSize: '0.85rem', fontWeight: 700,
                                border: '3px solid var(--border)', 
                                background: 'var(--white)',
                                color: 'var(--text)',
                                boxShadow: '4px 4px 0 var(--border)', 
                                transition: 'all 0.1s cubic-bezier(0, 0, 0.2, 1)',
                                cursor: 'pointer',
                                transform: `rotate(${rot}deg)`,
                                borderRadius: '0',
                                position: 'relative'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translate(4px, 4px) rotate(0deg) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 0 0 var(--border)';
                                e.currentTarget.style.background = color;
                                e.currentTarget.style.color = colorObj.content;
                                e.currentTarget.style.zIndex = 10;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = `rotate(${rot}deg)`;
                                e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)';
                                e.currentTarget.style.background = 'var(--white)';
                                e.currentTarget.style.color = 'var(--text)';
                                e.currentTarget.style.zIndex = 1;
                            }}
                        >
                            <i className={tag.icon} style={{ fontSize: '1.2rem' }} />
                            {tag.label}
                        </div>
                    )
                })}
            </div>
        </div>
        </div>
    );
}

export default function SkillsSection() {
    const fadeRef = useFadeIn();
    return (
        <section id="skills" style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)', marginBottom: '3rem' }}>
            <div ref={fadeRef} className="section-fade">
                <h2 style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1.5rem',
                    letterSpacing: '-0.5px', textTransform: 'uppercase',
                    display: 'inline-block', padding: '0.5rem 1rem',
                    background: 'var(--secondary)', border: 'var(--border-width) solid var(--border)',
                    boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 var(--border)'
                }}>Skills</h2>
                
                <div className="skills-grid">
                    {data.skills.map((skill, i) => (
                        <SkillBox key={skill.title} skill={skill} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
