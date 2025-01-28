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
    animationFrame: null,
    lastFoodCollected: null,
    autoModeDelay: 300, // Add delay between auto moves
    levelDelay: 2000,   // Add delay between levels
    foodDelay: 1000,    // Add delay between food collections
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
        document.getElementById('levelNumber').textContent = GameState.currentLevel;
        document.getElementById('levelName').textContent = level.name;
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
        
        // If we're in auto mode, pressing any key switches to manual mode
        if (GameState.isAutoMode) {
            GameState.isAutoMode = false;
            document.getElementById('autoBtn').classList.remove('active-mode');
            return;
        }
        
        const directions = {
            ArrowUp: {x: 0, y: -1},
            ArrowDown: {x: 0, y: 1},
            ArrowLeft: {x: -1, y: 0},
            ArrowRight: {x: 1, y: 0},
            'w': {x: 0, y: -1},
            's': {x: 0, y: 1},
            'a': {x: -1, y: 0},
            'd': {x: 1, y: 0}
        };

        const newDir = directions[key];
        if (newDir && this.isValidDirection(newDir)) {
            GameState.direction = newDir;
        }
    },

    // Update MovementSystem with simpler pathfinding
    findPathToFood(start, goal) {
        // Simple direct pathfinding
        const dx = goal.x - start.x;
        const dy = goal.y - start.y;
        
        // Try horizontal movement first if it's safe
        if (dx !== 0) {
            const horizontalMove = {
                x: Math.sign(dx),
                y: 0
            };
            if (this.isSafeMove(start, horizontalMove)) {
                return true;
            }
        }
        
        // Try vertical movement if horizontal isn't possible
        if (dy !== 0) {
            const verticalMove = {
                x: 0,
                y: Math.sign(dy)
            };
            if (this.isSafeMove(start, verticalMove)) {
                return true;
            }
        }
        
        // If direct path isn't safe, find any safe direction
        return this.findSafeDirection(start);
    },

    isSafeMove(pos, dir) {
        const newPos = {
            x: (pos.x + dir.x + GAME.TILE_COUNT) % GAME.TILE_COUNT,
            y: (pos.y + dir.y + GAME.TILE_COUNT) % GAME.TILE_COUNT
        };
        
        // Check if new position collides with snake
        return !GameState.snake.some(s => s.x === newPos.x && s.y === newPos.y);
    },

    findSafeDirection(pos) {
        const directions = [
            {x: 1, y: 0}, {x: 0, y: 1},
            {x: -1, y: 0}, {x: 0, y: -1}
        ];
        
        // Filter safe directions and prioritize those leading towards food
        return directions.find(dir => this.isSafeMove(pos, dir));
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
        this.drawRiddleBackground();  // Add this line
        this.drawSnake();
        this.drawFood();
    },

    clearCanvas() {
        // Make canvas semi-transparent
        GAME.ctx.clearRect(0, 0, GAME.canvas.width, GAME.canvas.height);
        GAME.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        GAME.ctx.fillRect(0, 0, GAME.canvas.width, GAME.canvas.height);
    },

    drawRiddleBackground() {
        if (!GameState.config?.riddles) return;
        const riddle = GameState.config.riddles[RiddleSystem.riddleIndex];
        if (!riddle) return;

        GAME.ctx.save();
        
        // Draw the countdown first
        GAME.ctx.font = 'bold 24px Comic Neue';
        GAME.ctx.textAlign = 'center';
        GAME.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        GAME.ctx.fillText(
            `${RiddleSystem.isShowingAnswer ? 'Answer' : 'Question'}: ${RiddleSystem.timeLeft}s`,
            GAME.canvas.width / 2,
            30
        );

        // Set up the text style
        GAME.ctx.font = 'bold 18px Comic Neue';
        GAME.ctx.textBaseline = 'middle';
        
        // Get the text to display based on current state
        const text = RiddleSystem.isShowingAnswer ? riddle.answer : riddle.question;
        
        // Split text into multiple lines
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            if (GAME.ctx.measureText(testLine).width > GAME.canvas.width - 40) {
                lines.push(currentLine);
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine);

        // Draw each line with stroke
        const lineHeight = 28;
        const startY = (GAME.canvas.height - (lines.length * lineHeight)) / 2;
        
        lines.forEach((line, index) => {
            const x = GAME.canvas.width / 2;
            const y = startY + (index * lineHeight);
            
            // Draw stroke
            GAME.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            GAME.ctx.lineWidth = 3;
            GAME.ctx.strokeText(line, x, y);
            
            // Draw text with different colors for question and answer
            GAME.ctx.fillStyle = RiddleSystem.isShowingAnswer ? 
                'rgba(255, 107, 107, 0.3)' : // Red tint for answer
                'rgba(255, 255, 255, 0.2)';  // White for question
            GAME.ctx.fillText(line, x, y);
        });

        GAME.ctx.restore();
    },

    drawSnake() {
        GameState.snake.forEach((segment, index) => {
            const colors = this.getSnakeColor(index);
            
            // Draw main body with outline
            GAME.ctx.beginPath();
            GAME.ctx.roundRect(
                segment.x * GAME.TILE_SIZE,
                segment.y * GAME.TILE_SIZE,
                GAME.TILE_SIZE - 1,
                GAME.TILE_SIZE - 1,
                5
            );
            
            // Fill with semi-transparent color
            GAME.ctx.fillStyle = colors.fill;
            GAME.ctx.fill();
            
            // Add outline
            GAME.ctx.strokeStyle = colors.outline;
            GAME.ctx.lineWidth = 2;
            GAME.ctx.stroke();
            
            // Add highlight for better visibility
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
        const defaultColors = ['#4CAF50', '#81C784', '#A5D6A7'];
        let colors;
        
        // Get color scheme based on selected mode
        const colorMode = document.getElementById('colorMode').value;
        if (colorMode && GameState.config?.colorSchemes?.[colorMode.replace('-mode', '')]) {
            colors = GameState.config.colorSchemes[colorMode.replace('-mode', '')];
        } else if (GameState.config?.levels?.[GameState.currentLevel - 1]?.snakeColors) {
            colors = GameState.config.levels[GameState.currentLevel - 1].snakeColors;
        } else {
            colors = defaultColors;
        }

        return {
            fill: colors[index % colors.length],
            outline: '#000000'
        };
    }
};

// Riddle System
const RiddleSystem = {
    riddleIndex: 0,
    animationFrame: null,
    startTime: null,
    lastUpdateTime: 0,
    QUESTION_DURATION: 10000,
    ANSWER_DURATION: 5000,
    isShowingAnswer: false,
    timeLeft: 10,

    startRiddles() {
        // Simplified to only handle state updates and animation frame
        const updateRiddle = (timestamp) => {
            if (!this.startTime) {
                this.startTime = timestamp;
                this.lastUpdateTime = timestamp;
            }
            
            const elapsed = timestamp - this.startTime;
            
            // Update state and force redraw every second
            if (timestamp - this.lastUpdateTime >= 1000) {
                this.lastUpdateTime = timestamp;
                
                if (!GameState.config?.riddles) return;

                if (elapsed < this.QUESTION_DURATION) {
                    this.timeLeft = Math.ceil((this.QUESTION_DURATION - elapsed) / 1000);
                    this.isShowingAnswer = false;
                } else if (elapsed < this.QUESTION_DURATION + this.ANSWER_DURATION) {
                    this.timeLeft = Math.ceil((this.QUESTION_DURATION + this.ANSWER_DURATION - elapsed) / 1000);
                    this.isShowingAnswer = true;
                } else {
                    this.startTime = timestamp;
                    this.riddleIndex = (this.riddleIndex + 1) % GameState.config.riddles.length;
                    this.isShowingAnswer = false;
                    this.timeLeft = 10;
                }
                
                RenderSystem.draw(); // Force canvas redraw
            }

            if (!GameState.isGameOver) {
                this.animationFrame = requestAnimationFrame(updateRiddle);
            }
        };

        this.startTime = null;
        this.lastUpdateTime = 0;
        this.timeLeft = 10;
        this.animationFrame = requestAnimationFrame(updateRiddle);
    },

    stopRiddles() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.startTime = null;
        this.lastUpdateTime = 0;
        this.riddleIndex = 0;
        this.isShowingAnswer = false;
        this.timeLeft = 10;
    }
};

