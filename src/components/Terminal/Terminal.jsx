import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Terminal.css';
import portfolioData from '../../data/portfolio.json';
import figlet from 'figlet';
import ansiShadow from 'figlet/importable-fonts/ANSI Shadow.js';
import smallFont from 'figlet/importable-fonts/Small.js';

figlet.parseFont('ANSI Shadow', ansiShadow);
figlet.parseFont('Small', smallFont);

const THEMES = {
    amber: {
        name: 'Amber',
        color: '#ff8c00',
        bg: '#141414',
        glow: 'rgba(255, 140, 0, 0.4)',
        border: 'rgba(255, 140, 0, 0.2)',
        highlight: '#ffb347',
        divider: '#4d3d2b'
    },
    green: {
        name: 'Matrix',
        color: '#00ff41',
        bg: '#0a0a0a',
        glow: 'rgba(0, 255, 65, 0.3)',
        border: 'rgba(0, 255, 65, 0.15)',
        highlight: '#9dffb0',
        divider: '#1a3d21'
    },
    cyan: {
        name: 'Modern',
        color: '#00f2ff',
        bg: '#0b161a',
        glow: 'rgba(0, 242, 255, 0.3)',
        border: 'rgba(0, 242, 255, 0.15)',
        highlight: '#a1f7ff',
        divider: '#1c3d40'
    },
    retro: {
        name: 'Retro',
        color: '#d1d1d1',
        bg: '#1a1a1a',
        glow: 'rgba(209, 209, 209, 0.2)',
        border: 'rgba(209, 209, 209, 0.1)',
        highlight: '#ffffff',
        divider: '#444444',
        dim: '#777777',
        success: '#f0f0f0',
        error: '#ff0000'
    }
};

