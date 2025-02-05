export class Level {
    constructor() {
        this.reset();
        this.levelDesigns = {
            1: { name: 'Neon', color: '#00ff00', effect: 'pulse' },
            2: { name: 'Cyber', color: '#00ffff', effect: 'circuit' },
            3: { name: 'Crystal', color: '#ff00ff', effect: 'shimmer' },
            4: { name: 'Energy', color: '#ffff00', effect: 'particles' },
            5: { name: 'Plasma', color: '#ff0000', effect: 'wave' },
            6: { name: 'Digital', color: '#0000ff', effect: 'matrix' },
            7: { name: 'Laser', color: '#ff8000', effect: 'beam' },
            8: { name: 'Hologram', color: '#80ff80', effect: 'transparent' },
            9: { name: 'Quantum', color: '#8080ff', effect: 'phase' },
            10: { name: 'Ultimate', color: '#ffffff', effect: 'combined' }
        };
    }

    reset() {
        this.currentLevel = 1;
        this.startTime = Date.now();
        this.livesLost = 0;
        this.updateUI();
    }

    update(snakeLength) {
        const requiredLength = this.currentLevel * 10;
        
        if (snakeLength >= requiredLength) {
            this.completeLevel();
        }
    }

    completeLevel() {
        const timeTaken = (Date.now() - this.startTime) / 1000; // Convert to seconds
        const stars = this.calculateStars(timeTaken);
        
        this.showLevelComplete(stars);
        
        if (this.currentLevel < 10) {
            this.currentLevel++;
            this.startTime = Date.now();
            this.livesLost = 0;
            this.updateUI();
        } else {
            this.showGameComplete();
        }
    }

    calculateStars(timeTaken) {
        if (this.livesLost === 0) {
            return 3;
        } else if (this.livesLost === 1) {
            return 2;
        } else if (this.livesLost === 2 && timeTaken > 100) {
            return 1;
        }
        return 1;
    }

    showLevelComplete(stars) {
        // Update star display
        const starElements = document.querySelectorAll('.star');
        starElements.forEach((star, index) => {
            star.style.color = index < stars ? '#FFD700' : '#ccc';
        });
    }

    showGameComplete() {
        alert('Congratulations! You have completed all levels!');
    }

    updateUI() {
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = this.currentLevel;
        }
    }

    getCurrentDesign() {
        return this.levelDesigns[this.currentLevel];
    }

    recordLifeLost() {
        this.livesLost++;
    }

    getRequiredLength() {
        return this.currentLevel * 10;
    }
}