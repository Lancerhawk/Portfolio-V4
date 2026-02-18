import { useFadeIn } from '../hooks/useFadeIn';
import { useLanguageStars } from '../hooks/useLanguageStars';
import data from '../data/portfolio.json';

export default function EducationLanguagesSection() {
    const fadeRef = useFadeIn();
    const starsRef = useLanguageStars();
    const edu = data.education;

    return (
        <section id="education" style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)', marginBottom: '3rem' }}>
            <div ref={fadeRef} className="section-fade">
                <div className="edu-lang-grid">
                    {/* Education column */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1.5rem',
                            letterSpacing: '-0.5px', textTransform: 'uppercase',
                            display: 'inline-block', padding: '0.5rem 1rem',
                            background: 'var(--secondary)', border: 'var(--border-width) solid var(--border)',
                            boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 var(--border)'
                        }}>Education</h2>
                        <div style={{
                            flex: 1, background: 'var(--white)', border: 'var(--border-width) solid var(--border)',
                            padding: '1.5rem', boxShadow: '8px 8px 0 var(--border)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem'
                        }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 600, marginBottom: '0.4rem', lineHeight: 1.3 }}>{edu.degree}</h3>
                                        <div style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontFamily: 'Space Mono, monospace', opacity: 0.9 }}>{edu.school}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                                        <div style={{
                                            padding: '0.4rem 0.85rem', background: 'var(--primary)',
                                            border: 'var(--border-width) solid var(--border)',
                                            fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', fontWeight: 600,
                                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
                                            color: 'var(--primary-content)'
                                        }}>
                                            <i className="fas fa-calendar" /> {edu.period}
                                        </div>
                                        {edu.cgpa && (
                                            <div style={{
                                                padding: '0.4rem 0.85rem', background: 'var(--secondary)',
                                                border: 'var(--border-width) solid var(--border)',
                                                fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', fontWeight: 600,
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
                                                color: 'var(--secondary-content)'
                                            }}>
                                                <i className="fas fa-star" /> CGPA: {edu.cgpa}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
                                <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary)' }} />
                                {edu.location}
                            </div>
                        </div>
                    </div>

                    {/* Languages column */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1.5rem',
                            letterSpacing: '-0.5px', textTransform: 'uppercase',
                            display: 'inline-block', padding: '0.5rem 1rem',
                            background: 'var(--secondary)', border: 'var(--border-width) solid var(--border)',
                            boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 var(--border)'
                        }}>Languages</h2>
                        <div ref={starsRef} style={{
                            flex: 1, background: 'var(--white)', border: 'var(--border-width) solid var(--border)',
                            padding: '1.25rem', boxShadow: '8px 8px 0 var(--border)',
                            display: 'flex', flexDirection: 'column', gap: '0.85rem'
                        }}>
                            {data.languages.map(lang => (
                                <div key={lang.name} className="lang-item" style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.65rem 1rem', background: 'var(--white)',
                                    border: 'var(--border-width) solid var(--border)', borderRadius: '6px',
                                    boxShadow: '2px 2px 0 0 var(--border)', transition: 'all 0.2s ease'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '0 0 0 var(--border)'; e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-content)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 2px 0 0 var(--border)'; e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'initial'; }}
                                >
                                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{lang.name}</span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {[1, 2, 3].map(n => (
                                            <div key={n} className={`language-star${n <= lang.stars ? ' filled' : ''}`} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
