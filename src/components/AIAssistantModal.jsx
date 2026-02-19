import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_AI_SERVER_URL || '';
const STORAGE_KEY = 'ai_chat_history';

const INITIAL_MESSAGE = {
    role: 'assistant',
    content: "👋 Hey! I'm **Arin's AI assistant** — ask me anything about his skills, projects, experience, or education. I've got all the details!",
    timestamp: Date.now(),
};

const QUICK_QUESTIONS = [
    { label: '🧠 Skills', text: "What are Arin's main technical skills?" },
    { label: '🚀 Projects', text: "Tell me about his best projects." },
    { label: '🎓 Education', text: "What is his educational background?" },
    { label: '💼 Experience', text: "What work experience does he have?" },
];

function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.12);padding:1px 5px;border-radius:0;font-family:var(--font-mono);font-size:0.82em;border:1px solid rgba(0,0,0,0.15)">$1</code>')
        .replace(/^### (.*$)/gm, '<h4 style="font-weight:800;margin:0.5rem 0 0.2rem;font-family:var(--font-mono)">$1</h4>')
        .replace(/^## (.*$)/gm, '<h3 style="font-weight:900;margin:0.5rem 0 0.25rem;font-family:var(--font-mono)">$1</h3>')
        .replace(/^- (.*$)/gm, '<li style="margin-left:1.2rem;list-style:disc;margin-bottom:0.2rem">$1</li>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');
}

// ─── Inline keyframes injected once ───────────────────────────────────────────
const STYLES = `
@keyframes aiModalIn {
    from { transform: translateY(28px) scale(0.96); opacity: 0; }
    to   { transform: translateY(0)    scale(1);    opacity: 1; }
}
@keyframes msgIn {
    from { transform: translateY(10px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
}
@keyframes typingDot {
    0%,80%,100% { transform: translateY(0);    opacity: 0.35; }
    40%          { transform: translateY(-6px); opacity: 1;    }
}
@keyframes statusPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.4; }
}
.ai-msg { animation: msgIn 0.22s ease forwards; }
.ai-input:focus {
    outline: none;
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accent), 3px 3px 0 var(--border) inset !important;
}
.ai-chip:hover {
    background: var(--yellow) !important;
    transform: translate(2px,2px) !important;
    box-shadow: 0 0 0 var(--border) !important;
}
.ai-btn-neo:hover:not(:disabled) {
    transform: translate(2px,2px) !important;
    box-shadow: none !important;
}
.ai-btn-neo:disabled { opacity: 0.4; cursor: not-allowed !important; }
`;

// ─── MessageBubble ────────────────────────────────────────────────────────────
function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    return (
        <div
            className="ai-msg"
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                flexDirection: isUser ? 'row-reverse' : 'row',
            }}
        >
            {/* Avatar */}
            <div style={{
                flexShrink: 0,
                width: 36, height: 36,
                background: isUser ? 'var(--pink)' : 'var(--cyan)',
                border: '3px solid var(--border)',
                boxShadow: '3px 3px 0 var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem',
                color: isUser ? 'var(--pink-content)' : 'var(--cyan-content)',
            }}>
                <i className={`fas ${isUser ? 'fa-user' : 'fa-robot'}`} />
            </div>

            {/* Bubble */}
            <div style={{
                maxWidth: '76%',
                padding: '0.65rem 0.9rem',
                border: '3px solid var(--border)',
                boxShadow: isUser ? '-4px 4px 0 var(--border)' : '4px 4px 0 var(--border)',
                background: isUser ? 'var(--accent)' : 'var(--white)',
                color: isUser ? 'var(--accent-content)' : 'var(--text)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                fontFamily: 'var(--font-main)',
                wordBreak: 'break-word',
            }}
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
            />
        </div>
    );
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem' }}>
            <div style={{
                flexShrink: 0, width: 36, height: 36,
                background: 'var(--cyan)', border: '3px solid var(--border)',
                boxShadow: '3px 3px 0 var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', color: 'var(--cyan-content)',
            }}>
                <i className="fas fa-robot" />
            </div>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '0.75rem 1rem',
                border: '3px solid var(--border)',
                boxShadow: '4px 4px 0 var(--border)',
                background: 'var(--white)',
            }}>
                {[0, 1, 2].map(i => (
                    <span key={i} style={{
                        display: 'inline-block', width: 8, height: 8,
                        background: 'var(--border)', borderRadius: '50%',
                        animation: `typingDot 1.2s ${i * 0.2}s infinite`,
                    }} />
                ))}
            </div>
        </div>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function AIAssistantModal({ isOpen, onClose }) {
    const [messages, setMessages] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [INITIAL_MESSAGE]; }
        catch { return [INITIAL_MESSAGE]; }
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serverOnline, setServerOnline] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Persist
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); }, [messages]);

    // Scroll to bottom
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

    // On open: focus + health check
    useEffect(() => {
        if (!isOpen) return;
        setTimeout(() => inputRef.current?.focus(), 150);
        setServerOnline(null);
        fetch(`${API_URL}/api/health`)
            .then(r => setServerOnline(r.ok))
            .catch(() => setServerOnline(false));
    }, [isOpen]);

    // ESC to close
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // ── send ──
    const sendMessage = async (text) => {
        const msg = (text || input).trim();
        if (!msg || isLoading) return;
        const userMsg = { role: 'user', content: msg, timestamp: Date.now() };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput('');
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updated.map(({ role, content }) => ({ role, content })) }),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Server error');
            const data = await res.json();
            setMessages(prev => [...prev, { ...data, timestamp: Date.now() }]);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const resetChat = () => { setMessages([INITIAL_MESSAGE]); setError(null); localStorage.removeItem(STORAGE_KEY); };
    const onKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

    if (!isOpen) return null;

    const canSend = input.trim() && !isLoading && serverOnline !== false;
    const statusColor = serverOnline === null ? 'var(--yellow)' : serverOnline ? '#22c55e' : '#ef4444';
    const statusLabel = serverOnline === null ? 'Connecting…' : serverOnline ? 'Online' : 'Offline';

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
            }}
            onClick={onClose}
        >
            <style>{STYLES}</style>

            <div
                style={{
                    width: '100%', maxWidth: 580,
                    height: '80vh', maxHeight: 720,
                    display: 'flex', flexDirection: 'column',
                    background: 'var(--white)',
                    border: '4px solid var(--border)',
                    boxShadow: '14px 14px 0 var(--border)',
                    animation: 'aiModalIn 0.32s cubic-bezier(0.175,0.885,0.32,1.275)',
                    overflow: 'hidden',
                }}
                onClick={e => e.stopPropagation()}
            >

                {/* ── HEADER ──────────────────────────────────────────────── */}
                <div style={{
                    background: 'var(--accent)',
                    borderBottom: '4px solid var(--border)',
                    flexShrink: 0,
                }}>
                    {/* Scanline stripe */}
                    <div style={{
                        height: 6,
                        background: 'repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 6px, transparent 6px, transparent 12px)',
                    }} />

                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                    }}>
                        {/* Left: icon + title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{
                                width: 44, height: 44,
                                background: 'var(--white)',
                                border: '3px solid var(--border)',
                                boxShadow: '4px 4px 0 var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.3rem',
                                color: 'var(--accent-content)',
                                flexShrink: 0,
                            }}>
                                <i className="fas fa-robot" />
                            </div>
                            <div>
                                <div style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 800,
                                    fontSize: '1.05rem',
                                    letterSpacing: '-0.5px',
                                    color: 'var(--accent-content)',
                                    lineHeight: 1.2,
                                }}>
                                    AI Assistant
                                </div>
                                {/* Status row */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.72rem',
                                    color: 'var(--accent-content)',
                                    opacity: 0.85,
                                    marginTop: '0.15rem',
                                }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: 8, height: 8,
                                        borderRadius: '50%',
                                        background: statusColor,
                                        boxShadow: serverOnline ? `0 0 8px ${statusColor}` : 'none',
                                        animation: serverOnline === null ? 'statusPulse 1s infinite' : 'none',
                                    }} />
                                    <span>{statusLabel}</span>
                                    <span style={{ opacity: 0.5 }}>·</span>
                                    <span>{messages.length - 1} msg{messages.length !== 2 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Reset + Close */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="ai-btn-neo"
                                onClick={resetChat}
                                title="Reset conversation"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.4rem 0.75rem',
                                    background: 'var(--white)',
                                    border: '3px solid var(--border)',
                                    boxShadow: '3px 3px 0 var(--border)',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem', fontWeight: 700,
                                    color: 'var(--text)',
                                    transition: 'all 0.1s',
                                }}
                            >
                                <i className="fas fa-rotate-left" />
                                <span>Reset</span>
                            </button>
                            <button
                                className="ai-btn-neo"
                                onClick={onClose}
                                title="Close (Esc)"
                                style={{
                                    width: 38, height: 38,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--pink)',
                                    border: '3px solid var(--border)',
                                    boxShadow: '3px 3px 0 var(--border)',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    color: 'var(--pink-content)',
                                    transition: 'all 0.1s',
                                }}
                            >
                                <i className="fas fa-times" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── OFFLINE BANNER ───────────────────────────────────────── */}
                {serverOnline === false && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.55rem 1rem',
                        background: 'var(--yellow)',
                        borderBottom: '3px solid var(--border)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem', fontWeight: 700,
                        color: 'var(--text)',
                        flexShrink: 0,
                    }}>
                        <i className="fas fa-triangle-exclamation" />
                        <span>AI Assistant unavailable — please try again in a moment.</span>
                    </div>
                )}

                {/* ── MESSAGES AREA ────────────────────────────────────────── */}
                <div style={{
                    flex: 1, overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: '0.85rem',
                    padding: '1.1rem',
                    /* subtle dot-grid bg */
                    backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    backgroundAttachment: 'local',
                    opacity: 1,
                }}>
                    {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
                    {isLoading && <TypingIndicator />}
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.65rem 0.9rem',
                            background: 'var(--pink)',
                            border: '3px solid var(--border)',
                            boxShadow: '4px 4px 0 var(--border)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.82rem', fontWeight: 700,
                            color: 'var(--pink-content)',
                        }}>
                            <i className="fas fa-circle-exclamation" />
                            <span>{error}</span>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* ── QUICK QUESTIONS ──────────────────────────────────────── */}
                {messages.length <= 2 && !isLoading && (
                    <div style={{
                        display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
                        padding: '0.65rem 1rem',
                        borderTop: '3px solid var(--border)',
                        background: 'var(--white)',
                        flexShrink: 0,
                    }}>
                        {QUICK_QUESTIONS.map(q => (
                            <button
                                key={q.label}
                                className="ai-chip"
                                onClick={() => sendMessage(q.text)}
                                disabled={serverOnline === false}
                                style={{
                                    padding: '0.3rem 0.65rem',
                                    background: 'var(--white)',
                                    border: '2px solid var(--border)',
                                    boxShadow: '2px 2px 0 var(--border)',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.72rem', fontWeight: 700,
                                    color: 'var(--text)',
                                    transition: 'all 0.1s',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {q.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── INPUT AREA ───────────────────────────────────────────── */}
                <div style={{
                    borderTop: '4px solid var(--border)',
                    background: 'var(--white)',
                    flexShrink: 0,
                }}>
                    <div style={{
                        display: 'flex', gap: '0.6rem', alignItems: 'flex-end',
                        padding: '0.75rem',
                    }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <textarea
                                ref={inputRef}
                                rows={2}
                                className="ai-input"
                                placeholder="Ask about Arin's skills, projects or experience…"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                disabled={isLoading || serverOnline === false}
                                style={{
                                    width: '100%',
                                    resize: 'none',
                                    border: '3px solid var(--border)',
                                    boxShadow: '3px 3px 0 var(--border) inset',
                                    padding: '0.55rem 0.75rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.85rem',
                                    color: 'var(--text)',
                                    background: 'transparent',
                                    lineHeight: 1.5,
                                    transition: 'all 0.15s',
                                    display: 'block',
                                }}
                            />
                            {/* char count */}
                            {input.length > 0 && (
                                <span style={{
                                    position: 'absolute', bottom: 4, right: 6,
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.65rem',
                                    color: 'var(--text)',
                                    opacity: 0.4,
                                    pointerEvents: 'none',
                                }}>
                                    {input.length}
                                </span>
                            )}
                        </div>

                        {/* Send button */}
                        <button
                            className="ai-btn-neo"
                            onClick={() => sendMessage()}
                            disabled={!canSend}
                            title="Send (Enter)"
                            style={{
                                flexShrink: 0,
                                width: 48, height: 48,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: canSend ? 'var(--cyan)' : 'var(--white)',
                                border: '3px solid var(--border)',
                                boxShadow: '4px 4px 0 var(--border)',
                                cursor: canSend ? 'pointer' : 'not-allowed',
                                fontSize: '1.05rem',
                                color: canSend ? 'var(--cyan-content)' : 'var(--border)',
                                transition: 'all 0.1s',
                                opacity: canSend ? 1 : 0.45,
                            }}
                        >
                            <i className={`fas ${isLoading ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'}`} />
                        </button>
                    </div>

                    {/* Footer hint bar */}
                    <div style={{
                        borderTop: '2px solid var(--border)',
                        padding: '0.35rem 0.85rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.67rem',
                        color: 'var(--text)',
                        opacity: 0.7,
                    }}>
                        <kbd style={{
                            background: 'var(--yellow)',
                            border: '2px solid var(--border)',
                            boxShadow: '1px 1px 0 var(--border)',
                            padding: '1px 6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.67rem',
                            fontWeight: 800,
                            color: 'var(--yellow-content)',
                        }}>Enter</kbd>
                        <span>to send</span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <kbd style={{
                            background: 'var(--white)',
                            border: '2px solid var(--border)',
                            boxShadow: '1px 1px 0 var(--border)',
                            padding: '1px 6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.67rem',
                            fontWeight: 800,
                            color: 'var(--text)',
                        }}>Shift+Enter</kbd>
                        <span>new line</span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <kbd style={{
                            background: 'var(--white)',
                            border: '2px solid var(--border)',
                            boxShadow: '1px 1px 0 var(--border)',
                            padding: '1px 6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.67rem',
                            fontWeight: 800,
                            color: 'var(--text)',
                        }}>Esc</kbd>
                        <span>close</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
