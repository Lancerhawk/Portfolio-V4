import { useHighlightParallax } from '../hooks/useHighlightParallax';
import { useFadeIn } from '../hooks/useFadeIn';
import data from '../data/portfolio.json';

export default function AboutSection() {
    const containerRef = useHighlightParallax();
    const fadeRef = useFadeIn();

    const colorMap = { yellow: 'highlight-yellow', cyan: 'highlight-cyan', pink: 'highlight-pink', green: 'highlight-green' };

    return (
        <section id="about" style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)', marginBottom: '3rem' }}>
            <div ref={fadeRef} className="section-fade">
                
                <h2 style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1.5rem',
                    letterSpacing: '-0.5px', textTransform: 'uppercase',
                    display: 'inline-block', padding: '0.5rem 1rem',
                    background: 'var(--secondary)', border: 'var(--border-width) solid var(--border)',
                    boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 var(--border)'
                }}>About Me</h2>

                <div ref={containerRef} style={{
                    background: 'var(--white)', 
                    border: '4px solid var(--border)',
                    borderRadius: '0',
                    boxShadow: '8px 8px 0 var(--border)',
                    position: 'relative'
                }}>
                    
                    {/* Retro Window Header */}
                    <div style={{
                        borderBottom: '4px solid var(--border)',
                        background: 'var(--yellow)',
                        padding: '0.8rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: '0'
                    }}>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '0', background: 'var(--pink)', border: '3px solid var(--border)' }} />
                            <div style={{ width: '16px', height: '16px', borderRadius: '0', background: 'var(--cyan)', border: '3px solid var(--border)' }} />
                            <div style={{ width: '16px', height: '16px', borderRadius: '0', background: 'var(--accent)', border: '3px solid var(--border)' }} />
                        </div>
                        <span style={{ fontWeight: 800, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>whoami.txt</span>
                        <div style={{ width: '64px' }} /> {/* Spacer to balance the 3 squares */}
                    </div>

                    <div style={{ padding: '1.5rem 2rem', background: 'var(--white)', borderRadius: '0' }}>
                        {data.about.paragraphs.map((para, pi) => (
                            <p key={pi} style={{
                                fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)', 
                                lineHeight: 1.8,
                                fontWeight: 500,
                                color: 'var(--text)',
                                marginBottom: pi < data.about.paragraphs.length - 1 ? '1.2rem' : 0
                            }}>
                                {para.parts.map((part, i) =>
                                    part.highlight ? (
                                        <span key={i} className={`highlight ${colorMap[part.highlight] || ''}`} style={{ fontWeight: 800 }}>
                                            {part.text}
                                        </span>
                                    ) : (
                                        <span key={i}>{part.text}</span>
                                    )
                                )}
                            </p>
                        ))}
                    </div>
                    
                    {/* Neo-brutalist decorative sticker/tape on the side */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-15px',
                        right: '-15px',
                        background: 'var(--cyan)',
                        border: '3px solid var(--border)',
                        padding: '0.4rem 1rem',
                        fontWeight: 800,
                        fontFamily: 'Space Mono, monospace',
                        transform: 'rotate(-5deg)',
                        boxShadow: '4px 4px 0 var(--border)',
                        zIndex: 10
                    }}>
                        <i className="fas fa-fingerprint" style={{ marginRight: '8px' }}></i>
                        VERIFIED
                    </div>
                </div>
            </div>
        </section>
    );
}
