import { GameSystem } from './GameSystem.js';
import { GAME } from '../script.js';

export const RenderSystem = {
    draw() {
        this.clearCanvas();
        this.drawSnake();
        this.drawFood();
        this.updateHUD();
    },

    clearCanvas() {
        GAME.ctx.clearRect(0, 0, GAME.canvas.width, GAME.canvas.height);
        GAME.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        GAME.ctx.fillRect(0, 0, GAME.canvas.width, GAME.canvas.height);
    },

    drawSnake() {
        GameSystem.state.snake.forEach((segment, index) => {
            const colors = this.getSnakeColor(index);
            
            GAME.ctx.beginPath();
            GAME.ctx.roundRect(
                segment.x * GAME.TILE_SIZE,
                segment.y * GAME.TILE_SIZE,
                GAME.TILE_SIZE - 1,
                GAME.TILE_SIZE - 1,
                5
            );
            
            GAME.ctx.fillStyle = colors.fill;
            GAME.ctx.fill();
            GAME.ctx.strokeStyle = colors.outline;
            GAME.ctx.lineWidth = 2;
            GAME.ctx.stroke();
            
            // Add highlight
            GAME.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            GAME.ctx.beginPath();
            GAME.ctx.roundRect(
                segment.x * GAME.TILE_SIZE + 2,
                segment.y * GAME.TILE_SIZE + 2,
                (GAME.TILE_SIZE - 1) / 2,
                (GAME.TILE_SIZE - 1) / 2,
                3
            );
            GAME.ctx.fill();
        });
    },

    drawFood() {
        if (!GameSystem.state.food) return;
        
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
