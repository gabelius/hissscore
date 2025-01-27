let config;
let currentLevel = 1;
let gameAnimationFrame;

// Load YAML configuration
fetch('config.yaml')
    .then(response => response.text())
    .then(yamlText => {
        config = jsyaml.load(yamlText);
        initGame();
        setupEventListeners();
    })
    .catch(error => console.error('Error loading config:', error));

// Game Constants
const TILE_SIZE = config.game.tileSize;
const TILE_COUNT = config.game.tileCount;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let snake = [], food, direction;
let score = 0, hearts = 3, gameOver = false, gameStarted = false;
let colorCycle = 0, currentColorMode = 'rainbow';
let lastUpdate = 0, updateInterval = config.game.updateInterval, startTime;
let isAuto = false, inactivityTimer;

function setupEventListeners() {
    // Touch/Mouse controls
    let touchStartX = 0, touchStartY = 0;
    
    canvas.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', handleSwipe, { passive: false });
    canvas.addEventListener('mousedown', e => {
        touchStartX = e.clientX;
        touchStartY = e.clientY;
    });
    canvas.addEventListener('mouseup', handleSwipe);

    // Button controls
    document.getElementById('startBtn').addEventListener('click', () => {
        if (!gameStarted) {
            gameStarted = true;
            initGame();
            gameLoop(performance.now());
        }
    });

    document.getElementById('autoBtn').addEventListener('click', function() {
        isAuto = !isAuto;
        this.classList.toggle('active-mode');
    });

    document.getElementById('speedBtn').addEventListener('click', () => {
        updateInterval = Math.max(50, updateInterval * 0.7);
    });

    document.getElementById('colorMode').addEventListener('change', (e) => {
        currentColorMode = e.target.value;
        document.body.className = `${currentColorMode}-mode`;
    });

    // Keyboard controls
    window.addEventListener('keydown', e => {
        switch(e.key) {
            case 'ArrowUp': if(direction.y !== 1) direction = {x: 0, y: -1}; break;
            case 'ArrowDown': if(direction.y !== -1) direction = {x: 0, y: 1}; break;
            case 'ArrowLeft': if(direction.x !== 1) direction = {x: -1, y: 0}; break;
            case 'ArrowRight': if(direction.x !== -1) direction = {x: 1, y: 0}; break;
        }
    });
}

function initGame() {
    canvas.width = canvas.height = 400;
    snake = [{x: 10, y: 10}];
    direction = {x: 1, y: 0};
    score = 0;
    hearts = 3;
    gameOver = false;
    gameStarted = true;
    startTime = Date.now();
    
    placeFood();
    updateHearts();
    startRiddles();
    updateLevelBackground();
    document.getElementById('levelName').textContent = `Level 1: ${config.levels[0].name}`;
    draw();
    resetInactivityTimer();
}

// Core Game Functions
function placeFood() {
    const spawnHeart = hearts < 3 && Math.random() < 0.3;
    do {
        food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT),
            type: spawnHeart ? 'heart' : 'apple'
        };
    } while(snake.some(s => s.x === food.x && s.y === food.y));
}

function draw() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary-bg');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Snake
    snake.forEach((seg, i) => {
        ctx.fillStyle = getColor(i);
        ctx.beginPath();
        ctx.roundRect(seg.x*TILE_SIZE, seg.y*TILE_SIZE, TILE_SIZE-1, TILE_SIZE-1, 5);
        ctx.fill();
    });

    // Draw Food
    ctx.font = '24px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = food.type === 'apple' ? '#ff4757' : '#e91e63';
    ctx.fillText(food.type === 'apple' ? '🍎' : '❤️', 
        food.x*TILE_SIZE + TILE_SIZE/2, 
        food.y*TILE_SIZE + TILE_SIZE/2);
}

function updateLevelBackground() {
    const level = config.levels[currentLevel - 1];
    document.body.style.backgroundImage = `url('images/${level.background}')`;
    const levelNameElement = document.getElementById('levelName');
    levelNameElement.textContent = `Level ${currentLevel}: ${level.name}`;
    levelNameElement.classList.remove('fade-out');
    setTimeout(() => {
        levelNameElement.classList.add('fade-out');
    }, 5000);
}

