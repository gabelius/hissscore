
import { GameState, RenderSystem } from './coreGame.js';

export function toggleTheme() {
    const isNightMode = document.body.classList.toggle('night-mode');
    document.getElementById('themeToggle').classList.toggle('active-mode', isNightMode);
    localStorage.setItem('nightMode', isNightMode); // Remember user preference
}

export function updateColorScheme() {
    const colorMode = document.getElementById('colorMode').value;
    document.body.className = ''; // Clear all modes
    document.body.classList.add(colorMode);
    if (document.body.classList.contains('night-mode')) {
        document.body.classList.add('night-mode');
    }
    RenderSystem.draw(); // Redraw snake with new colors
}