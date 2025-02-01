import { jest } from '@jest/globals';
import { setupTestEnv } from './testUtils.js';
import { GameState, resetGameState, updateGameState } from '../coreGame.js';

describe('Core Game Logic', () => {
    beforeEach(() => {
        // Set up test environment
        setupTestEnv();
        
        // Reset game state and setup mock config
        GameState.config = {
            game: {
                updateInterval: 150
            },
            levels: [{
                name: "Test Level",
                background: "test.jpg",
                scoreThreshold: 100,
                snakeColors: ["#000000"]
            }],
            colorSchemes: {
                default: ["#00FF00"]
            }
        };
        
        // Reset other game state properties
        GameState.score = 0;
        GameState.hearts = 3;
        GameState.isGameOver = false;
        GameState.snake = [{x: 10, y: 10}];
        GameState.isGameStarted = true;
        GameState.currentLevel = 1;
        
        // Clear all mock calls
        jest.clearAllMocks();
    });

    test('resets game state properly', () => {
        // Arrange
        GameState.score = 42;
        GameState.hearts = 1;
        GameState.currentLevel = 2;
        
        // Act
        resetGameState();
        
        // Assert
        expect(GameState.score).toBe(0);
        expect(GameState.hearts).toBe(3);
        expect(GameState.isGameOver).toBe(false);
        expect(GameState.snake).toEqual([{x: 10, y: 10}]);
        expect(GameState.currentLevel).toBe(1);
    });

    test('snake grows when eating food', () => {
        // Arrange
        GameState.snake = [{x: 0, y: 0}];
        GameState.food = {x: 1, y: 0, type: 'apple'};
        GameState.direction = {x: 1, y: 0};
        GameState.isGameStarted = true;
        GameState.score = 0;
        
        // Act
        updateGameState();
        
        // Assert
        expect(GameState.snake).toEqual([
            {x: 1, y: 0}, // New head at food position
            {x: 0, y: 0}  // Old position remains
        ]);
        expect(GameState.score).toBe(10);
    });

    test('handles collision correctly', () => {
        // Arrange
        GameState.hearts = 3;
        GameState.snake = [{x: 1, y: 0}, {x: 1, y: 0}]; // Guaranteed collision
        GameState.direction = {x: 0, y: 0};
        GameState.isGameStarted = true;
        
        // Act
        updateGameState();
        
        // Assert
        expect(GameState.hearts).toBe(2); // Lost one heart
        expect(GameState.snake).toEqual([{x: 10, y: 10}]); // Snake respawns at default position
    });
});