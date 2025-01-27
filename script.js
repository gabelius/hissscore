// Game Configuration and State Management
const GameState = {
    config: null,
    currentLevel: 1,
    snake: [],
    food: null,
    direction: {x: 1, y: 0},
    score: 0,
    hearts: 3,
    isGameOver: false,
    isGameStarted: false,
    isAutoMode: false,
    lastUpdate: 0,
    updateInterval: 150,
    startTime: null,
    inactivityTimer: null,
    animationFrame: null
};

// Game Constants
const GAME = {
    TILE_SIZE: 20,
    TILE_COUNT: 20,
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d')
};

// Food System
const FoodSystem = {
    spawnFood() {
        const spawnHeart = GameState.hearts < 3 && Math.random() < 0.3;
        do {
            GameState.food = {
                x: Math.floor(Math.random() * GAME.TILE_COUNT),
                y: Math.floor(Math.random() * GAME.TILE_COUNT),
                type: spawnHeart ? 'heart' : 'apple'
            };
        } while(GameState.snake.some(s => 
            s.x === GameState.food.x && s.y === GameState.food.y));
    }
};

// UI System
const UISystem = {
    updateUI() {
        this.updateHearts();
        this.updateScore();
        this.updateLevel();
    },

    updateHearts() {
        const heartsElement = document.getElementById('hearts');
        heartsElement.innerHTML = '❤'.repeat(GameState.hearts);
    },

    updateScore() {
        document.getElementById('score').textContent = GameState.score;
    },

    updateLevel() {
        const level = GameState.config?.levels[GameState.currentLevel - 1];
        if (!level) return;

        document.body.style.backgroundImage = `url('${level.background}')`;
        const levelNameElement = document.getElementById('levelName');
        levelNameElement.textContent = `Level ${GameState.currentLevel}: ${level.name}`;
        levelNameElement.classList.remove('fade-out');
        void levelNameElement.offsetWidth;
        setTimeout(() => levelNameElement.classList.add('fade-out'), 5000);
    }
};