// Add LevelSystem module
const LevelSystem = {
    nextLevel() {
        const nextLevelIndex = GameState.currentLevel;
        if (nextLevelIndex >= GameState.config.levels.length) {
            alert('Congratulations! You\'ve completed all levels!');
            handleGameOver();
            return;
        }

        // Store current state
        const savedScore = GameState.score;
        
        // Reset snake state
        GameState.snake = [{x: 10, y: 10}];
        GameState.direction = {x: 1, y: 0};
        GameState.currentLevel = nextLevelIndex + 1;
        GameState.updateInterval = Math.max(50, GameState.updateInterval * 0.9);
        GameState.lastUpdate = performance.now();
        GameState.lastFoodCollected = Date.now(); // Reset food collection timer
        
        // Restore score
        GameState.score = savedScore;
        
        // Update game state
        setTimeout(() => {
            FoodSystem.spawnFood();
            UISystem.updateUI();
        }, 500); // Add delay before spawning new food
    },

    checkLevelProgress() {
        if (!GameState.config?.levels) return false;
        const currentLevel = GameState.config.levels[GameState.currentLevel - 1];
        return currentLevel && GameState.score >= currentLevel.scoreThreshold;
    }
};

// Add GameOverSystem module
const GameOverSystem = {
    messages: [
        "🐍 Even the wisest snake knows when to start anew!",
        "🌟 In the cosmic dance of snake and apple, you were magnificent!",
        "🎮 Game over? More like a temporary pause in your epic journey!",
        "🌈 Like a snake shedding its skin, you'll emerge stronger!",
        "🔄 The circle of life continues... right after this countdown!"
    ],

    facts: [
        "Did you know? Snakes can climb trees! 🌳",
        "Fun fact: Snakes don't need coffee to stay alert! ☕",
        "Snake wisdom: The best path isn't always the shortest! 🛣️",
        "Ancient secret: Snakes invented the zigzag pattern! ↝",
        "Pro tip: Even the best snakes take breaks! 😴"
    ],

    showGameOver() {
        const container = document.getElementById('gameContainer');
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        
        const message = this.messages[Math.floor(Math.random() * this.messages.length)];
        const fact = this.facts[Math.floor(Math.random() * this.facts.length)];
        
        overlay.innerHTML = `
            <div class="game-over-message">${message}</div>
            <div class="game-over-score">Score: ${GameState.score}</div>
            <div class="game-over-message">${fact}</div>
            <div class="game-over-countdown">Restarting in: 10</div>
        `;
        
        container.appendChild(overlay);
        setTimeout(() => overlay.classList.add('visible'), 100);

        // Wait 10 seconds before countdown
        setTimeout(() => {
            let count = 10;
            const countdownEl = overlay.querySelector('.game-over-countdown');
            
            const countdown = setInterval(() => {
                count--;
                countdownEl.textContent = `Restarting in: ${count}`;
                
                if (count <= 0) {
                    clearInterval(countdown);
                    overlay.classList.remove('visible');
                    setTimeout(() => {
                        overlay.remove();
                        resetGameState();
                        startGame();
                    }, 500);
                }
            }, 1000);
        }, 10000);
    }
};

