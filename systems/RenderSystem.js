import { GameSystem } from './GameSystem.js';
// Remove GAME import, it will be available globally

export const RenderSystem = {
    lastDrawnState: null, // Cache last state

    draw() {
        // Skip if nothing changed
        if (this.stateUnchanged()) return;

        if (!window.GAME?.ctx) {
            console.error('No canvas context');
            return;
        }
        
        //console.log('Drawing with state:', GameSystem.state);
        
        this.clearCanvas();
        this.drawBackground();
        this.drawSnake();
        this.drawFood();
        this.updateHUD();
        
        if (GameSystem.state.isGameOver) {
            this.drawGameOver();
        }

        this.cacheCurrentState();
    },

    stateUnchanged() {
        if (!this.lastDrawnState) return false;
        return JSON.stringify(GameSystem.state) === JSON.stringify(this.lastDrawnState);
    },

    cacheCurrentState() {
        this.lastDrawnState = JSON.parse(JSON.stringify(GameSystem.state));
    },

    clearCanvas() {
        if (!GAME.ctx) return;
        GAME.ctx.clearRect(0, 0, GAME.canvas.width, GAME.canvas.height);
    },

    drawBackground() {
        const level = GameSystem.state.config?.levels[GameSystem.state.currentLevel - 1];
        if (level?.background) {
            const img = GAME.assets.images.get(level.background);
            if (img) {
                GAME.ctx.globalAlpha = 0.2;  // Make background more subtle
                GAME.ctx.drawImage(img, 0, 0, GAME.canvas.width, GAME.canvas.height);
                GAME.ctx.globalAlpha = 1;
                
                // Add semi-transparent overlay
                GAME.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                GAME.ctx.fillRect(0, 0, GAME.canvas.width, GAME.canvas.height);
            }
        }
    },

    drawSnake() {
        if (!GameSystem.state.snake) return;
        
        GameSystem.state.snake.forEach((segment, index) => {
            GAME.ctx.beginPath();
            
            // Special handling for head
            if (index === 0) {
                this.drawSnakeHead(segment);
            } else {
                this.drawSnakeSegment(segment, index);
            }
        });
    },

    drawSnakeHead(head) {
        GAME.ctx.beginPath();
        GAME.ctx.roundRect(
            head.x * GAME.TILE_SIZE,
            head.y * GAME.TILE_SIZE,
            GAME.TILE_SIZE - 1,
            GAME.TILE_SIZE - 1,
            8  // Larger radius for head
        );
        
        const currentLevel = GameSystem.state.config?.levels[GameSystem.state.currentLevel - 1];
        const headColor = currentLevel?.snakeColors?.[0] || '#4CAF50';
        
        // Add gradient effect for head
        const gradient = GAME.ctx.createRadialGradient(
            head.x * GAME.TILE_SIZE + GAME.TILE_SIZE/2,
            head.y * GAME.TILE_SIZE + GAME.TILE_SIZE/2,
            0,
            head.x * GAME.TILE_SIZE + GAME.TILE_SIZE/2,
            head.y * GAME.TILE_SIZE + GAME.TILE_SIZE/2,
            GAME.TILE_SIZE/2
        );
        gradient.addColorStop(0, headColor);
        gradient.addColorStop(1, this.darkenColor(headColor, 20));
        
        GAME.ctx.fillStyle = gradient;
        GAME.ctx.fill();
        GAME.ctx.strokeStyle = '#000000';
        GAME.ctx.lineWidth = 2;
        GAME.ctx.stroke();
    },

    drawSnakeSegment(segment, index) {
        GAME.ctx.beginPath();
        GAME.ctx.roundRect(
            segment.x * GAME.TILE_SIZE,
            segment.y * GAME.TILE_SIZE,
            GAME.TILE_SIZE - 1,
            GAME.TILE_SIZE - 1,
            5
        );
        
        // Use level-based colors
        const currentLevel = GameSystem.state.config?.levels[GameSystem.state.currentLevel - 1];
        const snakeColor = currentLevel?.snakeColors?.[index % (currentLevel.snakeColors.length || 1)] || '#4CAF50';
        
        GAME.ctx.fillStyle = snakeColor;
        GAME.ctx.fill();
        GAME.ctx.strokeStyle = '#000000';
        GAME.ctx.lineWidth = 2;
        GAME.ctx.stroke();
    },

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) - amt,
            G = (num >> 8 & 0x00FF) - amt,
            B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
    },

    drawFood() {
        if (!GameSystem.state.food) return;
        
        // Don't draw if it's a heart and not visible (during blink)
        if (GameSystem.state.food.type === 'heart' && !GameSystem.state.food.isVisible) {
            return;
        }

        GAME.ctx.font = '24px system-ui';
        GAME.ctx.textAlign = 'center';
        GAME.ctx.textBaseline = 'middle';
        GAME.ctx.fillStyle = GameSystem.state.food.type === 'apple' ? '#ff4757' : '#e91e63';
        GAME.ctx.fillText(
            GameSystem.state.food.type === 'apple' ? '🍎' : '❤️',
            GameSystem.state.food.x * GAME.TILE_SIZE + GAME.TILE_SIZE/2,
            GameSystem.state.food.y * GAME.TILE_SIZE + GAME.TILE_SIZE/2
        );
    },

    updateHUD() {
        document.getElementById('score').textContent = GameSystem.state.score;
        document.getElementById('hearts').textContent = '❤'.repeat(GameSystem.state.hearts);
        document.getElementById('timer').textContent = 
            Math.floor((Date.now() - GameSystem.state.startTime)/1000);
    },

    drawGameOver() {
        GAME.ctx.save();
        GAME.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        GAME.ctx.fillRect(0, 0, GAME.canvas.width, GAME.canvas.height);
        
        GAME.ctx.fillStyle = '#fff';
        GAME.ctx.font = 'bold 24px Comic Neue';
        GAME.ctx.textAlign = 'center';
        GAME.ctx.textBaseline = 'middle';
        
        const centerY = GAME.canvas.height / 2;
        GAME.ctx.fillText('Game Over!', GAME.canvas.width/2, centerY - 30);
        GAME.ctx.fillText(`Score: ${GameSystem.state.score}`, GAME.canvas.width/2, centerY + 10);
        GAME.ctx.restore();
    },

    getSnakeColor(index) {
        const scheme = document.body.className || 'rainbow-mode';
        const colors = GameSystem.state.config?.colorSchemes[scheme.replace('-mode', '')] || 
                      GameSystem.state.config?.levels[GameSystem.state.currentLevel - 1]?.snakeColors;
        return {
            fill: colors?.[index % colors.length] || '#4CAF50',
            outline: '#000000'
        };
    },

    setupThemes() {
        this.setupThemeListeners();
        this.applyStoredTheme();
    },

    // Theme event handlers...
    // ...existing theme code...
};
