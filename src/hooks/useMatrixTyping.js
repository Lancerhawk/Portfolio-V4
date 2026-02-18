import { useEffect } from 'react';

export function useMatrixTyping(elementId, finalText, delay = 500) {
    useEffect(() => {
        const el = document.getElementById(elementId);
        if (!el) return;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let iterations = 0;
        let interval;
        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                el.textContent = finalText
                    .split('')
                    .map((char, index) => {
                        if (index < iterations) return finalText[index];
                        if (char === ' ' || char === '👋') return char;
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');
                if (iterations >= finalText.length) clearInterval(interval);
                iterations += 1 / 3;
            }, 50);
        }, delay);
        return () => { clearTimeout(timeout); clearInterval(interval); };
    }, [elementId, finalText, delay]);
}