// Game Loop
function gameLoop(timestamp) {
    if (GameState.isGameOver) {
        cancelAnimationFrame(GameState.animationFrame);
        return;
    }

    if (timestamp - GameState.lastUpdate > GameState.updateInterval) {
        if (GameState.isAutoMode && GameState.isGameStarted && !GameState.isGameOver) {
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
    if (GameState.isGameOver || !GameState.isGameStarted) return;

    const head = {
        x: (GameState.snake[0].x + GameState.direction.x + GAME.TILE_COUNT) % GAME.TILE_COUNT,
        y: (GameState.snake[0].y + GameState.direction.y + GAME.TILE_COUNT) % GAME.TILE_COUNT
    };

    // Check collision first
    if (CollisionSystem.checkCollision(head)) {
        CollisionSystem.handleCollision();
        return;
    }

    // Check if next position will collect food
    const willCollectFood = (head.x === GameState.food.x && head.y === GameState.food.y);
    
    // Move snake
    GameState.snake.unshift(head);
    
    // Handle food collection immediately
    if (willCollectFood) {
        GameState.score += 10;
        if (GameState.food.type === 'heart' && GameState.hearts < 3) {
            GameState.hearts++;
        }
        
        UISystem.updateUI();
        
        // Check level progression
        if (LevelSystem.checkLevelProgress()) {
            LevelSystem.nextLevel();
        } else {
            // Spawn new food immediately but in a new position
            FoodSystem.spawnFood();
        }
    } else {
        GameState.snake.pop();
    }

    document.getElementById('score').textContent = GameState.score;
    document.getElementById('timer').textContent = 
        Math.floor((Date.now() - GameState.startTime)/1000);
}

// Update Event Listeners Setup
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        MovementSystem.handleKeyboardInput(e.key);
    });

    // Auto mode toggle with proper state handling and visual feedback
    document.getElementById('autoBtn').addEventListener('click', () => {
        const autoBtn = document.getElementById('autoBtn');
        
        // Always toggle the mode state
        GameState.isAutoMode = !GameState.isAutoMode;
        
        // Update button appearance
        autoBtn.classList.toggle('active-mode', GameState.isAutoMode);
        
        if (!GameState.isGameStarted) {
            // If game hasn't started, start it
            startGame();
        } else {
            // If game is running, handle mode switch
            if (!GameState.isAutoMode) {
                // Store current direction when switching to manual
                const currentDir = { ...GameState.direction };
                setTimeout(() => {
                    GameState.direction = currentDir;
                }, 50);
            }
        }
    });

    // Start button
    document.getElementById('startBtn').addEventListener('click', () => {
        if (!GameState.isGameStarted) {
            GameState.isAutoMode = false;
            document.getElementById('autoBtn').classList.remove('active-mode');
            startGame();
        }
    });

    // Speed button
    document.getElementById('speedBtn').addEventListener('click', () => {
        GameState.updateInterval = Math.max(50, GameState.updateInterval * 0.7);
    });

    // Theme toggle with proper state management
    document.getElementById('themeToggle').addEventListener('click', () => {
        const isNightMode = document.body.classList.toggle('night-mode');
        document.getElementById('themeToggle').classList.toggle('active-mode', isNightMode);
        localStorage.setItem('nightMode', isNightMode); // Remember user preference
    });

    // Color mode with immediate update
    document.getElementById('colorMode').addEventListener('change', (e) => {
        document.body.className = ''; // Clear all modes
        document.body.classList.add(e.target.value);
        if (document.body.classList.contains('night-mode')) {
            document.body.classList.add('night-mode');
        }
        RenderSystem.draw(); // Redraw snake with new colors
    });
}

