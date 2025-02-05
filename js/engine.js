import { Snake } from './snake.js';
import { Food } from './food.js';
import { Level } from './level.js';
import { UI } from './ui.js';
import { Input } from './input.js';
import { Renderer } from './renderer.js';

class Engine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setCanvasSize();

        this.ui = new UI();
        this.input = new Input();
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.level = new Level();
        this.snake = new Snake();
        this.food = new Food(this.canvas.width, this.canvas.height);

        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60 FPS
        
        this.isRunning = false;
        this.isAutoPlay = false;

        this.setupEventListeners();
    }

    setCanvasSize() {
        const size = Math.min(600, window.innerWidth - 40);
        this.canvas.width = size;
        this.canvas.height = size;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.setCanvasSize());
        
        this.input.onDirectionChange((direction) => {
            if (!this.isAutoPlay) {
                this.snake.setDirection(direction);
            }
        });

        document.getElementById('startBtn').addEventListener('click', () => this.toggleGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('autoPlayBtn').addEventListener('click', () => this.toggleAutoPlay());
    }

    toggleGame() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    togglePause() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    toggleAutoPlay() {
        this.isAutoPlay = !this.isAutoPlay;
    }

    update(deltaTime) {
        if (!this.isRunning) return;

        if (this.isAutoPlay) {
            this.autoPlay();
        }

        this.snake.update(deltaTime);
        this.checkCollisions();
        this.checkFoodCollection();
        this.level.update(this.snake.segments.length);
    }

    autoPlay() {
        const snakeHead = this.snake.segments[0];
        const foodPos = this.food.position;
        
        // Simple AI: Move towards food while avoiding walls and self
        const dx = foodPos.x - snakeHead.x;
        const dy = foodPos.y - snakeHead.y;
        
        let preferredDirection;
        if (Math.abs(dx) > Math.abs(dy)) {
            preferredDirection = dx > 0 ? 'right' : 'left';
        } else {
            preferredDirection = dy > 0 ? 'down' : 'up';
        }
        
        if (this.isValidMove(preferredDirection)) {
            this.snake.setDirection(preferredDirection);
        } else {
            // Try other directions if preferred direction is not safe
            const directions = ['up', 'right', 'down', 'left'];
            for (const dir of directions) {
                if (this.isValidMove(dir)) {
                    this.snake.setDirection(dir);
                    break;
                }
            }
        }
    }

    isValidMove(direction) {
        const head = this.snake.segments[0];
        const nextPos = { x: head.x, y: head.y };
        
        switch (direction) {
            case 'up': nextPos.y--; break;
            case 'down': nextPos.y++; break;
            case 'left': nextPos.x--; break;
            case 'right': nextPos.x++; break;
        }
        
        // Check wall collision
        if (nextPos.x < 0 || nextPos.x >= this.canvas.width / this.snake.gridSize ||
            nextPos.y < 0 || nextPos.y >= this.canvas.height / this.snake.gridSize) {
            return false;
        }
        
        // Check self collision
        return !this.snake.segments.some(segment => 
            segment.x === nextPos.x && segment.y === nextPos.y
        );
    }

    checkCollisions() {
        if (this.snake.checkCollision(this.canvas.width, this.canvas.height)) {
            this.handleCollision();
        }
    }

    checkFoodCollection() {
        if (this.snake.checkFoodCollection(this.food.position)) {
            this.food.spawn(this.snake.segments);
            this.ui.updateScore(this.level.currentLevel * 10);
        }
    }

    handleCollision() {
        this.ui.loseLife();
        if (this.ui.lives <= 0) {
            this.gameOver();
        } else {
            this.snake.reset();
            this.food.spawn(this.snake.segments);
        }
    }

    gameOver() {
        this.isRunning = false;
        alert(`Game Over! Final Score: ${this.ui.score}`);
        this.snake.reset();
        this.food.spawn(this.snake.segments);
        this.ui.reset();
        this.level.reset();
    }

    gameLoop(currentTime) {
        if (!this.lastTime) this.lastTime = currentTime;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }
        
        this.renderer.render(this.snake, this.food, this.level);
        
        if (this.isRunning) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
}

// Start the game
const engine = new Engine();