function getColor(index) {
    const level = config.levels[currentLevel - 1];
    return level.snakeColors[index % level.snakeColors.length];
}

function handleCollision() {
    hearts--;
    updateHearts();
    if (hearts <= 0) {
        gameOver = true;
        alert('Game Over!');
    } else {
        snake = [{ x: 10, y: 10 }];
        direction = { x: 1, y: 0 };
    }
}

function updateHearts() {
    const heartsElement = document.getElementById('hearts');
    heartsElement.innerHTML = '❤'.repeat(hearts);
}

function nextLevel() {
    currentLevel++;
    if (currentLevel > config.levels.length) {
        alert('You have completed all levels!');
        gameOver = true;
    } else {
        updateLevelBackground();
        initGame();
    }
}

// Game Loop
function gameLoop(timestamp) {
    if(gameOver) return;
    if(timestamp - lastUpdate > updateInterval) {
        if(isAuto) autoMove();
        const head = {
            x: (snake[0].x + direction.x + TILE_COUNT) % TILE_COUNT,
            y: (snake[0].y + direction.y + TILE_COUNT) % TILE_COUNT
        };

        if(snake.some(s => s.x === head.x && s.y === head.y)) {
            handleCollision();
            return;
        }

        snake.unshift(head);
        if(head.x === food.x && head.y === food.y) {
            score += 10;
            if(food.type === 'heart') hearts++;
            placeFood();
            if (score >= config.levels[currentLevel - 1].scoreThreshold) {
                nextLevel();
            }
        } else {
            snake.pop();
        }

        document.getElementById('score').textContent = score;
        document.getElementById('timer').textContent = Math.floor((Date.now() - startTime)/1000);
        lastUpdate = timestamp;
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Auto Mode Logic
function autoMove() {
    const head = snake[0];
    const body = new Set(snake.slice(1).map(s => `${s.x},${s.y}`));
    
    const dirs = [
        {x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}
    ].filter(d => !(d.x === -direction.x && d.y === -direction.y));

    const safeDirs = dirs.filter(d => {
        const nx = (head.x + d.x + TILE_COUNT) % TILE_COUNT;
        const ny = (head.y + d.y + TILE_COUNT) % TILE_COUNT;
        return !body.has(`${nx},${ny}`);
    });

    const candidates = safeDirs.length ? safeDirs : dirs;
    const foodDir = {x: food.x - head.x, y: food.y - head.y};
    
    direction = candidates.reduce((a,b) => 
        (Math.sign(foodDir.x) === b.x + Math.sign(foodDir.y) === b.y) > 
        (Math.sign(foodDir.x) === a.x + Math.sign(foodDir.y) === a.y) ? b : a
    );
}

// Start Riddles
function startRiddles() {
    const riddleText = document.getElementById('riddleText');
    const riddleCountdown = document.getElementById('riddleCountdown');
    let riddleIndex = 0;

    function showRiddle() {
        const riddle = config.riddles[riddleIndex];
        riddleText.innerHTML = riddle.question;
        riddleCountdown.innerHTML = config.game.riddleCycleTime;
        riddleIndex = (riddleIndex + 1) % config.riddles.length;
    }

    showRiddle();
    setInterval(showRiddle, config.game.riddleCycleTime * 1000);
}

// Auto-Start System
function showAutoStart() {
    const countdown = document.getElementById('autoCountdown');
    countdown.style.display = 'block';
    document.getElementById('snakeFact').textContent = 
        config.snakeFacts[Math.floor(Math.random() * config.snakeFacts.length)];
    
    let seconds = 5;
    const timer = setInterval(() => {
        document.getElementById('countdown').textContent = seconds;
        if(seconds-- <= 0) {
            clearInterval(timer);
            countdown.style.display = 'none';
            isAuto = true;
            document.getElementById('autoBtn').classList.add('active-mode');
            initGame();
            gameLoop(0);
        }
    }, 1000);
}

// Event Listeners
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    document.getElementById('themeToggle').textContent =
        document.body.classList.contains('night-mode') ? "☀️ Day" : "🌙 Night";
});

// Initialize Game
canvas.width = canvas.height = 400;
draw();