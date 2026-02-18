import { useFadeIn } from '../hooks/useFadeIn';
import data from '../data/portfolio.json';

const cardStyles = [
    { bg: '#66d9ef', rotate: '-2deg' },
    { bg: '#ffd93d', rotate: '1deg' },
    { bg: '#ff6b9d', rotate: '-1deg' },
];

export default function ContactSection() {
    const fadeRef = useFadeIn();

    return (
        <section id="contact" style={{ padding: '3rem 2rem', marginBottom: '3rem' }}>
            <div ref={fadeRef} className="section-fade">
                <h2 style={{
                    fontSize: '2.5rem', fontWeight: 700, textAlign: 'center',
                    marginBottom: '3rem', padding: '1rem 2rem',
                    background: 'var(--white)', border: 'var(--border-width) solid var(--border)',
                    boxShadow: '6px 6px 0 var(--border)', display: 'block'
                }}>Get in Touch</h2>

                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <p style={{
                        fontSize: '1.25rem', fontWeight: 600, textAlign: 'center',
                        marginBottom: '2rem', opacity: 0.9
                    }}>
                        Feel free to reach out on any of these platforms!
                    </p>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem', padding: '1rem'
                    }}>
                        {data.contact.map((c, i) => {
                            const style = cardStyles[i] || cardStyles[0];
                            return (
                                <a key={c.platform} href={c.url} target="_blank" rel="noopener noreferrer"
                                    className={`contact-card contact-card-${i + 1}`}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        justifyContent: 'center', gap: '1rem', padding: '2rem 1.5rem',
                                        minHeight: '180px', background: style.bg,
                                        border: 'var(--border-width) solid var(--border)',
                                        boxShadow: '6px 6px 0 var(--border)',
                                        textDecoration: 'none', color: 'var(--text)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        textAlign: 'center', position: 'relative',
                                        transform: `rotate(${style.rotate})`, transformOrigin: 'center center'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'rotate(0deg) translateY(-10px)'; e.currentTarget.style.boxShadow = '8px 8px 0 var(--border)'; e.currentTarget.style.zIndex = '10'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${style.rotate})`; e.currentTarget.style.boxShadow = '6px 6px 0 var(--border)'; e.currentTarget.style.zIndex = ''; }}
                                >
                                    {/* Tape sticker */}
                                    <div style={{
                                        position: 'absolute', top: '-12px', right: '5px',
                                        width: '70px', height: '30px',
                                        background: 'rgba(255,217,61,0.7)', border: '2px solid rgba(0,0,0,0.1)',
                                        borderRadius: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        zIndex: 10, pointerEvents: 'none', transform: 'rotate(15deg)',
                                        transition: 'transform 0.3s ease'
                                    }} />
                                    <i className={c.icon} style={{ fontSize: '2.5rem', color: 'var(--text)', marginTop: '1rem' }} />
                                    <span style={{
                                        fontSize: '1.1rem', fontWeight: 700,
                                        fontFamily: 'Caveat, cursive', letterSpacing: '0.5px'
                                    }}>{c.platform}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