// Add new function to handle game start
function startGame() {
    resetGameState();
    GameState.isGameStarted = true;
    GameState.isGameOver = false;
    GameState.lastUpdate = performance.now();
    GameState.startTime = Date.now();
    
    // Update auto button visual state
    document.getElementById('autoBtn').classList.toggle('active-mode', GameState.isAutoMode);
    
    RenderSystem.draw();
    gameLoop(performance.now());
}

// Update autoMove function with simpler, more direct pathfinding
function autoMove() {
    const head = GameState.snake[0];
    if (!GameState.food) return;
    
    // Direct path to food
    const directPath = {
        x: GameState.food.x - head.x,
        y: GameState.food.y - head.y
    };
    
    // Choose the largest distance to move in that direction
    if (Math.abs(directPath.x) > Math.abs(directPath.y)) {
        // Try moving horizontally
        const horizontalMove = { x: Math.sign(directPath.x), y: 0 };
        if (MovementSystem.isSafeMove(head, horizontalMove)) {
            GameState.direction = horizontalMove;
            return;
        }
        // If horizontal isn't safe, try vertical
        const verticalMove = { x: 0, y: Math.sign(directPath.y) };
        if (MovementSystem.isSafeMove(head, verticalMove)) {
            GameState.direction = verticalMove;
        }
    } else {
        // Try moving vertically
        const verticalMove = { x: 0, y: Math.sign(directPath.y) };
        if (MovementSystem.isSafeMove(head, verticalMove)) {
            GameState.direction = verticalMove;
            return;
        }
        // If vertical isn't safe, try horizontal
        const horizontalMove = { x: Math.sign(directPath.x), y: 0 };
        if (MovementSystem.isSafeMove(head, horizontalMove)) {
            GameState.direction = horizontalMove;
        }
    }
}

// Update handleGameOver function
function handleGameOver() {
    GameState.isGameOver = true;
    RiddleSystem.stopRiddles();
    cancelAnimationFrame(GameState.animationFrame);
    GameOverSystem.showGameOver();
}

// Add auto-start functionality
function resetInactivityTimer() {
    clearTimeout(GameState.inactivityTimer);
    if (!GameState.isGameStarted) {
        GameState.inactivityTimer = setTimeout(() => {
            GameState.isAutoMode = true;
            document.getElementById('autoBtn').classList.add('active-mode');
            startGame();
        }, 5000); // 5 seconds
    }
}

// Initialize the game
window.addEventListener('load', () => {
    initializeGame();
    resetInactivityTimer();
});

// Initialize the game
initializeGame();