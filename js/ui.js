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
        
        // Remove all theme classes
        document.body.classList.remove('theme-dark', 'theme-forest');
        
        // Add new theme class if not default
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }
    }

    updateScore(points) {
        this.score += points;
        this.updateUI();
    }

    loseLife() {
        this.lives--;
        this.updateUI();
    }

    gainLife() {
        if (this.lives < 3) {
            this.lives++;
            this.updateUI();
        }
    }

    updateUI() {
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        if (livesElement) {
            livesElement.textContent = this.lives;
        }
    }

    showMessage(message, duration = 2000) {
        const messageDiv = document.createElement('div');
        messageDiv.style.position = 'absolute';
        messageDiv.style.top = '50%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.padding = '20px';
        messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        messageDiv.style.color = 'white';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.fontSize = '24px';
        messageDiv.style.zIndex = '1000';
        messageDiv.textContent = message;

        document.querySelector('.game-container').appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, duration);
    }

    updateStars(stars) {
        const starElements = document.querySelectorAll('.star');
        starElements.forEach((star, index) => {
            star.style.opacity = index < stars ? '1' : '0.3';
        });
    }
}