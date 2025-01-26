let config;

// Load YAML configuration
fetch('config.yaml')
    .then(response => response.text())
    .then(yamlText => {
        config = jsyaml.load(yamlText); // Parse YAML
        initGame(); // Start the game after loading config
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

// Initialize Game
function initGame() {
    canvas.width = canvas.height = 400;
    snake = [{x: 10, y: 10}];
    direction = {x: 1, y: 0};
    score = hearts = 0;
    gameOver = false;
    gameStarted = true;
    startTime = Date.now();
    placeFood();
    updateHearts();
    startRiddles();
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

// Riddle System
let riddleIndex = 0, riddleInterval;
function startRiddles() {
    showRiddle();
    riddleInterval = setInterval(() => {
        document.getElementById('riddleCountdown').textContent = 
            (15 - Math.floor((Date.now() - startTime)/1000 % 15)) || 15;
    }, 1000);
}

function showRiddle() {
    const riddle = config.riddles[riddleIndex % config.riddles.length];
    document.getElementById('riddleText').innerHTML = 
        `${riddle.question}<br><span style="color: var(--primary-accent)">${riddle.answer}</span>`;
    riddleIndex++;
    setTimeout(showRiddle, 15000);
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
document.getElementById('startBtn').addEventListener('click', () => {
    if(!gameStarted) {
        initGame();
        gameLoop(0);
    }
});

document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    document.getElementById('themeToggle').textContent = 
        document.body.classList.contains('night-mode') ? "☀️ Day" : "🌙 Night";
});

// Initialize Game
canvas.width = canvas.height = 400;
draw();