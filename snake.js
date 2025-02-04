class SnakeGame {
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
                    btn.addEventListener(event, (e) => {

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
            
            if (this.foodCount % 2 === 1) {
                // First food of pair - create ghost segment
                this.ghostSegment = this.snake[this.snake.length - 1];
            } else {
                // Second food - solidify ghost segment
                this.ghostSegment = null;
            }
            
            this.generateFood();
            this.checkLevelProgress();
        } else {
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

        // Draw food with material icon
        this.ctx.save();
        this.ctx.fillStyle = '#F44336';
        this.ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.font = `${this.gridSize}px 'Material Icons'`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const foodX = this.food.x * this.gridSize + this.gridSize/2;
        const foodY = this.food.y * this.gridSize + this.gridSize/2;
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
}

// Initialize game
const game = new SnakeGame();