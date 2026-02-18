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

    return (
        <div ref={ref} className={`skill-box-anim skill-box-${index + 1} skill-box-responsive`}
            style={{
                background: skill.isHighlight ? 'var(--secondary)' : 'var(--white)',
                border: '4px solid var(--border)', padding: '1.5rem',
                boxShadow: '8px 8px 0 var(--border)', transition: 'all 0.3s ease',
                position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(8px,8px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '8px 8px 0 var(--border)'; }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: color }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '4px solid var(--border)', position: 'relative', zIndex: 1 }}>
                <i className={skill.icon} style={{ fontSize: '2.5rem', color, transition: 'all 0.3s ease' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{skill.title}</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', position: 'relative', zIndex: 1 }}>
                {skill.tags.map(tag => (
                    <div key={tag.label}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: 600,
                            border: '3px solid var(--border)', background: 'var(--white)',
                            boxShadow: '3px 3px 0 var(--border)', transition: 'all 0.2s ease', cursor: 'pointer'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translate(3px,3px)';
                            e.currentTarget.style.boxShadow = '0 0 0 var(--border)';
                            e.currentTarget.style.background = color;
                            e.currentTarget.style.color = colorObj.content;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.boxShadow = '3px 3px 0 var(--border)';
                            e.currentTarget.style.background = 'var(--white)';
                            e.currentTarget.style.color = 'var(--text)';
                        }}
                    >
                        <i className={tag.icon} style={{ fontSize: '1rem' }} />
                        {tag.label}
                    </div>
                ))}
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