// Game Initialization
async function initializeGame() {
    try {
        const response = await fetch('config.yaml');
        const yamlText = await response.text();
        GameState.config = jsyaml.load(yamlText);
        setupGame();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
}

// Core Game Setup
function setupGame() {
    GAME.canvas.width = GAME.canvas.height = 400;
    resetGameState();
    RiddleSystem.startRiddles();
    RenderSystem.draw();
}

// Game State Management
function resetGameState() {
    Object.assign(GameState, {
        snake: [{x: 10, y: 10}],
        direction: {x: 1, y: 0},
        score: 0,
        hearts: 3,
        isGameOver: false,
        startTime: Date.now(),
        currentLevel: 1,
        updateInterval: GameState.config?.game.updateInterval || 150
    });
    FoodSystem.spawnFood();
    UISystem.updateUI();
}

// Movement and Control System
const MovementSystem = {
    isValidDirection(newDir) {
        return !(
            (newDir.x === -GameState.direction.x && newDir.y === GameState.direction.y) ||
            (newDir.x === GameState.direction.x && newDir.y === -GameState.direction.y)
        );
    },

    handleKeyboardInput(key) {
        if (!GameState.isGameStarted || GameState.isGameOver) return;
        
        const directions = {
            ArrowUp: {x: 0, y: -1},
            ArrowDown: {x: 0, y: 1},
            ArrowLeft: {x: -1, y: 0},
            ArrowRight: {x: 1, y: 0}
        };

        const newDir = directions[key];
        if (newDir && this.isValidDirection(newDir)) {
            GameState.direction = newDir;
        }
    },

    // A* Pathfinding for Auto Mode
    findPathToFood() {
        // ... existing A* pathfinding code ...
    },

    getSafeMoves(head) {
        return [
            {x: 1, y: 0}, {x: -1, y: 0},
            {x: 0, y: 1}, {x: 0, y: -1}
        ].filter(dir => {
            const newPos = {
                x: (head.x + dir.x + GAME.TILE_COUNT) % GAME.TILE_COUNT,
                y: (head.y + dir.y + GAME.TILE_COUNT) % GAME.TILE_COUNT
            };
            return !GameState.snake.some(s => s.x === newPos.x && s.y === newPos.y);
        });
    },

    findPathToFood(start, goal) {
        // Implement A* pathfinding here
        // For now, return direct path to food
        return [start, goal];
    }
};

// Collision Detection System
const CollisionSystem = {
    checkCollision(head) {
        return GameState.snake.some(s => s.x === head.x && s.y === head.y);
    },

    handleCollision() {
        GameState.hearts--;
        if (GameState.hearts <= 0) {
            handleGameOver();
            return;
        }

        this.respawnSnake();
    },

    respawnSnake() {
        GameState.snake = [{ x: 10, y: 10 }];
        GameState.direction = { x: 1, y: 0 };
        GameState.lastUpdate = performance.now();
        FoodSystem.spawnFood();
    }
};

// Rendering System
const RenderSystem = {
    draw() {
        this.clearCanvas();
        this.drawSnake();
        this.drawFood();
    },

    clearCanvas() {
        GAME.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary-bg');
        GAME.ctx.fillRect(0, 0, GAME.canvas.width, GAME.canvas.height);
    },

    drawSnake() {
        GameState.snake.forEach((segment, index) => {
            GAME.ctx.fillStyle = this.getSnakeColor(index);
            GAME.ctx.beginPath();
            GAME.ctx.roundRect(
                segment.x * GAME.TILE_SIZE,
                segment.y * GAME.TILE_SIZE,
                GAME.TILE_SIZE - 1,
                GAME.TILE_SIZE - 1,
                5
            );
            GAME.ctx.fill();
        });
    },

    drawFood() {
        if (!GameState.food) return;
        
        GAME.ctx.font = '24px system-ui';
        GAME.ctx.textAlign = 'center';
        GAME.ctx.textBaseline = 'middle';
        GAME.ctx.fillStyle = GameState.food.type === 'apple' ? '#ff4757' : '#e91e63';
        GAME.ctx.fillText(
            GameState.food.type === 'apple' ? '🍎' : '❤️',
            GameState.food.x * GAME.TILE_SIZE + GAME.TILE_SIZE/2,
            GameState.food.y * GAME.TILE_SIZE + GAME.TILE_SIZE/2
        );
    },

    getSnakeColor(index) {
        // ... existing color logic ...
    }
};

// Riddle System
const RiddleSystem = {
    riddleIndex: 0,
    intervalId: null,
    QUESTION_DURATION: 10000, // 10 seconds
    ANSWER_DURATION: 5000,    // 5 seconds
    isShowingAnswer: false,

    startRiddles() {
        const container = document.getElementById('riddleText');
        const timerElement = document.getElementById('riddleCountdown');
        
        // Create permanent DOM elements
        container.innerHTML = `
            <div class="riddle-text"></div>
            <div class="riddle-answer"></div>
        `;
        
        const textElement = container.querySelector('.riddle-text');
        const answerElement = container.querySelector('.riddle-answer');

        const showRiddle = () => {
            if (!GameState.config?.riddles) return;
            
            const riddle = GameState.config.riddles[this.riddleIndex];
            this.isShowingAnswer = false;
            
            // Show question
            textElement.textContent = riddle.question;
            textElement.classList.remove('fade-out');
            answerElement.classList.remove('fade-in');
            
            // Start question timer
            let timeLeft = this.QUESTION_DURATION / 1000;
            const updateTimer = () => {
                if (timeLeft > 0) {
                    timerElement.textContent = timeLeft;
                    timeLeft--;
                    setTimeout(updateTimer, 1000);
                }
            };
            updateTimer();

            // Show answer after question duration
            setTimeout(() => {
                this.isShowingAnswer = true;
                textElement.classList.add('fade-out');
                answerElement.textContent = riddle.answer;
                answerElement.classList.add('fade-in');
                
                // Update timer for answer duration
                timeLeft = this.ANSWER_DURATION / 1000;
                const updateAnswerTimer = () => {
                    if (timeLeft > 0) {
                        timerElement.textContent = timeLeft;
                        timeLeft--;
                        setTimeout(updateAnswerTimer, 1000);
                    }
                };
                updateAnswerTimer();
            }, this.QUESTION_DURATION);

            // Schedule next riddle
            setTimeout(() => {
                this.riddleIndex = (this.riddleIndex + 1) % GameState.config.riddles.length;
                showRiddle();
            }, this.QUESTION_DURATION + this.ANSWER_DURATION);
        };

        showRiddle();
    },

    stopRiddles() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
};

// Game Loop
function gameLoop(timestamp) {
    if (GameState.isGameOver) {
        cancelAnimationFrame(GameState.animationFrame);
        return;
    }

    if (timestamp - GameState.lastUpdate > GameState.updateInterval) {
        if (GameState.isAutoMode) {
            autoMove();
        }
        updateGameState();
        RenderSystem.draw();
        GameState.lastUpdate = timestamp;
    }

    GameState.animationFrame = requestAnimationFrame(gameLoop);
}

// Update game state
function updateGameState() {
    if (GameState.isGameOver) return;

    const head = {
        x: (GameState.snake[0].x + GameState.direction.x + GAME.TILE_COUNT) % GAME.TILE_COUNT,
        y: (GameState.snake[0].y + GameState.direction.y + GAME.TILE_COUNT) % GAME.TILE_COUNT
    };

    if (CollisionSystem.checkCollision(head)) {
        CollisionSystem.handleCollision();
        return;
    }

    GameState.snake.unshift(head);
    
    if (head.x === GameState.food.x && head.y === GameState.food.y) {
        GameState.score += 10;
        if (GameState.food.type === 'heart' && GameState.hearts < 3) GameState.hearts++;
        UISystem.updateUI();
        FoodSystem.spawnFood();
        
        if (GameState.score >= GameState.config.levels[GameState.currentLevel - 1].scoreThreshold) {
            nextLevel();
        }
    } else {
        GameState.snake.pop();
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Button controls
    document.getElementById('startBtn').addEventListener('click', () => {
        GameState.isAutoMode = false;
        startGame();
    });

    document.getElementById('autoBtn').addEventListener('click', () => {
        GameState.isAutoMode = true;
        startGame();
    });

    // ...rest of event listeners...
}

// Add new function to handle game start
function startGame() {
    if (!GameState.isGameStarted || GameState.isGameOver) {
        resetGameState();
        GameState.isGameStarted = true;
        GameState.isGameOver = false;
        GameState.lastUpdate = performance.now();
        gameLoop(performance.now());
        
        // Update UI to reflect auto mode
        if (GameState.isAutoMode) {
            document.getElementById('autoBtn').classList.add('active-mode');
        } else {
            document.getElementById('autoBtn').classList.remove('active-mode');
        }
    }
}

// Update autoMove function to use A* pathfinding
function autoMove() {
    const head = GameState.snake[0];
    const path = MovementSystem.findPathToFood(head, GameState.food);
    
    if (path && path.length > 1) {
        const nextMove = path[1];
        GameState.direction = {
            x: nextMove.x - head.x,
            y: nextMove.y - head.y
        };
    } else {
        // Fallback movement
        const safeMoves = MovementSystem.getSafeMoves(head);
        if (safeMoves.length > 0) {
            GameState.direction = safeMoves[Math.floor(Math.random() * safeMoves.length)];
        }
    }
}

// Add cleanup on game over
function handleGameOver() {
    GameState.isGameOver = true;
    RiddleSystem.stopRiddles();
    cancelAnimationFrame(GameState.animationFrame);
    alert('Game Over!');
}

// Initialize the game
initializeGame();