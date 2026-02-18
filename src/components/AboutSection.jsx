import { useHighlightParallax } from '../hooks/useHighlightParallax';
import { useFadeIn } from '../hooks/useFadeIn';
import data from '../data/portfolio.json';

export default function AboutSection() {
    const containerRef = useHighlightParallax();
    const fadeRef = useFadeIn();

    const colorMap = { yellow: 'highlight-yellow', cyan: 'highlight-cyan', pink: 'highlight-pink', green: 'highlight-green' };

    return (
        <section id="about" style={{ padding: '3rem 2rem', marginBottom: '3rem' }}>
            <div ref={fadeRef} className="section-fade">
                <h2 style={{
                    fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem',
                    letterSpacing: '-0.5px', textTransform: 'uppercase',
                    display: 'inline-block', padding: '0.5rem 1rem',
                    background: 'var(--secondary)', border: 'var(--border-width) solid var(--border)',
                    boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 var(--border)'
                }}>About Me</h2>

                <div ref={containerRef} style={{
                    background: 'var(--white)', border: 'var(--border-width) solid var(--border)',
                    padding: '2rem', boxShadow: '8px 8px 0 var(--border)'
                }}>
                    {data.about.paragraphs.map((para, pi) => (
                        <p key={pi} style={{
                            fontSize: '1.125rem', lineHeight: 1.8,
                            marginBottom: pi < data.about.paragraphs.length - 1 ? '1rem' : 0
                        }}>
                            {para.parts.map((part, i) =>
                                part.highlight ? (
                                    <span key={i} className={`highlight ${colorMap[part.highlight] || ''}`}>
                                        {part.text}
                                    </span>
                                ) : (
                                    <span key={i}>{part.text}</span>
                                )
                            )}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}