const Terminal = () => {
    const [history, setHistory] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentTheme, setCurrentTheme] = useState('amber');
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const outputRef = useRef(null);
    const inputRef = useRef(null);
    const menuRef = useRef(null);
    const navigate = useNavigate();


    // Click outside handler for theme menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setThemeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        applyTheme(currentTheme);
    }, [currentTheme]);

    const applyTheme = (themeId) => {
        const theme = THEMES[themeId];
        const root = document.documentElement;
        root.style.setProperty('--term-color', theme.color);
        root.style.setProperty('--term-bg', theme.bg);
        root.style.setProperty('--term-glow', theme.glow);
        root.style.setProperty('--term-border', theme.border);
        root.style.setProperty('--term-highlight', theme.highlight || theme.color);
        root.style.setProperty('--term-divider', theme.divider || 'rgba(255,255,255,0.1)');
        root.style.setProperty('--term-dim', theme.dim || '#666666');
        root.style.setProperty('--term-success', theme.success || '#98fb98');
        root.style.setProperty('--term-error', theme.error || '#ff6b6b');
    };

    useEffect(() => {
        // Generate Dynamic ASCII Art
        const isMobile = window.innerWidth < 600;
        const fontToUse = isMobile ? 'Small' : 'ANSI Shadow';

        figlet.text(portfolioData.meta.name || 'ARIN JAIN', {
            font: fontToUse,
        }, (err, asciiArt) => {
            const welcomeLines = [
                { type: 'ascii', content: err ? (portfolioData.meta.name || 'ARIN JAIN') : asciiArt },
                { type: 'text', content: isMobile ? '────────────────────────────────' : '─────────────────────────────────────────────────', className: 'divider' },
                { type: 'text', content: isMobile ? '  Interactive Terminal Portfolio' : '              Interactive Terminal Portfolio', className: 'dim' },
                { type: 'text', content: isMobile ? `      ${portfolioData.meta.title}` : `         ${portfolioData.meta.title}`, className: 'dim' },
                { type: 'text', content: isMobile ? '────────────────────────────────' : '─────────────────────────────────────────────────', className: 'divider' },
                { type: 'text', content: "Type 'help' to see available commands", className: 'terminal-highlight' },
                { type: 'text', content: "Press 'tab' to auto-complete commands", className: 'terminal-highlight' },
                { type: 'text', content: '' }
            ];

            let currentLine = 0;
            const interval = setInterval(() => {
                if (currentLine <= welcomeLines.length) {
                    setHistory(welcomeLines.slice(0, currentLine));
                    currentLine++;
                } else {
                    clearInterval(interval);
                }
            }, 100);

            return () => clearInterval(interval);
        });

        // Hide main body scrollbar
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        inputRef.current?.focus();
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [history]);

    const availableCommands = ['help', 'about', 'experience', 'skills', 'projects', 'education', 'contact', 'clear', 'whoami', 'github', 'exit'];

    const handleTabCompletion = () => {
        const matches = availableCommands.filter(cmd => cmd.startsWith(inputValue));
        if (matches.length === 1) {
            setInputValue(matches[0]);
        }
    };

    const handleCommand = (command) => {
        const cmd = command.trim().toLowerCase();
        // ... (rest of the command logic is same)
        const args = cmd.split(' ');
        const mainCmd = args[0];

        let response = [];
        response.push({ type: 'text', content: `➜ ${cmd}`, className: 'command-text' });

        switch (mainCmd) {
            case 'help':
                response.push({ type: 'text', content: 'Available commands:', className: 'terminal-highlight' });
                response.push({ type: 'text', content: '  about      - Professional summary' });
                response.push({ type: 'text', content: '  experience - Work history' });
                response.push({ type: 'text', content: '  skills     - Technical expertise' });
                response.push({ type: 'text', content: '  projects   - View my projects' });
                response.push({ type: 'text', content: '  education  - Academic background' });
                response.push({ type: 'text', content: '  contact    - Get in touch' });
                response.push({ type: 'text', content: '  clear      - Clear terminal output' });
                response.push({ type: 'text', content: '  whoami     - Brief intro' });
                response.push({ type: 'text', content: '  exit       - Return to main page' });
                break;

            case 'about':
                response.push({ type: 'text', content: portfolioData.meta.description });
                break;

            case 'experience':
                portfolioData.experience.forEach(exp => {
                    response.push({ type: 'text', content: `\n[${exp.period}] ${exp.title}`, className: 'terminal-highlight' });
                    response.push({ type: 'text', content: `Location: ${exp.location}`, className: 'dim' });
                    response.push({ type: 'text', content: exp.description });
                });
                break;

            case 'skills':
                portfolioData.skills.forEach(skillSet => {
                    response.push({ type: 'text', content: `\n${skillSet.title}:`, className: 'terminal-highlight' });
                    response.push({ type: 'text', content: skillSet.tags.map(t => t.label).join(' • ') });
                });
                break;

            case 'projects':
                portfolioData.projects.forEach(proj => {
                    response.push({ type: 'text', content: `\n${proj.name.toUpperCase()}`, className: 'terminal-highlight' });
                    response.push({ type: 'text', content: proj.tagline, className: 'dimitalic' });
                    response.push({ type: 'text', content: proj.description });
                    response.push({ type: 'text', content: `GitHub: ${proj.githubUrl}`, className: 'dim' });
                });
                break;

            case 'education': {
                const edu = portfolioData.education;
                response.push({ type: 'text', content: `\nDEGREE: ${edu.degree}`, className: 'terminal-highlight' });
                response.push({ type: 'text', content: `SCHOOL: ${edu.school}` });
                response.push({ type: 'text', content: `PERIOD: ${edu.period} | CGPA: ${edu.cgpa}` });
                break;
            }

            case 'contact':
                response.push({ type: 'text', content: '\nCONNECT WITH ME:', className: 'terminal-highlight' });
                portfolioData.contact.forEach(c => {
                    response.push({ type: 'text', content: `${c.platform.padEnd(10)}: ${c.url}` });
                });
                break;

            case 'github':
                response.push({ type: 'text', content: `\nGitHub Username: ${portfolioData.github.username}`, className: 'terminal-highlight' });
                response.push({ type: 'text', content: `Profile: https://github.com/${portfolioData.github.username}` });
                break;

            case 'whoami':
                response.push({ type: 'text', content: `\nNAME: ${portfolioData.meta.name}`, className: 'terminal-highlight' });
                response.push({ type: 'text', content: `ROLE: ${portfolioData.meta.title}` });
                response.push({ type: 'text', content: `SITE: ${portfolioData.meta.siteUrl}` });
                break;

            case 'clear':
                setHistory([]);
                return;

            case 'exit':
                navigate('/');
                return;

            case '':
                break;

            default:
                response.push({ type: 'text', content: `Command not found: ${mainCmd}. Type 'help' for available commands.`, className: 'error-text' });
        }

        response.push({
            type: 'text',
            content: window.innerWidth < 600 ? '────────────────────────────────' : '─────────────────────────────────────────────────',
            className: 'divider'
        });

        setHistory(prev => [...prev, ...response]);
    };

    const onKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            handleTabCompletion();
        } else if (e.key === 'Enter') {
            handleCommand(inputValue);
            if (inputValue.trim()) {
                setCommandHistory(prev => [inputValue, ...prev]);
            }
            setHistoryIndex(-1);
            setInputValue('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInputValue(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInputValue(commandHistory[newIndex]);
            } else {
                setHistoryIndex(-1);
                setInputValue('');
            }
        }
    };

    return (
        <div className="terminal-route-container" onClick={() => inputRef.current?.focus()}>
            <div className="terminal-window">
                <div className="terminal-header">
                    <div className="terminal-buttons">
                        <span className="close" onClick={() => navigate('/')} title="Go back to Home"></span>
                        <span className="minimize"></span>
                        <span className="maximize"></span>
                    </div>
                    <div className="terminal-title">arin@portfolio: ~/resume</div>
                    <div className="terminal-controls">
                        <div className="theme-switcher" ref={menuRef}>
                            <button
                                className="theme-btn"
                                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                            >
                                <i className="fas fa-palette"></i> {THEMES[currentTheme].name}
                            </button>
                            {themeMenuOpen && (
                                <div className="theme-menu">
                                    {Object.entries(THEMES).map(([id, theme]) => (
                                        <button
                                            key={id}
                                            className="theme-option"
                                            onClick={() => {
                                                setCurrentTheme(id);
                                                setThemeMenuOpen(false);
                                            }}
                                        >
                                            {theme.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="terminal-content" ref={outputRef}>
                    {history.map((line, i) => (
                        <div key={i} className={`output-line ${line.className || ''}`}>
                            {line.type === 'ascii' ? <pre className="ascii-art">{line.content}</pre> : line.content}
                        </div>
                    ))}
                    <div className="input-line">
                        <span className="prompt">➜</span>
                        <input
                            ref={inputRef}
                            type="text"
                            className="terminal-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={onKeyDown}
                            autoFocus
                        />
                    </div>
                </div>
                <div className="terminal-footer">
                    <button onClick={() => navigate('/')} className="footer-link">
                        <i className="fas fa-home"></i> Back to Main Site
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Terminal;