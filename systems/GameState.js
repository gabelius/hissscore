export const GameState = {
    config: null,
    currentLevel: 1,
    snake: [{x: 10, y: 10}],
    food: null,
    direction: {x: 1, y: 0},
    score: 0,
    hearts: 3,
    isGameOver: false,
    isGameStarted: false,
    isAutoMode: false,
    isPaused: false,
    lastUpdate: 0,
    updateInterval: 150,
    startTime: null,
    inactivityTimer: null,
    animationFrame: null,
    currentSpeed: 1,
    maxSpeed: 3,
    baseInterval: 150
};

export function resetGameState() {
    Object.assign(GameState, {
        snake: [{x: 10, y: 10}],
        direction: {x: 1, y: 0},
        score: 0,
        hearts: 3,
        isGameOver: false,
        startTime: Date.now(),
        currentLevel: 1,
        updateInterval: GameState.baseInterval,
        currentSpeed: 1
    });
}
