export class UI {
    constructor() {
        this.themes = ['default', 'dark', 'forest'];
        this.currentTheme = 0;
        this.score = 0;
        this.lives = 3;
        this.setupThemeButton();
        this.updateUI();
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.updateUI();
    }

    setupThemeButton() {
        const themeBtn = document.getElementById('themeBtn');
        themeBtn.addEventListener('click', () => this.cycleTheme());
    }

    cycleTheme() {
        this.currentTheme = (this.currentTheme + 1) % this.themes.length;
        const theme = this.themes[this.currentTheme];
        
        // Remove theme classes from body
        document.body.classList.remove('theme-dark', 'theme-forest');
        
        // Add theme class if not default
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }
    }

    updateScore(points) {
        this.score += points;
        this.updateUI();
    }

    loseLife() {
        this.lives = Math.max(0, this.lives - 1);
        this.updateUI();
    }

    gainLife() {
        this.lives++;
        this.updateUI();
    }

    updateUI() {
        // Update score and lives if elements exist
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = this.score;
        const livesEl = document.getElementById('lives');
        if (livesEl) livesEl.textContent = this.lives;
    }

    showMessage(message, duration = 2000) {
        // Create a temporary overlay message
        const overlay = document.createElement('div');
        overlay.className = 'ui-message';
        overlay.textContent = message;
        document.body.appendChild(overlay);
        setTimeout(() => document.body.removeChild(overlay), duration);
    }

    updateStars(stars) {
        // If a star element exists, update its count (dummy implementation)
        const starsEl = document.getElementById('stars');
        if (starsEl) {
            starsEl.textContent = '★'.repeat(stars);
        }
    }
}