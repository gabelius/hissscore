class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.canvas.width = Math.floor(window.innerWidth * 0.8);
        this.canvas.height = Math.floor(window.innerHeight * 0.6);
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.baseSpeed = 200;
        this.isGameOver = false;
        this.isPaused = true;
        this.isAutoMode = false;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.foodCount = 0;
        this.ghostSegment = null;
        this.particles = [];
        this.livesLost = 0;
        this.levelTime = 0;
        this.levelStartTime = Date.now();
        
        // Snake and food initialization
        this.snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 }
        ];
        this.food = { x: 10, y: 10 };
        
        // Game design
        this.foodIcons = ['restaurant', 'apple', 'egg', 'cake', 'pizza'];
        this.currentFoodIcon = 0;
        this.snakeDesigns = {
            1: { color: '#4CAF50', effect: 'none' },
            2: { color: '#2196F3', effect: 'pulse' },
            3: { color: '#9C27B0', effect: 'shimmer' },
            4: { color: '#FF9800', effect: 'circuit' },
            5: { color: '#E91E63', effect: 'pulse' },
            6: { color: '#3F51B5', effect: 'shimmer' },
            7: { color: '#009688', effect: 'circuit' },
            8: { color: '#FF5722', effect: 'pulse' },
            9: { color: '#673AB7', effect: 'shimmer' },
            10: { color: '#F44336', effect: 'circuit' }
        };
        
        this.setupEventListeners();
        this.updateLivesDisplay();
        this.initializeGame();
    }

    // Access methods for AutoPlayer
    getSnake() { return [...this.snake]; }
    getFood() { return { ...this.food }; }
    getGridSize() { return this.gridSize; }
    getCanvasSize() { return { width: this.canvas.width, height: this.canvas.height }; }
    getCurrentDirection() { return this.direction; }
    setNextDirection(dir) { this.nextDirection = dir; }

    handleCanvasClick(e) {
        if (this.isAutoMode) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.handleDirectionalInput(x, y);
    }

    handleCanvasTouch(e) {
        if (this.isAutoMode) return;
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.handleDirectionalInput(x, y);
    }

    handleDirectionalInput(x, y) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const deltaX = x - centerX;
        const deltaY = y - centerY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            this.nextDirection = deltaX > 0 ? 'right' : 'left';
        } else {
            this.nextDirection = deltaY > 0 ? 'down' : 'up';
        }
    }

    handleKeyPress(e) {
        if (this.isAutoMode) return;

        const keys = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right'
        };

        if (keys[e.key]) {
            const newDirection = keys[e.key];
            const opposites = {
                'up': 'down', 'down': 'up',
                'left': 'right', 'right': 'left'
            };

            if (opposites[this.direction] !== newDirection) {
                this.nextDirection = newDirection;
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        const touchButtons = ['upBtn', 'downBtn', 'leftBtn', 'rightBtn'];
        touchButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                ['touchstart', 'mousedown'].forEach(event => {
                    btn.addEventListener(event, () => {
                        if (!this.isAutoMode) {
                            this.nextDirection = btnId.replace('Btn', '');
                        }
                    });
                });
            }
        });

        // Add canvas click and touch events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleCanvasTouch(e));

        // Add game control button events
        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.isGameOver) {
                this.restartGame();
                return;
            }
            this.isPaused = !this.isPaused;
            document.getElementById('startBtn').innerHTML = this.isPaused ?
                '<span class="material-icons">play_arrow</span>' :
                '<span class="material-icons">pause</span>';
            if (!this.isPaused) {
                this.levelStartTime = Date.now() - (this.levelTime * 1000);
                this.gameLoop();
            }
        });

        document.getElementById('autoBtn').addEventListener('click', () => {
            this.isAutoMode = !this.isAutoMode;
            document.getElementById('autoBtn').classList.toggle('active');
        });

        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.startNextLevel();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    updateLivesDisplay() {
        const livesContainer = document.getElementById('lives');
        livesContainer.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const heart = document.createElement('span');
            heart.className = 'material-icons';
            heart.textContent = 'favorite';
            livesContainer.appendChild(heart);
        }
    }

    initializeGame() {
        this.levelStartTime = Date.now();
        this.levelTime = 0;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 }
        ];
        this.ghostSegment = null;
        this.particles = [];
        this.generateFood();
        this.updateUI();
    }

    generateFood() {
        do {
            this.food.x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
            this.food.y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
        this.currentFoodIcon = Math.floor(Math.random() * this.foodIcons.length);
    }

    calculateStars() {
        if (this.livesLost === 0) return 3;
        if (this.livesLost === 1) return 2;
        return this.levelTime <= 100 ? 2 : 1;
    }

    showLevelComplete() {
        const stars = this.calculateStars();
        document.getElementById('completedLevel').textContent = this.level;
        document.getElementById('levelTime').textContent = Math.floor(this.levelTime);
        document.getElementById('livesLeft').textContent = this.lives;
        document.getElementById('finalLength').textContent = this.snake.length;

        const starElements = document.querySelectorAll('.star-rating .star');
        starElements.forEach((star, index) => {
            star.classList.remove('filled');
            if (index < stars) {
                setTimeout(() => {
                    star.classList.add('filled');
                }, index * 200);
            }
        });

        document.getElementById('levelComplete').classList.remove('hidden');
        
        // Auto-progress in auto mode after 5 seconds
        if (this.isAutoMode) {
            setTimeout(() => {
                this.startNextLevel();
                if (!this.isGameOver) {
                    this.isPaused = false;
                    this.gameLoop();
                }
            }, 5000);
        }
    }

    startNextLevel() {
        this.level++;
        if (this.level > 10) {
            this.endGame();
            return;
        }
        
        document.getElementById('levelComplete').classList.add('hidden');
        this.initializeGame();
        this.baseSpeed = Math.max(50, 200 * Math.pow(0.9, this.level - 1));
    }

    handleKeyPress(e) {
        if (this.isAutoMode) return;

        const keys = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right'
        };

        if (keys[e.key]) {
            const newDirection = keys[e.key];
            const opposites = {
                'up': 'down', 'down': 'up',
                'left': 'right', 'right': 'left'
            };

            if (opposites[this.direction] !== newDirection) {
                this.nextDirection = newDirection;
            }
        }
    }

    moveSnake() {
        const head = { ...this.snake[0] };
        this.direction = this.nextDirection;

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if (this.checkCollision(head)) {
            this.handleCollision();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.foodCount++;
            this.score += 10;
            this.addParticles(this.food.x * this.gridSize, this.food.y * this.gridSize);
            
            if (this.foodCount % 2 === 0) {
                // Keep the current length on second food
                this.ghostSegment = null;
            } else {
                // Remove ghost segment and pop on first food
                this.ghostSegment = null;
                this.snake.pop();
            }
            
            this.generateFood();
            this.checkLevelProgress();
        } else {
            this.ghostSegment = null;
            this.snake.pop();
        }

        this.updateUI();
    }

    addParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            return p.life > 0;
        });
    }

    checkLevelProgress() {
        const requiredLength = (this.level * 10);
        if (this.snake.length >= requiredLength) {
            this.isPaused = true;
            this.showLevelComplete();
        }
    }

    drawSnakeSegment(x, y, index, isGhost = false) {
        const design = this.snakeDesigns[this.level];
        const segmentSize = this.gridSize - 2;
        const alpha = isGhost ? 0.5 : Math.max(0.4, 1 - index * 0.03);

        this.ctx.save();
        
        // Base segment
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = design.color;
        this.ctx.shadowColor = design.color;
        this.ctx.shadowBlur = 10;

        // Draw curved segment
        const px = x * this.gridSize + 1;
        const py = y * this.gridSize + 1;

        this.ctx.beginPath();
        this.ctx.roundRect(px, py, segmentSize, segmentSize, 5);
        this.ctx.fill();

        // Apply level-specific effects
        switch (design.effect) {
            case 'pulse':
                this.ctx.globalAlpha = 0.5 * Math.sin(Date.now() / 200);
                this.ctx.shadowBlur = 20;
                this.ctx.fill();
                break;
            case 'circuit':
                this.drawCircuitPattern(px, py, segmentSize);
                break;
            case 'shimmer':
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.shadowBlur = 15 * Math.sin(Date.now() / 300);
                this.ctx.fill();
                break;
            // Add more effects as needed
        }

        this.ctx.restore();
    }

    drawCircuitPattern(x, y, size) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.globalAlpha = 0.3;
        this.ctx.lineWidth = 1;
        
        const time = Date.now() / 1000;
        const offset = Math.sin(time) * 2;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y + offset);
        this.ctx.lineTo(x + size, y + size - offset);
        this.ctx.stroke();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles
        this.updateParticles();
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw food with material icon and background
        this.ctx.save();
        const foodX = this.food.x * this.gridSize + this.gridSize/2;
        const foodY = this.food.y * this.gridSize + this.gridSize/2;
        
        // Draw background circle
        this.ctx.beginPath();
        this.ctx.arc(foodX, foodY, this.gridSize/2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(244, 67, 54, 0.2)';
        this.ctx.fill();
        
        // Draw food icon
        this.ctx.fillStyle = '#F44336';
        this.ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.font = `${Math.floor(this.gridSize * 1.2)}px 'Material Icons'`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.foodIcons[this.currentFoodIcon], foodX, foodY);
        this.ctx.restore();

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.drawSnakeSegment(segment.x, segment.y, index);
        });

        // Draw ghost segment if exists
        if (this.ghostSegment) {
            this.drawSnakeSegment(this.ghostSegment.x, this.ghostSegment.y, this.snake.length, true);
        }

        if (!this.isPaused) {
            this.levelTime = (Date.now() - this.levelStartTime) / 1000;
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('length').textContent = this.snake.length;
        document.getElementById('time').textContent = Math.floor(this.levelTime);
    }

    gameLoop() {
        if (!this.isPaused && !this.isGameOver) {
            this.moveSnake();
            this.draw();
            setTimeout(() => requestAnimationFrame(() => this.gameLoop()), this.baseSpeed);
        }
    }

    handleCollision() {
        this.lives--;
        this.livesLost++;
        this.updateLivesDisplay();
        if (this.lives <= 0) {
            this.endGame();
        } else {
            this.initializeGame();
        }
    }

    endGame() {
        this.isGameOver = true;
        this.isPaused = true;
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('maxLength').textContent = this.snake.length;
    }

    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.baseSpeed = 200;
        this.isGameOver = false;
        this.isPaused = true;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.foodCount = 0;
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('startBtn').innerHTML = '<span class="material-icons">play_arrow</span>';
        this.updateLivesDisplay();
        this.initializeGame();
    }

    checkCollision(head) {
        // Check wall collision
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            return true;
        }

        // Check self collision
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SnakeGame();
});