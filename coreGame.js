
// Core game systems (GameState, FoodSystem, UISystem, Movement, Collision, Render, Level, GameOver).

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
    isPaused: false, // Add pause state
};

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

const MovementSystem = {
    isValidDirection(newDir) {
        return !(
            (newDir.x === -GameState.direction.x && newDir.y === GameState.direction.y) ||
            (newDir.x === GameState.direction.x && newDir.y === -GameState.direction.y)
        );
    },

    handleKeyboardInput(key) {
        if (!GameState.isGameStarted || GameState.isGameOver) return;
        
        // If in auto mode and any movement key is pressed, switch to manual mode
        if (GameState.isAutoMode && this.isMovementKey(key)) {
            GameState.isAutoMode = false;
            document.getElementById('autoBtn').classList.remove('active-mode');
            return;
        }
        
        // Handle movement
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

    isMovementKey(key) {
        return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(key);
    },

    // Implement A* Pathfinding
    findPathToFood(start, goal) {
        // A* algorithm implementation
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();

        const gScore = new Map();
        const fScore = new Map();

        const startKey = `${start.x},${start.y}`;
        const goalKey = `${goal.x},${goal.y}`;

        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(start, goal));

        openSet.push({ pos: start, f: fScore.get(startKey) });

        while (openSet.length > 0) {
            // Sort openSet by fScore
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift().pos;
            const currentKey = `${current.x},${current.y}`;

            if (currentKey === goalKey) {
                return this.reconstructPath(cameFrom, currentKey);
            }

            closedSet.add(currentKey);

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (closedSet.has(neighborKey)) continue;

                const tentativeG = gScore.get(currentKey) + 1;

                const existingG = gScore.get(neighborKey);
                if (existingG === undefined || tentativeG < existingG) {
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeG);
                    fScore.set(neighborKey, tentativeG + this.heuristic(neighbor, goal));

                    if (!openSet.find(item => item.pos.x === neighbor.x && item.pos.y === neighbor.y)) {
                        openSet.push({ pos: neighbor, f: fScore.get(neighborKey) });
                    }
                }
            }
        }

        // No path found
        return null;
    },

    heuristic(a, b) {
        // Manhattan distance
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    },

    getNeighbors(pos) {
        const dirs = [
            {x: 1, y: 0},
            {x: -1, y: 0},
            {x: 0, y: 1},
            {x: 0, y: -1}
        ];
        return dirs.map(dir => ({
            x: (pos.x + dir.x + GAME.TILE_COUNT) % GAME.TILE_COUNT,
            y: (pos.y + dir.y + GAME.TILE_COUNT) % GAME.TILE_COUNT
        }));
    },

    reconstructPath(cameFrom, currentKey) {
        const path = [];
        while (cameFrom.has(currentKey)) {
            const prevKey = cameFrom.get(currentKey);
            const [x, y] = prevKey.split(',').map(Number);
            path.unshift({x, y});
            currentKey = prevKey;
        }
        return path;
    },

    // Add isSafeMove method
    isSafeMove(head, moveDir) {
        const newHead = {
            x: (head.x + moveDir.x + GAME.TILE_COUNT) % GAME.TILE_COUNT,
            y: (head.y + moveDir.y + GAME.TILE_COUNT) % GAME.TILE_COUNT
        };
        return !GameState.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y);
    },
};

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
            <div class="game-over-countdown">Restarting in: <span id="countdown">10</span>s</div>
        `;
        
        container.appendChild(overlay);
        setTimeout(() => overlay.classList.add('visible'), 100);

        let count = 10;
        const countdownElement = overlay.querySelector('#countdown');
        const countdownInterval = setInterval(() => {
            count--;
            countdownElement.textContent = count;
            if (count <= 0) {
                clearInterval(countdownInterval);
                overlay.remove();
                resetInactivityTimer();
            }
        }, 1000);
    }
};

// Game initialization, update, and loop
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

function setupGame() {
    GAME.canvas.width = GAME.canvas.height = 400;
    resetGameState();
    RiddleSystem.startRiddles();
    RenderSystem.draw();
}

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

function gameLoop(timestamp) {
    if (GameState.isGameOver) {
        cancelAnimationFrame(GameState.animationFrame);
        return;
    }

    if (GameState.isPaused) {
        return; // Exit if the game is paused
    }

    if (timestamp - GameState.lastUpdate > GameState.updateInterval) {
        // Only use autoMove when auto mode is active
        if (GameState.isAutoMode && GameState.isGameStarted && !GameState.isGameOver) {
            autoMove();
        }
        updateGameState();
        RenderSystem.draw();
        GameState.lastUpdate = timestamp;
    }

    GameState.animationFrame = requestAnimationFrame(gameLoop);
}

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

function handleGameOver() {
    GameState.isGameOver = true;
    RiddleSystem.stopRiddles();
    cancelAnimationFrame(GameState.animationFrame);
    GameOverSystem.showGameOver();
}

function startGame() {
    resetGameState();
    GameState.isGameStarted = true;
    GameState.isPaused = false;

    // Change Start button to Pause icon
    document.getElementById('startBtn').textContent = '⏸️';

    RenderSystem.draw();
    gameLoop(performance.now());
}

function pauseGame() {
    GameState.isPaused = true;
    cancelAnimationFrame(GameState.animationFrame);
    // Update Start button to show Play icon
    document.getElementById('startBtn').textContent = '▶️';
}

function resumeGame() {
    GameState.isPaused = false;
    GameState.animationFrame = requestAnimationFrame(gameLoop);
    // Update Start button to show Pause icon
    document.getElementById('startBtn').textContent = '⏸️';
}

// Export what is needed in other modules
export {
    GameState,
    FoodSystem,
    UISystem,
    MovementSystem,
    CollisionSystem,
    RenderSystem,
    LevelSystem,
    GameOverSystem,
    initializeGame,
    setupGame,
    resetGameState,
    gameLoop,
    updateGameState,
    handleGameOver,
    startGame,
    pauseGame,
    resumeGame
};