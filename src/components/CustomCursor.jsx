import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [hovering, setHovering] = useState(false);
    const [clicked, setClicked] = useState(false);
    const location = useLocation();
    const isTerminal = location.pathname === '/terminal';

    useEffect(() => {
        const moveMouse = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseDown = () => setClicked(true);
        const handleMouseUp = () => setClicked(false);

        const handleMouseOver = (e) => {
            if (e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'A' ||
                e.target.closest('button') ||
                window.getComputedStyle(e.target).cursor === 'pointer') {
                setHovering(true);
            } else {
                setHovering(false);
            }
        };

        window.addEventListener('mousemove', moveMouse);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <div className={`cursor-container ${isTerminal ? 'terminal-mode' : ''} ${hovering ? 'hovering' : ''} ${clicked ? 'clicked' : ''}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`
            }}>
            <div className="cursor-dot" />
            <div className="cursor-ring" />
        </div>
    );
}
