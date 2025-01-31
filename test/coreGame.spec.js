
import { GameState, resetGameState } from '../coreGame.js';

describe('Core Game Logic', () => {
  test('resets game state properly', () => {
    GameState.score = 42; 
    resetGameState();
    expect(GameState.score).toBe(0);
  });
});